Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DEMARRAGE COMPLET - GESTION DOSSIERS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$PROJECT_PATH = "E:\mon-projet-final"
$SERVER_IP = "192.168.0.111"

Write-Host "`n[1/6] Verification des prerequis..." -ForegroundColor Blue

if (-not (Test-Path "$PROJECT_PATH\logs")) {
    New-Item -ItemType Directory -Path "$PROJECT_PATH\logs" -Force | Out-Null
    Write-Host "  [OK] Dossier logs cree" -ForegroundColor Green
}

Write-Host "`n[2/6] Demarrage PostgreSQL..." -ForegroundColor Blue

$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if ($pgService) {
    if ($pgService.Status -ne 'Running') {
        Start-Service -Name $pgService.Name -ErrorAction SilentlyContinue
        Write-Host "  [OK] PostgreSQL demarre" -ForegroundColor Green
    } else {
        Write-Host "  [OK] PostgreSQL deja en cours" -ForegroundColor Green
    }
} else {
    Write-Host "  [ATTENTION] PostgreSQL non trouve" -ForegroundColor Yellow
}

Write-Host "`n[3/6] Demarrage Redis..." -ForegroundColor Blue

$redisService = Get-Service -Name "Memurai" -ErrorAction SilentlyContinue
if ($redisService) {
    if ($redisService.Status -ne 'Running') {
        Start-Service -Name "Memurai" -ErrorAction SilentlyContinue
        Write-Host "  [OK] Redis (Memurai) demarre" -ForegroundColor Green
    } else {
        Write-Host "  [OK] Redis deja en cours" -ForegroundColor Green
    }
} else {
    Write-Host "  [ATTENTION] Redis non trouve (optionnel)" -ForegroundColor Yellow
}

# ==================== 4. Démarrer Django ====================
Write-Host "`n[4/6] Demarrage Django..." -ForegroundColor Blue

# Vérifier si le port 8000 est déjà utilisé
$portUsed = netstat -an | findstr ":8000" | findstr "LISTENING"
if ($portUsed) {
    Write-Host "  [ATTENTION] Port 8000 deja utilise. Arret du processus existant..." -ForegroundColor Yellow
    $existingPid = netstat -ano | findstr ":8000" | findstr "LISTENING" | ForEach-Object { ($_ -split '\s+')[-1] }
    if ($existingPid) {
        Stop-Process -Id $existingPid -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
    }
}

Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
Write-Host '=== DJANGO BACKEND ===' -ForegroundColor Green
Write-Host 'API: http://localhost:8000/api' -ForegroundColor Yellow
Write-Host 'Admin: http://localhost:8000/admin' -ForegroundColor Yellow
Write-Host 'Reseau: http://$SERVER_IP`:8000' -ForegroundColor Yellow
Write-Host ''
cd '$PROJECT_PATH\mon_projet_django_propre'
.\venv\Scripts\Activate.ps1
python manage.py runserver 0.0.0.0:8000
"@

Start-Sleep -Seconds 3

# ==================== 5. Démarrer React ====================
Write-Host "`n[5/6] Demarrage React..." -ForegroundColor Blue

# Vérifier si le port 3000 est déjà utilisé
$portUsed = netstat -an | findstr ":3000" | findstr "LISTENING"
if ($portUsed) {
    Write-Host "  [ATTENTION] Port 3000 deja utilise. Arret du processus existant..." -ForegroundColor Yellow
    $existingPid = netstat -ano | findstr ":3000" | findstr "LISTENING" | ForEach-Object { ($_ -split '\s+')[-1] }
    if ($existingPid) {
        Stop-Process -Id $existingPid -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
    }
}

Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
Write-Host '=== REACT FRONTEND ===' -ForegroundColor Green
Write-Host 'Local: http://localhost:3000' -ForegroundColor Yellow
Write-Host 'Reseau: http://$SERVER_IP`:3000' -ForegroundColor Yellow
Write-Host ''
cd '$PROJECT_PATH\frontend-propre'
`$env:VITE_API_URL = 'http://$SERVER_IP`:8000/api'
npx vite --host 0.0.0.0 --port 3000
"@

Start-Sleep -Seconds 2

# ==================== 6. Démarrer Celery ====================
Write-Host "`n[6/6] Demarrage Celery..." -ForegroundColor Blue

Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
Write-Host '=== CELERY WORKER ===' -ForegroundColor Green
Write-Host 'Taches asynchrones : Analyses IA, Emails, Rapports' -ForegroundColor Yellow
Write-Host ''
cd '$PROJECT_PATH\mon_projet_django_propre'
.\venv\Scripts\Activate.ps1
celery -A config worker --loglevel=info --pool=solo
"@

# ==================== RÉCAPITULATIF ====================
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  [OK] PLATEFORME COMPLETE DEMARREE !" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "SERVICES LANCES :" -ForegroundColor Cyan
Write-Host "  - PostgreSQL (Base de donnees)" -ForegroundColor White
Write-Host "  - Redis (Cache / Broker Celery)" -ForegroundColor White
Write-Host "  - Django (Backend API) : http://localhost:8000" -ForegroundColor White
Write-Host "  - React (Frontend) : http://localhost:3000" -ForegroundColor White
Write-Host "  - Celery (Taches asynchrones)" -ForegroundColor White
Write-Host ""
Write-Host "ACCES :" -ForegroundColor Cyan
Write-Host "  - Sur le SERVEUR : http://localhost:3000" -ForegroundColor White
Write-Host "  - Sur le CLIENT  : http://$SERVER_IP`:3000" -ForegroundColor White
Write-Host ""
Write-Host "IDENTIFIANTS DE CONNEXION :" -ForegroundColor Cyan
Write-Host "  - Email : interesse@gmail.com" -ForegroundColor White
Write-Host "  - Mot de passe : password123" -ForegroundColor White
Write-Host ""
Write-Host "AUTRES COMPTES (mot de passe: password123) :" -ForegroundColor Cyan
Write-Host "  - DREN     : dren@gmail.com" -ForegroundColor White
Write-Host "  - MEN      : men@gmail.com" -ForegroundColor White
Write-Host "  - FOP      : fop@gmail.com" -ForegroundColor White
Write-Host "  - Finance  : finance@gmail.com" -ForegroundColor White
Write-Host "  - Admin    : admin@gmail.com" -ForegroundColor White
Write-Host ""
Write-Host "SURVEILLANCE :" -ForegroundColor Cyan
Write-Host "  - Logs acces   : $PROJECT_PATH\logs\access.log" -ForegroundColor White
Write-Host "  - Logs securite: $PROJECT_PATH\logs\security.log" -ForegroundColor White
Write-Host ""
Write-Host "IMPORTANT :" -ForegroundColor Yellow
Write-Host "  - Ne fermez PAS les fenetres PowerShell !" -ForegroundColor White
Write-Host "  - Pour arreter : fermez les 4 fenetres" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan

# Ouvrir le navigateur sur le serveur
Start-Sleep -Seconds 2
Start-Process "http://localhost:3000"