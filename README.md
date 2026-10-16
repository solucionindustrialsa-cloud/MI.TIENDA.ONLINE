# caprichitos_cosas_lindas — Tienda Online

Tienda moderna y elegante para venta de **botellas, bolsos, gorras y mochilas**. 
Colores: rosa principal (#e91e63), rosa pastel (#fce7f3), fondo blanco. 
Totalmente responsive, con carrito, buscador y pedidos por WhatsApp.

## ✨ Funcionalidades

- **Catálogo** con filtros por categoría, buscador, imágenes, precios, descripciones y stock.
- **Carrito de compras** persistente (localStorage) + checkout con datos del cliente.
- **Botón WhatsApp** por producto y en checkout (mensaje prearmado con detalle del pedido).
- **Pedidos reales** guardados en PostgreSQL y visibles en panel admin.
- **Panel administrador** en `/admin` (sin framework UI externo, 100% funcional):
  - Agregar / editar / eliminar productos (precio, categoría, stock, imágenes).
  - Subir imágenes (base64 persistente o Cloudinary si se configura).
  - Cambiar logo, colores, imágenes hero, textos.
  - Editar datos de contacto y número de WhatsApp (se aplica en toda la tienda).
  - Gestionar pedidos (cambiar estado: pendiente → confirmado → enviado → entregado).
  - Estadísticas: total productos, pedidos, ingresos estimados, stock bajo, gráficos por categoría y estado.

## 🔐 Autenticación Admin

Por pedido del cliente, **el panel está abierto sin contraseña por defecto**.

- Si `ADMIN_PASSWORD` **no está definida** en `.env`, cualquier persona que entre a `/admin` accede directamente (se crea cookie `admin_auth` automáticamente).
- Cuando quieras protegerlo: define `ADMIN_PASSWORD=tu_clave_segura` en Railway → Variables y redeploy. El panel pedirá contraseña.

Cookies: `admin_auth` httpOnly, 7 días.

## 🗄️ Backend y Base de Datos

- **Next.js 16 App Router** (API Routes).
- **PostgreSQL + Drizzle ORM** (`src/db/schema.ts`).
- Tablas: `products`, `orders`, `settings`.
- `drizzle.config.json` listo para `npx drizzle-kit push`.

## 🖼️ Almacenamiento de imágenes

Opción A (por defecto, sin configuración externa):
- Se convierte el archivo a **data URL base64** y se guarda como `imageUrl` en la BD. 100% persistente, funciona sin servicios externos.

Opción B (recomendada para producción):
- Configurá Cloudinary (gratis):
  1. Creá cuenta en https://cloudinary.com
  2. En Dashboard obtené `cloudName` y creá un **Upload Preset unsigned** (Settings → Upload).
  3. Define en `.env`: `CLOUDINARY_CLOUD_NAME=xxx` y `CLOUDINARY_UPLOAD_PRESET=xxx`.
  4. El endpoint `/api/upload` detecta y sube automáticamente.

Alternativa: reemplazar por S3/R2/Supabase Storage editando `src/app/api/upload/route.ts`.

## 🚀 Instalación local

```bash
git clone <repo>
npm install

# 1. Crea .env con DATABASE_URL
cp .env.example .env
# Edita DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db

# 2. Aplica schema
npx drizzle-kit push

# 3. Seed de datos de ejemplo (productos + config)
npm run dev
# abre http://localhost:3000/api/seed (POST o GET)

# 4. Inicia
npm run dev
# Tienda: http://localhost:3000
# Admin: http://localhost:3000/admin (abajo del todo hay acceso directo)
```

## 🌐 Deploy en Railway

1. Crear proyecto en https://railway.app → New Project → Deploy from GitHub.
2. Agregar **PostgreSQL** (Add Plugin → Database → PostgreSQL).
3. En **Variables** del servicio web, Railway inyecta `DATABASE_URL` automáticamente. Verificá que existe.
4. (Opcional) Agregá `ADMIN_PASSWORD` si querés proteger `/admin`.
5. (Opcional) Agregá `CLOUDINARY_CLOUD_NAME` y `CLOUDINARY_UPLOAD_PRESET`.
6. Deploy ejecuta automáticamente:

```bash
npm run build
npm run start   # Next.js production en $PORT
```

Archivos incluidos: `railway.json`, `nixpacks.toml`, `next.config.ts` con `remotePatterns`.

**Healthcheck:** `/api/health` (ya existe).

### Variables de entorno en Railway

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `DATABASE_URL` | Sí | Conexión Postgres (auto por Railway) |
| `ADMIN_PASSWORD` | No | Si se define, protege `/admin` |
| `CLOUDINARY_CLOUD_NAME` | No | Para subir imágenes a Cloudinary |
| `CLOUDINARY_UPLOAD_PRESET` | No | Preset unsigned Cloudinary |

### Scripts verificados

```bash
npx next typegen
npm exec tsc -- --noEmit
npm run build
```

Config `drizzle.config.json` ya apunta a `DATABASE_URL` local; en Railway usa la variable del entorno (Drizzle lee `DATABASE_URL`).

## 📁 Estructura

```
src/
  app/
    page.tsx (tienda)
    admin/page.tsx (panel)
    api/products, orders, settings, upload, auth, seed
  db/schema.ts, index.ts
  components/ StoreHeader, ProductCard, CartContext, CartDrawer, StoreClient
```

## 📝 Notas

- Todas las operaciones admin guardan en Postgres de forma permanente.
- El panel cambia colores y textos en tiempo real (guardados en tabla `settings`).
- WhatsApp: usar formato internacional sin + ni espacios: `5491123456789`.
- No hay funciones inventadas sin implementar.

¡Listo para vender! 💖
