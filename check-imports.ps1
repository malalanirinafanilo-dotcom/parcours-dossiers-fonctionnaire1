Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VÉRIFICATION DES IMPORTS FRONTEND" -ForegroundColor Cyan
Write-Host "========================================
" -ForegroundColor Cyan
cd E:\mon-projet-final\frontend-propre
Write-Host "1. Vérification des fichiers TypeScript..." -ForegroundColor Yellow
npx tsc --noEmit 2>&1 | Select-String "error"
Write-Host "
2. Vérification des dépendances..." -ForegroundColor Yellow
npm ls --depth=0 2>&1 | Select-String "missing|invalid|conflict"
Write-Host "
3. Vérification des duplications dans les imports..." -ForegroundColor Yellow
Get-ChildItem -Recurse -Filter "*.tsx" -ErrorAction SilentlyContinue | ForEach-Object {
     = Get-Content .FullName -Raw
    if ( -match "import.*from.*\.\.\.\./") {
        Write-Host "  ⚠️ Import relatif suspect: " -ForegroundColor Yellow
    }
}
Write-Host "
✅ Vérification terminée" -ForegroundColor Green
