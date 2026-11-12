# Bitácora y Documentación de Cambios - RM & Masha

Este documento registra cronológicamente cada cambio, modificación, creación de archivos y mejoras realizadas en el proyecto.

---

## [11/11/2026 - 11:15 AM] - Inicialización del Proyecto y Estructura Base

### Cambios Realizados:
- **Creación de Estructura de Directorios Principal:**
  - `Front/`: Directorio dedicado a la aplicación de interfaz de usuario (Next.js, React, Tailwind CSS).
  - `back/`: Directorio dedicado a la infraestructura de base de datos, políticas RLS, funciones RPC de Postgres y almacenamiento (Supabase).
  - `Documentacion/`: Directorio normativo para trazabilidad y auditoría técnica.
- **Configuración de Control de Versiones:**
  - Inicialización del repositorio Git local conectado al repositorio remoto oficial: `https://github.com/RmMasha/RM-MASHA.git`.
  - Creación del archivo `.gitignore` para proteger credenciales sensibles (`.env`, `.env.local`, llaves privadas, `node_modules`).
- **Definición de Documentación Obligatoria:**
  - Creación de los 6 documentos normativos del proyecto.

---

## [11/11/2026 - 11:30 AM] - Diseño y Creación de Migraciones Supabase PostgreSQL y Conexión de Datos

### Cambios Realizados:
- **Diseño de Base de Datos y Scripts de Migración:**
  - `back/supabase/migrations/20261111120000_create_enums_and_tables.sql`: Creación de ENUMs (`user_role`, `order_status`, `recharge_status`, `transaction_type`, etc.) y 11 tablas relacionales optimizadas con índices.
  - `back/supabase/migrations/20261111120100_create_functions_and_rpc.sql`: Procedimientos atómicos `pagar_con_saldo`, `aprobar_recarga_saldo`, `rechazar_recarga_saldo`, `ajuste_manual_saldo` y trigger `handle_new_user` para `auth.users`.
  - `back/supabase/migrations/20261111120200_create_rls_policies.sql`: Políticas de Row Level Security con aislamiento estricto del rol `programador` invisible para el rol `admin`.
  - `back/supabase/migrations/20261111120300_create_storage_buckets.sql`: Definición de buckets de Supabase Storage (`comprobantes`, `avatares`, `catalogo`) y sus políticas de lectura/escritura.
  - `back/supabase/migrations/20261111120400_seed_initial_data.sql`: Carga de datos semilla (métodos de pago iniciales: Binance Pay, Pago Móvil, Zinli, Zelle; categorías de Free Fire, productos, requisitos dinámicos de ID y matriz de precios por rol).
- **Scripts y Variables de Entorno:**
  - `back/scripts/migrate.js`: Script de migración automatizado vía PostgreSQL directo.
  - `Front/.env.local`: Configuración de conexión cliente con las credenciales de Supabase del proyecto `xvwcmcrfgrclhebbcrze`.
  - `Front/.env.example`: Plantilla de variables de entorno para control de versiones.

---

## [11/11/2026 - 06:45 PM] - Reconstrucción Total del Frontend: Temática Ciber-Navideña Free Fire (Cyber Winter)

### Cambios Realizados:
- **Rediseño Completo de la Paleta y Estilos Visuales (`Front/tailwind.config.ts` y `Front/src/app/globals.css`):**
  - **Atmósfera / Fondo Base:** Azul Marino Profundo (`#050811`, `#070B19`) para un entorno nocturno inmersivo.
  - **Energía y Resplandores:** Azul Eléctrico / Neón (`#00D2FF`) para líneas de la cuadrícula cibernética, rayos y bordes brillantes.
  - **Contraste y Nieve:** Blanco Puro (`#FFFFFF`) para textos legibles, texturas de nieve acumulada y copos vectoriales; Rosa Fucsia / Magenta (`#FF007F`) en detalles de vestimenta táctica y atuendo de Caperucita.
  - **Acentos y Relleno:** Celeste / Azul Hielo (`#7DD3FC`) en cajas de regalo navideñas, escarcha y brillo interno de botones; Negro Táctico Opaco (`#060913`) en paneles de información rectangulares (`.cyber-panel`); Dorado Festivo (`#FBBF24`) en saldo actual, insignias, hebillas y estrellas.
  - **Formas de Interfaz:** Botones en forma de píldora (`rounded-full`) con resplandor neón (`.btn-neon-pill`, `.btn-ice-pill`, `.btn-magenta-pill`) y paneles rectangulares negros con bordes finos azul neón.
- **Componentes Globales y de Layout:**
  - `Front/src/components/common/Snowfall.tsx`: Generador de partículas de nieve animadas por CSS en tiempo real con parámetro configurable de densidad.
  - `Front/src/components/common/Navbar.tsx`: Barra de navegación minimalista superior con saldo en vivo en píldora dorada, campanita de notificaciones push, modal de notificaciones y dropdown de usuario.
  - `Front/src/components/common/Footer.tsx`: Pie de página rectangular negro con borde neón y enlaces a políticas legales.
  - `Front/src/components/common/ErrorBoundary.tsx`: Componente de aislamiento de errores en React para proteger la navegación.
  - `Front/src/components/home/HeroChristmas.tsx`: Banner principal temático con avatares duales (masculino táctico con bandana y gorra con 'F' dorada; femenino con trenzas rubias y atuendo fucsia), letras 3D de "FREE FIRE" con nieve acumulada, cajas de regalo azul hielo con lazos plateados y burbujas circulares de reseñas destacadas.
- **Arquitectura de Catálogo Aislado en 4 Niveles:**
  - `Front/src/app/catalogo/page.tsx` & `error.tsx`: Nivel 1 - Categorías principales y productos destacados.
  - `Front/src/app/catalogo/[categoria]/page.tsx` & `error.tsx`: Nivel 2 - Subcategorías dinámicas filtradas por slug.
  - `Front/src/app/catalogo/[categoria]/[subcategoria]/page.tsx` & `error.tsx`: Nivel 3 - Lista de productos de la subcategoría seleccionada.
  - `Front/src/app/catalogo/[categoria]/[subcategoria]/[producto]/page.tsx` & `error.tsx`: Nivel 4 - Vista detallada del producto.
  - `Front/src/components/catalog/ProductCheckoutClient.tsx`: Panel interactivo de compra con selector de variantes, matriz de precios dinámicos según rol de usuario (`cliente`, `revendedor`, etc.), campos dinámicos obligatorios (UID Free Fire con validación numérica), selector dual de liquidación (Pagar con Saldo Automático vía RPC `pagar_con_saldo` vs Pago Directo con subida de comprobante al bucket `comprobantes`), y módulo de reseñas.
- **Módulos de Cliente y Autenticación:**
  - `Front/src/app/billetera/page.tsx` & `BilleteraClient.tsx`: Monedero interno con saldo en dorado festivo, formulario de depósito con comprobante de transferencia y tablas de transacciones y recargas.
  - `Front/src/app/ordenes/page.tsx` & `OrdenesClient.tsx`: Historial de pedidos del usuario con badges de estado neón.
  - `Front/src/app/perfil/page.tsx`: Gestión de perfil, nickname, WhatsApp, avatar personal y rol.
  - `Front/src/app/login/page.tsx` & `LoginClient.tsx`: Formulario de inicio de sesión cibernético con redirección inteligente.
  - `Front/src/app/registro/page.tsx` & `RegistroClient.tsx`: Formulario de registro completo con campos de auditoría.
  - `Front/src/app/cookies/page.tsx`, `terminos/page.tsx`, `privacidad/page.tsx`: Páginas legales normativas.
- **Panel Administrativo Completo (`Front/src/app/admin/`):**
  - `layout.tsx`: Protección estricta con verificación de rol (`admin`, `programador`) y ocultamiento del programador frente al admin.
  - `pedidos/page.tsx`: Gestor de pedidos con paginación de 10 en 10, pestañas (Nuevos, Confirmados, Entregados, Rechazados), visor modal de comprobantes y disparo de notificaciones push automáticas.
  - `recargas/page.tsx`: Aprobación y rechazo de solicitudes de recarga mediante funciones atómicas PostgreSQL (`aprobar_recarga_saldo`, `rechazar_recarga_saldo`).
  - `saldo-manual/page.tsx`: Acreditación manual de saldo promocional, regalos a revendedores o débitos con motivo registrado mediante `ajuste_manual_saldo`.
  - `catalogo/page.tsx`: Editor visual de la jerarquía de catálogo, matriz de precios por rol y requisitos de entrega.
  - `metodos-pago/page.tsx`: CRUD y reglas de validación de canales de pago.
  - `comentarios/page.tsx`: Moderación de reseñas comunitarias y switch para mostrarlas en el Hero principal.
- **Verificación de Compilación y Puesta en Marcha:**
  - Compilación exitosa de producción `next build` (20 de 20 rutas estáticas y dinámicas compiladas con 0 errores).
  - Servidor de desarrollo Next.js en ejecución en `http://localhost:3000` respondiendo con código HTTP 200 OK.


## [2026-11-12] Implementación de HeroBackground y Limpieza de Cuadrícula Temática

### 1. Creación de Componente `HeroBackground.tsx`
- **Atmósfera de Invierno Cibernético**:
  - Incorporación de fondo panorámico 16:9 cinemático generado (`/images/cyber-winter-hero.jpg`).
  - Gradiente radial profundo muy oscuro (`bg-[radial-gradient(ellipse_at_50%_20%,_rgba(23,37,84,0.45)_0%,_rgba(15,23,42,0.78)_50%,_#020617_100%)]`).
  - Sistema de 38 copos de nieve en CSS dinámico con renderizado en cliente (`useEffect`) para evitar diferencias de hidratación SSR.
  - Relámpagos de luz azul eléctrico (`#00f0ff`) con animaciones diagonales y desenfoque (blur de 22px a 28px).
  - Base inferior con 4 capas de dunas de nieve superpuestas en SVG vectorizado que se integran con el fondo base `#050811`.
  - **Aislamiento Estricto**: Cero personajes, cero avatares, cero siluetas; actúa como wrapper limpio que recibe `{children}`.

### 2. Eliminación de Líneas de Cuadrícula ("Cuaderno de Matemáticas")
- Eliminación de `.bg-cyber-grid-pattern` en `Front/src/app/globals.css`.
- Eliminación de cualquier patrón de rejilla en `HeroChristmas.tsx` y `HeroBackground.tsx`, priorizando iluminación orgánica y degradados oscuros.

### 3. Modernización de `HeroChristmas.tsx`
- Se reemplazó la caja ilustrada de personajes por una **UI interactiva de Recarga Rápida de Free Fire**:
  - Input para ID de jugador de Free Fire con validación numérica inmediata.
  - Selector en cuadrícula de paquetes de diamantes (100, 310, 520, 1060 diamantes, Pase Booyah, Membresía) con etiquetas de bonificación festiva (+10%).
  - Indicador de acreditación automática (< 2 min) y soporte de pago con saldo de billetera o depósito directo.
  - Botón píldora con brillo azul eléctrico y redirección fluida al checkout del catálogo.
  - Burbujas flotantes de reseñas destacadas con contorno de hielo y magenta.

### 4. Servidor y Conectividad
- Next.js en ejecución en `0.0.0.0:3000`, accesible simultáneamente desde:
  - **PC**: `http://localhost:3000`
  - **Móvil (Wi-Fi/LAN)**: `http://192.168.0.6:3000`
- Compilación de producción `next build` verificada exitosamente (20/20 rutas estáticas y dinámicas).


## [2026-11-12] Implementación Completa de Módulos 6.3, 6.5, 6.7 y Reseñas Flotantes en Tiempo Real

### 1. Reseñas Flotantes del Hero en Tiempo Real (`HeroReviewsFloat.tsx`)
- Conexión a Supabase con filtro `destacado_hero = true` y suscripción Realtime a cambios en la tabla `reviews`.
- Rediseño ultra-compacto: Solo avatar con halo neón y nombre/nickname del gamer con insignia de verificación (sin texto de comentario ni estrellas).
- Rotación infinita automática con ciclo de 4 segundos y animación suave `fade-in` / `fade-out`.
- Integración en `HeroChristmas.tsx` en posiciones flotantes sobre la tarjeta de recarga rápida.

### 2. Control Administrativo de Referencias del Hero (`/admin/comentarios`)
- Sección dedicada **"Referencias del Hero (En Vivo)"** con:
  - Previsualizador en tiempo real de la cápsula flotante.
  - Interruptores de 1 clic para activar o excluir clientes de la rotación.
  - Selector de intervalo de rotación (3s, 4s, 6s).
  - Modal para dar de alta referencias directas de clientes VIP.

### 3. Editor de Plantillas de Notificaciones (`/admin/notificaciones` - Módulo 6.5)
- Creación de tabla `notification_templates` en Supabase con RLS y permisos administrativos.
- Migración y actualización de RPCs (`aprobar_recarga_saldo` y `rechazar_recarga_saldo`) para interpolar plantillas dinámicas con `{monto}`, `{saldo_actual}`, `{motivo}`, `{codigo}`.
- Interfaz gráfica completa en `/admin/notificaciones` con inserción rápida de variables, botón de restablecer a fábrica y simulador de notificación push en pantalla de cliente.

### 4. CRUD Completo de Catálogo & Modal de Requisitos (`/admin/catalogo` - Módulo 6.7)
- Modales de Creación, Edición y Eliminación en los 4 niveles jerárquicos:
  - Categorías (con generación automática de slug y control de orden).
  - Subcategorías vinculadas a la categoría activa.
  - Productos con descripción y estado.
  - Variantes con sembrado automático de precios para los 6 roles de usuario.
- Modal flotante especializado para la configuración de Requisitos de Entrega (ID de Jugador, Nickname, Correo, Personalizado).
