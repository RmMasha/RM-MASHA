-- Migración 03: Políticas de Seguridad a Nivel de Fila (RLS)
-- Proyecto: RM & Masha
-- Regla Crítica: El rol 'programador' es estrictamente invisible para el rol 'admin'.

-- Habilitar RLS en todas las tablas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balance_recharges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 1. TABLA: USERS
-- ==============================================================================
-- LECTURA:
-- 1. Cada usuario puede leer su propio perfil.
-- 2. El 'programador' puede leer a todos los usuarios.
-- 3. El 'admin' puede leer a todos EXCEPTO a los que tengan rol 'programador'.
CREATE POLICY "users_select_policy" ON public.users
FOR SELECT USING (
    (auth.uid() = id)
    OR (public.get_current_user_role() = 'programador')
    OR (public.get_current_user_role() = 'admin' AND rol != 'programador')
);

-- ACTUALIZACIÓN:
-- 1. El propio usuario puede actualizar campos secundarios (sin tocar saldo ni rol mediante RLS).
-- 2. 'programador' puede actualizar cualquier usuario.
-- 3. 'admin' puede actualizar usuarios excepto 'programador'.
CREATE POLICY "users_update_policy" ON public.users
FOR UPDATE USING (
    (auth.uid() = id)
    OR (public.get_current_user_role() = 'programador')
    OR (public.get_current_user_role() = 'admin' AND rol != 'programador')
) WITH CHECK (
    -- El usuario regular no puede auto-cambiarse el rol a admin o programador
    (
        (auth.uid() = id AND rol = (SELECT u.rol FROM public.users u WHERE u.id = auth.uid()))
        OR (public.get_current_user_role() = 'programador')
        OR (public.get_current_user_role() = 'admin' AND rol != 'programador')
    )
);

-- ==============================================================================
-- 2. TABLAS DE CATÁLOGO (categories, subcategories, products, variants, prices, product_requirements)
-- ==============================================================================
-- Lectura pública para elementos activos (o todos si es admin/programador)
CREATE POLICY "categories_select" ON public.categories FOR SELECT
USING (activo = true OR public.is_admin_or_programador());

CREATE POLICY "subcategories_select" ON public.subcategories FOR SELECT
USING (activo = true OR public.is_admin_or_programador());

CREATE POLICY "products_select" ON public.products FOR SELECT
USING (activo = true OR public.is_admin_or_programador());

CREATE POLICY "variants_select" ON public.variants FOR SELECT
USING (activo = true OR public.is_admin_or_programador());

CREATE POLICY "prices_select" ON public.prices FOR SELECT
USING (true); -- Los precios se filtran en la consulta según el rol del usuario

CREATE POLICY "requirements_select" ON public.product_requirements FOR SELECT
USING (true);

-- Modificación exclusiva para administradores y programadores
CREATE POLICY "categories_admin_all" ON public.categories FOR ALL
USING (public.is_admin_or_programador()) WITH CHECK (public.is_admin_or_programador());

CREATE POLICY "subcategories_admin_all" ON public.subcategories FOR ALL
USING (public.is_admin_or_programador()) WITH CHECK (public.is_admin_or_programador());

CREATE POLICY "products_admin_all" ON public.products FOR ALL
USING (public.is_admin_or_programador()) WITH CHECK (public.is_admin_or_programador());

CREATE POLICY "variants_admin_all" ON public.variants FOR ALL
USING (public.is_admin_or_programador()) WITH CHECK (public.is_admin_or_programador());

CREATE POLICY "prices_admin_all" ON public.prices FOR ALL
USING (public.is_admin_or_programador()) WITH CHECK (public.is_admin_or_programador());

CREATE POLICY "requirements_admin_all" ON public.product_requirements FOR ALL
USING (public.is_admin_or_programador()) WITH CHECK (public.is_admin_or_programador());

-- ==============================================================================
-- 3. MÉTODOS DE PAGO (payment_methods)
-- ==============================================================================
CREATE POLICY "payment_methods_select" ON public.payment_methods FOR SELECT
USING (activo = true OR public.is_admin_or_programador());

CREATE POLICY "payment_methods_admin_all" ON public.payment_methods FOR ALL
USING (public.is_admin_or_programador()) WITH CHECK (public.is_admin_or_programador());

-- ==============================================================================
-- 4. RECARGAS DE SALDO (balance_recharges)
-- ==============================================================================
CREATE POLICY "recharges_select" ON public.balance_recharges FOR SELECT
USING (
    (auth.uid() = usuario_id) OR public.is_admin_or_programador()
);

CREATE POLICY "recharges_insert" ON public.balance_recharges FOR INSERT
WITH CHECK (
    auth.uid() = usuario_id AND estado = 'pendiente'
);

CREATE POLICY "recharges_admin_update" ON public.balance_recharges FOR UPDATE
USING (public.is_admin_or_programador());

-- ==============================================================================
-- 5. PEDIDOS (orders)
-- ==============================================================================
CREATE POLICY "orders_select" ON public.orders FOR SELECT
USING (
    (auth.uid() = usuario_id) OR public.is_admin_or_programador()
);

-- Creación de pedidos: Clientes pueden insertar pedidos en estado 'nuevo' (pago directo)
CREATE POLICY "orders_insert_client" ON public.orders FOR INSERT
WITH CHECK (
    auth.uid() = usuario_id
);

-- Actualización de pedidos: Solo admin o programador (marcar como entregado, rechazado, etc.)
CREATE POLICY "orders_admin_update" ON public.orders FOR UPDATE
USING (public.is_admin_or_programador());

-- ==============================================================================
-- 6. HISTORIAL DE TRANSACCIONES (transactions)
-- ==============================================================================
CREATE POLICY "transactions_select" ON public.transactions FOR SELECT
USING (
    (auth.uid() = usuario_id) OR public.is_admin_or_programador()
);
-- Las inserciones se realizan a través de las funciones SECURITY DEFINER de saldo

-- ==============================================================================
-- 7. RESEÑAS (reviews)
-- ==============================================================================
CREATE POLICY "reviews_select" ON public.reviews FOR SELECT
USING (activo = true OR public.is_admin_or_programador());

CREATE POLICY "reviews_insert" ON public.reviews FOR INSERT
WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "reviews_update_own" ON public.reviews FOR UPDATE
USING (auth.uid() = usuario_id OR public.is_admin_or_programador());

-- ==============================================================================
-- 8. NOTIFICACIONES (notifications)
-- ==============================================================================
CREATE POLICY "notifications_select" ON public.notifications FOR SELECT
USING (auth.uid() = usuario_id);

CREATE POLICY "notifications_update" ON public.notifications FOR UPDATE
USING (auth.uid() = usuario_id)
WITH CHECK (auth.uid() = usuario_id);
