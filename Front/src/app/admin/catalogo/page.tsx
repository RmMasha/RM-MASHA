'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Category, Subcategory, Product, Variant, Price, UserRole } from '@/types/database.types';
import { formatCurrency } from '@/lib/utils';

const ALL_ROLES: UserRole[] = [
  'cliente',
  'cliente_especial',
  'revendedor',
  'revendedor_especial',
  'admin',
  'programador',
];

export default function AdminCatalogoPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<string>('');
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedSubId, setSelectedSubId] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProdId, setSelectedProdId] = useState<string>('');
  const [variants, setVariants] = useState<(Variant & { prices: Price[] })[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para nuevo producto/variante
  const [editingPrices, setEditingPrices] = useState<Record<string, Record<string, string>>>({});
  const [savingPrices, setSavingPrices] = useState<string | null>(null);

  // Requisitos del producto seleccionado
  const [requirements, setRequirements] = useState<any[]>([]);
  const [newReqField, setNewReqField] = useState('');
  const [newReqType, setNewReqType] = useState('id_jugador');

  // Cargar categorías iniciales
  const loadCategories = async () => {
    try {
      setLoading(true);
      const { data } = await supabase.from('categories').select('*').order('orden');
      if (data) {
        setCategories(data);
        if (data.length > 0 && !selectedCatId) {
          const firstId = data[0].id || data[0].categoria_id || '';
          setSelectedCatId(firstId);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Cargar subcategorías cuando cambia categoría seleccionada
  useEffect(() => {
    if (!selectedCatId) return;
    const loadSubs = async () => {
      const { data } = await supabase
        .from('subcategories')
        .select('*')
        .eq('categoria_id', selectedCatId)
        .order('orden');
      setSubcategories(data || []);
      if (data && data.length > 0) {
        const firstSubId = data[0].id || data[0].subcategoria_id || '';
        setSelectedSubId(firstSubId);
      } else {
        setSelectedSubId('');
        setProducts([]);
        setSelectedProdId('');
      }
    };
    loadSubs();
  }, [selectedCatId]);

  // Cargar productos cuando cambia subcategoría
  useEffect(() => {
    if (!selectedSubId) return;
    const loadProds = async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('subcategoria_id', selectedSubId)
        .order('orden');
      setProducts(data || []);
      if (data && data.length > 0) {
        const firstProdId = data[0].id || data[0].producto_id || '';
        setSelectedProdId(firstProdId);
      } else {
        setSelectedProdId('');
        setVariants([]);
      }
    };
    loadProds();
  }, [selectedSubId]);

  // Cargar variantes, precios y requisitos cuando cambia producto
  const loadProductDetails = async () => {
    if (!selectedProdId) return;
    try {
      // 1. Variantes con precios
      const { data: varsData } = await supabase
        .from('variants')
        .select('*, prices(*)')
        .eq('producto_id', selectedProdId)
        .order('orden');

      if (varsData) {
        setVariants(varsData as any);
        // Inicializar matriz de edición
        const priceMap: Record<string, Record<string, string>> = {};
        for (const v of varsData) {
          const vId = v.id || v.variante_id || '';
          priceMap[vId] = {};
          for (const role of ALL_ROLES) {
            const pObj = (v as any).prices?.find((p: Price) => p.rol === role);
            priceMap[vId][role] = pObj ? String(pObj.precio) : '0.00';
          }
        }
        setEditingPrices(priceMap);
      }

      // 2. Requisitos
      const { data: reqData } = await supabase
        .from('product_requirements')
        .select('*')
        .eq('producto_id', selectedProdId)
        .order('orden');
      setRequirements(reqData || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadProductDetails();
  }, [selectedProdId]);

  // Guardar precios de una variante
  const handleSavePrices = async (varianteId: string) => {
    try {
      setSavingPrices(varianteId);
      const varPrices = editingPrices[varianteId];
      if (!varPrices) return;

      for (const role of ALL_ROLES) {
        const precioNum = parseFloat(varPrices[role] || '0');
        const { error } = await supabase.from('prices').upsert(
          {
            variante_id: varianteId,
            rol: role,
            precio: precioNum,
          },
          { onConflict: 'variante_id,rol' }
        );
        if (error) throw error;
      }

      alert('¡Precios actualizados exitosamente para todos los roles!');
      await loadProductDetails();
    } catch (err: any) {
      console.error('Error guardando precios:', err);
      alert('Error: ' + err.message);
    } finally {
      setSavingPrices(null);
    }
  };

  // Agregar requisito al producto
  const handleAddRequirement = async () => {
    if (!selectedProdId || !newReqField.trim()) return;
    try {
      const { error } = await supabase.from('product_requirements').insert({
        producto_id: selectedProdId,
        etiqueta: newReqField.trim(),
        tipo: newReqType as any,
        requerido: true,
        placeholder: `Ingresa tu ${newReqField.trim()}`,
        orden: requirements.length + 1,
      });

      if (error) throw error;
      setNewReqField('');
      await loadProductDetails();
    } catch (err: any) {
      alert('Error agregando requisito: ' + err.message);
    }
  };

  // Eliminar requisito
  const handleDeleteRequirement = async (requisitoId: string) => {
    try {
      await supabase.from('product_requirements').delete().eq('id', requisitoId);
      await loadProductDetails();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="cyber-panel rounded-2xl p-6 border-neon/30">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon/15 border border-neon/30 text-neon text-[11px] font-mono uppercase mb-2">
          <span>❄</span> Módulo 6.7: Jerarquía de Catálogo & Precios Dinámicos por Rol
        </div>
        <h1 className="text-2xl font-black text-pure uppercase tracking-wider">
          Administración de Catálogo
        </h1>
        <p className="text-xs text-ice/70 font-mono mt-1">
          Navegación y configuración en 4 niveles: Categoría → Subcategoría → Producto → Variantes con precios por rol.
        </p>
      </div>

      {/* Selectores de Nivel Jerárquico */}
      <div className="cyber-panel rounded-2xl p-6 border-neon/30 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Nivel 1: Categorías */}
        <div>
          <label className="block text-xs font-mono uppercase text-ice mb-2">
            1. Categoría:
          </label>
          <select
            value={selectedCatId}
            onChange={(e) => setSelectedCatId(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-pitch border border-neon/30 text-pure text-xs font-mono focus:outline-none focus:border-neon"
          >
            {categories.map((c) => {
              const catId = c.id || c.categoria_id || '';
              return (
                <option key={catId} value={catId}>
                  {c.nombre}
                </option>
              );
            })}
          </select>
        </div>

        {/* Nivel 2: Subcategorías */}
        <div>
          <label className="block text-xs font-mono uppercase text-ice mb-2">
            2. Subcategoría:
          </label>
          <select
            value={selectedSubId}
            onChange={(e) => setSelectedSubId(e.target.value)}
            disabled={subcategories.length === 0}
            className="w-full px-3 py-2.5 rounded-xl bg-pitch border border-neon/30 text-pure text-xs font-mono focus:outline-none focus:border-neon disabled:opacity-50"
          >
            {subcategories.map((s) => {
              const subId = s.id || s.subcategoria_id || '';
              return (
                <option key={subId} value={subId}>
                  {s.nombre}
                </option>
              );
            })}
          </select>
        </div>

        {/* Nivel 3: Producto */}
        <div>
          <label className="block text-xs font-mono uppercase text-ice mb-2">
            3. Producto:
          </label>
          <select
            value={selectedProdId}
            onChange={(e) => setSelectedProdId(e.target.value)}
            disabled={products.length === 0}
            className="w-full px-3 py-2.5 rounded-xl bg-pitch border border-neon/30 text-pure text-xs font-mono focus:outline-none focus:border-neon disabled:opacity-50"
          >
            {products.map((p) => {
              const prodId = p.id || p.producto_id || '';
              return (
                <option key={prodId} value={prodId}>
                  {p.nombre}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {selectedProdId && (
        <div className="space-y-6">
          {/* Matriz de Precios por Rol para las Variantes */}
          <div className="cyber-panel rounded-2xl p-6 border-neon/30">
            <h2 className="text-base font-bold uppercase tracking-wider text-pure mb-2 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-gold shadow-[0_0_8px_#FBBF24]" />
              Matriz de Precios por Rol de Usuario (Variantes del Producto)
            </h2>
            <p className="text-xs font-mono text-ice/70 mb-6">
              Define los precios en dólares (USD) para cada rango de cliente y revendedor.
            </p>

            <div className="space-y-6">
              {variants.map((v) => {
                const varId = v.id || v.variante_id || '';
                return (
                  <div key={varId} className="p-4 rounded-xl bg-navy/60 border border-neon/20">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                      <div>
                        <h3 className="font-bold text-pure text-sm">{v.nombre}</h3>
                        <p className="text-[11px] font-mono text-ice/60">{v.descripcion}</p>
                      </div>
                      <button
                        type="button"
                        disabled={savingPrices === varId}
                        onClick={() => handleSavePrices(varId)}
                        className="btn-neon-pill px-4 py-1.5 text-xs font-bold uppercase tracking-wider disabled:opacity-50"
                      >
                        {savingPrices === varId ? 'Guardando...' : 'Guardar Precios'}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      {ALL_ROLES.map((role) => (
                        <div key={role} className="p-2.5 rounded-lg bg-pitch border border-neon/20">
                          <label className="block text-[10px] font-mono uppercase text-ice/80 mb-1 truncate">
                            {role.replace('_', ' ')}:
                          </label>
                          <div className="relative">
                            <span className="absolute left-2 top-1.5 text-gold font-mono text-xs">$</span>
                            <input
                              type="number"
                              step="0.01"
                              value={editingPrices[varId]?.[role] || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEditingPrices((prev) => ({
                                  ...prev,
                                  [varId]: {
                                    ...prev[varId],
                                    [role]: val,
                                  },
                                }));
                              }}
                              className="w-full pl-5 pr-2 py-1 rounded bg-navy text-pure text-xs font-mono border border-neon/30 focus:outline-none focus:border-neon"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Requisitos de Entrega para este Producto (UID, Nickname, etc.) */}
          <div className="cyber-panel rounded-2xl p-6 border-neon/30">
            <h2 className="text-base font-bold uppercase tracking-wider text-pure mb-2 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-magenta shadow-[0_0_8px_#FF007F]" />
              Campos y Requisitos Solicitados al Comprador
            </h2>
            <p className="text-xs font-mono text-ice/70 mb-4">
              Estos campos serán solicitados en el checkout al momento de la compra (ej. ID de Jugador).
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              {requirements.map((r) => {
                const reqId = r.id || r.requisito_id;
                const reqLabel = r.etiqueta || r.campo_nombre;
                return (
                  <div
                    key={reqId}
                    className="px-3 py-1.5 rounded-xl bg-navy/80 border border-neon/30 flex items-center gap-2 text-xs font-mono"
                  >
                    <span className="text-pure font-bold">{reqLabel}</span>
                    <span className="text-[10px] text-neon uppercase">({r.tipo})</span>
                    <button
                      onClick={() => handleDeleteRequirement(reqId)}
                      className="text-magenta hover:text-white font-bold ml-1"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Agregar nuevo requisito */}
            <div className="flex flex-col sm:flex-row gap-3 items-center max-w-xl">
              <input
                type="text"
                placeholder="Nombre del Campo (Ej: ID de Jugador)"
                value={newReqField}
                onChange={(e) => setNewReqField(e.target.value)}
                className="w-full sm:flex-1 px-3 py-2 rounded-xl bg-pitch border border-neon/30 text-pure text-xs font-mono focus:outline-none focus:border-neon"
              />
              <select
                value={newReqType}
                onChange={(e) => setNewReqType(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 rounded-xl bg-pitch border border-neon/30 text-pure text-xs font-mono focus:outline-none focus:border-neon"
              >
                <option value="id_jugador">Solo Números (ID Jugador)</option>
                <option value="nickname">Alfanumérico (Nickname)</option>
                <option value="correo">Correo Electrónico</option>
                <option value="personalizado">Texto Libre</option>
              </select>
              <button
                type="button"
                onClick={handleAddRequirement}
                className="w-full sm:w-auto btn-ice-pill px-4 py-2 text-xs font-bold uppercase tracking-wider whitespace-nowrap"
              >
                + Agregar Campo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
