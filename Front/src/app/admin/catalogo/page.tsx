'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { Category, Subcategory, Product, Variant, Price, UserRole } from '@/types/database.types';
import {
  FolderPlus,
  Layers,
  Package,
  Boxes,
  PlusCircle,
  Edit2,
  Trash2,
  Save,
  Settings,
  X,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Eye,
  Upload,
  Image as ImageIcon,
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<string>('');
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedSubId, setSelectedSubId] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProdId, setSelectedProdId] = useState<string>('');
  const [variants, setVariants] = useState<(Variant & { prices: Price[] })[]>([]);
  const [loading, setLoading] = useState(true);

  // Matriz de edición de precios
  const [editingPrices, setEditingPrices] = useState<Record<string, Record<string, string>>>({});
  const [savingPrices, setSavingPrices] = useState<string | null>(null);

  // Requisitos del producto
  const [requirements, setRequirements] = useState<any[]>([]);
  const [showReqModal, setShowReqModal] = useState(false);
  const [newReqField, setNewReqField] = useState('');
  const [newReqType, setNewReqType] = useState('id_jugador');

  // Modales CRUD
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [activeModal, setActiveModal] = useState<'category' | 'subcategory' | 'product' | 'variant' | null>(null);

  // Bloquea el scroll del fondo cuando un modal está abierto
  useBodyScrollLock(!!activeModal || showReqModal);
  
  // Campos del formulario modal
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formQuantity, setFormQuantity] = useState('0');
  const [formOrder, setFormOrder] = useState('0');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Subir imagen (PNG, JPG, WEBP, SVG) a Supabase Storage bucket 'catalogo'
  const handleImageFileUpload = async (file: File) => {
    try {
      setUploadingImage(true);
      const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
      const folder =
        activeModal === 'category'
          ? 'categorias'
          : activeModal === 'subcategory'
          ? 'subcategorias'
          : 'productos';
      const cleanName = (formSlug || generateSlug(formName) || 'item').slice(0, 30);
      const path = `${folder}/${cleanName}_${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('catalogo')
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('catalogo')
        .getPublicUrl(path);

      setFormImageUrl(publicUrl);
    } catch (err: any) {
      console.error('Error subiendo imagen:', err);
      alert('Error al subir imagen: ' + (err.message || err));
    } finally {
      setUploadingImage(false);
    }
  };

  // Generador de slug a partir del nombre
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Cargar categorías iniciales
  const loadCategories = async (selectIdAfterLoad?: string) => {
    try {
      setLoading(true);
      const { data } = await supabase.from('categories').select('*').order('orden');
      if (data) {
        setCategories(data);
        if (selectIdAfterLoad) {
          setSelectedCatId(selectIdAfterLoad);
        } else if (data.length > 0 && !selectedCatId) {
          const firstId = data[0].id || data[0].categoria_id || '';
          setSelectedCatId(firstId);
        }
      }
    } catch (err) {
      console.error('Error cargando categorías:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Cargar subcategorías cuando cambia categoría seleccionada
  const loadSubcategories = async (selectIdAfterLoad?: string) => {
    if (!selectedCatId) return;
    try {
      const { data } = await supabase
        .from('subcategories')
        .select('*')
        .eq('categoria_id', selectedCatId)
        .order('orden');
      setSubcategories(data || []);
      if (selectIdAfterLoad) {
        setSelectedSubId(selectIdAfterLoad);
      } else if (data && data.length > 0) {
        setSelectedSubId(data[0].id || data[0].subcategoria_id || '');
      } else {
        setSelectedSubId('');
        setProducts([]);
        setSelectedProdId('');
      }
    } catch (err) {
      console.error('Error cargando subcategorías:', err);
    }
  };

  useEffect(() => {
    loadSubcategories();
  }, [selectedCatId]);

  // Cargar productos cuando cambia subcategoría
  const loadProducts = async (selectIdAfterLoad?: string) => {
    if (!selectedSubId) return;
    try {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('subcategoria_id', selectedSubId)
        .order('orden');
      setProducts(data || []);
      if (selectIdAfterLoad) {
        setSelectedProdId(selectIdAfterLoad);
      } else if (data && data.length > 0) {
        setSelectedProdId(data[0].id || data[0].producto_id || '');
      } else {
        setSelectedProdId('');
        setVariants([]);
      }
    } catch (err) {
      console.error('Error cargando productos:', err);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [selectedSubId]);

  // Cargar variantes, precios y requisitos cuando cambia producto
  const loadProductDetails = async () => {
    if (!selectedProdId) {
      setVariants([]);
      setRequirements([]);
      return;
    }
    try {
      // 1. Variantes con precios
      const { data: varsData } = await supabase
        .from('variants')
        .select('*, prices(*)')
        .eq('producto_id', selectedProdId)
        .order('orden');

      if (varsData) {
        setVariants(varsData as any);
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

  // Guardar matriz de precios
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

  // ==========================================
  // MANEJADORES DE APERTURA DE MODAL CRUD
  // ==========================================
  const openModal = (
    level: 'category' | 'subcategory' | 'product' | 'variant',
    mode: 'create' | 'edit',
    existingItem?: any
  ) => {
    setActiveModal(level);
    setModalMode(mode);

    if (mode === 'edit' && existingItem) {
      setFormName(existingItem.nombre || '');
      setFormSlug(existingItem.slug || '');
      setFormDesc(existingItem.descripcion || '');
      setFormQuantity(existingItem.cantidad_items ? String(existingItem.cantidad_items) : '0');
      setFormOrder(existingItem.orden ? String(existingItem.orden) : '0');
      setFormImageUrl(existingItem.imagen_url || '');
    } else {
      setFormName('');
      setFormSlug('');
      setFormDesc('');
      setFormQuantity('0');
      setFormOrder('0');
      setFormImageUrl('');
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    setFormSubmitting(false);
  };

  // Submit modal según nivel
  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    try {
      setFormSubmitting(true);
      const slugVal = formSlug.trim() || generateSlug(formName);
      const orderNum = parseInt(formOrder, 10) || 0;

      if (activeModal === 'category') {
        if (modalMode === 'create') {
          const { data, error } = await supabase.from('categories').insert({
            nombre: formName.trim(),
            slug: slugVal,
            descripcion: formDesc.trim(),
            imagen_url: formImageUrl.trim() || null,
            orden: orderNum,
            activo: true,
          }).select().single();
          if (error) throw error;
          await loadCategories(data.id);
        } else {
          const { error } = await supabase.from('categories').update({
            nombre: formName.trim(),
            slug: slugVal,
            descripcion: formDesc.trim(),
            imagen_url: formImageUrl.trim() || null,
            orden: orderNum,
          }).eq('id', selectedCatId);
          if (error) throw error;
          await loadCategories(selectedCatId);
        }
      } else if (activeModal === 'subcategory') {
        if (!selectedCatId) {
          alert('Primero selecciona una categoría padre.');
          return;
        }
        if (modalMode === 'create') {
          const { data, error } = await supabase.from('subcategories').insert({
            categoria_id: selectedCatId,
            nombre: formName.trim(),
            slug: slugVal,
            descripcion: formDesc.trim(),
            imagen_url: formImageUrl.trim() || null,
            orden: orderNum,
            activo: true,
          }).select().single();
          if (error) throw error;
          await loadSubcategories(data.id);
        } else {
          const { error } = await supabase.from('subcategories').update({
            nombre: formName.trim(),
            slug: slugVal,
            descripcion: formDesc.trim(),
            imagen_url: formImageUrl.trim() || null,
            orden: orderNum,
          }).eq('id', selectedSubId);
          if (error) throw error;
          await loadSubcategories(selectedSubId);
        }
      } else if (activeModal === 'product') {
        if (!selectedSubId) {
          alert('Primero selecciona una subcategoría padre.');
          return;
        }
        if (modalMode === 'create') {
          const { data, error } = await supabase.from('products').insert({
            subcategoria_id: selectedSubId,
            nombre: formName.trim(),
            slug: slugVal,
            descripcion: formDesc.trim(),
            imagen_url: formImageUrl.trim() || null,
            orden: orderNum,
            activo: true,
          }).select().single();
          if (error) throw error;
          await loadProducts(data.id);
        } else {
          const { error } = await supabase.from('products').update({
            nombre: formName.trim(),
            slug: slugVal,
            descripcion: formDesc.trim(),
            imagen_url: formImageUrl.trim() || null,
            orden: orderNum,
          }).eq('id', selectedProdId);
          if (error) throw error;
          await loadProducts(selectedProdId);
        }
      } else if (activeModal === 'variant') {
        if (!selectedProdId) {
          alert('Primero selecciona un producto padre.');
          return;
        }
        const qtyNum = parseFloat(formQuantity) || 0;
        if (modalMode === 'create') {
          const { data: newVar, error: varErr } = await supabase.from('variants').insert({
            producto_id: selectedProdId,
            nombre: formName.trim(),
            descripcion: formDesc.trim(),
            cantidad_items: qtyNum,
            orden: orderNum,
            activo: true,
          }).select().single();
          if (varErr) throw varErr;

          // Sembrar precios base para los 6 roles
          for (const role of ALL_ROLES) {
            await supabase.from('prices').insert({
              variante_id: newVar.id,
              rol: role,
              precio: 1.00,
            });
          }
          await loadProductDetails();
        } else {
          // Edit variant
          const targetVar = variants.find(v => (v.id || v.variante_id) === formSlug);
          if (targetVar) {
            const { error } = await supabase.from('variants').update({
              nombre: formName.trim(),
              descripcion: formDesc.trim(),
              cantidad_items: qtyNum,
              orden: orderNum,
            }).eq('id', formSlug);
            if (error) throw error;
            await loadProductDetails();
          }
        }
      }

      closeModal();
    } catch (err: any) {
      console.error('Error en operación CRUD:', err);
      alert('Error: ' + err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Eliminaciones
  const handleDeleteCategory = async () => {
    if (!selectedCatId) return;
    if (!confirm('¿Seguro que deseas eliminar esta categoría? Se eliminarán todas sus subcategorías, productos y variantes.')) return;
    try {
      const { error } = await supabase.from('categories').delete().eq('id', selectedCatId);
      if (error) throw error;
      await loadCategories();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleDeleteSubcategory = async () => {
    if (!selectedSubId) return;
    if (!confirm('¿Seguro que deseas eliminar esta subcategoría?')) return;
    try {
      const { error } = await supabase.from('subcategories').delete().eq('id', selectedSubId);
      if (error) throw error;
      await loadSubcategories();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProdId) return;
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', selectedProdId);
      if (error) throw error;
      await loadProducts();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleDeleteVariant = async (varId: string) => {
    if (!confirm('¿Eliminar esta variante?')) return;
    try {
      const { error } = await supabase.from('variants').delete().eq('id', varId);
      if (error) throw error;
      await loadProductDetails();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  // Requisitos: Agregar y Eliminar
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

  const handleDeleteRequirement = async (requisitoId: string) => {
    try {
      await supabase.from('product_requirements').delete().eq('id', requisitoId);
      await loadProductDetails();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const currentCategory = categories.find(c => (c.id || c.categoria_id) === selectedCatId);
  const currentSubcategory = subcategories.find(s => (s.id || s.subcategoria_id) === selectedSubId);
  const currentProduct = products.find(p => (p.id || p.producto_id) === selectedProdId);

  return (
    <div className="space-y-6">
      {/* CABECERA */}
      <div className="cyber-panel rounded-2xl p-6 border-neon/30 flex justify-between items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon/15 border border-neon/30 text-neon text-[11px] font-mono uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5 text-neon-cyan" />
            <span>Módulo 6.7: CRUD de Jerarquía de Catálogo & Precios por Rol</span>
          </div>
          <h1 className="text-2xl font-black text-pure uppercase tracking-wider">
            Administración del Catálogo
          </h1>
          <p className="text-xs text-ice/70 font-mono mt-1">
            Gestión en 4 niveles jerárquicos: Categorías → Subcategorías → Productos → Variantes con matriz de precios por rol.
          </p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SELECTORES Y CONTROLES CRUD EN LOS 3 PRIMEROS NIVELES     */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* NIVEL 1: CATEGORÍA */}
        <div className="cyber-panel rounded-2xl p-5 border-neon/30 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono font-bold uppercase text-neon-cyan flex items-center gap-1.5">
              <FolderPlus className="w-4 h-4 text-neon-cyan" />
              <span>1. Categoría</span>
            </label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => openModal('category', 'create')}
                className="p-1 rounded bg-neon/10 hover:bg-neon/20 text-neon-cyan text-xs"
                title="Nueva Categoría"
              >
                <PlusCircle className="w-4 h-4" />
              </button>
              {currentCategory && (
                <>
                  <button
                    type="button"
                    onClick={() => openModal('category', 'edit', currentCategory)}
                    className="p-1 rounded bg-navy hover:bg-navy/80 text-ice text-xs"
                    title="Editar Categoría"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteCategory}
                    className="p-1 rounded bg-magenta/10 hover:bg-magenta/20 text-magenta text-xs"
                    title="Eliminar Categoría"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

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
          {currentCategory && (
            <div className="flex items-center gap-2 pt-2 border-t border-neon/10">
              {currentCategory.imagen_url ? (
                <img
                  src={currentCategory.imagen_url}
                  alt={currentCategory.nombre}
                  className="w-7 h-7 object-cover rounded-lg border border-neon/30 shrink-0"
                />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-navy border border-neon/20 flex items-center justify-center text-xs text-ice/40 shrink-0">
                  📁
                </div>
              )}
              <p className="text-[10px] font-mono text-ice/60 truncate flex-1">
                Slug: /{currentCategory.slug}
              </p>
            </div>
          )}
        </div>

        {/* NIVEL 2: SUBCATEGORÍA */}
        <div className="cyber-panel rounded-2xl p-5 border-neon/30 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono font-bold uppercase text-neon-cyan flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-neon-cyan" />
              <span>2. Subcategoría</span>
            </label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={!selectedCatId}
                onClick={() => openModal('subcategory', 'create')}
                className="p-1 rounded bg-neon/10 hover:bg-neon/20 text-neon-cyan text-xs disabled:opacity-40"
                title="Nueva Subcategoría"
              >
                <PlusCircle className="w-4 h-4" />
              </button>
              {currentSubcategory && (
                <>
                  <button
                    type="button"
                    onClick={() => openModal('subcategory', 'edit', currentSubcategory)}
                    className="p-1 rounded bg-navy hover:bg-navy/80 text-ice text-xs"
                    title="Editar Subcategoría"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteSubcategory}
                    className="p-1 rounded bg-magenta/10 hover:bg-magenta/20 text-magenta text-xs"
                    title="Eliminar Subcategoría"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

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
          {currentSubcategory && (
            <div className="flex items-center gap-2 pt-2 border-t border-neon/10">
              {currentSubcategory.imagen_url ? (
                <img
                  src={currentSubcategory.imagen_url}
                  alt={currentSubcategory.nombre}
                  className="w-7 h-7 object-cover rounded-lg border border-neon/30 shrink-0"
                />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-navy border border-neon/20 flex items-center justify-center text-xs text-ice/40 shrink-0">
                  ⚡
                </div>
              )}
              <p className="text-[10px] font-mono text-ice/60 truncate flex-1">
                Slug: /{currentSubcategory.slug}
              </p>
            </div>
          )}
        </div>

        {/* NIVEL 3: PRODUCTO */}
        <div className="cyber-panel rounded-2xl p-5 border-neon/30 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono font-bold uppercase text-neon-cyan flex items-center gap-1.5">
              <Package className="w-4 h-4 text-neon-cyan" />
              <span>3. Producto</span>
            </label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={!selectedSubId}
                onClick={() => openModal('product', 'create')}
                className="p-1 rounded bg-neon/10 hover:bg-neon/20 text-neon-cyan text-xs disabled:opacity-40"
                title="Nuevo Producto"
              >
                <PlusCircle className="w-4 h-4" />
              </button>
              {currentProduct && (
                <>
                  <button
                    type="button"
                    onClick={() => openModal('product', 'edit', currentProduct)}
                    className="p-1 rounded bg-navy hover:bg-navy/80 text-ice text-xs"
                    title="Editar Producto"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteProduct}
                    className="p-1 rounded bg-magenta/10 hover:bg-magenta/20 text-magenta text-xs"
                    title="Eliminar Producto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

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
          {currentProduct && (
            <div className="flex items-center gap-2 pt-2 border-t border-neon/10">
              {currentProduct.imagen_url ? (
                <img
                  src={currentProduct.imagen_url}
                  alt={currentProduct.nombre}
                  className="w-7 h-7 object-cover rounded-lg border border-neon/30 shrink-0"
                />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-navy border border-neon/20 flex items-center justify-center text-xs text-ice/40 shrink-0">
                  💎
                </div>
              )}
              <p className="text-[10px] font-mono text-ice/60 truncate flex-1">
                Slug: /{currentProduct.slug}
              </p>
            </div>
          )}
        </div>

      </div>

      {/* ========================================================= */}
      {/* NIVEL 4: VARIANTES CON MATRIZ DE PRECIOS & BOTÓN MODAL    */}
      {/* ========================================================= */}
      {selectedProdId && (
        <div className="space-y-6">
          
          <div className="cyber-panel rounded-2xl p-6 border-neon/30">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-neon/20">
              <div>
                <h2 className="text-base font-bold uppercase tracking-wider text-pure flex items-center gap-2">
                  <Boxes className="w-5 h-5 text-gold" />
                  <span>Variantes & Matriz de Precios por Rol</span>
                </h2>
                <p className="text-xs font-mono text-ice/70 mt-0.5">
                  Producto: <strong className="text-white">{currentProduct?.nombre}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* BOTÓN MODAL REQUISITOS DE ENTREGA */}
                <button
                  type="button"
                  onClick={() => setShowReqModal(true)}
                  className="btn-ice-pill px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Requisitos de Entrega ({requirements.length})</span>
                </button>

                {/* BOTÓN NUEVA VARIANTE */}
                <button
                  type="button"
                  onClick={() => openModal('variant', 'create')}
                  className="btn-neon-pill px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>+ Nueva Variante</span>
                </button>
              </div>
            </div>

            {/* LISTA DE VARIANTES CON PRECIOS */}
            {variants.length === 0 ? (
              <div className="p-12 text-center text-xs font-mono text-ice/60">
                Este producto no tiene variantes registradas. Haz clic en <strong>"+ Nueva Variante"</strong> para agregar el primer paquete.
              </div>
            ) : (
              <div className="space-y-5">
                {variants.map((v) => {
                  const varId = v.id || v.variante_id || '';
                  return (
                    <div key={varId} className="p-4 rounded-xl bg-navy/60 border border-neon/20 hover:border-neon/40 transition-colors">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-pitch border border-neon/30 flex items-center justify-center text-xs font-black text-neon-cyan">
                            💎
                          </div>
                          <div>
                            <h3 className="font-bold text-pure text-sm flex items-center gap-2">
                              <span>{v.nombre}</span>
                              {v.cantidad_items ? (
                                <span className="text-[10px] px-2 py-0.2 rounded-full bg-neon/15 text-neon-cyan border border-neon/30">
                                  {v.cantidad_items} Items
                                </span>
                              ) : null}
                            </h3>
                            <p className="text-[11px] font-mono text-ice/60">{v.descripcion || 'Sin descripción'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              openModal('variant', 'edit', v);
                              setFormSlug(varId);
                            }}
                            className="p-1.5 rounded bg-pitch border border-neon/20 text-ice hover:text-white text-xs"
                            title="Editar Variante"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteVariant(varId)}
                            className="p-1.5 rounded bg-magenta/15 border border-magenta/30 text-magenta text-xs"
                            title="Eliminar Variante"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={savingPrices === varId}
                            onClick={() => handleSavePrices(varId)}
                            className="btn-neon-pill px-4 py-1.5 text-xs font-bold uppercase tracking-wider disabled:opacity-50 flex items-center gap-1.5 ml-2"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>{savingPrices === varId ? 'Guardando...' : 'Guardar Precios'}</span>
                          </button>
                        </div>
                      </div>

                      {/* MATRIZ DE PRECIOS PARA LOS 6 ROLES */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2 border-t border-neon/10">
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
            )}
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL CRUD PARA CATEGORÍAS / SUBCATEGORÍAS / PRODUCTOS     */}
      {/* ========================================================= */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain animate-fadeIn">
          <div className="w-full max-w-md cyber-panel p-6 rounded-2xl border border-neon-cyan/40 max-h-[90vh] overflow-y-auto overscroll-contain shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neon/20 mb-4">
              <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span>
                  {modalMode === 'create' ? '+ Crear' : '✎ Editar'}{' '}
                  {activeModal === 'category'
                    ? 'Categoría'
                    : activeModal === 'subcategory'
                    ? 'Subcategoría'
                    : activeModal === 'product'
                    ? 'Producto'
                    : 'Variante'}
                </span>
              </h3>
              <button onClick={closeModal} className="text-ice hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-ice mb-1">
                  Nombre:
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    if (modalMode === 'create') {
                      setFormSlug(generateSlug(e.target.value));
                    }
                  }}
                  placeholder="Ej: Free Fire - Diamantes"
                  className="w-full px-3 py-2 rounded-xl bg-pitch border border-neon/30 text-white text-xs font-mono focus:outline-none focus:border-neon-cyan"
                />
              </div>

              {activeModal !== 'variant' && (
                <div>
                  <label className="block text-xs font-mono uppercase text-ice mb-1">
                    Slug (URL amigable):
                  </label>
                  <input
                    type="text"
                    required
                    value={formSlug}
                    onChange={(e) => setFormSlug(generateSlug(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-pitch border border-neon/30 text-white text-xs font-mono focus:outline-none focus:border-neon-cyan"
                  />
                </div>
              )}

              {activeModal !== 'variant' && (
                <div>
                  <label className="block text-xs font-mono uppercase text-ice mb-1">
                    Imagen / Ícono (PNG, JPG, WEBP):
                  </label>

                  {/* Vista previa en miniatura */}
                  {formImageUrl && (
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-pitch/90 border border-neon/40 mb-2">
                      <img
                        src={formImageUrl}
                        alt="Vista previa"
                        className="w-12 h-12 object-cover rounded-lg border border-neon/30 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[11px] font-mono text-neon truncate block">
                          {formImageUrl}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400">
                          ✓ Imagen cargada
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormImageUrl('')}
                        className="p-1 text-magenta hover:text-white transition-colors"
                        title="Quitar imagen"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <label className="btn-ice-pill px-3 py-2 text-[11px] font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1.5 shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingImage ? 'Subiendo...' : 'Subir Archivo'}</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                        disabled={uploadingImage}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageFileUpload(file);
                        }}
                        className="hidden"
                      />
                    </label>
                    <span className="text-xs font-mono text-ice/40">o</span>
                    <input
                      type="url"
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      placeholder="Pegar enlace de imagen (https://...)"
                      className="flex-1 px-3 py-2 rounded-xl bg-pitch border border-neon/30 text-white text-xs font-mono focus:outline-none focus:border-neon-cyan"
                    />
                  </div>
                  <p className="text-[10px] font-mono text-ice/50 mt-1">
                    Formatos soportados: PNG, JPG, JPEG, WEBP y SVG.
                  </p>
                </div>
              )}

              {activeModal === 'variant' && (
                <div>
                  <label className="block text-xs font-mono uppercase text-ice mb-1">
                    Cantidad de Items (Diamantes / Unidades):
                  </label>
                  <input
                    type="number"
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-pitch border border-neon/30 text-white text-xs font-mono focus:outline-none focus:border-neon-cyan"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-mono uppercase text-ice mb-1">
                  Descripción (Opcional):
                </label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-pitch border border-neon/30 text-white text-xs font-mono focus:outline-none focus:border-neon-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-ice mb-1">
                  Orden de Visualización:
                </label>
                <input
                  type="number"
                  value={formOrder}
                  onChange={(e) => setFormOrder(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-pitch border border-neon/30 text-white text-xs font-mono focus:outline-none focus:border-neon-cyan"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-neon/20">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl text-xs font-mono uppercase text-ice hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="btn-neon-pill px-6 py-2 text-xs font-bold uppercase tracking-wider"
                >
                  {formSubmitting ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VENTANA MODAL ESPECIALIZADA: REQUISITOS DE ENTREGA        */}
      {/* ========================================================= */}
      {showReqModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain animate-fadeIn">
          <div className="w-full max-w-xl cyber-panel p-6 rounded-2xl border border-neon-cyan/40 space-y-5 max-h-[90vh] overflow-y-auto overscroll-contain shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neon/20">
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Settings className="w-5 h-5 text-neon-cyan" />
                  <span>Requisitos de Entrega para el Comprador</span>
                </h3>
                <p className="text-xs font-mono text-ice/70 mt-0.5">
                  Campos solicitados al cliente durante el checkout del producto: <strong className="text-white">{currentProduct?.nombre}</strong>
                </p>
              </div>
              <button onClick={() => setShowReqModal(false)} className="text-ice hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* LISTA ACTUAL DE REQUISITOS */}
            <div>
              <label className="block text-xs font-mono uppercase text-ice mb-2">
                Campos Activos Solicitados:
              </label>
              {requirements.length === 0 ? (
                <div className="p-4 rounded-xl bg-pitch border border-neon/20 text-xs font-mono text-ice/60 text-center">
                  No hay requisitos configurados. Añade uno abajo (ej: ID de Jugador).
                </div>
              ) : (
                <div className="space-y-2">
                  {requirements.map((r) => {
                    const reqId = r.id || r.requisito_id;
                    const reqLabel = r.etiqueta || r.campo_nombre;
                    return (
                      <div
                        key={reqId}
                        className="p-3 rounded-xl bg-pitch border border-neon/20 flex items-center justify-between text-xs font-mono"
                      >
                        <div>
                          <span className="text-pure font-bold">{reqLabel}</span>
                          <span className="text-[10px] text-neon-cyan uppercase ml-2 px-2 py-0.5 rounded bg-neon/10">
                            Tipo: {r.tipo}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteRequirement(reqId)}
                          className="text-magenta hover:text-white font-bold p-1 rounded"
                          title="Eliminar requisito"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* FORMULARIO PARA AÑADIR NUEVO CAMPO */}
            <div className="p-4 rounded-xl bg-navy/60 border border-neon/20 space-y-3">
              <span className="text-xs font-mono uppercase text-neon-cyan font-bold block">
                + Añadir Nuevo Campo Requerido:
              </span>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  placeholder="Etiqueta (Ej: ID de Jugador)"
                  value={newReqField}
                  onChange={(e) => setNewReqField(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-pitch border border-neon/30 text-pure text-xs font-mono focus:outline-none focus:border-neon-cyan"
                />
                <select
                  value={newReqType}
                  onChange={(e) => setNewReqType(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-pitch border border-neon/30 text-pure text-xs font-mono focus:outline-none focus:border-neon-cyan"
                >
                  <option value="id_jugador">Solo Números (ID Jugador)</option>
                  <option value="nickname">Alfanumérico (Nickname)</option>
                  <option value="correo">Correo Electrónico</option>
                  <option value="personalizado">Texto Libre</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddRequirement}
                  className="btn-neon-pill px-4 py-2 text-xs font-bold uppercase tracking-wider whitespace-nowrap"
                >
                  Agregar
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-neon/20">
              <button
                type="button"
                onClick={() => setShowReqModal(false)}
                className="btn-ice-pill px-6 py-2 text-xs font-bold uppercase tracking-wider"
              >
                Listo / Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
