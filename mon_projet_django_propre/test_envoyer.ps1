# test_envoyer.ps1 - VERSION CORRIGÉE
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "TEST DE L'ENDPOINT ENVOYER" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# 1. Connexion
Write-Host "`n1. Connexion à l'API..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = "interesse@example.com"
        password = "password123"
    } | ConvertTo-Json

    $login = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login/" `
        -Method POST `
        -Headers @{ "Content-Type" = "application/json" } `
        -Body $loginBody

    $token = $login.access
    Write-Host "✅ Connecté avec succès" -ForegroundColor Green
    Write-Host "   Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
}
catch {
    Write-Host "❌ Erreur de connexion:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
}

# 2. Récupérer un dossier en BROUILLON
Write-Host "`n2. Recherche d'un dossier en BROUILLON..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }

    $dossiers = Invoke-RestMethod -Uri "http://localhost:8000/api/dossiers/?statut=BROUILLON" `
        -Method GET `
        -Headers $headers

    if ($dossiers.results.Count -eq 0) {
        Write-Host "❌ Aucun dossier en BROUILLON trouvé" -ForegroundColor Red
        Write-Host "   Liste de tous les dossiers disponibles:" -ForegroundColor Yellow
        
        $allDossiers = Invoke-RestMethod -Uri "http://localhost:8000/api/dossiers/" -Method GET -Headers $headers
        $allDossiers.results | ForEach-Object {
            Write-Host "   - $($_.numero_dossier) (ID: $($_.id)) - Statut: $($_.statut) - Étape: $($_.etape_actuelle)"
        }
        exit 1
    }

    $dossier = $dossiers.results[0]
    Write-Host "✅ Dossier trouvé:" -ForegroundColor Green
    Write-Host "   ID: $($dossier.id)" -ForegroundColor Cyan
    Write-Host "   Numéro: $($dossier.numero_dossier)" -ForegroundColor Cyan
    Write-Host "   Titre: $($dossier.titre)" -ForegroundColor Cyan
    Write-Host "   Statut: $($dossier.statut)" -ForegroundColor Cyan
    Write-Host "   Étape: $($dossier.etape_actuelle)" -ForegroundColor Cyan
}
catch {
    Write-Host "❌ Erreur récupération dossiers:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
}

# 3. Tester l'endpoint envoyer
Write-Host "`n3. Test de l'endpoint /envoyer/..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/dossiers/$($dossier.id)/envoyer/" `
        -Method POST `
        -Headers $headers `
        -Body '{}'

    Write-Host "✅ SUCCÈS !" -ForegroundColor Green
    Write-Host "   Message: $($response.message)" -ForegroundColor Green
    
    if ($response.dossier) {
        Write-Host "`n📋 Dossier mis à jour:" -ForegroundColor Cyan
        Write-Host "   Numéro: $($response.dossier.numero_dossier)" -ForegroundColor White
        Write-Host "   Statut: $($response.dossier.statut)" -ForegroundColor White
        Write-Host "   Étape: $($response.dossier.etape_actuelle)" -ForegroundColor White
    }
}
catch {
    Write-Host "❌ Échec du test" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    
    # Essayer de lire le corps de la réponse
    try {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $responseBody = $reader.ReadToEnd()
        Write-Host "Réponse: $responseBody" -ForegroundColor Red
    }
    catch {
        Write-Host "Impossible de lire la réponse" -ForegroundColor Red
    }
}

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "TEST TERMINÉ" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan