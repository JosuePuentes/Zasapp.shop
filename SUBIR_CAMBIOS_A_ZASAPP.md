# Subir tus cambios (mercado general, sin enfoque restaurante) a Zasapp.shop

Tu proyecto está en esta carpeta pero **no tiene Git inicializado**. Sigue estos pasos en **PowerShell** o **Git Bash** para subir todo a https://github.com/JosuePuentes/Zasapp.shop

## 1. Abrir terminal en esta carpeta

```powershell
cd "c:\Users\puent\Downloads\food-delivery-multivendor-main\food-delivery-multivendor-main"
```

## 2. Inicializar Git y conectar con tu repo

```powershell
git init
git remote add origin https://github.com/JosuePuentes/Zasapp.shop.git
```

## 3. Traer el estado actual del repo (si ya tiene commits)

Si el repo en GitHub ya tiene contenido, tienes dos opciones:

**Opción A – Reemplazar todo lo que está en GitHub con tu versión local** (tu versión “mercado general” será la única):

```powershell
git add .
git commit -m "Versión mercado general: sin enfoque restaurante"
git branch -M main
git push -u origin main --force
```

**Opción B – Mantener el historial de GitHub y fusionar** (más técnico):

```powershell
git fetch origin
git add .
git commit -m "Versión mercado general: sin enfoque restaurante"
git branch -M main
git pull origin main --allow-unrelated-histories
# Resuelve conflictos si los hay, luego:
git push -u origin main
```

## 4. Después del push

- En **Vercel** (zasapp-shop.vercel.app), si el proyecto está conectado a `JosuePuentes/Zasapp.shop` y a la rama `main`, debería iniciarse un deploy automático.
- Si no despliega, en el dashboard de Vercel revisa que el repo sea **Zasapp.shop** y la rama **main**, y haz un “Redeploy” si hace falta.

---

**Resumen:** Tu código (sin enfoque restaurante, mercado general) está en esta carpeta. Con los comandos de la **Opción A** lo subes y reemplazas lo que haya en `main` en GitHub; con la **Opción B** intentas conservar el historial existente.
