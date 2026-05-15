# surveillance_continue.ps1 - Surveillance en temps réel
while ($true) {
    Clear-Host
    $DATE = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    
    Write-Host "=== SURVEILLANCE TEMPS RÉEL ===" -ForegroundColor Cyan
    Write-Host "Date : $DATE" -ForegroundColor Yellow
    Write-Host ""
    
    # Connexions actives
    $active = netstat -an | findstr ":8000" | findstr "ESTABLISHED" | Measure-Object | Select-Object -ExpandProperty Count
    Write-Host "🔌 Connexions Django : $active" -ForegroundColor $($active -gt 20 ? "Red" : "Green")
    
    # Processus
    $python = Get-Process python -ErrorAction SilentlyContinue
    $node = Get-Process node -ErrorAction SilentlyContinue
    Write-Host "🐍 Python : $($python.Count) instances" -ForegroundColor $($python ? "Green" : "Red")
    Write-Host "📦 Node : $($node.Count) instances" -ForegroundColor $($node ? "Green" : "Red")
    
    # CPU
    $cpu = Get-Counter "\Processor(_Total)\% Processor Time" -ErrorAction SilentlyContinue
    if ($cpu) {
        Write-Host "💻 CPU : $([math]::Round($cpu.CounterSamples.CookedValue, 1))%"
    }
    
    # Mémoire
    $mem = Get-Counter "\Memory\Available MBytes" -ErrorAction SilentlyContinue
    if ($mem) {
        Write-Host "💾 RAM disponible : $([math]::Round($mem.CounterSamples.CookedValue, 0)) MB"
    }
    
    Write-Host ""
    Write-Host "Appuyez sur Ctrl+C pour quitter"
    Start-Sleep -Seconds 5
}