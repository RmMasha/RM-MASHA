-- Migración 05: Datos Semilla Iniciales (Seed Data)
-- Proyecto: RM & Masha

-- 1. MÉTODOS DE PAGO
INSERT INTO public.payment_methods (id, nombre_metodo, titular, numero_cuenta_o_dato, instrucciones, formato_requerido, regex_validacion, activo)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Binance Pay', 'RM & Masha Payments', 'pay@rmmasha.com / PayID: 987654321', 'Envía USDT mediante Binance Pay a nuestro Pay ID o correo. Adjunta captura y escribe el Pay ID de referencia.', 'alfanumerico', '^[a-zA-Z0-9]{8,32}$', true),
    ('22222222-2222-2222-2222-222222222222', 'Pago Móvil (Venezuela)', 'RM & Masha C.A. - CI: 12345678', 'Banco Banesco (0134) - Tlf: 04121234567', 'Realiza el pago móvil a la tasa acordada y coloca los últimos 4 o 6 dígitos de la referencia bancaria.', 'solo_numeros', '^[0-9]{4,10}$', true),
    ('33333333-3333-3333-3333-333333333333', 'Zinli', 'RM & Masha Wallet', 'zinli@rmmasha.com', 'Transfiere saldo directo por correo Zinli e ingresa el ID de transacción generado.', 'alfanumerico', '^[a-zA-Z0-9]{6,25}$', true),
    ('44444444-4444-4444-4444-444444444444', 'Zelle', 'RM & Masha LLC', 'zelle@rmmasha.com', 'Asegúrate de colocar tu nombre de cuenta como titular y adjuntar la captura del comprobante.', 'alfanumerico', '^[a-zA-Z0-9\s]{4,30}$', true)
ON CONFLICT (id) DO NOTHING;

-- 2. CATEGORÍAS
INSERT INTO public.categories (id, nombre, slug, descripcion, orden, activo)
VALUES 
    ('c0000001-1111-1111-1111-111111111111', 'Free Fire', 'free-fire', 'Recargas de diamantes al instante, pases y membresías directas a tu ID de Garena.', 1, true),
    ('c0000002-2222-2222-2222-222222222222', 'Pases y Membresías', 'pases-y-membresias', 'Membresías semanales, mensuales y paquetes especiales de juegos.', 2, true),
    ('c0000003-3333-3333-3333-333333333333', 'Otros Juegos', 'otros-juegos', 'Servicios para Roblox, Mobile Legends, PUBG y más.', 3, true)
ON CONFLICT (id) DO NOTHING;

-- 3. SUBCATEGORÍAS
INSERT INTO public.subcategories (id, categoria_id, nombre, slug, descripcion, orden, activo)
VALUES 
    ('b0000001-1111-1111-1111-111111111111', 'c0000001-1111-1111-1111-111111111111', 'Recargas Directas por ID', 'recargas-id', 'Paquetes de diamantes oficiales entregados directamente mediante tu ID de jugador.', 1, true),
    ('b0000002-2222-2222-2222-222222222222', 'c0000001-1111-1111-1111-111111111111', 'Membresías y Tarjetas', 'membresias-ff', 'Membresías semanal y mensual para Free Fire.', 2, true)
ON CONFLICT (id) DO NOTHING;

-- 4. PRODUCTOS
INSERT INTO public.products (id, subcategoria_id, nombre, slug, descripcion, orden, activo)
VALUES 
    ('a0000001-1111-1111-1111-111111111111', 'b0000001-1111-1111-1111-111111111111', 'Diamantes Free Fire (Directo por ID)', 'diamantes-free-fire', 'Recargas oficiales de diamantes Free Fire para todas las regiones (Sudamérica, EE.UU., etc.). Entrega rápida.', 1, true),
    ('a0000002-2222-2222-2222-222222222222', 'b0000002-2222-2222-2222-222222222222', 'Membresías Free Fire', 'membresias-free-fire', 'Obtén diamantes diarios activando la membresía semanal o mensual en tu cuenta.', 2, true)
ON CONFLICT (id) DO NOTHING;

-- 5. REQUISITOS DEL PRODUCTO
INSERT INTO public.product_requirements (producto_id, tipo, etiqueta, placeholder, requerido, regex_validacion, orden)
VALUES 
    ('a0000001-1111-1111-1111-111111111111', 'id_jugador', 'ID de Jugador (Free Fire)', 'Ej: 1234567890', true, '^[0-9]{8,12}$', 1),
    ('a0000001-1111-1111-1111-111111111111', 'nickname', 'Nickname en el juego (Opcional)', 'Ej: Carlos_Pro25', false, NULL, 2),
    ('a0000002-2222-2222-2222-222222222222', 'id_jugador', 'ID de Jugador (Free Fire)', 'Ej: 1234567890', true, '^[0-9]{8,12}$', 1)
ON CONFLICT DO NOTHING;

-- 6. VARIANTES
INSERT INTO public.variants (id, producto_id, nombre, descripcion, cantidad_items, orden, activo)
VALUES 
    ('f0000001-1111-1111-1111-111111111111', 'a0000001-1111-1111-1111-111111111111', '100 + 10 Diamantes', 'Recarga básica con bono promocional', 110, 1, true),
    ('f0000002-2222-2222-2222-222222222222', 'a0000001-1111-1111-1111-111111111111', '310 + 31 Diamantes', 'Recarga intermedia con bono de 10%', 341, 2, true),
    ('f0000003-3333-3333-3333-333333333333', 'a0000001-1111-1111-1111-111111111111', '520 + 52 Diamantes', 'Excelente relación costo beneficio', 572, 3, true),
    ('f0000004-4444-4444-4444-444444444444', 'a0000001-1111-1111-1111-111111111111', '1060 + 106 Diamantes', 'Mega paquete para eventos y pases', 1166, 4, true),
    ('f0000005-5555-5555-5555-555555555555', 'a0000002-2222-2222-2222-222222222222', 'Membresía Semanal', 'Otorga diamantes diarios durante 7 días', 1, 1, true),
    ('f0000006-6666-6666-6666-666666666666', 'a0000002-2222-2222-2222-222222222222', 'Membresía Mensual', 'Otorga diamantes y caja de recompensas durante 30 días', 1, 2, true)
ON CONFLICT (id) DO NOTHING;

-- 7. MATRIZ DE PRECIOS POR ROL
-- Variante 1: 100+10 Diamantes
INSERT INTO public.prices (variante_id, rol, precio) VALUES
    ('f0000001-1111-1111-1111-111111111111', 'cliente', 1.15),
    ('f0000001-1111-1111-1111-111111111111', 'cliente_especial', 1.10),
    ('f0000001-1111-1111-1111-111111111111', 'revendedor', 1.00),
    ('f0000001-1111-1111-1111-111111111111', 'revendedor_especial', 0.95),
    ('f0000001-1111-1111-1111-111111111111', 'admin', 0.90),
    ('f0000001-1111-1111-1111-111111111111', 'programador', 0.90)
ON CONFLICT (variante_id, rol) DO NOTHING;

-- Variante 2: 310+31 Diamantes
INSERT INTO public.prices (variante_id, rol, precio) VALUES
    ('f0000002-2222-2222-2222-222222222222', 'cliente', 3.30),
    ('f0000002-2222-2222-2222-222222222222', 'cliente_especial', 3.15),
    ('f0000002-2222-2222-2222-222222222222', 'revendedor', 2.95),
    ('f0000002-2222-2222-2222-222222222222', 'revendedor_especial', 2.85),
    ('f0000002-2222-2222-2222-222222222222', 'admin', 2.70),
    ('f0000002-2222-2222-2222-222222222222', 'programador', 2.70)
ON CONFLICT (variante_id, rol) DO NOTHING;

-- Variante 3: 520+52 Diamantes
INSERT INTO public.prices (variante_id, rol, precio) VALUES
    ('f0000003-3333-3333-3333-333333333333', 'cliente', 5.40),
    ('f0000003-3333-3333-3333-333333333333', 'cliente_especial', 5.15),
    ('f0000003-3333-3333-3333-333333333333', 'revendedor', 4.85),
    ('f0000003-3333-3333-3333-333333333333', 'revendedor_especial', 4.70),
    ('f0000003-3333-3333-3333-333333333333', 'admin', 4.50),
    ('f0000003-3333-3333-3333-333333333333', 'programador', 4.50)
ON CONFLICT (variante_id, rol) DO NOTHING;

-- Variante 4: 1060+106 Diamantes
INSERT INTO public.prices (variante_id, rol, precio) VALUES
    ('f0000004-4444-4444-4444-444444444444', 'cliente', 10.50),
    ('f0000004-4444-4444-4444-444444444444', 'cliente_especial', 10.00),
    ('f0000004-4444-4444-4444-444444444444', 'revendedor', 9.50),
    ('f0000004-4444-4444-4444-444444444444', 'revendedor_especial', 9.20),
    ('f0000004-4444-4444-4444-444444444444', 'admin', 8.90),
    ('f0000004-4444-4444-4444-444444444444', 'programador', 8.90)
ON CONFLICT (variante_id, rol) DO NOTHING;

-- Variante 5: Membresía Semanal
INSERT INTO public.prices (variante_id, rol, precio) VALUES
    ('f0000005-5555-5555-5555-555555555555', 'cliente', 2.10),
    ('f0000005-5555-5555-5555-555555555555', 'cliente_especial', 2.00),
    ('f0000005-5555-5555-5555-555555555555', 'revendedor', 1.90),
    ('f0000005-5555-5555-5555-555555555555', 'revendedor_especial', 1.85),
    ('f0000005-5555-5555-5555-555555555555', 'admin', 1.75),
    ('f0000005-5555-5555-5555-555555555555', 'programador', 1.75)
ON CONFLICT (variante_id, rol) DO NOTHING;

-- Variante 6: Membresía Mensual
INSERT INTO public.prices (variante_id, rol, precio) VALUES
    ('f0000006-6666-6666-6666-666666666666', 'cliente', 10.50),
    ('f0000006-6666-6666-6666-666666666666', 'cliente_especial', 10.00),
    ('f0000006-6666-6666-6666-666666666666', 'revendedor', 9.50),
    ('f0000006-6666-6666-6666-666666666666', 'revendedor_especial', 9.20),
    ('f0000006-6666-6666-6666-666666666666', 'admin', 8.90),
    ('f0000006-6666-6666-6666-666666666666', 'programador', 8.90)
ON CONFLICT (variante_id, rol) DO NOTHING;
