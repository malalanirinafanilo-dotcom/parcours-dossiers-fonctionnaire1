# fix_and_test.ps1
Write-Host "=== VÉRIFICATION ET TEST API ===" -ForegroundColor Cyan

# 1. Vérifier que les fichiers sont corrects
Write-Host "`n1. Vérification des fichiers..." -ForegroundColor Yellow

$filesToCheck = @{
    "api/views.py" = "RoleSerializer"
    "api/serializers.py" = "class RoleSerializer"
}

foreach ($file in $filesToCheck.Keys) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        if ($content -match $filesToCheck[$file]) {
            Write-Host "✅ $file OK" -ForegroundColor Green
        } else {
            Write-Host "❌ $file: $($filesToCheck[$file]) manquant" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ $file n'existe pas" -ForegroundColor Red
    }
}

# 2. Démarrer le serveur (dans un nouveau window)
Write-Host "`n2. Démarrage du serveur..." -ForegroundColor Yellow
Write-Host "👉 Ouvrez un NOUVEAU terminal PowerShell et exécutez:" -ForegroundColor White
Write-Host "   cd '$pwd'" -ForegroundColor Gray
Write-Host "   venv\Scripts\activate" -ForegroundColor Gray
Write-Host "   python manage.py runserver" -ForegroundColor Gray
Write-Host ""
Write-Host "Appuyez sur Entrée une fois le serveur démarré..." -ForegroundColor Yellow
Read-Host

# 3. Tester la connexion
Write-Host "`n3. Test de connexion..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login/" `
        -Method POST `
        -Body '{"email":"admin@example.com","password":"admin123"}' `
        -ContentType "application/json"
    
    Write-Host "✅ Connexion réussie!" -ForegroundColor Green
    $token = $response.access
} catch {
    Write-Host "❌ Échec de connexion" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit
}

# 4. Tester /api/users/me/
Write-Host "`n4. Test GET /api/users/me/..." -ForegroundColor Yellow
$headers = @{ "Authorization" = "Bearer $token" }
try {
    $me = Invoke-RestMethod -Uri "http://localhost:8000/api/users/me/" -Method GET -Headers $headers
    Write-Host "✅ Succès!" -ForegroundColor Green
    Write-Host "Utilisateur: $($me.email)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Échec" -ForegroundColor Red
}

Write-Host "`n=== TERMINÉ ===" -ForegroundColor Cyan