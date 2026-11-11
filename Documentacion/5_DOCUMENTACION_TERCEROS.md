# Software, Librerías y Servicios de Terceros - RM & Masha

Este documento enumera todos los servicios en la nube, librerías externas, frameworks, fuentes y activos de terceros incorporados en el proyecto, detallando su versión, licencia y rol funcional.

---

## 1. Servicios de Infraestructura en la Nube (Cloud)

| Servicio / Proveedor | Propósito en el Proyecto | Tipo de Licencia / Plan | Enlace Oficial |
| :--- | :--- | :--- | :--- |
| **Supabase** | Backend as a Service: Base de datos PostgreSQL relacional, Autenticación de usuarios, Buckets de almacenamiento de archivos (Storage) y WebSockets para tiempo real. | Open Source / Cloud Hosted | `https://supabase.com` |
| **Vercel** | Plataforma de alojamiento y despliegue del frontend Next.js con Edge Network global y Serverless Functions. | SaaS Cloud Hosting | `https://vercel.com` |
| **GitHub** | Control de versiones, repositorio de código fuente y flujos de integración continua. | Repositorio Privado / Público | `https://github.com/RmMasha/RM-MASHA` |

---

## 2. Librerías y Paquetes de Terceros (Frontend & Backend)

| Paquete / Librería | Versión | Licencia | Rol Funcional |
| :--- | :--- | :--- | :--- |
| **Next.js** | 14.x / 15.x | MIT | Framework principal de React para Server-Side Rendering (SSR), App Router y soporte nativo de Error Boundaries. |
| **React & React DOM** | 18.x / 19.x | MIT | Biblioteca base para la construcción de interfaces de usuario reactivas. |
| **Tailwind CSS** | 3.x / 4.x | MIT | Motor de utilidades CSS para diseño responsive y estética gamer/moderna. |
| **@supabase/supabase-js** | ^2.x | MIT | SDK oficial de cliente JavaScript/TypeScript para interactuar con Supabase. |
| **@supabase/ssr** | ^0.5.x | MIT | Utilidades para el manejo de cookies y sesiones de Supabase en Next.js Server Components y Middleware. |
| **lucide-react** | ^0.4x | ISC | Colección de iconos vectoriales ligeros para navegación, billetera, notificaciones y estado de pedidos. |
| **clsx / tailwind-merge** | ^2.x | MIT | Utilidades para composición condicional y segura de clases CSS de Tailwind. |

---

## 3. Tipografías y Recursos Estéticos
- **Google Fonts (Geist / Inter / Rajdhani):** Tipografías abiertas con licencia SIL Open Font License, optimizadas mediante `next/font` para carga ultrarrápida sin bloqueos de renderizado.

