# surveiller.ps1 - Surveillance rapide
Write-Host "=== SURVEILLANCE SERVEUR ===" -ForegroundColor Cyan
Write-Host "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n" -ForegroundColor Yellow

# Services
$pg = Get-Service postgresql* -ErrorAction SilentlyContinue
Write-Host "PostgreSQL : $($pg.Status)" -ForegroundColor $(if($pg.Status -eq 'Running'){'Green'}else{'Red'})

# Ports
$django = netstat -an | findstr ":8000" | findstr "LISTENING"
$react = netstat -an | findstr ":3000" | findstr "LISTENING"
Write-Host "Port 8000 (Django) : $(if($django){'ÉCOUTE'}else{'FERMÉ'})" -ForegroundColor $(if($django){'Green'}else{'Red'})
Write-Host "Port 3000 (React)  : $(if($react){'ÉCOUTE'}else{'FERMÉ'})" -ForegroundColor $(if($react){'Green'}else{'Red'})

# Connexions actives
$conn = netstat -an | findstr ":8000" | findstr "ESTABLISHED" | Measure-Object | Select-Object -ExpandProperty Count
Write-Host "Connexions actives : $conn" -ForegroundColor $(if($conn -gt 30){'Red'}else{'Green'})

# Test API
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/dossiers/" -Method GET -TimeoutSec 3
    Write-Host "API Django : OK (Status $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "API Django : INACCESSIBLE" -ForegroundColor Red
}