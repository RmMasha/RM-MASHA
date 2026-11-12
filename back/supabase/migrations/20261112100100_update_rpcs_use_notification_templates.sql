-- Migración 07: Enlazar Procedimientos RPC con Plantillas Dinámicas de Notificaciones

-- 1. Actualizar RPC: APROBAR RECARGA DE SALDO
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
    v_msg TEXT;
    v_tpl TEXT;
BEGIN
    v_admin_id := auth.uid();
    IF NOT public.is_admin_or_programador() THEN
        RAISE EXCEPTION 'No autorizado para aprobar recargas.' USING ERRCODE = '42501';
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

    -- 4. Obtener plantilla personalizada si existe
    SELECT plantilla INTO v_tpl
    FROM public.notification_templates
    WHERE id = 'recarga_aprobada' AND activo = true;

    IF v_tpl IS NOT NULL THEN
        v_msg := replace(v_tpl, '{monto}', v_recarga.monto::text);
        v_msg := replace(v_msg, '{saldo_actual}', v_nuevo_saldo::text);
    ELSE
        v_msg := '¡Tu recarga de saldo por $' || v_recarga.monto || ' fue aprobada! Tu nuevo saldo es $' || v_nuevo_saldo || '.';
    END IF;

    INSERT INTO public.notifications (
        usuario_id,
        mensaje,
        tipo,
        enlace
    ) VALUES (
        v_recarga.usuario_id,
        v_msg,
        'saldo',
        '/billetera'
    );

    RETURN jsonb_build_object(
        'success', true,
        'recarga_id', p_recarga_id,
        'monto_acreditado', v_recarga.monto,
        'nuevo_saldo', v_nuevo_saldo
    );
END;
$$;

-- 2. Actualizar RPC: RECHAZAR RECARGA DE SALDO
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
    v_msg TEXT;
    v_tpl TEXT;
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

    -- Obtener plantilla personalizada si existe
    SELECT plantilla INTO v_tpl
    FROM public.notification_templates
    WHERE id = 'recarga_rechazada' AND activo = true;

    IF v_tpl IS NOT NULL THEN
        v_msg := replace(v_tpl, '{monto}', v_recarga.monto::text);
        v_msg := replace(v_msg, '{motivo}', COALESCE(p_motivo, 'Comprobante no válido'));
    ELSE
        v_msg := 'Tu solicitud de recarga por $' || v_recarga.monto || ' fue rechazada. Motivo: ' || COALESCE(p_motivo, 'Comprobante no válido');
    END IF;

    INSERT INTO public.notifications (
        usuario_id,
        mensaje,
        tipo,
        enlace
    ) VALUES (
        v_recarga.usuario_id,
        v_msg,
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

