-- Migración 08: Creación de la Tabla de Configuración de Apariencia y Marca
-- Módulo: Panel de Apariencia (/admin/apariencia)

CREATE TABLE IF NOT EXISTS public.appearance_settings (
    id TEXT PRIMARY KEY DEFAULT 'global',
    logo_url TEXT,
    favicon_url TEXT,
    color_neon_principal TEXT NOT NULL DEFAULT '#00D2FF',
    color_neon_secundario TEXT NOT NULL DEFAULT '#0070F3',
    color_magenta TEXT NOT NULL DEFAULT '#FF007F',
    color_ice TEXT NOT NULL DEFAULT '#7DD3FC',
    color_gold TEXT NOT NULL DEFAULT '#FBBF24',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- RLS
ALTER TABLE public.appearance_settings ENABLE ROW LEVEL SECURITY;

-- Cualquier visitante puede leer la apariencia de la tienda
CREATE POLICY "Lectura pública de apariencia"
    ON public.appearance_settings
    FOR SELECT
    TO public
    USING (true);

-- Solo administradores y programadores pueden modificar el diseño
CREATE POLICY "Edición de apariencia para staff"
    ON public.appearance_settings
    FOR ALL
    TO authenticated
    USING (public.is_admin_or_programador())
    WITH CHECK (public.is_admin_or_programador());

-- Semilla predeterminada Cyber Winter Navideña
INSERT INTO public.appearance_settings (
    id,
    logo_url,
    favicon_url,
    color_neon_principal,
    color_neon_secundario,
    color_magenta,
    color_ice,
    color_gold
) VALUES (
    'global',
    null,
    null,
    '#00D2FF',
    '#0070F3',
    '#FF007F',
    '#7DD3FC',
    '#FBBF24'
) ON CONFLICT (id) DO NOTHING;

