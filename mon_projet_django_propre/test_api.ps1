# test_api.ps1
Write-Host "=== TEST API ===" -ForegroundColor Cyan

# 1. Connexion
Write-Host "`n1. Connexion..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login/" `
        -Method POST `
        -Body '{"email":"admin@example.com","password":"admin123"}' `
        -ContentType "application/json"
    
    Write-Host "Connexion reussie!" -ForegroundColor Green
    $token = $response.access
} catch {
    Write-Host "Erreur de connexion" -ForegroundColor Red
    exit
}

# 2. Headers
$headers = @{
    "Authorization" = "Bearer $token"
}

# 3. Tester differents endpoints
$endpoints = @(
    "/api/users/me/",
    "/api/users/",
    "/api/roles/"
)

foreach ($endpoint in $endpoints) {
    Write-Host "`nTest GET $endpoint" -ForegroundColor Yellow
    try {
        $result = Invoke-RestMethod -Uri "http://localhost:8000$endpoint" -Method GET -Headers $headers
        Write-Host "Succes!" -ForegroundColor Green
        Write-Host $result
    } catch {
        Write-Host "Echec" -ForegroundColor Red
    }
}

Write-Host "`n=== FIN ===" -ForegroundColor Cyan