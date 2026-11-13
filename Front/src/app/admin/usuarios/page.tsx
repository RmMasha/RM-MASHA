'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { UserProfile, UserRole } from '@/types/database.types';
import { formatCurrency, formatDate, getRoleBadge } from '@/lib/utils';
import {
  Users,
  Search,
  Filter,
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  DollarSign,
  UserCheck,
  Edit,
  X,
  Check,
} from 'lucide-react';

export default function AdminUsuariosPage() {
  const { profile: currentAdmin } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('todos');

  // Modal para cambio de rol
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [newRole, setNewRole] = useState<UserRole>('cliente');
  const [updatingRole, setUpdatingRole] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setUsers(data as UserProfile[]);
    } catch (err: any) {
      console.error('Error al cargar usuarios:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();

    // Suscripción Realtime para ver nuevos registros en vivo
    const channel = supabase
      .channel(`admin-users-feed-${Date.now()}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        () => {
          fetchUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Filtrado reactivo
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchRole = roleFilter === 'todos' || u.rol === roleFilter;
      const term = searchTerm.toLowerCase().trim();
      if (!term) return matchRole;

      const matchTerm =
        (u.nombre && u.nombre.toLowerCase().includes(term)) ||
        (u.email && u.email.toLowerCase().includes(term)) ||
        (u.whatsapp && u.whatsapp.toLowerCase().includes(term)) ||
        (u.nickname && u.nickname.toLowerCase().includes(term));

      return matchRole && matchTerm;
    });
  }, [users, roleFilter, searchTerm]);

  // Estadísticas rápidas
  const stats = useMemo(() => {
    const total = users.length;
    const clientes = users.filter((u) => u.rol === 'cliente' || u.rol === 'cliente_especial').length;
    const revendedores = users.filter((u) => u.rol === 'revendedor' || u.rol === 'revendedor_especial').length;
    const staff = users.filter((u) => u.rol === 'admin' || u.rol === 'programador').length;
    const saldoTotal = users.reduce((acc, u) => acc + (Number(u.saldo_actual) || 0), 0);
    return { total, clientes, revendedores, staff, saldoTotal };
  }, [users]);

  // Manejar cambio de rol
  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      setUpdatingRole(true);
      setActionError(null);
      setActionSuccess(null);

      // Usar la función segura RPC
      const { data, error } = await supabase.rpc('admin_update_user_role', {
        p_user_id: selectedUser.id,
        p_new_role: newRole,
      });

      if (error) throw error;

      setActionSuccess(`Rol de ${selectedUser.nombre} actualizado a "${newRole}" con éxito.`);
      setTimeout(() => {
        setSelectedUser(null);
        setActionSuccess(null);
        fetchUsers();
      }, 1200);
    } catch (err: any) {
      console.error('Error al actualizar rol:', err);
      setActionError(err.message || 'No se pudo actualizar el rol del usuario.');
    } finally {
      setUpdatingRole(false);
    }
  };

  // Formateador detallado con hora y segundos
  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return 'No registrado';
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* CABECERA */}
      <div className="cyber-panel rounded-2xl p-6 border-neon/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon/15 border border-neon/30 text-neon-cyan text-[11px] font-mono uppercase mb-2">
            <Users className="w-3.5 h-3.5 text-neon" />
            <span>Control de Comunidad & Seguridad</span>
          </div>
          <h1 className="text-2xl font-black text-pure uppercase tracking-wider">
            Gestor de Usuarios Registrados
          </h1>
          <p className="text-xs text-ice/70 font-mono mt-1">
            Supervisa las cuentas de clientes y revendedores, fecha y hora exacta de registro, aceptación legal de términos y asignación de rangos.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="btn-ice-pill px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
        >
          <span>Actualizar Lista</span>
        </button>
      </div>

      {/* TARJETAS DE ESTADÍSTICAS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="cyber-panel rounded-xl p-4 border-neon/20">
          <span className="text-[10px] font-mono uppercase text-ice/60">Total Usuarios</span>
          <p className="text-xl font-black text-pure mt-1">{stats.total}</p>
        </div>
        <div className="cyber-panel rounded-xl p-4 border-neon/20">
          <span className="text-[10px] font-mono uppercase text-ice/60">Clientes</span>
          <p className="text-xl font-black text-neon-cyan mt-1">{stats.clientes}</p>
        </div>
        <div className="cyber-panel rounded-xl p-4 border-neon/20">
          <span className="text-[10px] font-mono uppercase text-ice/60">Revendedores</span>
          <p className="text-xl font-black text-gold mt-1">{stats.revendedores}</p>
        </div>
        <div className="cyber-panel rounded-xl p-4 border-neon/20">
          <span className="text-[10px] font-mono uppercase text-ice/60">Staff / Admin</span>
          <p className="text-xl font-black text-magenta-light mt-1">{stats.staff}</p>
        </div>
        <div className="cyber-panel rounded-xl p-4 border-neon/20 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-mono uppercase text-ice/60">Saldo Global Billeteras</span>
          <p className="text-xl font-black text-emerald-400 mt-1">{formatCurrency(stats.saldoTotal)}</p>
        </div>
      </div>

      {/* FILTROS Y BÚSQUEDA */}
      <div className="cyber-panel rounded-2xl p-4 border-neon/30 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-ice/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, email, whatsapp o nickname..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-pitch border border-neon/30 text-xs font-mono text-pure placeholder-ice/40 focus:outline-none focus:border-neon-cyan"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-3.5 h-3.5 text-ice/50 shrink-0" />
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'cliente', label: 'Clientes' },
            { id: 'cliente_especial', label: 'Clientes Esp.' },
            { id: 'revendedor', label: 'Revendedores' },
            { id: 'revendedor_especial', label: 'Rev. Especial' },
            { id: 'admin', label: 'Admins' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-mono uppercase font-bold tracking-wider transition-all shrink-0 ${
                roleFilter === tab.id
                  ? 'btn-neon-pill'
                  : 'bg-pitch border border-neon/20 text-ice/70 hover:text-white hover:border-neon/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TABLA DE USUARIOS */}
      <div className="cyber-panel rounded-2xl border-neon/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neon/20 bg-pitch/90 text-[10px] font-mono uppercase tracking-wider text-ice/80">
                <th className="p-4">Usuario</th>
                <th className="p-4">Contacto</th>
                <th className="p-4">Rol / Rango</th>
                <th className="p-4">Saldo Billetera</th>
                <th className="p-4">Fecha & Hora Registro</th>
                <th className="p-4">Términos Aceptados</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neon/15 text-xs font-mono">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-ice/60">
                    <div className="animate-pulse flex items-center justify-center gap-2">
                      <Clock className="w-4 h-4 text-neon" />
                      <span>Cargando base de datos de usuarios...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-ice/60">
                    No se encontraron usuarios con los criterios de búsqueda.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const whatsappClean = (u.whatsapp || '').replace(/[^0-9]/g, '');
                  const isDev = u.rol === 'programador';
                  const canManage = currentAdmin?.rol === 'programador' || (currentAdmin?.rol === 'admin' && !isDev);

                  return (
                    <tr key={u.id} className="hover:bg-pitch/60 transition-colors">
                      {/* USUARIO */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-neon to-magenta flex items-center justify-center font-bold text-white shrink-0 overflow-hidden shadow-neon-border border border-neon/40">
                            {u.avatar_url ? (
                              <img src={u.avatar_url} alt={u.nombre} className="w-full h-full object-cover" />
                            ) : (
                              u.nombre?.charAt(0)?.toUpperCase() || 'U'
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{u.nombre}</span>
                              {u.pais && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-navy text-ice/70 border border-neon/20">
                                  {u.pais}
                                </span>
                              )}
                            </div>
                            {u.nickname ? (
                              <div className="text-[11px] text-neon-cyan">@{u.nickname}</div>
                            ) : (
                              <div className="text-[10px] text-ice/40">Sin nickname</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* CONTACTO */}
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <div className="text-pure truncate max-w-[180px]">{u.email}</div>
                          {u.whatsapp ? (
                            <a
                              href={`https://wa.me/${whatsappClean}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:underline"
                              title="Abrir chat directo de WhatsApp"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>{u.whatsapp}</span>
                            </a>
                          ) : (
                            <span className="text-ice/40 text-[10px]">Sin teléfono</span>
                          )}
                        </div>
                      </td>

                      {/* ROL */}
                      <td className="p-4">
                        <span className={getRoleBadge(u.rol)}>{u.rol}</span>
                      </td>

                      {/* SALDO */}
                      <td className="p-4 font-bold text-pure">
                        <span className={Number(u.saldo_actual) > 0 ? 'text-emerald-400' : 'text-slate-400'}>
                          {formatCurrency(u.saldo_actual)}
                        </span>
                      </td>

                      {/* FECHA Y HORA DE REGISTRO */}
                      <td className="p-4 text-ice/90">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-neon-cyan shrink-0" />
                          <span>{formatDateTime(u.created_at)}</span>
                        </div>
                      </td>

                      {/* TÉRMINOS ACEPTADOS */}
                      <td className="p-4">
                        {u.terminos_aceptados_at ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/40">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Aceptados</span>
                            </span>
                            <div className="text-[10px] text-ice/70 flex items-center gap-1 mt-0.5">
                              <span>{formatDateTime(u.terminos_aceptados_at)}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gold/15 text-gold border border-gold/40">
                            <AlertCircle className="w-3 h-3" />
                            <span>Registro Previo</span>
                          </span>
                        )}
                      </td>

                      {/* ACCIONES */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/saldo-manual?usuario_id=${u.id}`}
                            className="p-1.5 rounded-lg bg-pitch border border-gold/40 text-gold hover:bg-gold/20 transition-all"
                            title="Ajustar saldo de este usuario"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                          </Link>

                          {canManage && (
                            <button
                              onClick={() => {
                                setSelectedUser(u);
                                setNewRole(u.rol);
                                setActionError(null);
                                setActionSuccess(null);
                              }}
                              className="p-1.5 rounded-lg bg-pitch border border-neon/40 text-neon hover:bg-neon/20 transition-all"
                              title="Cambiar rol o rango"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL PARA CAMBIO DE ROL */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="cyber-panel rounded-3xl p-6 sm:p-8 max-w-md w-full border-neon/40 shadow-neon space-y-6 relative">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-5 right-5 text-ice/60 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-magenta/15 border border-magenta/30 text-magenta-light text-[10px] font-mono uppercase mb-2">
                <Shield className="w-3 h-3 text-magenta" />
                <span>Asignación de Rango</span>
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-wider">
                Cambiar Rol de Usuario
              </h3>
              <p className="text-xs font-mono text-ice/70 mt-1">
                Modifica el nivel de acceso y las tablas de precios asignadas a{' '}
                <strong className="text-white">{selectedUser.nombre}</strong> ({selectedUser.email}).
              </p>
            </div>

            {actionError && (
              <div className="p-3 rounded-xl bg-magenta/15 border border-magenta text-xs font-mono text-pure flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-magenta shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {actionSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500 text-xs font-mono text-emerald-400 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{actionSuccess}</span>
              </div>
            )}

            <form onSubmit={handleUpdateRole} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-ice mb-2">
                  Seleccionar Nuevo Rol:
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'cliente', label: 'Cliente (Tarifas normales)' },
                    { id: 'cliente_especial', label: 'Cliente Especial (Descuento leve)' },
                    { id: 'revendedor', label: 'Revendedor (Tarifas mayoristas)' },
                    { id: 'revendedor_especial', label: 'Revendedor Especial (Tarifas VIP)' },
                    { id: 'admin', label: 'Administrador (Acceso al panel)' },
                  ].map((r) => (
                    <label
                      key={r.id}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        newRole === r.id
                          ? 'bg-neon/15 border-neon text-white font-bold'
                          : 'bg-pitch border-neon/20 text-ice/70 hover:border-neon/40'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="rol"
                          value={r.id}
                          checked={newRole === r.id}
                          onChange={() => setNewRole(r.id as UserRole)}
                          className="accent-[#00D2FF]"
                        />
                        <span className="text-xs font-mono">{r.label}</span>
                      </div>
                      <span className={getRoleBadge(r.id)}>{r.id}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-ice/70 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={updatingRole}
                  className="btn-neon-pill px-6 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                >
                  <span>{updatingRole ? 'Actualizando...' : 'Guardar Rango'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

