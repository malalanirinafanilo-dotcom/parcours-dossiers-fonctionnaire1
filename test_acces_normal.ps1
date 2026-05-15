# test_acces_normal.ps1
# Test de l'acces d'un utilisateur normal aux endpoints admin

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST ACCES UTILISATEUR NORMAL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$API_URL = "http://localhost:8000/api"

Write-Host "`n[1/2] Login avec utilisateur normal..." -ForegroundColor Blue
$body = @{
    email = "interesse@example.com"
    password = "Interesse@2024#Dossier!"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$API_URL/auth/login/" -Method Post -Body $body -ContentType "application/json"
    $tokenNormal = $response.access
    
    Write-Host "  [OK] Login utilisateur normal reussi" -ForegroundColor Green
} catch {
    Write-Host "  [ERREUR] Login utilisateur normal echoue" -ForegroundColor Red
    Read-Host "Appuyez sur Entree pour quitter"
    exit
}

Write-Host "`n[2/2] Test acces aux endpoints admin..." -ForegroundColor Blue
$headersNormal = @{
    Authorization = "Bearer $tokenNormal"
}

try {
    $users = Invoke-RestMethod -Uri "$API_URL/admin/users/" -Method Get -Headers $headersNormal
    Write-Host "  [ERREUR] ACCES AUTORISE - Anormal! L'utilisateur normal ne devrait pas voir ca!" -ForegroundColor Red
} catch {
    Write-Host "  [OK] ACCES REFUSE - Normal! L'utilisateur normal ne peut pas acceder a /admin/users/" -ForegroundColor Green
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  TEST TERMINE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Read-Host "Appuyez sur Entree pour quitter"