-- Migración 04: Configuración de Buckets de Storage y Políticas
-- Proyecto: RM & Masha

-- Crear Buckets si no existen
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('comprobantes', 'comprobantes', false),
    ('avatares', 'avatares', true),
    ('catalogo', 'catalogo', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage para 'comprobantes' (Privado)
CREATE POLICY "comprobantes_subida_usuario" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'comprobantes'
);

CREATE POLICY "comprobantes_lectura_segura" ON storage.objects
FOR SELECT TO authenticated
USING (
    bucket_id = 'comprobantes' AND (
        (auth.uid()::text = (storage.foldername(name))[1])
        OR public.is_admin_or_programador()
    )
);

-- Políticas de Storage para 'avatares' (Público)
CREATE POLICY "avatares_lectura_publica" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'avatares');

CREATE POLICY "avatares_subida_usuario" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'avatares' AND (auth.uid()::text = (storage.foldername(name))[1])
);

-- Políticas de Storage para 'catalogo' (Público)
CREATE POLICY "catalogo_lectura_publica" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'catalogo');

CREATE POLICY "catalogo_gestion_admin" ON storage.objects
FOR ALL TO authenticated
USING (bucket_id = 'catalogo' AND public.is_admin_or_programador())
WITH CHECK (bucket_id = 'catalogo' AND public.is_admin_or_programador());
