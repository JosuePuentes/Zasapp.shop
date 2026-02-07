# Deploy en Vercel (zasapp-shop.vercel.app)

Para que la web y la ruta **/api/graphql** funcionen bien:

1. **Root Directory (crítico)**  
   En el proyecto de Vercel → **Settings → General → Root Directory**:
   - Si tu repo tiene esta estructura: `repo/` → `enatega-multivendor-web/`, pon: **`enatega-multivendor-web`**
   - Si tienes algo como `repo/food-delivery-multivendor-main/enatega-multivendor-web/`, pon la ruta relativa hasta esta carpeta (ej. **`food-delivery-multivendor-main/enatega-multivendor-web`**).
   - Después de cambiar, haz **Redeploy** (Deployments → ⋮ → Redeploy).

2. **Framework Preset:** Next.js.

3. **Build Command:** `npm run build` (por defecto).

4. **Variables de entorno:**  
   `NEXT_PUBLIC_SERVER_URL` y `NEXT_PUBLIC_WS_SERVER_URL` apuntando al backend (ej. `https://zasapp-shop.onrender.com` y `wss://zasapp-shop.onrender.com`), **sin** `/graphql` al final.

**Comprobar que las APIs están desplegadas**

- Abre **https://zasapp-shop.vercel.app/api/health** en el navegador. Debe devolver JSON `{ "ok": true, "api": "enatega-multivendor-web", ... }`.
- Si `/api/health` devuelve 404 (página HTML), el build no está usando esta carpeta como raíz: revisa Root Directory y vuelve a desplegar.
- Cuando `/api/health` responda bien, `/api/graphql` debería responder también.
