# demarrer_securise.ps1
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DÉMARRAGE SÉCURISÉ - GESTION DOSSIERS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$PROJECT_PATH = "E:\mon-projet-final"

# 1. Vérifier les prérequis
Write-Host "`n[1/4] Vérification des prérequis..." -ForegroundColor Blue

# Vérifier PostgreSQL
$pg = Get-Service postgresql* -ErrorAction SilentlyContinue
if ($pg -and $pg.Status -ne 'Running') {
    Start-Service -Name $pg.Name
    Write-Host "  ✅ PostgreSQL démarré" -ForegroundColor Green
}

# Vérifier Redis (Memurai)
$redis = Get-Service Memurai -ErrorAction SilentlyContinue
if ($redis -and $redis.Status -ne 'Running') {
    Start-Service -Name "Memurai"
    Write-Host "  ✅ Redis démarré" -ForegroundColor Green
}

# 2. Configurer le pare-feu
Write-Host "`n[2/4] Configuration du pare-feu..." -ForegroundColor Blue
Remove-NetFirewallRule -DisplayName "GestionDossiers-*" -ErrorAction SilentlyContinue
New-NetFirewallRule -DisplayName "GestionDossiers-Django" -Direction Inbound -Protocol TCP -LocalPort 8000 -Action Allow -Profile Private
New-NetFirewallRule -DisplayName "GestionDossiers-React" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow -Profile Private
Write-Host "  ✅ Pare-feu configuré" -ForegroundColor Green

# 3. Démarrer Django
Write-Host "`n[3/4] Démarrage Django..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
cd '$PROJECT_PATH\mon_projet_django_propre'
.\venv\Scripts\Activate.ps1
Write-Host '=== DJANGO BACKEND ===' -ForegroundColor Green
python manage.py runserver 0.0.0.0:8000
"@
Start-Sleep -Seconds 3

# 4. Démarrer React
Write-Host "[4/4] Démarrage React..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
cd '$PROJECT_PATH\frontend-propre'
Write-Host '=== REACT FRONTEND ===' -ForegroundColor Green
npx vite --host 0.0.0.0 --port 3000
"@

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  ✅ SERVEUR DÉMARRÉ" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "🌐 Accès : http://192.168.0.111:3000" -ForegroundColor Cyan
Write-Host "🔐 Identifiants : interesse@example.com / password123" -ForegroundColor Yellow
Write-Host ""
Write-Host "📊 Surveillance : .\surveiller.ps1" -ForegroundColor White