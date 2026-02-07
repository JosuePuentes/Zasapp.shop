# CORS en el backend (Render) – zasapp-shop.onrender.com

## Problema

El frontend en **https://zasapp-shop.vercel.app** hace peticiones a **https://zasapp-shop.onrender.com/graphql**.  
El navegador bloquea las peticiones con:

```text
Access to fetch at 'https://zasapp-shop.onrender.com/graphql' from origin 'https://zasapp-shop.vercel.app'
has been blocked by CORS policy: Response to preflight request doesn't pass access control check:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

Esto se soluciona **solo en el backend** que sirve `zasapp-shop.onrender.com`, añadiendo cabeceras CORS que permitan el origen del frontend.

## Qué debe hacer el backend

El servidor que responde en `https://zasapp-shop.onrender.com` debe:

1. **Responder a las peticiones preflight OPTIONS** a `/graphql` (y a la ruta que uses para GraphQL) con:
   - `Access-Control-Allow-Origin: https://zasapp-shop.vercel.app`
   - `Access-Control-Allow-Methods: GET, POST, OPTIONS`
   - `Access-Control-Allow-Headers: authorization, content-type, isauth, userid, x-client-type`
   - `Access-Control-Max-Age: 86400` (opcional)

2. **En las respuestas de GET/POST** a `/graphql`, incluir al menos:
   - `Access-Control-Allow-Origin: https://zasapp-shop.vercel.app`

## Ejemplos por tecnología

### Express (Node.js)

```js
const cors = require("cors");

app.use(
  cors({
    origin: ["https://zasapp-shop.vercel.app"],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["authorization", "content-type", "isauth", "userid", "x-client-type"],
    credentials: true,
  })
);
```

O manualmente para OPTIONS:

```js
app.use("/graphql", (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://zasapp-shop.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "authorization, content-type, isauth, userid, x-client-type");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
```

### Apollo Server (Node)

Al crear el servidor, usa `cors: { origin: "https://zasapp-shop.vercel.app" }` en las opciones, o aplica el middleware CORS antes de la ruta GraphQL como arriba.

### Otro backend (Go, Python, etc.)

Asegúrate de que todas las respuestas (incluidas OPTIONS) incluyan:

- `Access-Control-Allow-Origin: https://zasapp-shop.vercel.app`
- Para OPTIONS: devolver 200 con los headers `Allow-Methods` y `Allow-Headers` indicados arriba.

## Dónde configurarlo

- Si el backend de **zasapp-shop.onrender.com** es un repo propio: edita el código del servidor (Express, Apollo, etc.) como arriba, despliega de nuevo en Render.
- Si usas un backend propietario de Zas: pide a quien mantenga ese backend que añada el origen `https://zasapp-shop.vercel.app` a la lista de orígenes permitidos por CORS.

## Comprobar que funciona

Después de desplegar los cambios en el backend:

1. Abre https://zasapp-shop.vercel.app
2. Abre DevTools → pestaña Network
3. Recarga la página y revisa la petición a `zasapp-shop.onrender.com/graphql`
4. En la respuesta no debe aparecer el error de CORS y la petición debe completarse con status 200 (o el que corresponda a tu API).
