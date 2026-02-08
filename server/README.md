# Backend / API (Zasapp)

Esta carpeta contiene el **servidor/API** del proyecto.

- **`index.js`**: Punto de entrada del servidor (Express + CORS ya configurado para `https://zasapp-shop.vercel.app`).
- **`package.json`**: Dependencias; en Render ejecuta `npm install` y `npm start`.
- **`.env`**: Variables de entorno con tu MongoDB y demás secretos (no se sube a GitHub).
- **`.env.example`**: Plantilla sin contraseñas para quien clone el repo.

**GraphQL (Apollo Server)** en `/graphql`:
- **createUser**: registro de cliente (nombre, apellido, teléfono, correo, contraseña, dirección). Role por defecto: CLIENT.
- **login**: tipo `email` o `credentials` con email y password.
- **profile**: perfil del usuario autenticado (requiere header `Authorization: Bearer <token>`).
- **searchProducts(department)**: productos de tiendas con `status: APPROVED` y `isActive: true`. Precio final = costPrice × (1 + marginPercent/100). Filtro opcional por categoría (Farmacia, Repuestos).
- **configuration**: configuración básica para el front.

Para que `searchProducts` devuelva resultados, crea al menos una **Store** con `status: "APPROVED"` y `isActive: true`, y **Product**s con `store` referenciando esa tienda, `costPrice`, `marginPercent` y `category`.

## MongoDB

La URI en `.env` apunta a tu cluster en Atlas: **Zasapp**.  
Usuario: `josuepuentes1234_db_user`.

## Conectar el backend (Render) a la base de datos

El backend que corre en **Render** (`zasapp-shop.onrender.com`) debe tener las mismas variables de entorno que usas en `server/.env` para conectarse a MongoDB y funcionar bien.

En el **dashboard de Render** → tu servicio (backend/API) → **Environment** → añade al menos:

| Variable        | Descripción |
|----------------|-------------|
| `MONGODB_URI`  | URI de MongoDB Atlas (la misma de tu `server/.env`). Ejemplo: `mongodb+srv://usuario:password@zasapp.xxxxx.mongodb.net/?appName=Zasapp` |
| `JWT_SECRET`   | Secreto para firmar tokens (usa el mismo que en `.env` o uno seguro en producción) |
| `PORT`         | Suele ser `8001` o el que Render asigne |
| `SERVER_URL`   | URL pública del backend, ej. `https://zasapp-shop.onrender.com/` |
| `WS_SERVER_URL`| WebSocket, ej. `wss://zasapp-shop.onrender.com/` |

Después de guardar las variables, Render vuelve a desplegar el servicio. Si `MONGODB_URI` es correcta y Atlas permite conexiones desde cualquier IP (o desde las IPs de Render), el backend quedará conectado a tu base de datos.

**Para instalar Mongoose y desplegar tras cambios en el código:**
1. En el Dashboard de Render → tu servicio (ej. zas-api).
2. **Manual Deploy:** clic en **"Clear Build Cache & Deploy"** para forzar `npm install` y cargar las nuevas dependencias (p. ej. Mongoose).
3. Sin `MONGODB_URI` en Environment, el servidor puede devolver 503 en `/api/products`; comprueba que la variable esté definida.

**Comprobar en MongoDB Atlas:**
- En el cluster **Zasapp**, en *Network Access*: que haya una regla que permita acceso (p. ej. `0.0.0.0/0` para permitir desde cualquier sitio, o las IPs de Render si las usas).
- Que el usuario `josuepuentes1234_db_user` tenga permisos sobre la base de datos que usa la API.
