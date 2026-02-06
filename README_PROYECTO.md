# Zas – Repositorio oficial

Este es el **repositorio oficial** de la plataforma **Zas**.

Monorepo que contiene las aplicaciones web, móviles y panel de administración de Zas (basado en ZAS Multivendor).

## Estructura principal

| Carpeta | Descripción |
|--------|-------------|
| **ZAS-multivendor-admin** | Panel de administración (dashboard web) – Zas Admin |
| **ZAS-multivendor-app** | App móvil para clientes (consumidores) – Zas |
| **ZAS-multivendor-web** | Aplicación web para clientes – Zas Web |
| **ZAS-multivendor-store** | App para tiendas/vendedores – Zas Store |
| **ZAS-multivendor-rider** | App para repartidores (riders) – Zas Rider |
| **server** | Configuración del servidor/API (MongoDB, .env) |

## Notas

- Cada carpeta principal es un proyecto con su propio `package.json` y dependencias.
- Los nombres de paquete en `package.json` usan el prefijo `zas-` (zas-admin, zas-web, zas-app, etc.).
- Para más detalles de configuración y ejecución, ver el `README.md` en la raíz y en cada subcarpeta.
