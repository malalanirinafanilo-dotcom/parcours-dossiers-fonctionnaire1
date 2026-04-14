# Script de test API
Write-Host "=== TEST DE L'API ===" -ForegroundColor Cyan

# Tester le login
Write-Host "`n1. Test de connexion avec admin:" -ForegroundColor Yellow
$body = @{
    email = "admin@education.gouv.fr"
    password = "Admin123!"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/token/" -Method Post -Body $body -ContentType "application/json"
    Write-Host "✅ Connexion réussie!" -ForegroundColor Green
    Write-Host "Token: $($response.access.Substring(0, 30))..." -ForegroundColor Gray
    
    # Tester l'endpoint /auth/me/
    Write-Host "`n2. Test de l'endpoint /auth/me/:" -ForegroundColor Yellow
    $me = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/me/" -Method Get -Headers @{Authorization = "Bearer $($response.access)"}
    Write-Host "✅ Données utilisateur reçues!" -ForegroundColor Green
    Write-Host "Email: $($me.email)" -ForegroundColor Gray
    Write-Host "Rôle: $($me.role)" -ForegroundColor Gray
}
catch {
    Write-Host "❌ Erreur: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $responseBody = $reader.ReadToEnd()
        Write-Host "Détails: $responseBody" -ForegroundColor Red
    }
}

Read-Host "`nAppuyez sur Entrée pour continuer"