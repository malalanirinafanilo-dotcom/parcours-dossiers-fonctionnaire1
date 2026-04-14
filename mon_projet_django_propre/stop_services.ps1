# stop_services.ps1
Write-Host "=== ARRÊT DES SERVICES ===" -ForegroundColor Cyan

# Arrêter les processus Celery
Write-Host "`nArrêt des workers Celery..." -ForegroundColor Yellow
Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -like "*celery*"
} | Stop-Process -Force

# Arrêter Redis
Write-Host "Arrêt de Redis..." -ForegroundColor Yellow
Get-Process -Name "redis-server" -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host "`n✅ Tous les services sont arrêtés!" -ForegroundColor Green