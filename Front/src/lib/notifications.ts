import { supabase } from '@/lib/supabase/client';

/**
 * Reemplaza variables en una plantilla de texto (ej: {codigo}, {monto}, {motivo})
 */
export function interpolateTemplate(
  template: string,
  variables: Record<string, string | number | undefined | null>
): string {
  let result = template;
  for (const [key, val] of Object.entries(variables)) {
    const stringVal = val !== undefined && val !== null ? String(val) : '';
    // Reemplaza {key}
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), stringVal);
  }
  return result;
}

/**
 * Obtiene el mensaje personalizado desde notification_templates de Supabase
 * o retorna el texto de respaldo por defecto si la base de datos no responde.
 */
export async function getRenderedNotification(
  templateId: string,
  variables: Record<string, string | number | undefined | null>,
  fallbackMessage: string
): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('notification_templates')
      .select('plantilla, activo')
      .eq('id', templateId)
      .single();

    if (error || !data || !data.activo) {
      return interpolateTemplate(fallbackMessage, variables);
    }

    return interpolateTemplate(data.plantilla, variables);
  } catch (err) {
    console.warn(`Error resolving template ${templateId}, using fallback:`, err);
    return interpolateTemplate(fallbackMessage, variables);
  }
}

