export type UserRole =
  | 'cliente'
  | 'cliente_especial'
  | 'revendedor'
  | 'revendedor_especial'
  | 'admin'
  | 'programador';

export type OrderStatus = 'nuevo' | 'confirmado' | 'entregado' | 'rechazado';
export type RechargeStatus = 'pendiente' | 'aprobada' | 'rechazada';
export type TransactionType = 'ingreso' | 'descuento_compra' | 'reembolso' | 'ajuste_manual';
export type PaymentFormatRule = 'solo_numeros' | 'solo_letras' | 'alfanumerico';
export type ReviewEntityType = 'general' | 'categoria' | 'subcategoria' | 'producto';
export type NotificationType = 'pedido' | 'saldo' | 'sistema' | 'rechazo';
export type RequirementInputType = 'id_jugador' | 'id' | 'nickname' | 'correo' | 'personalizado';

export interface UserProfile {
  id: string;
  nombre: string;
  whatsapp: string;
  email: string;
  edad?: number | null;
  nickname?: string | null;
  pais?: string | null;
  codigo_referido?: string | null;
  avatar_url?: string | null;
  saldo_actual: number;
  rol: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  categoria_id?: string;
  nombre: string;
  slug: string;
  descripcion?: string | null;
  imagen_url?: string | null;
  orden: number;
  activo: boolean;
  created_at?: string;
}

export interface Subcategory {
  id: string;
  subcategoria_id?: string;
  categoria_id: string;
  nombre: string;
  slug: string;
  descripcion?: string | null;
  imagen_url?: string | null;
  orden: number;
  activo: boolean;
  created_at?: string;
}

export interface Product {
  id: string;
  producto_id?: string;
  subcategoria_id: string;
  nombre: string;
  slug: string;
  descripcion?: string | null;
  imagen_url?: string | null;
  orden: number;
  activo: boolean;
  created_at?: string;
}

export interface Variant {
  id: string;
  variante_id?: string;
  producto_id: string;
  nombre: string;
  descripcion?: string | null;
  cantidad_items?: number;
  precio_base?: number;
  orden: number;
  activo: boolean;
  created_at?: string;
  prices?: Price[];
}

export interface Price {
  id: string;
  variante_id: string;
  rol: UserRole;
  precio: number;
  created_at?: string;
}

export interface ProductRequirement {
  id: string;
  requisito_id?: string;
  producto_id: string;
  tipo: RequirementInputType | string;
  etiqueta?: string;
  campo_nombre?: string;
  placeholder?: string | null;
  requerido?: boolean;
  obligatorio?: boolean;
  regex_validacion?: string | null;
  orden: number;
  created_at?: string;
}

export interface PaymentMethod {
  id: string;
  metodo_id?: string;
  nombre_metodo: string;
  titular?: string | null;
  numero_cuenta_o_dato?: string | null;
  instrucciones?: string | null;
  formato_requerido: PaymentFormatRule | string;
  regex_validacion?: string | null;
  activo: boolean;
  logo_url?: string | null;
  created_at?: string;
}

export interface BalanceRecharge {
  id: string;
  recarga_id?: string;
  usuario_id: string;
  monto: number;
  comprobante_url: string;
  metodo_pago?: string;
  metodo_pago_id?: string | null;
  referencia_pago?: string | null;
  estado: RechargeStatus | string;
  motivo_rechazo?: string | null;
  revisado_por?: string | null;
  fecha?: string;
  created_at?: string;
  updated_at?: string;
  users?: UserProfile;
  payment_methods?: PaymentMethod;
}

export interface Order {
  id: string;
  pedido_id?: string;
  codigo_pedido?: string;
  usuario_id: string;
  variante_id: string;
  total?: number;
  estado: OrderStatus | string;
  metodo_pago: string;
  comprobante_url?: string | null;
  referencia_pago?: string | null;
  datos_requeridos_json?: Record<string, string> | any;
  notas_admin?: string | null;
  motivo_rechazo?: string | null;
  fecha_creacion?: string;
  created_at?: string;
  updated_at?: string;
  users?: UserProfile;
  variants?: Variant & { products?: Product };
}

export interface Transaction {
  id: string;
  transaccion_id?: string;
  usuario_id: string;
  tipo: TransactionType | string;
  monto: number;
  saldo_anterior?: number;
  saldo_posterior?: number;
  referencia_id?: string | null;
  descripcion: string;
  fecha: string;
}

export interface Review {
  id: string;
  review_id?: string;
  usuario_id: string;
  entidad_tipo: ReviewEntityType | string;
  entidad_id?: string | null;
  calificacion: number;
  comentario_texto: string;
  destacado_hero: boolean;
  activo?: boolean;
  fecha?: string;
  created_at?: string;
  users?: {
    nombre: string;
    email?: string | null;
    nickname?: string | null;
    avatar_url?: string | null;
    pais?: string | null;
  };
}

export interface Notification {
  id: string;
  notificacion_id?: string;
  usuario_id: string;
  mensaje: string;
  leido: boolean;
  tipo: NotificationType | string;
  enlace?: string | null;
  fecha?: string;
  created_at?: string;
}


export interface NotificationTemplate {
  id: string;
  titulo: string;
  categoria: 'pedidos' | 'recargas' | 'saldo' | string;
  plantilla: string;
  variables_disponibles: string[];
  activo: boolean;
  updated_at?: string;
}
