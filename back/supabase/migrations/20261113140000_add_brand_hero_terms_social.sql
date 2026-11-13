-- Migración 09: Ajustes de Marca Dinámica, Hero, Aceptación de Términos y Gestor de Redes Sociales
-- Proyecto: RM & Masha

-- 1. EXTENDER TABLA DE APARIENCIA (appearance_settings) CON CAMPOS DE TEXTO Y HERO
ALTER TABLE public.appearance_settings
ADD COLUMN IF NOT EXISTS site_name TEXT DEFAULT 'RM & MASHA',
ADD COLUMN IF NOT EXISTS site_subtitle TEXT DEFAULT 'Free Fire • Recargas Oficiales',
ADD COLUMN IF NOT EXISTS hero_title TEXT DEFAULT 'FREE FIRE',
ADD COLUMN IF NOT EXISTS hero_subtitle TEXT DEFAULT 'Recargas al Instante con Entrega Inmediata',
ADD COLUMN IF NOT EXISTS hero_description TEXT DEFAULT 'Diamantes oficiales garantizados, Pases Booyah y Membresías por tu ID de Jugador. Compra segura con acreditación automatizada en < 2 minutos o paga al instante con tu Saldo Wallet.';

-- Actualizar la fila global con valores por defecto si son nulos
UPDATE public.appearance_settings
SET
  site_name = COALESCE(site_name, 'RM & MASHA'),
  site_subtitle = COALESCE(site_subtitle, 'Free Fire • Recargas Oficiales'),
  hero_title = COALESCE(hero_title, 'FREE FIRE'),
  hero_subtitle = COALESCE(hero_subtitle, 'Recargas al Instante con Entrega Inmediata'),
  hero_description = COALESCE(hero_description, 'Diamantes oficiales garantizados, Pases Booyah y Membresías por tu ID de Jugador. Compra segura con acreditación automatizada en < 2 minutos o paga al instante con tu Saldo Wallet.')
WHERE id = 'global';


-- 2. ACEPTACIÓN DE TÉRMINOS Y CONDICIONES EN REGISTRO DE USUARIOS
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS terminos_aceptados_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- Actualizar trigger handle_new_user() para persistir terminos_aceptados_at desde metadata
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
    v_terminos TIMESTAMPTZ;
BEGIN
    v_nombre := COALESCE(new.raw_user_meta_data->>'nombre', split_part(new.email, '@', 1));
    v_whatsapp := COALESCE(new.raw_user_meta_data->>'whatsapp', '');
    v_nickname := new.raw_user_meta_data->>'nickname';
    v_edad := NULLIF(new.raw_user_meta_data->>'edad', '')::INTEGER;
    v_pais := new.raw_user_meta_data->>'pais';
    v_referido := new.raw_user_meta_data->>'codigo_referido';
    v_terminos := NULLIF(new.raw_user_meta_data->>'terminos_aceptados_at', '')::TIMESTAMPTZ;

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
        rol,
        terminos_aceptados_at
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
        'cliente',
        COALESCE(v_terminos, timezone('utc'::text, now()))
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        terminos_aceptados_at = COALESCE(EXCLUDED.terminos_aceptados_at, public.users.terminos_aceptados_at);

    RETURN new;
END;
$$;


-- 3. TABLA DE REDES SOCIALES (social_links)
CREATE TABLE IF NOT EXISTS public.social_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    url TEXT NOT NULL,
    icono_url TEXT,
    icono_nombre TEXT DEFAULT 'link',
    activo BOOLEAN NOT NULL DEFAULT true,
    orden INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;

-- Evitar duplicados de políticas si ya existen
DROP POLICY IF EXISTS "Lectura pública de redes sociales" ON public.social_links;
CREATE POLICY "Lectura pública de redes sociales"
    ON public.social_links
    FOR SELECT
    TO public
    USING (activo = true OR public.is_admin_or_programador());

DROP POLICY IF EXISTS "Gestión de redes para staff" ON public.social_links;
CREATE POLICY "Gestión de redes para staff"
    ON public.social_links
    FOR ALL
    TO authenticated
    USING (public.is_admin_or_programador())
    WITH CHECK (public.is_admin_or_programador());

-- Semilla de redes iniciales si no existen
INSERT INTO public.social_links (nombre, url, icono_nombre, orden, activo)
SELECT 'WhatsApp Oficial', 'https://wa.me/584121234567', 'message-circle', 1, true
WHERE NOT EXISTS (SELECT 1 FROM public.social_links WHERE nombre = 'WhatsApp Oficial');

INSERT INTO public.social_links (nombre, url, icono_nombre, orden, activo)
SELECT 'Canal de Telegram', 'https://t.me/rmmasha_oficial', 'send', 2, true
WHERE NOT EXISTS (SELECT 1 FROM public.social_links WHERE nombre = 'Canal de Telegram');

INSERT INTO public.social_links (nombre, url, icono_nombre, orden, activo)
SELECT 'TikTok Oficial', 'https://tiktok.com/@rmmasha', 'video', 3, true
WHERE NOT EXISTS (SELECT 1 FROM public.social_links WHERE nombre = 'TikTok Oficial');


-- 4. RPC PARA ACTUALIZAR ROL DE USUARIO DE FORMA SEGURA
CREATE OR REPLACE FUNCTION public.admin_update_user_role(
    p_user_id UUID,
    p_new_role user_role
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_caller_role user_role;
    v_target_role user_role;
BEGIN
    SELECT rol INTO v_caller_role FROM public.users WHERE id = auth.uid();
    IF v_caller_role NOT IN ('admin', 'programador') THEN
        RAISE EXCEPTION 'No autorizado para realizar esta acción.';
    END IF;

    SELECT rol INTO v_target_role FROM public.users WHERE id = p_user_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Usuario no encontrado.';
    END IF;

    -- El admin no puede alterar a un programador
    IF v_target_role = 'programador' AND v_caller_role != 'programador' THEN
        RAISE EXCEPTION 'Acción denegada: No tienes permiso para modificar usuarios de rango superior.';
    END IF;

    -- Solo un programador puede crear a otro programador
    IF p_new_role = 'programador' AND v_caller_role != 'programador' THEN
        RAISE EXCEPTION 'Acción denegada: Solo un programador puede ascender a rango programador.';
    END IF;

    UPDATE public.users
    SET rol = p_new_role, updated_at = timezone('utc'::text, now())
    WHERE id = p_user_id;

    RETURN jsonb_build_object('success', true, 'user_id', p_user_id, 'new_role', p_new_role);
END;
$$;

