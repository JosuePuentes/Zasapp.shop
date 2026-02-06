# Backend / API (Zasapp)

Esta carpeta es para la configuración del **servidor/API** del proyecto.

- **`.env`**: Variables de entorno con tu MongoDB y demás secretos (no se sube a GitHub).
- **`.env.example`**: Plantilla sin contraseñas para quien clone el repo.

El backend de Enatega es propietario. Cuando tengas el código del API (por licencia o uno propio), colócalo aquí o apunta las apps a su URL usando `NEXT_PUBLIC_SERVER_URL` y `WS_SERVER_URL` en admin y web.

## MongoDB

La URI en `.env` apunta a tu cluster en Atlas: **Zasapp**.  
Usuario: `josuepuentes1234_db_user`.
