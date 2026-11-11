-- Migración 02: Funciones PostgreSQL y Procedimientos Almacenados (RPC)
-- Proyecto: RM & Masha

-- 1. FUNCIÓN AUXILIAR: Obtener Rol del Usuario Actual
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT rol FROM public.users WHERE id = auth.uid();
$$;

-- 2. FUNCIÓN AUXILIAR: Verificar si es Admin o Programador
CREATE OR REPLACE FUNCTION public.is_admin_or_programador()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND rol IN ('admin', 'programador')
    );
$$;

-- 3. TRIGGER AUTOMÁTICO: Crear perfil público al registrarse en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_nombre TEXT;
    v_whatsapp TEXT;
    v_nickname TEXT;
    v_edad INTEGER;
    v_pais TEXT;
    v_referido TEXT;
BEGIN
    v_nombre := COALESCE(new.raw_user_meta_data->>'nombre', split_part(new.email, '@', 1));
    v_whatsapp := COALESCE(new.raw_user_meta_data->>'whatsapp', '');
    v_nickname := new.raw_user_meta_data->>'nickname';
    v_edad := NULLIF(new.raw_user_meta_data->>'edad', '')::INTEGER;
    v_pais := new.raw_user_meta_data->>'pais';
    v_referido := new.raw_user_meta_data->>'codigo_referido';

    INSERT INTO public.users (
        id,
        nombre,
        whatsapp,
        email,
        edad,
        nickname,
        pais,
        codigo_referido,
        saldo_actual,
        rol
    ) VALUES (
        new.id,
        v_nombre,
        v_whatsapp,
        new.email,
        v_edad,
        v_nickname,
        v_pais,
        v_referido,
        0.00,
        'cliente'
    )
    ON CONFLICT (id) DO NOTHING;

    RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. PROCEDIMIENTO RPC: PAGAR CON SALDO (Transacción Atómica Segura)
CREATE OR REPLACE FUNCTION public.pagar_con_saldo(
    p_variante_id UUID,
    p_datos_requeridos JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_user_rol user_role;
    v_saldo_actual NUMERIC(12, 2);
    v_precio NUMERIC(10, 2);
    v_nuevo_saldo NUMERIC(12, 2);
    v_pedido_id UUID;
    v_codigo_pedido TEXT;
    v_producto_nombre TEXT;
    v_variante_nombre TEXT;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'No autorizado: Inicie sesión para comprar con saldo.' USING ERRCODE = '42501';
    END IF;

    -- Bloqueo de fila para evitar condiciones de carrera (Concurrency Lock)
    SELECT rol, saldo_actual 
    INTO v_user_rol, v_saldo_actual
    FROM public.users 
    WHERE id = v_user_id 
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Usuario no encontrado.' USING ERRCODE = 'P0002';
    END IF;

    -- Obtener datos de la variante y precio según el rol
    SELECT p.precio, pr.nombre, va.nombre
    INTO v_precio, v_producto_nombre, v_variante_nombre
    FROM public.prices p
    JOIN public.variants va ON va.id = p.variante_id
    JOIN public.products pr ON pr.id = va.producto_id
    WHERE p.variante_id = p_variante_id AND p.rol = v_user_rol;

    -- Si no hay precio específico para ese rol, usar precio 'cliente'
    IF v_precio IS NULL THEN
        SELECT p.precio, pr.nombre, va.nombre
        INTO v_precio, v_producto_nombre, v_variante_nombre
        FROM public.prices p
        JOIN public.variants va ON va.id = p.variante_id
        JOIN public.products pr ON pr.id = va.producto_id
        WHERE p.variante_id = p_variante_id AND p.rol = 'cliente';
    END IF;

    IF v_precio IS NULL THEN
        RAISE EXCEPTION 'Precio no configurado para esta variante.' USING ERRCODE = 'P0003';
    END IF;

    -- Validación de Saldo
    IF v_saldo_actual < v_precio THEN
        RAISE EXCEPTION 'Saldo insuficiente. Saldo disponible: $%, Total requerido: $%.', v_saldo_actual, v_precio
        USING ERRCODE = 'P0001';
    END IF;

    v_nuevo_saldo := v_saldo_actual - v_precio;

    -- 1. Actualizar saldo del usuario
    UPDATE public.users 
    SET saldo_actual = v_nuevo_saldo,
        updated_at = timezone('utc'::text, now())
    WHERE id = v_user_id;

    -- 2. Crear Pedido en estado 'confirmado' de forma automática
    INSERT INTO public.orders (
        usuario_id,
        variante_id,
        total,
        estado,
        metodo_pago,
        comprobante_url,
        datos_requeridos_json
    ) VALUES (
        v_user_id,
        p_variante_id,
        v_precio,
        'confirmado',
        'Saldo Billetera',
        NULL,
        p_datos_requeridos
    )
    RETURNING id, codigo_pedido INTO v_pedido_id, v_codigo_pedido;

    -- 3. Registrar movimiento en la tabla de transacciones
    INSERT INTO public.transactions (
        usuario_id,
        tipo,
        monto,
        saldo_anterior,
        saldo_posterior,
        referencia_id,
        descripcion
    ) VALUES (
        v_user_id,
        'descuento_compra',
        v_precio,
        v_saldo_actual,
        v_nuevo_saldo,
        v_pedido_id,
        'Compra de ' || COALESCE(v_producto_nombre, 'Producto') || ' - ' || COALESCE(v_variante_nombre, '') || ' (' || v_codigo_pedido || ')'
    );

    -- 4. Notificar al cliente
    INSERT INTO public.notifications (
        usuario_id,
        mensaje,
        tipo,
        enlace
    ) VALUES (
        v_user_id,
        '¡Tu pedido ' || v_codigo_pedido || ' fue confirmado exitosamente usando tu saldo! Está en cola de entrega.',
        'pedido',
        '/ordenes'
    );

    RETURN jsonb_build_object(
        'success', true,
        'pedido_id', v_pedido_id,
        'codigo_pedido', v_codigo_pedido,
        'monto_descontado', v_precio,
        'nuevo_saldo', v_nuevo_saldo
    );
END;
$$;

-- 5. PROCEDIMIENTO RPC: APROBAR RECARGA DE SALDO
CREATE OR REPLACE FUNCTION public.aprobar_recarga_saldo(p_recarga_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_admin_id UUID;
    v_recarga RECORD;
    v_saldo_actual NUMERIC(12, 2);
    v_nuevo_saldo NUMERIC(12, 2);
BEGIN
    v_admin_id := auth.uid();
    IF NOT public.is_admin_or_programador() THEN
        RAISE EXCEPTION 'No autorizado para aprobar recargas.' USING ERRCODE = '42501';
    END IF;

    -- Bloquear recarga para actualizar
    SELECT * INTO v_recarga 
    FROM public.balance_recharges 
    WHERE id = p_recarga_id 
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Solicitud de recarga no encontrada.' USING ERRCODE = 'P0002';
    END IF;

    IF v_recarga.estado != 'pendiente' THEN
        RAISE EXCEPTION 'Esta recarga ya se encuentra procesada (%s).', v_recarga.estado USING ERRCODE = 'P0004';
    END IF;

    -- Bloquear usuario para sumar saldo
    SELECT saldo_actual INTO v_saldo_actual 
    FROM public.users 
    WHERE id = v_recarga.usuario_id 
    FOR UPDATE;

    v_nuevo_saldo := v_saldo_actual + v_recarga.monto;

    -- 1. Actualizar estado de la recarga
    UPDATE public.balance_recharges
    SET estado = 'aprobada',
        revisado_por = v_admin_id,
        updated_at = timezone('utc'::text, now())
    WHERE id = p_recarga_id;

    -- 2. Incrementar saldo del usuario
    UPDATE public.users
    SET saldo_actual = v_nuevo_saldo,
        updated_at = timezone('utc'::text, now())
    WHERE id = v_recarga.usuario_id;

    -- 3. Registrar transacción
    INSERT INTO public.transactions (
        usuario_id,
        tipo,
        monto,
        saldo_anterior,
        saldo_posterior,
        referencia_id,
        descripcion
    ) VALUES (
        v_recarga.usuario_id,
        'ingreso',
        v_recarga.monto,
        v_saldo_actual,
        v_nuevo_saldo,
        p_recarga_id,
        'Recarga de saldo aprobada por administración'
    );

    -- 4. Disparar notificación al cliente
    INSERT INTO public.notifications (
        usuario_id,
        mensaje,
        tipo,
        enlace
    ) VALUES (
        v_recarga.usuario_id,
        '¡Tu recarga de saldo por $' || v_recarga.monto || ' fue aprobada! Tu nuevo saldo es $' || v_nuevo_saldo || '.',
        'saldo',
        '/billetera'
    );

    RETURN jsonb_build_object(
        'success', true,
        'recarga_id', p_recarga_id,
        'monto', v_recarga.monto,
        'nuevo_saldo', v_nuevo_saldo
    );
END;
$$;

-- 6. PROCEDIMIENTO RPC: RECHAZAR RECARGA DE SALDO
CREATE OR REPLACE FUNCTION public.rechazar_recarga_saldo(
    p_recarga_id UUID,
    p_motivo TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_admin_id UUID;
    v_recarga RECORD;
BEGIN
    v_admin_id := auth.uid();
    IF NOT public.is_admin_or_programador() THEN
        RAISE EXCEPTION 'No autorizado para rechazar recargas.' USING ERRCODE = '42501';
    END IF;

    SELECT * INTO v_recarga 
    FROM public.balance_recharges 
    WHERE id = p_recarga_id 
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Solicitud de recarga no encontrada.' USING ERRCODE = 'P0002';
    END IF;

    IF v_recarga.estado != 'pendiente' THEN
        RAISE EXCEPTION 'Esta recarga ya se encuentra procesada (%s).', v_recarga.estado USING ERRCODE = 'P0004';
    END IF;

    UPDATE public.balance_recharges
    SET estado = 'rechazada',
        motivo_rechazo = p_motivo,
        revisado_por = v_admin_id,
        updated_at = timezone('utc'::text, now())
    WHERE id = p_recarga_id;

    -- Notificar al usuario
    INSERT INTO public.notifications (
        usuario_id,
        mensaje,
        tipo,
        enlace
    ) VALUES (
        v_recarga.usuario_id,
        'Tu recarga de saldo por $' || v_recarga.monto || ' fue rechazada. Motivo: ' || COALESCE(p_motivo, 'Comprobante no válido.'),
        'rechazo',
        '/billetera'
    );

    RETURN jsonb_build_object(
        'success', true,
        'recarga_id', p_recarga_id,
        'estado', 'rechazada'
    );
END;
$$;

-- 7. PROCEDIMIENTO RPC: AJUSTE MANUAL DE SALDO (Admin/Programador)
CREATE OR REPLACE FUNCTION public.ajuste_manual_saldo(
    p_usuario_id UUID,
    p_monto NUMERIC,
    p_es_aumento BOOLEAN,
    p_descripcion TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_saldo_actual NUMERIC(12, 2);
    v_nuevo_saldo NUMERIC(12, 2);
BEGIN
    IF NOT public.is_admin_or_programador() THEN
        RAISE EXCEPTION 'No autorizado para ajustar saldo manualmente.' USING ERRCODE = '42501';
    END IF;

    IF p_monto <= 0 THEN
        RAISE EXCEPTION 'El monto debe ser mayor a 0.' USING ERRCODE = 'P0005';
    END IF;

    SELECT saldo_actual INTO v_saldo_actual 
    FROM public.users 
    WHERE id = p_usuario_id 
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Usuario no encontrado.' USING ERRCODE = 'P0002';
    END IF;

    IF p_es_aumento THEN
        v_nuevo_saldo := v_saldo_actual + p_monto;
    ELSE
        IF v_saldo_actual < p_monto THEN
            RAISE EXCEPTION 'El usuario no posee suficiente saldo para realizar este débito.' USING ERRCODE = 'P0001';
        END IF;
        v_nuevo_saldo := v_saldo_actual - p_monto;
    END IF;

    UPDATE public.users 
    SET saldo_actual = v_nuevo_saldo,
        updated_at = timezone('utc'::text, now())
    WHERE id = p_usuario_id;

    INSERT INTO public.transactions (
        usuario_id,
        tipo,
        monto,
        saldo_anterior,
        saldo_posterior,
        referencia_id,
        descripcion
    ) VALUES (
        p_usuario_id,
        'ajuste_manual',
        p_monto,
        v_saldo_actual,
        v_nuevo_saldo,
        NULL,
        COALESCE(p_descripcion, 'Ajuste administrativo de saldo')
    );

    INSERT INTO public.notifications (
        usuario_id,
        mensaje,
        tipo,
        enlace
    ) VALUES (
        p_usuario_id,
        'Tu saldo ha sido actualizado por administración: $' || v_nuevo_saldo || ' (' || COALESCE(p_descripcion, 'Ajuste') || ').',
        'saldo',
        '/billetera'
    );

    RETURN jsonb_build_object(
        'success', true,
        'usuario_id', p_usuario_id,
        'nuevo_saldo', v_nuevo_saldo
    );
END;
$$;

