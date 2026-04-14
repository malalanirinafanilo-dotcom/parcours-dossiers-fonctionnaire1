# test_dossiers.ps1
Write-Host "=== TEST API DOSSIERS ===" -ForegroundColor Cyan

# 1. Connexion
$body = @{
    email = "interesse@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $login = Invoke-RestMethod "http://localhost:8000/api/auth/login/" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✅ Connexion réussie" -ForegroundColor Green
    
    $headers = @{ Authorization = "Bearer $($login.access)" }
    
    # 2. Récupérer les dossiers
    $dossiers = Invoke-RestMethod "http://localhost:8000/api/dossiers/" -Headers $headers
    Write-Host "✅ Dossiers récupérés: $($dossiers.results.Count)" -ForegroundColor Green
    $dossiers.results | Select-Object id, numero_dossier, titre | Format-Table
    
} catch {
    Write-Host "❌ Erreur: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $responseBody = $reader.ReadToEnd()
        Write-Host "Détail: $responseBody" -ForegroundColor Yellow
    }
}