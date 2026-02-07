# Script para subir esta carpeta (versión mercado general) a GitHub Zasapp.shop
# Ejecutar en PowerShell: .\subir-a-zasapp.ps1

Set-Location $PSScriptRoot

if (-not (Test-Path .git)) {
    git init
    git remote add origin https://github.com/JosuePuentes/Zasapp.shop.git
}

git add .
git status
Write-Host "`nSi todo se ve bien, se hara commit y push. ¿Continuar? (S/N)" -ForegroundColor Yellow
$r = Read-Host
if ($r -eq 'S' -or $r -eq 's') {
    git commit -m "Versión mercado general: sin enfoque restaurante"
    git branch -M main
    git push -u origin main --force
    Write-Host "Listo. Revisa https://github.com/JosuePuentes/Zasapp.shop y Vercel." -ForegroundColor Green
} else {
    Write-Host "Cancelado. Puedes hacer commit y push manualmente." -ForegroundColor Gray
}
