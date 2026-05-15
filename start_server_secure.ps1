# start_server_secure.ps1 - Démarrage sécurisé
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DÉMARRAGE SÉCURISÉ - GESTION DOSSIERS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$SERVER_IP = "192.168.0.111"
$PROJECT_PATH = "E:\mon-projet-final"

# Vérifier les logs
$LOG_DIR = "$PROJECT_PATH\logs"
if (-not (Test-Path $LOG_DIR)) {
    New-Item -ItemType Directory -Path $LOG_DIR -Force
}

# 1. Vérifier le pare-feu
Write-Host "[1/4] Vérification pare-feu..." -ForegroundColor Blue
Get-NetFirewallRule | Where-Object {$_.DisplayName -like "GestionDossiers*"} | ForEach-Object {
    Write-Host "  ✅ Règle active : $($_.DisplayName)" -ForegroundColor Green
}

# 2. Démarrer Django avec SSL
Write-Host "[2/4] Démarrage Django (SSL)..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
cd '$PROJECT_PATH\mon_projet_django_propre'
.\venv\Scripts\Activate.ps1
Write-Host '=== DJANGO BACKEND (HTTPS) ===' -ForegroundColor Green
Write-Host "API sécurisée : https://$SERVER_IP`:8000/api" -ForegroundColor Yellow
python manage.py runsslserver --certificate $PROJECT_PATH\certificats\cert.pem --key $PROJECT_PATH\certificats\key.pem 0.0.0.0:8000
"@

# 3. Démarrer React
Write-Host "[3/4] Démarrage React..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
cd '$PROJECT_PATH\frontend-propre'
Write-Host '=== REACT FRONTEND ===' -ForegroundColor Green
Write-Host "Application : https://$SERVER_IP`:3000" -ForegroundColor Yellow
npx vite --host 0.0.0.0 --port 3000
"@

# 4. Démarrer la surveillance
Write-Host "[4/4] Démarrage surveillance..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "powershell -File $PROJECT_PATH\surveillance_continue.ps1"

Write-Host ""
Write-Host "✅ SERVEUR SÉCURISÉ DÉMARRÉ !" -ForegroundColor Green
Write-Host "🌐 HTTPS : https://$SERVER_IP`:3000" -ForegroundColor Cyan
Write-Host "⚠️  Acceptez le certificat auto-signé dans le navigateur" -ForegroundColor Yellow