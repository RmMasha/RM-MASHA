# Tecnologías Utilizadas y Justificación Técnica - RM & Masha

Este documento describe la totalidad de las tecnologías seleccionadas para la plataforma "RM & Masha", fundamentando el motivo de su elección y la función específica que cumplen dentro de la arquitectura.

---

## 1. Frontend & Framework: Next.js (React) con TypeScript

### ¿Qué es?
Next.js es el framework líder de React para aplicaciones web modernas con soporte nativo para Server-Side Rendering (SSR), Server Components y App Router.

### ¿Para qué se usa en RM & Masha?
1. **Aislamiento por Error Boundaries (`error.tsx`):** Garantiza que fallos en subpáginas de catálogo (ej. un producto sin stock o error de renderizado) se contengan sin botar el Home ni la barra de navegación.
2. **SEO y Carga Ultrarrápida:** El catálogo de diamantes y servicios se renderiza del lado del servidor para posicionamiento orgánico en motores de búsqueda.
3. **Rutas Dinámicas Jerárquicas:** Facilita la navegación limpia `/catalogo/[categoria]/[subcategoria]/[producto]`.
4. **Seguridad y Tipado Estricto (TypeScript):** Evita errores de tipo en tiempo de ejecución al manipular balances, precios dinámicos y estados de pedidos.

---

## 2. Estilos y Diseño: Tailwind CSS

### ¿Qué es?
Un framework de diseño CSS basado en clases de utilidad altamente optimizadas para rendimiento y personalización.

### ¿Para qué se usa en RM & Masha?
1. **Estética Gamer Premium:** Interfaz oscura, moderna, con acentos de color neón (rojos/dorados/cian), tarjetas translúcidas (*glassmorphism*) y bordes iluminados.
2. **Diseño 100% Responsive:** Experiencia fluida tanto en dispositivos móviles (donde los jugadores de Free Fire compran comúnmente) como en computadoras de escritorio.
3. **Cero CSS Innecesario:** El compilador de Tailwind solo incluye en el bundle final las clases realmente utilizadas, reduciendo el peso de la página a pocos kilobytes.

---

## 3. Backend, Base de Datos y Autenticación: Supabase (PostgreSQL)

### ¿Qué es?
Plataforma backend de código abierto construida sobre PostgreSQL, que provee base de datos relacional, autenticación segura, almacenamiento de archivos y eventos en tiempo real.

### ¿Para qué se usa en RM & Masha?
1. **PostgreSQL Relacional:** Estructura íntegra para usuarios, catálogo jerárquico, matriz de precios por roles y pedidos.
2. **Seguridad a Nivel de Fila (Row Level Security - RLS):**
   - Asegura que los usuarios solo vean sus propios pedidos y transacciones.
   - **Ocultamiento estricto:** El rol `programador` es completamente invisible e inaccesible para usuarios con rol `admin`.
3. **Transacciones Atómicas de Saldo (Postgres Functions):**
   - El cobro mediante saldo interno se realiza a través de funciones SQL con `FOR UPDATE` para bloquear registros concurrentes, garantizando consistencia financiera estricta (no es posible gastar dos veces el mismo saldo).
4. **Supabase Realtime:**
   - La campanita de notificaciones y el saldo del usuario se actualizan instantáneamente sin necesidad de recargar la página web.
5. **Supabase Storage:**
   - Buckets seguros para la subida y almacenamiento de comprobantes de pago (restringidos a administradores y al propio dueño) y fotos de perfil (avatares públicos).

---

## 4. Despliegue e Infraestructura: Vercel & GitHub

### ¿Qué es?
Plataforma cloud optimizada para Next.js con integración directa a repositorios Git.

### ¿Para qué se usa en RM & Masha?
1. **Integración y Despliegue Continuo (CI/CD):** Cada actualización enviada a la rama principal de GitHub se compila y publica automáticamente.
2. **Red de Distribución Global (Edge CDN):** Tiempos de respuesta mínimos para usuarios en toda Latinoamérica y el mundo.
3. **Disponibilidad 99.99%:** Tolerancia a picos de tráfico durante promociones y eventos especiales de Free Fire.

