# test_login_final.ps1
Write-Host "=== TEST DE CONNEXION (VERSION CORRIGÉE) ===" -ForegroundColor Cyan

$emails = @(
    "interesse@example.com",
    "dren@example.com",
    "men@example.com",
    "fop@example.com",
    "finance@example.com",
    "admin@example.com"
)

foreach ($email in $emails) {
    Write-Host "`n🔑 Tentative de connexion avec $email..." -ForegroundColor Yellow
    
    # Méthode 1: Construction du body avec ConvertTo-Json
    $body = @{
        email = $email
        password = "password123"
    } | ConvertTo-Json
    
    Write-Host "   Body: $body" -ForegroundColor Gray
    
    try {
        $login = Invoke-RestMethod "http://localhost:8000/api/auth/login/" -Method POST -Body $body -ContentType "application/json" -ErrorAction Stop
        Write-Host "✅ SUCCÈS ! Token reçu" -ForegroundColor Green
        
        # Tester la récupération de l'utilisateur
        $headers = @{ Authorization = "Bearer $($login.access)" }
        $me = Invoke-RestMethod "http://localhost:8000/api/users/me/" -Headers $headers -ErrorAction Stop
        Write-Host "   👤 Utilisateur: $($me.email)" -ForegroundColor Cyan
        Write-Host "   📋 Rôle: $($me.role_detail.name)" -ForegroundColor Cyan
        
    } catch {
        Write-Host "❌ Échec: $_" -ForegroundColor Red
        if ($_.Exception.Response) {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $responseBody = $reader.ReadToEnd()
            Write-Host "   Détail: $responseBody" -ForegroundColor Gray
        }
    }
}

Write-Host "`n=== FIN DU TEST ===" -ForegroundColor Cyan