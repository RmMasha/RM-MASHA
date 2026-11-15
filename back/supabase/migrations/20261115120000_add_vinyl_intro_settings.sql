-- Migración 10: Configuración de Pantalla de Introducción Temporal (Vinyl Intro)
-- Módulo: Panel de Intro & Vinilo (/admin/intro)

ALTER TABLE public.appearance_settings
ADD COLUMN IF NOT EXISTS intro_activo BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS intro_audio_url TEXT DEFAULT '/intro.mp3',
ADD COLUMN IF NOT EXISTS intro_imagen_url TEXT DEFAULT '/RM&MASHA VINIL.jpg',
ADD COLUMN IF NOT EXISTS intro_duracion_segundos NUMERIC DEFAULT 5;

UPDATE public.appearance_settings
SET
  intro_activo = COALESCE(intro_activo, true),
  intro_audio_url = COALESCE(intro_audio_url, '/intro.mp3'),
  intro_imagen_url = COALESCE(intro_imagen_url, '/RM&MASHA VINIL.jpg'),
  intro_duracion_segundos = COALESCE(intro_duracion_segundos, 5)
WHERE id = 'global';

