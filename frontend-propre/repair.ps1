# repair.ps1 - Réparation complète
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RÉPARATION COMPLÈTE DE REACT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

cd E:\mon-projet-final\frontend-propre

# 1. Arrêter tous les processus Node
Write-Host "`n[1/6] Arrêt des processus Node..." -ForegroundColor Blue
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host "  ✅ Processus arrêtés" -ForegroundColor Green

# 2. Supprimer node_modules avec force
Write-Host "`n[2/6] Suppression de node_modules..." -ForegroundColor Blue
if (Test-Path "node_modules") {
    # Prendre ownership
    takeown /F "node_modules" /R /D Y 2>$null
    icacls "node_modules" /grant "${env:USERNAME}":F /T 2>$null
    # Supprimer
    Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
}
Write-Host "  ✅ node_modules supprimé" -ForegroundColor Green

# 3. Supprimer package-lock.json
Write-Host "`n[3/6] Suppression de package-lock.json..." -ForegroundColor Blue
Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue
Write-Host "  ✅ package-lock.json supprimé" -ForegroundColor Green

# 4. Nettoyer le cache npm
Write-Host "`n[4/6] Nettoyage du cache npm..." -ForegroundColor Blue
npm cache clean --force
Write-Host "  ✅ Cache nettoyé" -ForegroundColor Green

# 5. Réinstallation
Write-Host "`n[5/6] Installation des dépendances..." -ForegroundColor Blue
npm install --legacy-peer-deps
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ⚠️ npm a échoué, tentative avec yarn..." -ForegroundColor Yellow
    npm install -g yarn
    yarn install
}
Write-Host "  ✅ Dépendances installées" -ForegroundColor Green

# 6. Démarrer
Write-Host "`n[6/6] Démarrage du serveur..." -ForegroundColor Blue
Write-Host "  🌐 http://localhost:3000" -ForegroundColor Yellow
Write-Host "  🌐 http://192.168.0.111:3000" -ForegroundColor Yellow

npx vite --host 0.0.0.0 --port 3000