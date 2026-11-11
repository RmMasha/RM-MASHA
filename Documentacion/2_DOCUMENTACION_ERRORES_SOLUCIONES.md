# Bitácora de Errores y Soluciones Técnicas - RM & Masha

Este documento registra cada incidencia, advertencia, bloqueo o fallo detectado durante el desarrollo y despliegue del sistema, documentando **con fecha y hora exacta** la descripción del problema, la causa raíz identificada y la solución técnica implementada.

---

## Formato Estándar de Registro de Incidencias:
- **ID:** `ERR-[AÑO][MES][DIA]-[NUMERO]`
- **Fecha y Hora Exacta:** `DD/MM/AAAA - HH:MM:SS (Zona Horaria)`
- **Módulo / Componente:** (Front / Back / Base de Datos / RLS / Auth / etc.)
- **Descripción del Error:** Qué falló o qué mensaje de error se produjo.
- **Causa Raíz:** Por qué ocurrió el fallo.
- **Solución Implementada:** Qué cambios se realizaron para solucionar y mitigar el problema.
- **Estado:** `[RESUELTO]` / `[EN PROCESO]` / `[MITIGADO]`

---

## Registro Cronológico de Incidencias

### [ERR-20261111-001]
- **Fecha y Hora Exacta:** 11/11/2026 - 11:15:30 AM (UTC-4)
- **Módulo / Componente:** Inicialización de Supabase CLI (`npx supabase`)
- **Descripción del Error:** Advertencia durante la ejecución: `npm warn exec The following package was not found and will be installed: supabase@3.1.0`.
- **Causa Raíz:** El paquete global de Supabase CLI no se encontraba en el caché local de npm en Windows.
- **Solución Implementada:** Se permitió la descarga e instalación en caché de la versión `supabase@3.1.0`. Para optimizar la velocidad en comandos posteriores de CI/CD o locales, se configurará como dependencia de desarrollo dentro de `back/`.
- **Estado:** `[RESUELTO]`

### [ERR-20261111-002]
- **Fecha y Hora Exacta:** 11/11/2026 - 11:33:16 AM (UTC-4)
- **Módulo / Componente:** Conexión directa PostgreSQL (`back/scripts/migrate.js`)
- **Descripción del Error:** `getaddrinfo ENOENT db.xvwcmcrfgrclhebbcrze.supabase.co`.
- **Causa Raíz:** El dominio de conexión directa `db.[ref].supabase.co` resuelve exclusivamente en IPv6 en ciertos entornos de red de proveedores ISP o requiere el puerto y host del Connection Pooler (Supabase Pooler / Transaction mode en puerto 6543 o 5432 con Supabase CLI `db push`).
- **Solución Implementada:** Se procede a utilizar la herramienta oficial `supabase db push` vinculada al proyecto o la API REST/PostgREST para ejecutar las migraciones.
- **Estado:** `[EN PROCESO]`

### [ERR-20261111-003]
- **Fecha y Hora Exacta:** 11/11/2026 - 11:37:58 AM (UTC-4)
- **Módulo / Componente:** Script de Datos Semilla (`back/supabase/migrations/20261111120400_seed_initial_data.sql`)
- **Descripción del Error:** `invalid input syntax for type uuid: "s1111111-1111-1111-1111-111111111111"`.
- **Causa Raíz:** En los identificadores fijos de seed data para subcategorías y productos se incluyeron letras fuera del rango hexadecimal permitido para el estándar UUIDv4 (específicamente la letra 's' y 'p'). Los UUID válidos solo aceptan caracteres `0-9` y `a-f`.
- **Solución Implementada:** Se corrigieron los UUIDs de las categorías, subcategorías, productos y variantes reemplazando los caracteres no válidos por combinaciones hexadecimales canónicas válidas (`ca111111-...`, `cb222222-...`, `ba111111-...`, `da111111-...`).
- **Estado:** `[RESUELTO]`

### [ERR-20261111-004]
- **Fecha y Hora Exacta:** 11/11/2026 - 11:57:38 AM (UTC-4)
- **Módulo / Componente:** Instalación de dependencias Frontend (`Front/package.json`)
- **Descripción del Error:** Advertencia de npm: `deprecated next@14.2.15: This version has a security vulnerability. Please upgrade to a patched version. See https://nextjs.org/blog/security-update-2025-12-11 for more details`.
- **Causa Raíz:** Se fijó inicialmente la versión `14.2.15` en `package.json`, la cual fue parchada posteriormente por el equipo de Next.js en revisiones posteriores.
- **Solución Implementada:** Actualizar la especificación del paquete `next` en `Front/package.json` a la versión estable parchada `^14.2.23` o latest para garantizar máxima seguridad y estabilidad en producción.
- **Estado:** `[RESUELTO]`

### [ERR-20261111-005]
- **Fecha y Hora Exacta:** 11/11/2026 - 12:07:06 PM (UTC-4)
- **Módulo / Componente:** Scripts de Ejecución NPM (`Front/package.json` / `node_modules/.bin/next.cmd`)
- **Descripción del Error:** `"MASHA\Front\node_modules\.bin\" no se reconoce como un comando interno o externo... Cannot find module 'C:\Users\Carlos La Rosa\Documents\Carlos\Proyectos\next\dist\bin\next'`.
- **Causa Raíz:** En sistemas operativos Windows, el símbolo ampersand (`&`) presente en el nombre de la carpeta raíz del proyecto (`RM & MASHA`) es interpretado por el intérprete de comandos `cmd.exe` como un separador de instrucciones cuando se invocan los archivos por lotes `.cmd` generados por npm en `node_modules/.bin/`. Esto truncó la ruta en `Proyectos\RM` e intentó ejecutar `MASHA\...` como comando secundario.
- **Solución Implementada:** En `Front/package.json`, se configuraron los scripts de ejecución invocando directamente el binario de Node con rutas relativas entrecomilladas (`node ./node_modules/next/dist/bin/next build` y `node ./node_modules/next/dist/bin/next dev`), evitando completamente el intermediario defectuoso `cmd.exe` de npm.
- **Estado:** `[RESUELTO]`

### [ERR-20261111-006]
- **Fecha y Hora Exacta:** 11/11/2026 - 12:08:47 PM (UTC-4)
- **Módulo / Componente:** Tipado TypeScript (`Front/src/types/database.types.ts` / `Front/src/app/admin/comentarios/page.tsx`)
- **Descripción del Error:** `Type error: Property 'email' does not exist on type '{ nombre: string; nickname?: string | null | undefined; avatar_url?: string | null | undefined; pais?: string | null | undefined; }'`.
- **Causa Raíz:** En la definición de la interfaz `Review` se omitió la propiedad opcional `email` en la relación anidada con `users`, provocando un fallo de compilación estricta de TypeScript al renderizar la tabla de moderación de comentarios.
- **Solución Implementada:** Se agregó `email?: string | null;` en la definición de la interfaz `Review` dentro de `Front/src/types/database.types.ts`.
- **Estado:** `[RESUELTO]`

### [ERR-20261111-007]
- **Fecha y Hora Exacta:** 11/11/2026 - 12:09:59 PM (UTC-4)
- **Módulo / Componente:** Cliente Supabase SSR (`Front/src/lib/supabase/server.ts`)
- **Descripción del Error:** `Type error: Parameter 'cookiesToSet' implicitly has an 'any' type`.
- **Causa Raíz:** En la función `createClient` de componentes del servidor, el manejador de cookies `setAll` carecía de tipado TypeScript estricto en el argumento `cookiesToSet`, activando el fallo bajo la regla `strict: true` del compilador.
- **Solución Implementada:** Se definió la interfaz tipada explícita `cookiesToSet: Array<{ name: string; value: string; options?: any }>`.
- **Estado:** `[RESUELTO]`

### [ERR-20261111-008]
- **Fecha y Hora Exacta:** 11/11/2026 - 12:10:39 PM (UTC-4)
- **Módulo / Componente:** Pre-renderizado Next.js App Router (`useSearchParams` & SSR cookies)
- **Descripción del Error:** `useSearchParams() should be wrapped in a suspense boundary at page "/billetera", "/login", "/registro"` y `Dynamic server usage: Route / couldn't be rendered statically because it used cookies`.
- **Causa Raíz:** En Next.js 14, las páginas del cliente que leen parámetros de URL en tiempo de ejecución requieren estar aisladas dentro de un contenedor `<Suspense>` de React. Asimismo, las consultas de catálogo del lado del servidor que acceden al almacén de cookies para validar sesión deben configurarse como `dynamic = 'force-dynamic'`.
- **Solución Implementada:** Se envolvieron las páginas `/billetera`, `/login` y `/registro` con `<Suspense fallback={...}>` y se añadió `export const dynamic = 'force-dynamic'` en las rutas de Server Components dinámicos (`/`, `/catalogo`, `/catalogo/[categoria]`, etc.).
- **Estado:** `[RESUELTO]`

### [ERR-20261111-009]
- **Fecha y Hora Exacta:** 11/11/2026 - 12:14:53 PM (UTC-4)
- **Módulo / Componente:** Control de Versiones GitHub (`back/scripts/migrate.js`)
- **Descripción del Error:** `GitHub Push Protection: Push cannot contain secrets... Supabase Personal Access Token at back/scripts/migrate.js:5`.
- **Causa Raíz:** El script de migración contenía el token de acceso de Supabase en un valor de respaldo por defecto en el código fuente. GitHub Secret Scanning detectó el token y bloqueó el `push` al repositorio remoto para salvaguardar la seguridad de la infraestructura.
- **Solución Implementada:** Se eliminó cualquier token o credencial estática del código fuente de `back/scripts/migrate.js`, leyéndose únicamente desde `process.env.SUPABASE_ACCESS_TOKEN` o desde un archivo `.env` local estrictamente excluido por `.gitignore`. Se ejecutó `git commit --amend` para purgar completamente el secreto del historial de Git.
- **Estado:** `[RESUELTO]`

### [ERR-20261111-010]
- **Fecha y Hora Exacta:** 11/11/2026 - 06:27:19 PM (UTC-4)
- **Módulo / Componente:** Cliente de Navegador Supabase (`Front/src/lib/supabase/client.ts` y páginas administrativas / catálogo)
- **Descripción del Error:** `Type error: Module '"@/lib/supabase/client"' has no exported member 'supabase'`.
- **Causa Raíz:** El archivo `client.ts` solo exportaba la función factoría `createClient()`, mientras que múltiples componentes clientes requerían una instancia singleton `supabase` exportada para llamadas directas y suscripciones.
- **Solución Implementada:** Se añadió y exportó la instancia cliente singleton `export const supabase = createClient();` en `Front/src/lib/supabase/client.ts`.
- **Estado:** `[RESUELTO]`

### [ERR-20261111-011]
- **Fecha y Hora Exacta:** 11/11/2026 - 06:28:12 PM (UTC-4)
- **Módulo / Componente:** Exportaciones de Componentes (`Navbar.tsx`, `Footer.tsx`, `Snowfall.tsx`, `HeroChristmas.tsx`)
- **Descripción del Error:** `Attempted import error: '@/components/common/Snowfall' does not contain a default export (imported as 'Snowfall')` (y equivalente para Navbar, Footer y HeroChristmas).
- **Causa Raíz:** Los cuatro componentes fueron declarados con exportación nombrada (`export function Component()`) pero el diseño de `layout.tsx` y `page.tsx` los importaba usando la sintaxis de exportación por defecto (`import Component from '@/...'`).
- **Solución Implementada:** Se agregó la sentencia explícita `export default Component;` al final de cada uno de los cuatro componentes afectados, manteniendo compatibilidad con ambas sintaxis de importación.
- **Estado:** `[RESUELTO]`

### [ERR-20261111-012]
- **Fecha y Hora Exacta:** 11/11/2026 - 06:29:45 PM (UTC-4)
- **Módulo / Componente:** Tipado e Integración de Esquema Relacional (`Front/src/types/database.types.ts` y CRUDs de `/admin/`)
- **Descripción del Error:** `Type error: Property 'categoria_id' does not exist on type 'Category'`.
- **Causa Raíz:** En las migraciones PostgreSQL de Supabase, las claves primarias de las tablas relacionales (`categories`, `products`, `variants`, `orders`, `balance_recharges`, `payment_methods`, `reviews`) están definidas uniformemente como `id UUID PRIMARY KEY`, mientras que ciertas vistas de la interfaz hacían referencia a claves con prefijo (`categoria_id`, `subcategoria_id`, etc.). Asimismo, en `balance_recharges` el método de pago se almacena mediante la clave foránea `metodo_pago_id UUID` y `referencia_pago TEXT` (no mediante una columna de texto plano).
- **Solución Implementada:** Se actualizaron las interfaces en `database.types.ts` para proveer compatibilidad bi-direccional (`id` y alias opcionales), se ajustaron las consultas y mapeos para usar `id` como clave principal, y se alinearon las inserciones de depósitos en `BilleteraClient.tsx` para suministrar `metodo_pago_id` y `referencia_pago` con sus tipos exactos.
- **Estado:** `[RESUELTO]`

### [ERR-20261111-013]
- **Fecha y Hora Exacta:** 11/11/2026 - 06:39:22 PM (UTC-4)
- **Módulo / Componente:** Componente de Partículas de Nieve (`Front/src/components/common/Snowfall.tsx` / `Front/src/app/layout.tsx`)
- **Descripción del Error:** `Type error: Type '{ count: number; }' is not assignable to type 'IntrinsicAttributes'. Property 'count' does not exist on type 'IntrinsicAttributes'`.
- **Causa Raíz:** El componente `Snowfall` inicializaba un número estático de copos sin declarar la interfaz de propiedades correspondientes (`SnowfallProps`), provocando el rechazo por parte del chequeador estricto de JSX al recibir `<Snowfall count={45} />`.
- **Solución Implementada:** Se definió la interfaz `interface SnowfallProps { count?: number; }` y se actualizó la función `export function Snowfall({ count = 35 }: SnowfallProps = {})` incluyendo la dependencia en su `useEffect`.
- **Estado:** `[RESUELTO]`

### [ERR-20261111-014]
- **Fecha y Hora Exacta:** 11/11/2026 - 06:41:15 PM (UTC-4)
- **Módulo / Componente:** Contexto de Autenticación y Utilidad de Formato de Fechas (`AuthContext.tsx`, `LoginClient.tsx`, `utils.ts`)
- **Descripción del Error:** `Type error: Property 'signIn' does not exist on type 'AuthContextType'` y `Type error: Argument of type 'string | undefined' is not assignable to parameter of type 'string' in formatDate`.
- **Causa Raíz:** 1) `AuthContextType` carecía de los métodos de conveniencia `signIn` y `signUp`, forzando a los clientes de autenticación a lidiar con tipados no sincronizados. 2) La función `formatDate` requería un parámetro `string` no nulo, pero los campos de fecha de notificaciones y tablas pueden ser opcionales antes de la hidratación de datos.
- **Solución Implementada:** Se incorporaron los métodos `signIn` y `signUp` en `AuthContext` delegando a `supabase.auth.signInWithPassword` y `supabase.auth.signUp`, y se actualizó la firma de `formatDate` a `formatDate(dateString?: string | null): string`, retornando una cadena vacía segura ante valores nulos o indefinidos.
- **Estado:** `[RESUELTO]`
