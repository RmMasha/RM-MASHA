-- Migración 06: Creación de la Tabla de Plantillas de Notificaciones
-- Módulo 6.5: Configuración de Notificaciones Automáticas

CREATE TABLE IF NOT EXISTS public.notification_templates (
    id TEXT PRIMARY KEY,
    titulo TEXT NOT NULL,
    categoria TEXT NOT NULL DEFAULT 'pedidos',
    plantilla TEXT NOT NULL,
    variables_disponibles JSONB NOT NULL DEFAULT '[]'::jsonb,
    activo BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- RLS
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura de plantillas para usuarios autenticados"
    ON public.notification_templates
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Edición de plantillas para staff (admin y programador)"
    ON public.notification_templates
    FOR ALL
    TO authenticated
    USING (public.is_admin_or_programador())
    WITH CHECK (public.is_admin_or_programador());

-- Semillas predeterminadas de fábrica
INSERT INTO public.notification_templates (id, titulo, categoria, plantilla, variables_disponibles, activo)
VALUES
    (
        'pedido_confirmado',
        'Pedido Confirmado en Cola',
        'pedidos',
        'Tu pedido #{codigo} ha sido confirmado y se encuentra en cola de acreditación directa.',
        '["{codigo}", "{nombre}", "{total}"]'::jsonb,
        true
    ),
    (
        'pedido_entregado',
        'Servicio / Diamantes Entregados',
        'pedidos',
        '¡Tus diamantes o servicio del pedido #{codigo} han sido entregados con éxito! Ya puedes verificar tu cuenta de Free Fire.',
        '["{codigo}", "{nombre}"]'::jsonb,
        true
    ),
    (
        'pedido_rechazado',
        'Pedido Rechazado',
        'pedidos',
        'Tu pedido #{codigo} no pudo ser procesado. Motivo: {motivo}.',
        '["{codigo}", "{motivo}", "{nombre}"]'::jsonb,
        true
    ),
    (
        'recarga_aprobada',
        'Recarga de Saldo Wallet Aprobada',
        'recargas',
        '¡Tu recarga de saldo por ${monto} ha sido aprobada y ya está disponible en tu Billetera para compras instantáneas!',
        '["{monto}", "{nombre}"]'::jsonb,
        true
    ),
    (
        'recarga_rechazada',
        'Recarga de Saldo Wallet Rechazada',
        'recargas',
        'Tu solicitud de recarga de saldo por ${monto} fue rechazada. Motivo: {motivo}.',
        '["{monto}", "{motivo}", "{nombre}"]'::jsonb,
        true
    ),
    (
        'ajuste_saldo',
        'Ajuste Manual de Saldo Wallet',
        'saldo',
        'Se ha registrado un ajuste en tu saldo: {descripcion} por un valor de ${monto}. Tu nuevo saldo es ${saldo_actual}.',
        '["{descripcion}", "{monto}", "{saldo_actual}", "{nombre}"]'::jsonb,
        true
    )
ON CONFLICT (id) DO UPDATE SET
    titulo = EXCLUDED.titulo,
    categoria = EXCLUDED.categoria,
    plantilla = EXCLUDED.plantilla,
    variables_disponibles = EXCLUDED.variables_disponibles;

