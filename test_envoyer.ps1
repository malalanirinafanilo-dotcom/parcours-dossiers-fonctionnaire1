# test_envoyer.ps1
Write-Host "=== TEST ENDPOINT ENVOYER ===" -ForegroundColor Cyan

# 1. Connexion pour obtenir un token
Write-Host "`n1. Connexion..." -ForegroundColor Yellow
try {
    $login = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login/" `
        -Method POST `
        -Body '{"email":"interesse@example.com","password":"password123"}' `
        -ContentType "application/json"
    
    $token = $login.access
    Write-Host "✅ Connecté avec token" -ForegroundColor Green
} catch {
    Write-Host "❌ Échec de connexion" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit
}

# 2. Récupérer un dossier en BROUILLON
Write-Host "`n2. Recherche d'un dossier à envoyer..." -ForegroundColor Yellow
$headers = @{ "Authorization" = "Bearer $token" }

try {
    $dossiers = Invoke-RestMethod -Uri "http://localhost:8000/api/dossiers/?statut=BROUILLON" -Headers $headers
    $dossiersList = $dossiers.results
    
    if ($dossiersList.Count -eq 0) {
        Write-Host "❌ Aucun dossier en BROUILLON trouvé" -ForegroundColor Red
        exit
    }
    
    $dossierId = $dossiersList[0].id
    Write-Host "✅ Dossier sélectionné: $($dossiersList[0].numero_dossier) (ID: $dossierId)" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Erreur récupération dossiers" -ForegroundColor Red
    exit
}

# 3. Tester l'endpoint envoyer
Write-Host "`n3. Test de l'endpoint /envoyer/..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/dossiers/$dossierId/envoyer/" `
        -Method POST `
        -Headers $headers `
        -Body '{}' `
        -ContentType "application/json"
    
    Write-Host "✅ SUCCÈS !" -ForegroundColor Green
    Write-Host "   Message: $($response.message)"
    
    # Afficher le dossier mis à jour
    $dossier = $response.dossier
    if ($dossier) {
        Write-Host "`n📋 Dossier mis à jour:" -ForegroundColor Cyan
        Write-Host "   Numéro: $($dossier.numero_dossier)"
        Write-Host "   Statut: $($dossier.statut)"
        Write-Host "   Étape: $($dossier.etape_actuelle)"
    }
    
} catch {
    Write-Host "❌ Échec du test" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
    
    # Essayer de lire le corps de la réponse
    try {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Réponse: $responseBody" -ForegroundColor Red
    } catch {
        Write-Host "Impossible de lire la réponse" -ForegroundColor Red
    }
}

Write-Host "`n=== TEST TERMINÉ ===" -ForegroundColor Cyan