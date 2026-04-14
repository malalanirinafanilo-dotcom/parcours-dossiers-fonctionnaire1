# test.ps1
Write-Host "=== TEST API ===" -ForegroundColor Cyan

Write-Host "1. Verification des fichiers..." -ForegroundColor Yellow

$filesToCheck = @{
    "api/views.py" = "RoleSerializer"
    "api/serializers.py" = "class RoleSerializer"
}

foreach ($file in $filesToCheck.Keys) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        if ($content -match $filesToCheck[$file]) {
            Write-Host "OK $file" -ForegroundColor Green
        } else {
            Write-Host "ERREUR $file: $($filesToCheck[$file]) manquant" -ForegroundColor Red
        }
    } else {
        Write-Host "ERREUR $file n'existe pas" -ForegroundColor Red
    }
}

Write-Host "2. Test de connexion..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login/" `
        -Method POST `
        -Body '{"email":"admin@example.com","password":"admin123"}' `
        -ContentType "application/json"
    
    Write-Host "Connexion reussie!" -ForegroundColor Green
    $token = $response.access
    
    $headers = @{ "Authorization" = "Bearer $token" }
    $me = Invoke-RestMethod -Uri "http://localhost:8000/api/users/me/" -Method GET -Headers $headers
    Write-Host "Utilisateur: $($me.email)" -ForegroundColor Cyan
    
} catch {
    Write-Host "Erreur de connexion" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

Write-Host "=== FIN ===" -ForegroundColor Cyan