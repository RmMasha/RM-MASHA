-- Migración 01: Creación de ENUMs y Tablas Principales
-- Proyecto: RM & Masha

-- 1. TIPOS ENUM
CREATE TYPE user_role AS ENUM (
    'cliente',
    'cliente_especial',
    'revendedor',
    'revendedor_especial',
    'admin',
    'programador'
);

CREATE TYPE order_status AS ENUM (
    'nuevo',
    'confirmado',
    'entregado',
    'rechazado'
);

CREATE TYPE recharge_status AS ENUM (
    'pendiente',
    'aprobada',
    'rechazada'
);

CREATE TYPE transaction_type AS ENUM (
    'ingreso',
    'descuento_compra',
    'reembolso',
    'ajuste_manual'
);

CREATE TYPE payment_format_rule AS ENUM (
    'solo_numeros',
    'solo_letras',
    'alfanumerico'
);

CREATE TYPE review_entity_type AS ENUM (
    'general',
    'categoria',
    'subcategoria',
    'producto'
);

CREATE TYPE notification_type AS ENUM (
    'pedido',
    'saldo',
    'sistema',
    'rechazo'
);

CREATE TYPE requirement_input_type AS ENUM (
    'id_jugador',
    'nickname',
    'correo',
    'personalizado'
);

-- 2. TABLA USUARIOS (public.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    edad INTEGER,
    nickname TEXT,
    pais TEXT,
    codigo_referido TEXT,
    avatar_url TEXT,
    saldo_actual NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (saldo_actual >= 0.00),
    rol user_role NOT NULL DEFAULT 'cliente',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. TABLAS DE CATÁLOGO Y JERARQUÍA
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    descripcion TEXT,
    imagen_url TEXT,
    orden INTEGER NOT NULL DEFAULT 0,
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE public.subcategories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    categoria_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    slug TEXT NOT NULL,
    descripcion TEXT,
    imagen_url TEXT,
    orden INTEGER NOT NULL DEFAULT 0,
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_subcat_categoria_slug UNIQUE (categoria_id, slug)
);

CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subcategoria_id UUID NOT NULL REFERENCES public.subcategories(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    slug TEXT NOT NULL,
    descripcion TEXT,
    imagen_url TEXT,
    orden INTEGER NOT NULL DEFAULT 0,
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_prod_subcat_slug UNIQUE (subcategoria_id, slug)
);

CREATE TABLE public.variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producto_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    cantidad_items NUMERIC(10, 2) DEFAULT 0, -- Diamantes, fichas o cantidad de servicio
    orden INTEGER NOT NULL DEFAULT 0,
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. MATRIZ DE PRECIOS POR ROL
CREATE TABLE public.prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variante_id UUID NOT NULL REFERENCES public.variants(id) ON DELETE CASCADE,
    rol user_role NOT NULL,
    precio NUMERIC(10, 2) NOT NULL CHECK (precio >= 0.00),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_variante_rol UNIQUE (variante_id, rol)
);

-- 5. REQUISITOS DEL PRODUCTO (Campos dinámicos de entrega)
CREATE TABLE public.product_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producto_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    tipo requirement_input_type NOT NULL DEFAULT 'id_jugador',
    etiqueta TEXT NOT NULL,
    placeholder TEXT,
    requerido BOOLEAN NOT NULL DEFAULT true,
    regex_validacion TEXT,
    orden INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. MÉTODOS DE PAGO
CREATE TABLE public.payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_metodo TEXT NOT NULL,
    titular TEXT,
    numero_cuenta_o_dato TEXT,
    instrucciones TEXT,
    formato_requerido payment_format_rule NOT NULL DEFAULT 'alfanumerico',
    regex_validacion TEXT,
    activo BOOLEAN NOT NULL DEFAULT true,
    logo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. RECARGAS DE SALDO (balance_recharges)
CREATE TABLE public.balance_recharges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    monto NUMERIC(12, 2) NOT NULL CHECK (monto > 0.00),
    comprobante_url TEXT NOT NULL,
    metodo_pago_id UUID REFERENCES public.payment_methods(id) ON DELETE SET NULL,
    referencia_pago TEXT,
    estado recharge_status NOT NULL DEFAULT 'pendiente',
    motivo_rechazo TEXT,
    revisado_por UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. PEDIDOS (orders)
CREATE SEQUENCE IF NOT EXISTS public.order_code_seq START 10001;

CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_pedido TEXT NOT NULL UNIQUE DEFAULT ('RM-' || nextval('public.order_code_seq')::text),
    usuario_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    variante_id UUID NOT NULL REFERENCES public.variants(id) ON DELETE RESTRICT,
    total NUMERIC(12, 2) NOT NULL CHECK (total >= 0.00),
    estado order_status NOT NULL DEFAULT 'nuevo',
    metodo_pago TEXT NOT NULL, -- 'Saldo Billetera' o nombre del método de pago
    comprobante_url TEXT, -- Nulo si se pagó con Saldo Billetera
    referencia_pago TEXT,
    datos_requeridos_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    notas_admin TEXT,
    motivo_rechazo TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. HISTORIAL DE TRANSACCIONES FINANCIERAS (transactions)
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    tipo transaction_type NOT NULL,
    monto NUMERIC(12, 2) NOT NULL,
    saldo_anterior NUMERIC(12, 2) NOT NULL,
    saldo_posterior NUMERIC(12, 2) NOT NULL,
    referencia_id UUID, -- ID de pedido o ID de recarga
    descripcion TEXT NOT NULL,
    fecha TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. RESEÑAS Y COMENTARIOS MULTINIVEL (reviews)
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    entidad_tipo review_entity_type NOT NULL DEFAULT 'general',
    entidad_id UUID, -- Opcional: ID de categoria, subcategoria o producto
    calificacion INTEGER NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
    comentario_texto TEXT NOT NULL,
    destacado_hero BOOLEAN NOT NULL DEFAULT false,
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. NOTIFICACIONES EN TIEMPO REAL (notifications)
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    mensaje TEXT NOT NULL,
    leido BOOLEAN NOT NULL DEFAULT false,
    tipo notification_type NOT NULL DEFAULT 'sistema',
    enlace TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ÍNDICES DE RENDIMIENTO
CREATE INDEX idx_subcat_categoria ON public.subcategories(categoria_id);
CREATE INDEX idx_prod_subcategoria ON public.products(subcategoria_id);
CREATE INDEX idx_var_producto ON public.variants(producto_id);
CREATE INDEX idx_prices_variante ON public.prices(variante_id);
CREATE INDEX idx_orders_usuario ON public.orders(usuario_id);
CREATE INDEX idx_orders_estado ON public.orders(estado);
CREATE INDEX idx_recharges_usuario ON public.balance_recharges(usuario_id);
CREATE INDEX idx_recharges_estado ON public.balance_recharges(estado);
CREATE INDEX idx_transactions_usuario ON public.transactions(usuario_id);
CREATE INDEX idx_reviews_destacado ON public.reviews(destacado_hero) WHERE activo = true;
CREATE INDEX idx_notifications_usuario_leido ON public.notifications(usuario_id, leido);

