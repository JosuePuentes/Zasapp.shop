# Deploy en Vercel (zasapp-shop.vercel.app)

Para que la web y la ruta **/api/graphql** funcionen bien:

1. **Root Directory:** En el proyecto de Vercel → Settings → General, pon **Root Directory** en `enatega-multivendor-web` (o la ruta relativa a la raíz del repo que apunte a esta carpeta). Así el build ejecuta `npm install` y `npm run build` desde aquí.
2. **Framework Preset:** Next.js.
3. **Build Command:** `npm run build` (por defecto).
4. **Variables de entorno:** `NEXT_PUBLIC_SERVER_URL` y `NEXT_PUBLIC_WS_SERVER_URL` apuntando a tu backend (ej. `https://zasapp-shop.onrender.com` y `wss://zasapp-shop.onrender.com`).

Si Root Directory no es esta carpeta, la ruta `/api/graphql` puede devolver 404.
