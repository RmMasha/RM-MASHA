'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Category,
  Subcategory,
  Product,
  Variant,
  Price,
  ProductRequirement,
  UserRole,
} from '@/types/database.types';
import { formatCurrency } from '@/lib/utils';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Save,
  Check,
  AlertTriangle,
  Loader2,
  Settings,
  DollarSign,
} from 'lucide-react';

const ALL_ROLES: UserRole[] = [
  'cliente',
  'cliente_especial',
  'revendedor',
  'revendedor_especial',
  'admin',
  'programador',
];

export default function AdminCatalogoPage() {
  const supabase = createClient();

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<string>('');

  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedSubcatId, setSelectedSubcatId] = useState<string>('');

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProdId, setSelectedProdId] = useState<string>('');

  const [variants, setVariants] = useState<Variant[]>([]);
  const [requirements, setRequirements] = useState<ProductRequirement[]>([]);

  const [loading, setLoading] = useState(true);
  const [savingPrices, setSavingPrices] = useState<string | null>(null);

  // Estados de edición de matriz de precios { [varianteId_rol]: precio }
  const [priceMatrix, setPriceMatrix] = useState<Record<string, string>>({});

  // Cargar categorías iniciales
  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('orden', { ascending: true });

      if (data && data.length > 0) {
        setCategories(data as Category[]);
        setSelectedCatId(data[0].id);
      }
    } catch (err) {
      console.error('Error cargando categorías:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Cargar subcategorías cuando cambia la categoría
  useEffect(() => {
    if (!selectedCatId) return;
    const fetchSubcats = async () => {
      const { data } = await supabase
        .from('subcategories')
        .select('*')
        .eq('categoria_id', selectedCatId)
        .order('orden', { ascending: true });

      setSubcategories((data as Subcategory[]) || []);
      if (data && data.length > 0) {
        setSelectedSubcatId(data[0].id);
      } else {
        setSelectedSubcatId('');
        setProducts([]);
        setVariants([]);
      }
    };
    fetchSubcats();
  }, [selectedCatId, supabase]);

  // Cargar productos cuando cambia la subcategoría
  useEffect(() => {
    if (!selectedSubcatId) return;
    const fetchProducts = async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('subcategoria_id', selectedSubcatId)
        .order('orden', { ascending: true });

      setProducts((data as Product[]) || []);
      if (data && data.length > 0) {
        setSelectedProdId(data[0].id);
      } else {
        setSelectedProdId('');
        setVariants([]);
      }
    };
    fetchProducts();
  }, [selectedSubcatId, supabase]);

  // Cargar variantes, requisitos y precios del producto seleccionado
  useEffect(() => {
    if (!selectedProdId) return;
    const fetchProductDetails = async () => {
      const [varRes, reqRes] = await Promise.all([
        supabase
          .from('variants')
          .select('*, prices(*)')
          .eq('producto_id', selectedProdId)
          .order('orden', { ascending: true }),
        supabase
          .from('product_requirements')
          .select('*')
          .eq('producto_id', selectedProdId)
          .order('orden', { ascending: true }),
      ]);

      const vars = (varRes.data as Variant[]) || [];
      setVariants(vars);
      setRequirements((reqRes.data as ProductRequirement[]) || []);

      // Poblar matriz de precios local
      const matrix: Record<string, string> = {};
      vars.forEach((v) => {
        v.prices?.forEach((p) => {
          matrix[`${v.id}_${p.rol}`] = p.precio.toString();
        });
      });
      setPriceMatrix(matrix);
    };
    fetchProductDetails();
  }, [selectedProdId, supabase]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Guardar Precios de una Variante
  const handleSavePrices = async (variantId: string) => {
    setSavingPrices(variantId);
    try {
      const updates = ALL_ROLES.map((rol) => {
        const key = `${variantId}_${rol}`;
        const val = parseFloat(priceMatrix[key] || '0');
        return {
          variante_id: variantId,
          rol,
          precio: isNaN(val) ? 0 : val,
        };
      });

      for (const item of updates) {
        await supabase.from('prices').upsert(item, {
          onConflict: 'variante_id,rol',
        });
      }

      alert('¡Precios actualizados exitosamente!');
    } catch (err: any) {
      alert('Error al guardar precios: ' + err.message);
    } finally {
      setSavingPrices(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-white">Gestor de Catálogo y Precios Dinámicos</h2>
        <p className="text-xs text-slate-400">
          Configura jerarquías, requisitos de ID del jugador y la matriz de precios por cada nivel de usuario.
        </p>
      </div>

      {/* SELECTORES DE NAVEGACIÓN JERÁRQUICA */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* CATEGORÍA */}
        <div className="p-4 rounded-2xl bg-surface-card border border-surface-border">
          <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
            1. Categoría
          </label>
          <select
            value={selectedCatId}
            onChange={(e) => setSelectedCatId(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-surface border border-surface-border text-white text-xs font-bold focus:outline-none focus:border-brand-primary"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* SUBCATEGORÍA */}
        <div className="p-4 rounded-2xl bg-surface-card border border-surface-border">
          <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
            2. Subcategoría
          </label>
          <select
            value={selectedSubcatId}
            onChange={(e) => setSelectedSubcatId(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-surface border border-surface-border text-white text-xs font-bold focus:outline-none focus:border-brand-primary"
          >
            {subcategories.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* PRODUCTO */}
        <div className="p-4 rounded-2xl bg-surface-card border border-surface-border">
          <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
            3. Producto
          </label>
          <select
            value={selectedProdId}
            onChange={(e) => setSelectedProdId(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-surface border border-surface-border text-white text-xs font-bold focus:outline-none focus:border-brand-primary"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SECCIÓN DE VARIANTES Y MATRIZ DE PRECIOS */}
      <div className="bg-surface-card border border-surface-border rounded-3xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-brand-gold" />
              Matriz de Precios por Rol para este Producto
            </h3>
            <p className="text-xs text-slate-400">
              Define cuánto paga cada tipo de usuario por cada paquete de diamantes.
            </p>
          </div>
        </div>

        {variants.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No hay variantes creadas para este producto.
          </div>
        ) : (
          <div className="space-y-6">
            {variants.map((v) => {
              const isSaving = savingPrices === v.id;
              return (
                <div
                  key={v.id}
                  className="p-5 rounded-2xl bg-surface/70 border border-surface-border space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">{v.nombre}</h4>
                      <span className="text-xs text-slate-400">
                        {v.cantidad_items} diamantes/items • Orden: {v.orden}
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => handleSavePrices(v.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-primary hover:bg-brand-hover transition-colors shadow-glow-red disabled:opacity-50"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          Guardar Precios
                        </>
                      )}
                    </button>
                  </div>

                  {/* INPUTS DE PRECIOS POR ROL */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
                    {ALL_ROLES.map((rol) => {
                      const key = `${v.id}_${rol}`;
                      return (
                        <div key={rol} className="p-2.5 rounded-xl bg-surface border border-surface-border space-y-1">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">
                            {rol.replace('_', ' ')}
                          </label>
                          <div className="relative">
                            <span className="text-xs text-slate-500 absolute left-2 top-2">$</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={priceMatrix[key] || ''}
                              onChange={(e) =>
                                setPriceMatrix((prev) => ({
                                  ...prev,
                                  [key]: e.target.value,
                                }))
                              }
                              className="w-full pl-5 pr-2 py-1.5 rounded-lg bg-surface-card border border-surface-border text-white text-xs font-bold focus:outline-none focus:border-brand-primary"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECCIÓN DE REQUISITOS DE ENTREGA */}
      <div className="bg-surface-card border border-surface-border rounded-3xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-brand-cyan" />
          Requisitos de Entrega Configurados para este Producto
        </h3>
        <p className="text-xs text-slate-400">
          Campos que el cliente debe completar obligatoriamente al ordenar este producto (ej. ID de Jugador).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {requirements.map((req) => (
            <div
              key={req.id}
              className="p-4 rounded-xl bg-surface border border-surface-border text-xs space-y-1"
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-white">{req.etiqueta}</span>
                <span className="text-[10px] uppercase font-bold text-brand-primary">
                  {req.requerido ? 'Obligatorio' : 'Opcional'}
                </span>
              </div>
              <p className="text-slate-400 text-[11px]">Tipo de campo: {req.tipo}</p>
              {req.regex_validacion && (
                <p className="font-mono text-slate-500 text-[10px]">
                  Regex: {req.regex_validacion}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
