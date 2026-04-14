# check_server.ps1
Write-Host "=== DIAGNOSTIC DU SERVEUR ===" -ForegroundColor Cyan

# 1. Vérifier si le serveur tourne
Write-Host "`n1. Vérification du processus Django..." -ForegroundColor Yellow
$django = Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*manage.py*" }

if ($django) {
    Write-Host "✅ Django est en cours d'exécution (PID: $($django.Id))" -ForegroundColor Green
} else {
    Write-Host "❌ Django n'est PAS en cours d'exécution" -ForegroundColor Red
    Write-Host "   Démarrez-le avec: python manage.py runserver" -ForegroundColor Yellow
}

# 2. Tester la connexion à l'API
Write-Host "`n2. Test de l'API..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/" -Method GET -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ API accessible (HTTP $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ API inaccessible: $_" -ForegroundColor Red
}

# 3. Tester l'accès aux fichiers médias
Write-Host "`n3. Test du dossier media..." -ForegroundColor Yellow
$mediaUrl = "http://localhost:8000/media/"
try {
    $response = Invoke-WebRequest -Uri $mediaUrl -Method GET -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Dossier media accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ Dossier media inaccessible: $_" -ForegroundColor Red
}

# 4. Vérifier les fichiers physiques
Write-Host "`n4. Vérification des fichiers physiques..." -ForegroundColor Yellow
$mediaPath = "E:\dossier bureau\mon-projet-final\mon_projet_django_propre\media\documents"
if (Test-Path $mediaPath) {
    $files = Get-ChildItem $mediaPath
    Write-Host "📁 Dossier documents trouvé" -ForegroundColor Green
    Write-Host "📄 Fichiers trouvés: $($files.Count)" -ForegroundColor Cyan
    $files | Select-Object -First 5 | ForEach-Object {
        Write-Host "   - $($_.Name) ($([math]::Round($_.Length/1KB,2)) KB)" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ Dossier documents non trouvé: $mediaPath" -ForegroundColor Red
}

# 5. Proposer de démarrer le serveur
if (-not $django) {
    Write-Host "`n=== ACTION REQUISE ===" -ForegroundColor Magenta
    Write-Host "1️⃣  Ouvrez un NOUVEAU terminal PowerShell" -ForegroundColor Yellow
    Write-Host "2️⃣  Exécutez:" -ForegroundColor Yellow
    Write-Host "   cd 'E:\dossier bureau\mon-projet-final\mon_projet_django_propre'" -ForegroundColor White
    Write-Host "   venv\Scripts\activate" -ForegroundColor White
    Write-Host "   python manage.py runserver" -ForegroundColor White
    Write-Host "3️⃣  Rechargez cette page" -ForegroundColor Yellow
}

Write-Host "`n=== FIN DU DIAGNOSTIC ===" -ForegroundColor Cyan