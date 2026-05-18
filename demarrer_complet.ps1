# demarrer_local.ps1 - Script complet pour démarrer en local (CORRIGÉ)
# À exécuter dans PowerShell (Administrateur recommandé)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DEMARRAGE LOCAL - GESTION DOSSIERS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$PROJECT_PATH = "E:\mon-projet-final"

# ==================== 1. Vérification des prérequis ====================
Write-Host "`n[1/6] Verification des prerequis..." -ForegroundColor Blue

# Créer le dossier logs si nécessaire
if (-not (Test-Path "$PROJECT_PATH\logs")) {
    New-Item -ItemType Directory -Path "$PROJECT_PATH\logs" -Force | Out-Null
    Write-Host "  [OK] Dossier logs cree" -ForegroundColor Green
}

# Vérifier Node.js
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host "  [OK] Node.js $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "  [ERREUR] Node.js non installe" -ForegroundColor Red
    Write-Host "  Telechargez Node.js depuis https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Vérifier Python
$pythonVersion = python --version 2>$null
if ($pythonVersion) {
    Write-Host "  [OK] Python $pythonVersion" -ForegroundColor Green
} else {
    Write-Host "  [ERREUR] Python non trouve. Verifiez l'environnement virtuel." -ForegroundColor Red
    Write-Host "  Activez l'environnement virtuel avec: .\venv\Scripts\Activate.ps1" -ForegroundColor Yellow
    exit 1
}

# ==================== 2. Tuer les processus existants sur les ports ====================
Write-Host "`n[2/6] Nettoyage des ports..." -ForegroundColor Blue

function Stop-ProcessOnPort {
    param($port)
    $processes = netstat -ano 2>$null | findstr ":$port" | findstr "LISTENING"
    if ($processes) {
        foreach ($line in $processes) {
            $parts = $line -split '\s+'
            $pid = $parts[-1]
            if ($pid -match '^\d+$') {
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                Write-Host "  [OK] Processus sur le port $port (PID: $pid) arrete" -ForegroundColor Green
            }
        }
    }
}

Stop-ProcessOnPort -port 8000
Stop-ProcessOnPort -port 3000
Start-Sleep -Seconds 2

# ==================== 3. Vérifier le fichier .env ====================
Write-Host "`n[3/6] Configuration du frontend..." -ForegroundColor Blue

$envFile = "$PROJECT_PATH\frontend-propre\.env"
$envContentCorrect = "VITE_API_URL=http://127.0.0.1:8000/api"

if (Test-Path $envFile) {
    $envContent = Get-Content $envFile -Raw
    if ($envContent.Trim() -ne $envContentCorrect) {
        Write-Host "  [ACTION] Correction du .env..." -ForegroundColor Yellow
        Set-Content -Path $envFile -Value $envContentCorrect -NoNewline
        Write-Host "  [OK] .env corrige" -ForegroundColor Green
    } else {
        Write-Host "  [OK] .env correct" -ForegroundColor Green
    }
} else {
    Write-Host "  [ACTION] Creation du .env..." -ForegroundColor Yellow
    Set-Content -Path $envFile -Value $envContentCorrect -NoNewline
    Write-Host "  [OK] .env cree" -ForegroundColor Green
}

# ==================== 4. Démarrer Django Backend ====================
Write-Host "`n[4/6] Demarrage Django Backend..." -ForegroundColor Blue

$backendPath = "$PROJECT_PATH\mon_projet_django_propre"
if (-not (Test-Path $backendPath)) {
    Write-Host "  [ERREUR] Dossier backend non trouve: $backendPath" -ForegroundColor Red
    exit 1
}

Write-Host "  [ACTION] Demarrage du serveur Django..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
Write-Host '========================================' -ForegroundColor Green
Write-Host '  DJANGO BACKEND' -ForegroundColor Green
Write-Host '========================================' -ForegroundColor Green
Write-Host 'API: http://localhost:8000/api' -ForegroundColor Yellow
Write-Host 'Admin: http://localhost:8000/admin' -ForegroundColor Yellow
Write-Host ''
cd '$backendPath'

# Activer l'environnement virtuel
if (Test-Path '.\venv\Scripts\Activate.ps1') {
    .\venv\Scripts\Activate.ps1
    Write-Host '[OK] Environnement virtuel active' -ForegroundColor Green
} else {
    Write-Host '[ATTENTION] Environnement virtuel non trouve' -ForegroundColor Yellow
}

Write-Host ''
Write-Host 'Demarrage du serveur...' -ForegroundColor Cyan
python manage.py runserver
"@

Start-Sleep -Seconds 8

# Vérifier que Django a bien démarré
$djangoStarted = $false
for ($i = 1; $i -le 10; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/api/" -Method Head -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $djangoStarted = $true
            Write-Host "  [OK] Django est operationnel sur http://localhost:8000" -ForegroundColor Green
            break
        }
    } catch {
        Write-Host "  [INFO] Attente du demarrage de Django... ($i/10)" -ForegroundColor Yellow
        Start-Sleep -Seconds 2
    }
}

if (-not $djangoStarted) {
    Write-Host "  [ATTENTION] Django semble ne pas repondre. Verifiez manuellement." -ForegroundColor Yellow
}

# ==================== 5. Installer les dépendances frontend si nécessaire ====================
Write-Host "`n[5/6] Verification du frontend..." -ForegroundColor Blue

$frontendPath = "$PROJECT_PATH\frontend-propre"
if (-not (Test-Path $frontendPath)) {
    Write-Host "  [ERREUR] Dossier frontend non trouve: $frontendPath" -ForegroundColor Red
    exit 1
}

Push-Location $frontendPath

if (-not (Test-Path "node_modules")) {
    Write-Host "  [ACTION] Installation des dependances React..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  [ERREUR] npm install a echoue" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Write-Host "  [OK] Dependances installees" -ForegroundColor Green
} else {
    Write-Host "  [OK] Dependances deja presentes" -ForegroundColor Green
}

Pop-Location

# ==================== 6. Démarrer React Frontend ====================
Write-Host "`n[6/6] Demarrage React Frontend..." -ForegroundColor Blue

Write-Host "  [ACTION] Demarrage du serveur React..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
Write-Host '========================================' -ForegroundColor Green
Write-Host '  REACT FRONTEND' -ForegroundColor Green
Write-Host '========================================' -ForegroundColor Green
Write-Host 'Local: http://localhost:3000' -ForegroundColor Yellow
Write-Host ''
cd '$frontendPath'
npm run dev
"@

Start-Sleep -Seconds 8

# Vérifier que React a bien démarré
$reactStarted = $false
for ($i = 1; $i -le 10; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/" -Method Head -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $reactStarted = $true
            Write-Host "  [OK] React est operationnel sur http://localhost:3000" -ForegroundColor Green
            break
        }
    } catch {
        Write-Host "  [INFO] Attente du demarrage de React... ($i/10)" -ForegroundColor Yellow
        Start-Sleep -Seconds 2
    }
}

if (-not $reactStarted) {
    Write-Host "  [ATTENTION] React semble ne pas repondre. Verifiez manuellement." -ForegroundColor Yellow
}

# ==================== RÉCAPITULATIF ====================
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  [OK] PLATEFORME COMPLETE DEMARREE !" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "SERVICES LANCES :" -ForegroundColor Cyan
Write-Host "  - Django (Backend API) : http://localhost:8000" -ForegroundColor White
Write-Host "  - React (Frontend) : http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "ACCES :" -ForegroundColor Cyan
Write-Host "  - http://localhost:3000" -ForegroundColor White
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
Write-Host "IMPORTANT :" -ForegroundColor Yellow
Write-Host "  - Ne fermez PAS les fenetres PowerShell !" -ForegroundColor White
Write-Host "  - Pour arreter : fermez les fenetres PowerShell" -ForegroundColor White
Write-Host "  - Si l'application ne se connecte pas, attendez 10 secondes et rafraichissez" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

# Ouvrir le navigateur sur le serveur
Write-Host "`nOuverture du navigateur..." -ForegroundColor Cyan
Start-Sleep -Seconds 3

try {
    Start-Process "http://localhost:3000"
    Write-Host "  [OK] Navigateur ouvert" -ForegroundColor Green
} catch {
    Write-Host "  [INFO] Ouvrez manuellement http://localhost:3000" -ForegroundColor Yellow
}