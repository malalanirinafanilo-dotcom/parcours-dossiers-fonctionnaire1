# surveillance.ps1 - Script de surveillance complète
# À exécuter périodiquement ou en continu

$LOG_DIR = "E:\mon-projet-final\logs"
$DATE = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

# Créer le dossier de logs
if (-not (Test-Path $LOG_DIR)) {
    New-Item -ItemType Directory -Path $LOG_DIR -Force
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SURVEILLANCE - GESTION DOSSIERS" -ForegroundColor Cyan
Write-Host "  $DATE" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

# ==================== 1. VÉRIFICATION DES SERVICES ====================
Write-Host "`n[1/6] VÉRIFICATION DES SERVICES..." -ForegroundColor Blue

$services = @("postgresql*", "Memurai")
foreach ($service in $services) {
    $svc = Get-Service -Name $service -ErrorAction SilentlyContinue
    if ($svc) {
        $status = $svc.Status
        if ($status -eq "Running") {
            Write-Host "  ✅ $($svc.DisplayName) : $status" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $($svc.DisplayName) : $status" -ForegroundColor Red
            Add-Content -Path "$LOG_DIR\services_errors.log" -Value "$DATE - $($svc.DisplayName) est $status"
        }
    }
}

# ==================== 2. VÉRIFICATION DES PROCESSUS ====================
Write-Host "`n[2/6] VÉRIFICATION DES PROCESSUS..." -ForegroundColor Blue

$processes = @("python", "node")
foreach ($proc in $processes) {
    $running = Get-Process -Name $proc -ErrorAction SilentlyContinue
    if ($running) {
        Write-Host "  ✅ $proc : $($running.Count) instance(s)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $proc : NON TROUVÉ" -ForegroundColor Red
        Add-Content -Path "$LOG_DIR\process_errors.log" -Value "$DATE - $proc non trouvé"
    }
}

# ==================== 3. VÉRIFICATION DES PORTS ====================
Write-Host "`n[3/6] VÉRIFICATION DES PORTS..." -ForegroundColor Blue

$ports = @{8000="Django"; 3000="React"; 5432="PostgreSQL"; 6379="Redis"}
foreach ($port in $ports.Keys) {
    $listening = netstat -an | findstr ":$port " | findstr "LISTENING"
    if ($listening) {
        Write-Host "  ✅ Port $port ($($ports[$port])) : ÉCOUTE" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Port $port ($($ports[$port])) : NON ÉCOUTE" -ForegroundColor Red
        Add-Content -Path "$LOG_DIR\ports_errors.log" -Value "$DATE - Port $port non écoutant"
    }
}

# ==================== 4. TEST DE L'API ====================
Write-Host "`n[4/6] TEST DE L'API..." -ForegroundColor Blue

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/dossiers/" -Method GET -TimeoutSec 5
    if ($response.StatusCode -eq 401) {
        Write-Host "  ✅ API Django : Répond (401 attendu)" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️ API Django : Status $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ❌ API Django : INACCESSIBLE" -ForegroundColor Red
    Add-Content -Path "$LOG_DIR\api_errors.log" -Value "$DATE - API Django inaccessible"
}

# ==================== 5. TEST DU FRONTEND ====================
Write-Host "`n[5/6] TEST DU FRONTEND..." -ForegroundColor Blue

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✅ React : RÉPOND" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️ React : Status $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ❌ React : INACCESSIBLE" -ForegroundColor Red
    Add-Content -Path "$LOG_DIR\frontend_errors.log" -Value "$DATE - React inaccessible"
}

# ==================== 6. CONNEXIONS SUSPECTES ====================
Write-Host "`n[6/6] ANALYSE DES CONNEXIONS..." -ForegroundColor Blue

$connections = netstat -an | findstr ":8000 " | findstr "ESTABLISHED"
$count = ($connections | Measure-Object).Count
Write-Host "  🔌 Connexions actives sur Django : $count" -ForegroundColor Yellow

if ($count -gt 50) {
    Write-Host "  ⚠️ ALERTE : $count connexions actives!" -ForegroundColor Red
    Add-Content -Path "$LOG_DIR\suspicious.log" -Value "$DATE - $count connexions actives sur Django"
}

# ==================== RÉCAPITULATIF ====================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  SURVEILLANCE TERMINÉE" -ForegroundColor Green
Write-Host "  Logs dans : $LOG_DIR" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan