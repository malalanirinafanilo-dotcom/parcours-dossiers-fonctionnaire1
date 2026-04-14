# monitor.ps1
Write-Host "=== SURVEILLANCE DES SERVICES ===" -ForegroundColor Cyan

# Vérifier Redis
$redis = Get-Process -Name "redis-server" -ErrorAction SilentlyContinue
if ($redis) {
    Write-Host "✅ Redis: en cours d'exécution (PID: $($redis.Id))" -ForegroundColor Green
} else {
    Write-Host "❌ Redis: arrêté" -ForegroundColor Red
}

# Vérifier Celery Worker
$celeryWorker = Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*celery*worker*" }
if ($celeryWorker) {
    Write-Host "✅ Celery Worker: en cours d'exécution (PID: $($celeryWorker.Id))" -ForegroundColor Green
} else {
    Write-Host "❌ Celery Worker: arrêté" -ForegroundColor Red
}

# Vérifier Celery Beat
$celeryBeat = Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*celery*beat*" }
if ($celeryBeat) {
    Write-Host "✅ Celery Beat: en cours d'exécution (PID: $($celeryBeat.Id))" -ForegroundColor Green
} else {
    Write-Host "❌ Celery Beat: arrêté" -ForegroundColor Red
}

# Vérifier Django
$django = Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*manage.py runserver*" }
if ($django) {
    Write-Host "✅ Django: en cours d'exécution (PID: $($django.Id))" -ForegroundColor Green
} else {
    Write-Host "❌ Django: arrêté" -ForegroundColor Red
}