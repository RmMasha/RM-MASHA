'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { NotificationTemplate } from '@/types/database.types';
import {
  Bell,
  Sparkles,
  Save,
  RotateCcw,
  CheckCircle2,
  Info,
  Smartphone,
  Eye,
  Sliders,
} from 'lucide-react';
import { interpolateTemplate } from '@/lib/notifications';

const DEFAULT_FACTORY_TEMPLATES: Record<string, string> = {
  pedido_confirmado:
    'Tu pedido #{codigo} ha sido confirmado y se encuentra en cola de acreditación directa.',
  pedido_entregado:
    '¡Tus diamantes o servicio del pedido #{codigo} han sido entregados con éxito! Ya puedes verificar tu cuenta de Free Fire.',
  pedido_rechazado:
    'Tu pedido #{codigo} no pudo ser procesado. Motivo: {motivo}.',
  recarga_aprobada:
    '¡Tu recarga de saldo por ${monto} ha sido aprobada y ya está disponible en tu Billetera para compras instantáneas!',
  recarga_rechazada:
    'Tu solicitud de recarga de saldo por ${monto} fue rechazada. Motivo: {motivo}.',
  ajuste_saldo:
    'Se ha registrado un ajuste en tu saldo: {descripcion} por un valor de ${monto}. Tu nuevo saldo es ${saldo_actual}.',
};

const SAMPLE_DATA: Record<string, string> = {
  codigo: 'RM-10294',
  nombre: 'Kevin Salazar',
  total: '$10.50',
  monto: '15.00',
  motivo: 'Comprobante bancario ilegible o duplicado',
  descripcion: 'Bonificación Navideña Especial',
  saldo_actual: '25.00',
};

export default function AdminNotificacionesPage() {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [selectedId, setSelectedId] = useState<string>('pedido_entregado');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Campos del editor
  const [currentTitulo, setCurrentTitulo] = useState('');
  const [currentPlantilla, setCurrentPlantilla] = useState('');
  const [currentActivo, setCurrentActivo] = useState(true);
  const [currentVariables, setCurrentVariables] = useState<string[]>([]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) {
        setTemplates(data as NotificationTemplate[]);
        const active = data.find((t: any) => t.id === selectedId) || data[0];
        loadIntoEditor(active as NotificationTemplate);
      }
    } catch (err) {
      console.error('Error fetching notification templates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const loadIntoEditor = (tpl: NotificationTemplate) => {
    setSelectedId(tpl.id);
    setCurrentTitulo(tpl.titulo);
    setCurrentPlantilla(tpl.plantilla);
    setCurrentActivo(tpl.activo);
    setCurrentVariables(tpl.variables_disponibles || []);
    setSavedSuccess(false);
  };

  const handleSelectTemplate = (id: string) => {
    const tpl = templates.find((t) => t.id === id);
    if (tpl) {
      loadIntoEditor(tpl);
    }
  };

  const insertVariable = (variable: string) => {
    setCurrentPlantilla((prev) => `${prev} ${variable}`.trim());
  };

  const handleResetToDefault = () => {
    const defaultText = DEFAULT_FACTORY_TEMPLATES[selectedId];
    if (defaultText) {
      setCurrentPlantilla(defaultText);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPlantilla.trim() || !currentTitulo.trim()) return;

    try {
      setSaving(true);
      setSavedSuccess(false);

      const { error } = await supabase
        .from('notification_templates')
        .update({
          titulo: currentTitulo.trim(),
          plantilla: currentPlantilla.trim(),
          activo: currentActivo,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedId);

      if (error) throw error;

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);

      // Refrescar lista local
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === selectedId
            ? {
                ...t,
                titulo: currentTitulo.trim(),
                plantilla: currentPlantilla.trim(),
                activo: currentActivo,
              }
            : t
        )
      );
    } catch (err: any) {
      console.error('Error saving template:', err);
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Generar vista previa interpolada con datos de prueba
  const previewMessage = interpolateTemplate(currentPlantilla, SAMPLE_DATA);

  return (
    <div className="space-y-6">
      {/* CABECERA */}
      <div className="cyber-panel rounded-2xl p-6 border-neon/30 flex justify-between items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon/15 border border-neon/30 text-neon text-[11px] font-mono uppercase mb-2">
            <Bell className="w-3.5 h-3.5 text-neon-cyan" />
            <span>Módulo 6.5: Mensajería Push & Plantillas Automáticas</span>
          </div>
          <h1 className="text-2xl font-black text-pure uppercase tracking-wider">
            Editor de Plantillas de Notificaciones
          </h1>
          <p className="text-xs text-ice/70 font-mono mt-1">
            Personaliza los textos que reciben los clientes al ser confirmados, recibir sus diamantes, o al aprobarse sus recargas de saldo.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLUMNA IZQUIERDA: LISTA DE EVENTOS / PLANTILLAS (4 COLS) */}
        <div className="lg:col-span-4 cyber-panel rounded-2xl p-4 border-neon/30 space-y-2">
          <h3 className="text-xs font-mono font-bold uppercase text-ice px-2 py-1 mb-2">
            Eventos del Sistema ({templates.length})
          </h3>

          {loading ? (
            <div className="p-8 text-center text-xs font-mono text-ice">Cargando eventos...</div>
          ) : (
            <div className="space-y-1.5">
              {templates.map((tpl) => {
                const isSelected = tpl.id === selectedId;
                return (
                  <button
                    key={tpl.id}
                    onClick={() => handleSelectTemplate(tpl.id)}
                    className={`w-full p-3 rounded-xl text-left border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-neon/15 border-neon-cyan shadow-[0_0_15px_rgba(0,240,255,0.2)] text-white'
                        : 'bg-pitch/60 border-neon/10 hover:border-neon/30 text-ice/70 hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono text-pure">
                          {tpl.titulo}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-neon-cyan/80 block mt-0.5">
                        ID: {tpl.id}
                      </span>
                    </div>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        tpl.activo ? 'bg-neon-cyan shadow-[0_0_6px_#00f0ff]' : 'bg-slate-600'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: EDITOR Y PREVISUALIZADOR EN VIVO (8 COLS) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* EDITOR FORMULARIO */}
          <div className="cyber-panel rounded-2xl p-6 border-neon/30">
            <form onSubmit={handleSave} className="space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neon/20">
                <div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-neon/10 text-neon-cyan border border-neon/30">
                    Evento: {selectedId}
                  </span>
                  <h2 className="text-base font-bold text-white uppercase tracking-wider mt-1">
                    Configurar Mensaje Automático
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-mono text-ice/80 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentActivo}
                      onChange={(e) => setCurrentActivo(e.target.checked)}
                      className="w-4 h-4 rounded bg-pitch border-neon/40 text-neon-cyan focus:ring-neon-cyan"
                    />
                    <span>Notificación Habilitada</span>
                  </label>
                </div>
              </div>

              {/* TÍTULO INTERNO DEL EVENTO */}
              <div>
                <label className="block text-xs font-mono uppercase text-ice mb-1">
                  Nombre descriptivo del evento:
                </label>
                <input
                  type="text"
                  value={currentTitulo}
                  onChange={(e) => setCurrentTitulo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-pitch border border-neon/30 text-white text-xs font-mono focus:outline-none focus:border-neon-cyan"
                />
              </div>

              {/* CUERPO DEL MENSAJE / TEXTO DE LA PLANTILLA */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono uppercase text-ice">
                    Texto de la Notificación:
                  </label>
                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    className="text-[11px] font-mono text-gold hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Restablecer predeterminado</span>
                  </button>
                </div>

                <textarea
                  rows={4}
                  value={currentPlantilla}
                  onChange={(e) => setCurrentPlantilla(e.target.value)}
                  className="w-full p-3 rounded-xl bg-pitch border border-neon/30 text-white text-xs font-mono focus:outline-none focus:border-neon-cyan leading-relaxed"
                  placeholder="Escribe el mensaje de la notificación..."
                />
              </div>

              {/* COMODINES / VARIABLES DINÁMICAS DISPONIBLES */}
              {currentVariables.length > 0 && (
                <div className="p-3 rounded-xl bg-navy/60 border border-neon/20">
                  <p className="text-[11px] font-mono text-ice/80 mb-2 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-neon-cyan" />
                    <span>Haz clic en una variable para insertarla en el mensaje:</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {currentVariables.map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => insertVariable(v)}
                        className="px-2.5 py-1 rounded-lg bg-pitch border border-neon/30 text-neon-cyan hover:border-neon-cyan hover:bg-neon/10 font-mono text-xs font-bold transition-colors"
                      >
                        + {v}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* BOTÓN GUARDAR */}
              <div className="flex items-center justify-between pt-4 border-t border-neon/20">
                <div>
                  {savedSuccess && (
                    <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 animate-pulse">
                      <CheckCircle2 className="w-4 h-4" />
                      ¡Plantilla actualizada con éxito!
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="btn-neon-pill px-6 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Guardando...' : 'Guardar Plantilla'}</span>
                </button>
              </div>

            </form>
          </div>

          {/* SIMULADOR EN VIVO: CÓMO LO VE EL CLIENTE */}
          <div className="cyber-panel rounded-2xl p-6 border-neon/30 space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase text-ice flex items-center gap-2">
              <Eye className="w-4 h-4 text-neon-cyan" />
              <span>Simulación de la Notificación en Pantalla del Cliente</span>
            </h3>

            <div className="p-4 rounded-xl bg-pitch-black border border-neon-cyan/40 shadow-[0_0_20px_rgba(0,210,255,0.15)] max-w-lg">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-neon/20 border border-neon-cyan flex items-center justify-center text-neon-cyan shrink-0 shadow-neon-border">
                  <Bell className="w-4 h-4 animate-bounce" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white uppercase tracking-wider">
                      RM & Masha Gaming
                    </span>
                    <span className="text-[10px] font-mono text-ice/60">Hace 1 min</span>
                  </div>
                  <p className="text-xs text-pure mt-1 leading-relaxed font-sans">
                    {previewMessage}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-magenta/20 text-magenta-light border border-magenta/40">
                      Free Fire
                    </span>
                    <span className="text-[10px] font-mono text-ice-light flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-neon-cyan" />
                      Acreditado
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[10px] font-mono text-ice/50">
              * Los comodines como <code>{'{codigo}'}</code> y <code>{'{monto}'}</code> se sustituyen automáticamente por los datos reales de cada usuario al dispararse el evento.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

