# Registro y Documentación de Cookies - RM & Masha

Este documento describe todas las cookies utilizadas en la plataforma, su emisor, finalidad técnica, clasificación de privacidad y periodo de expiración.

---

## 1. Clasificación y Normativa
De acuerdo con las normativas internacionales de privacidad (RGPD / ePrivacy / LOPDGDD), las cookies se categorizan en:
- **Técnicas / Estrictamente Necesarias:** Imprescindibles para el funcionamiento de la sesión, navegación segura y prevención de fraude.
- **De Preferencia / Funcionalidad:** Almacenan configuraciones del usuario (tema, idioma).
- **De Rendimiento / Analíticas:** Métricas de carga de página.

---

## 2. Inventario de Cookies del Sistema

| Nombre de Cookie | Proveedor / Emisor | Finalidad Técnica | Tipo | Duración |
| :--- | :--- | :--- | :--- | :--- |
| `sb-[ref]-auth-token` | Supabase Auth | Almacena el JWT (JSON Web Token) de sesión autenticada del usuario para mantener la sesión activa entre recargas y navegación. | Estrictamente Necesaria (Técnica) | Sesión / Renovable (Típicamente 1 semana) |
| `sb-[ref]-auth-token.0`, `.1` | Supabase Auth (SSR) | Fragmentación del token JWT en chunks cuando supera el límite de tamaño de encabezado HTTP en Next.js Server Components. | Estrictamente Necesaria (Técnica) | Sesión / Renovable |
| `rm_masha_theme` | Plataforma RM & Masha | Guarda la preferencia de tema visual (oscuro/gamer por defecto). | Funcionalidad | 1 Año |
| `rm_masha_cookie_consent` | Plataforma RM & Masha | Almacena el estado de consentimiento del banner de cookies aceptado por el usuario. | Técnica / Cumplimiento Legal | 6 Meses |

---

## 3. Configuración de Seguridad de Cookies
Todas las cookies de autenticación generadas por el sistema se configuran con las siguientes directivas de cabecera HTTP:
- `HttpOnly`: Previene que scripts maliciosos de JavaScript cliente puedan acceder al token (mitigación de XSS).
- `Secure`: Solo se transmiten a través de conexiones cifradas HTTPS (excepto entorno localhost de desarrollo).
- `SameSite=Lax`: Protege contra ataques de falsificación de peticiones en sitios cruzados (CSRF).

