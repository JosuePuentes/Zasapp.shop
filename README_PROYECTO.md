# Zasapp.shop – Proyecto (Monorepo)

Este repositorio es un **monorepo** basado en **Enatega Multivendor**, preparado para Zasapp.shop.

## Estructura principal

Las carpetas principales del monorepo son:

| Carpeta | Descripción |
|--------|-------------|
| **enatega-multivendor-admin** | Panel de administración (dashboard web) |
| **enatega-multivendor-app** | App móvil para clientes (consumidores) |
| **enatega-multivendor-web** | Aplicación web para clientes |
| **enatega-multivendor-store** | App para tiendas/vendedores |
| **enatega-multivendor-rider** | App para repartidores (riders) |

## Notas

- Cada carpeta principal es un proyecto con su propio `package.json` y dependencias.
- El backend/API es propietario de Enatega; este monorepo contiene las aplicaciones frontend y móviles.
- Para más detalles de configuración y ejecución, ver el `README.md` en la raíz y en cada subcarpeta.
