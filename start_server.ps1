# start_server.ps1 - Version adaptée à votre interface Wi-Fi 3
# À exécuter en Administrateur sur le SERVEUR

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DÉMARRAGE DU SERVEUR - GESTION DOSSIERS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Configuration réseau
$SERVER_IP = "192.168.0.111"  # Votre IP fixe sur Wi-Fi 3
$PROJECT_PATH = "E:\mon-projet-final"

Write-Host "📡 IP du serveur : $SERVER_IP" -ForegroundColor Yellow
Write-Host "📁 Projet : $PROJECT_PATH" -ForegroundColor Yellow
Write-Host ""

# ==================== 1. Démarrer PostgreSQL ====================
Write-Host "[1/5] Démarrage PostgreSQL..." -ForegroundColor Blue

# Chercher le service PostgreSQL (peut avoir un nom différent)
$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if ($pgService) {
    if ($pgService.Status -ne 'Running') {
        Start-Service -Name $pgService.Name
        Write-Host "  ✅ PostgreSQL démarré ($($pgService.Name))" -ForegroundColor Green
    } else {
        Write-Host "  ✅ PostgreSQL déjà en cours" -ForegroundColor Green
    }
} else {
    Write-Host "  ⚠️ PostgreSQL non trouvé. Vérifiez l'installation." -ForegroundColor Yellow
}

# ==================== 2. Démarrer Redis (Memurai) ====================
Write-Host "[2/5] Démarrage Redis..." -ForegroundColor Blue

$redisService = Get-Service -Name "Memurai" -ErrorAction SilentlyContinue
if ($redisService) {
    if ($redisService.Status -ne 'Running') {
        Start-Service -Name "Memurai"
        Write-Host "  ✅ Redis (Memurai) démarré" -ForegroundColor Green
    } else {
        Write-Host "  ✅ Redis déjà en cours" -ForegroundColor Green
    }
} else {
    Write-Host "  ⚠️ Memurai non installé (Redis non disponible)" -ForegroundColor Yellow
}

# ==================== 3. Configurer le pare-feu ====================
Write-Host "[3/5] Configuration pare-feu..." -ForegroundColor Blue

# Supprimer les anciennes règles
Remove-NetFirewallRule -DisplayName "GestionDossiers-Django" -ErrorAction SilentlyContinue
Remove-NetFirewallRule -DisplayName "GestionDossiers-React" -ErrorAction SilentlyContinue

# Créer nouvelles règles
New-NetFirewallRule -DisplayName "GestionDossiers-Django" -Direction Inbound -Protocol TCP -LocalPort 8000 -Action Allow -Profile Private
New-NetFirewallRule -DisplayName "GestionDossiers-React" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow -Profile Private

Write-Host "  ✅ Pare-feu configuré (ports 8000 et 3000 ouverts)" -ForegroundColor Green

# ==================== 4. Démarrer Django Backend ====================
Write-Host "[4/5] Démarrage Django..." -ForegroundColor Blue

# Tuer les anciens processus Python sur le port 8000
$pidList = netstat -ano | findstr :8000 | findstr LISTENING
if ($pidList) {
    $pid = ($pidList -split '\s+')[-1]
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    Write-Host "  ⚠️ Ancien processus Django arrêté" -ForegroundColor Yellow
}

Set-Location -Path "$PROJECT_PATH\mon_projet_django_propre"

# Activer l'environnement virtuel et lancer Django
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
Write-Host '=== DJANGO BACKEND ===' -ForegroundColor Green
cd '$PROJECT_PATH\mon_projet_django_propre'
.\venv\Scripts\Activate.ps1
python manage.py runserver 0.0.0.0:8000
"@

Write-Host "  ✅ Django démarré sur http://$SERVER_IP`:8000" -ForegroundColor Green

# ==================== 5. Démarrer Celery ====================
Write-Host "[5/5] Démarrage Celery..." -ForegroundColor Blue

Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
Write-Host '=== CELERY WORKER ===' -ForegroundColor Green
cd '$PROJECT_PATH\mon_projet_django_propre'
.\venv\Scripts\Activate.ps1
celery -A config worker --loglevel=info --pool=solo
"@

Write-Host "  ✅ Celery démarré" -ForegroundColor Green

# ==================== 6. Démarrer React Frontend ====================
Write-Host "[6/5] Démarrage React..." -ForegroundColor Blue

Set-Location -Path "$PROJECT_PATH\frontend-propre"

# Configurer l'API URL
[System.Environment]::SetEnvironmentVariable("VITE_API_URL", "http://$SERVER_IP`:8000/api", "Process")

Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
Write-Host '=== REACT FRONTEND ===' -ForegroundColor Green
cd '$PROJECT_PATH\frontend-propre'
`$env:VITE_API_URL='http://$SERVER_IP`:8000/api'
npm run dev -- --host 0.0.0.0 --port 3000
"@

Write-Host "  ✅ React démarré sur http://$SERVER_IP`:3000" -ForegroundColor Green

# ==================== RÉCAPITULATIF ====================
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✅ SERVEUR PRÊT" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📡 SUR LE SERVEUR (cette machine) :"
Write-Host "  - Frontend : http://localhost:3000"
Write-Host "  - API      : http://localhost:8000/api"
Write-Host "  - Admin    : http://localhost:8000/admin"
Write-Host ""
Write-Host "🖥️ SUR LE CLIENT (autre ordinateur) :"
Write-Host "  - Frontend : http://$SERVER_IP`:3000"
Write-Host "  - API      : http://$SERVER_IP`:8000/api"
Write-Host ""
Write-Host "🔐 IDENTIFIANTS DE CONNEXION :"
Write-Host "  - Email : interesse@example.com"
Write-Host "  - Mot de passe : password123"
Write-Host ""
Write-Host "  - Email : admin@example.com"
Write-Host "  - Mot de passe : admin123"
Write-Host ""
Write-Host "⚠️  Pour arrêter : Fermez toutes les fenêtres PowerShell"
Write-Host "========================================" -ForegroundColor Cyan

# Ouvrir le navigateur sur le serveur
Start-Sleep -Seconds 3
Start-Process "http://localhost:3000"