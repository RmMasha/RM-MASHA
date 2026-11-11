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
