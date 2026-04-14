# start_services.ps1
Write-Host "=== DÉMARRAGE DES SERVICES ===" -ForegroundColor Cyan

# Vérifier que Redis est installé
$redisCheck = Get-Command redis-server -ErrorAction SilentlyContinue
if (-not $redisCheck) {
    Write-Host "❌ Redis n'est pas installé!" -ForegroundColor Red
    Write-Host "Téléchargez Redis depuis: https://github.com/microsoftarchive/redis/releases" -ForegroundColor Yellow
    exit
}

# Démarrer Redis dans un nouveau terminal
Write-Host "`n1. Démarrage de Redis..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "redis-server"

# Attendre que Redis démarre
Start-Sleep -Seconds 2

# Activer l'environnement virtuel
Write-Host "`n2. Activation de l'environnement virtuel..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

# Démarrer Celery Worker dans un nouveau terminal
Write-Host "`n3. Démarrage de Celery Worker..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$pwd'; .\venv\Scripts\Activate.ps1; celery -A config worker --loglevel=info"

# Démarrer Celery Beat (pour les tâches planifiées) dans un nouveau terminal
Write-Host "`n4. Démarrage de Celery Beat..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$pwd'; .\venv\Scripts\Activate.ps1; celery -A config beat --loglevel=info"

# Démarrer le serveur Django
Write-Host "`n5. Démarrage du serveur Django..." -ForegroundColor Yellow
python manage.py runserver

Write-Host "`n✅ Tous les services sont démarrés!" -ForegroundColor Green