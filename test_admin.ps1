# test_admin.ps1
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST ACCÈS ADMIN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$API_URL = "http://localhost:8000/api"

Write-Host "`n[1] Login admin..." -ForegroundColor Blue
$body = @{
    email = "admin@example.com"
    password = "Admin@2024#Securite!"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$API_URL/auth/login/" -Method Post -Body $body -ContentType "application/json"
    $token = $response.access
    $user = $response.user
    
    Write-Host "  ✅ Login réussi" -ForegroundColor Green
    Write-Host "  Superuser: $($user.is_superuser)" -ForegroundColor Yellow
    Write-Host "  Email: $($user.email)" -ForegroundColor Yellow
} catch {
    Write-Host "  ❌ Login échoué: $_" -ForegroundColor Red
    Read-Host "Appuyez sur Entrée pour quitter"
    exit
}

Write-Host "`n[2] Test endpoints admin..." -ForegroundColor Blue
$headers = @{ Authorization = "Bearer $token" }

# Liste des utilisateurs
try {
    $users = Invoke-RestMethod -Uri "$API_URL/admin/users/" -Method Get -Headers $headers
    Write-Host "  ✅ GET /admin/users/ - OK ($($users.count) utilisateurs)" -ForegroundColor Green
} catch {
    Write-Host "  ❌ GET /admin/users/ - ÉCHOUÉ" -ForegroundColor Red
}

# Statistiques
try {
    $stats = Invoke-RestMethod -Uri "$API_URL/admin/users/stats/" -Method Get -Headers $headers
    Write-Host "  ✅ GET /admin/users/stats/ - OK" -ForegroundColor Green
    Write-Host "     Total users: $($stats.total_users)" -ForegroundColor Gray
} catch {
    Write-Host "  ❌ GET /admin/users/stats/ - ÉCHOUÉ" -ForegroundColor Red
}

# Dashboard
try {
    $dashboard = Invoke-RestMethod -Uri "$API_URL/admin/dashboard/stats/" -Method Get -Headers $headers
    Write-Host "  ✅ GET /admin/dashboard/stats/ - OK" -ForegroundColor Green
} catch {
    Write-Host "  ❌ GET /admin/dashboard/stats/ - ÉCHOUÉ" -ForegroundColor Red
}

# Logs
try {
    $logs = Invoke-RestMethod -Uri "$API_URL/admin/logs/" -Method Get -Headers $headers
    Write-Host "  ✅ GET /admin/logs/ - OK" -ForegroundColor Green
} catch {
    Write-Host "  ❌ GET /admin/logs/ - ÉCHOUÉ" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  TEST TERMINÉ" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Read-Host "Appuyez sur Entrée pour quitter"