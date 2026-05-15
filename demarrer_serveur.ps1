# demarrer_serveur.ps1
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DÉMARRAGE DU SERVEUR - GESTION DOSSIERS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$SERVER_IP = "192.168.0.111"
$PROJECT_PATH = "E:\mon-projet-final"

Write-Host "📡 IP du serveur : $SERVER_IP" -ForegroundColor Yellow
Write-Host ""

# Démarrer Django
Write-Host "[1/2] Démarrage Django..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
cd '$PROJECT_PATH\mon_projet_django_propre'
.\venv\Scripts\Activate.ps1
Write-Host '=== DJANGO BACKEND ===' -ForegroundColor Green
Write-Host "API disponible sur http://$SERVER_IP`:8000/api" -ForegroundColor Yellow
python manage.py runserver 0.0.0.0:8000
"@

Start-Sleep -Seconds 3

# Démarrer React
Write-Host "[2/2] Démarrage React..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
cd '$PROJECT_PATH\frontend-propre'
Write-Host '=== REACT FRONTEND ===' -ForegroundColor Green
Write-Host "Application disponible sur http://$SERVER_IP`:3000" -ForegroundColor Yellow
npx vite --host 0.0.0.0 --port 3000
"@

Write-Host ""
Write-Host "✅ Serveur démarré !" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Accès depuis le client : http://$SERVER_IP`:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  Pour arrêter : Fermez les 2 fenêtres PowerShell"