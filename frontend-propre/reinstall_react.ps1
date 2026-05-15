# reinstall_react.ps1
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RÉINSTALLATION COMPLÈTE DE REACT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

cd E:\mon-projet-final\frontend-propre

Write-Host "`n[1/5] Suppression de node_modules..." -ForegroundColor Blue
Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "  ✅ Supprimé" -ForegroundColor Green

Write-Host "`n[2/5] Suppression de package-lock.json..." -ForegroundColor Blue
Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue
Write-Host "  ✅ Supprimé" -ForegroundColor Green

Write-Host "`n[3/5] Nettoyage du cache npm..." -ForegroundColor Blue
npm cache clean --force
Write-Host "  ✅ Cache nettoyé" -ForegroundColor Green

Write-Host "`n[4/5] Installation des dépendances..." -ForegroundColor Blue
npm install
Write-Host "  ✅ Dépendances installées" -ForegroundColor Green

Write-Host "`n[5/5] Démarrage du serveur React..." -ForegroundColor Blue
Write-Host "  🌐 http://localhost:3000" -ForegroundColor Yellow
Write-Host "  🌐 http://192.168.0.111:3000" -ForegroundColor Yellow

npx vite --host 0.0.0.0 --port 3000