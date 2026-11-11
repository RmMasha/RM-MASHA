# Catálogo y Especificación de APIs - RM & Masha

Este documento detalla todas las APIs, funciones RPC de PostgreSQL, consultas de datos y canales en tiempo real utilizados en la plataforma.

---

## 1. Conexión Backend / Supabase
- **URL Base:** `https://xvwcmcrfgrclhebbcrze.supabase.co`
- **Protocolos:** HTTPS (REST PostgREST), WSS (Supabase Realtime WebSockets), PostgreSQL Directo (Puerto 5432).

---

## 2. Procedimientos Almacenados y Funciones RPC (Postgres)

### 2.1. `pagar_con_saldo(p_variante_id UUID, p_datos_requeridos JSONB)`
- **Descripción:** Ejecuta una compra instantánea descontando el monto del saldo interno de la billetera del usuario autenticado.
- **Seguridad:** `SECURITY DEFINER`. Bloquea la fila del usuario (`FOR UPDATE`) para evitar saldos negativos o condiciones de carrera (*Race Conditions*).
- **Parámetros:**
  - `p_variante_id` (UUID): ID de la variante de diamantes/servicio a comprar.
  - `p_datos_requeridos` (JSONB): Información del jugador (ID de Free Fire, Nickname, etc.).
- **Retorno:** JSON `{ success: boolean, pedido_id: uuid, codigo_pedido: text, nuevo_saldo: numeric }`
- **Excepciones:** `P0001: Saldo insuficiente`, `P0002: Variante inactiva o no encontrada`.

### 2.2. `aprobar_recarga_saldo(p_recarga_id UUID)`
- **Descripción:** Permite a un administrador o programador aprobar una solicitud de recarga de saldo.
- **Seguridad:** `SECURITY DEFINER`. Valida que el invocador posea rol `admin` o `programador`.
- **Efectos:**
  1. Cambia el estado de `balance_recharges` a `'aprobada'`.
  2. Incrementa `saldo_actual` en la tabla `users`.
  3. Registra una fila en `transactions` con tipo `'ingreso'`.
  4. Genera una notificación en `notifications` en tiempo real para el usuario.

### 2.3. `rechazar_recarga_saldo(p_recarga_id UUID, p_motivo TEXT)`
- **Descripción:** Rechaza una recarga con comprobante inválido.
- **Efectos:** Actualiza estado a `'rechazada'`, almacena el motivo y notifica al usuario.

### 2.4. `ajuste_manual_saldo(p_usuario_id UUID, p_monto NUMERIC, p_tipo TEXT, p_descripcion TEXT)`
- **Descripción:** Permite acreditar o debitar saldo manualmente (bonificaciones o reembolsos de soporte).

---

## 3. Endpoints REST (Supabase PostgREST)

### 3.1. Catálogo Público
- `GET /rest/v1/categories?activo=eq.true&order=orden.asc`
- `GET /rest/v1/subcategories?categoria_id=eq.[ID]&activo=eq.true`
- `GET /rest/v1/products?subcategoria_id=eq.[ID]&activo=eq.true`
- `GET /rest/v1/variants?producto_id=eq.[ID]&select=*,prices(*)`

### 3.2. Billetera y Movimientos
- `GET /rest/v1/balance_recharges?usuario_id=eq.[UID]&order=created_at.desc`
- `POST /rest/v1/balance_recharges` (Creación de solicitud con comprobante)
- `GET /rest/v1/transactions?usuario_id=eq.[UID]&order=fecha.desc`

### 3.3. Pedidos
- `GET /rest/v1/orders?usuario_id=eq.[UID]&order=created_at.desc`
- `POST /rest/v1/orders` (Creación de pedido en pago directo con comprobante)

---

## 4. Canales de Tiempo Real (Supabase Realtime)
- Canal `user_notifications:[UID]`: Notificaciones push de pedidos, saldo aprobado o rechazos.
- Canal `admin_orders`: Alertas en vivo para administradores cuando ingresa un nuevo pedido o recarga.
