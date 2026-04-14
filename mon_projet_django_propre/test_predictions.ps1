# test_predictions.ps1
Write-Host "=== TEST DES PRÉDICTIONS ML ===" -ForegroundColor Cyan

# 1. Connexion
Write-Host "`n1. Connexion..." -ForegroundColor Yellow
$login = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login/" -Method POST -Body '{"email":"utilisateur@example.com","password":"password123"}' -ContentType "application/json"
$token = $login.access
$headers = @{ "Authorization" = "Bearer $token" }

# 2. Récupérer la liste des dossiers
Write-Host "`n2. Récupération des dossiers..." -ForegroundColor Yellow
$dossiers = Invoke-RestMethod -Uri "http://localhost:8000/api/dossiers/" -Headers $headers
$dossierId = $dossiers.results[0].id
Write-Host "✅ Dossier sélectionné: $dossierId" -ForegroundColor Green

# 3. Tester la prédiction de statut
Write-Host "`n3. Prédiction de statut:" -ForegroundColor Cyan
try {
    $predStatut = Invoke-RestMethod -Uri "http://localhost:8000/api/ia-analyses/predic_statut/?dossier=$dossierId" -Headers $headers
    Write-Host "✅ Prédiction:" -ForegroundColor Green
    Write-Host "   Statut: $($predStatut.statut_pred)"
    Write-Host "   Confiance: $($predStatut.confiance * 100)%"
    Write-Host "   Probabilités:"
    $predStatut.probabilites.PSObject.Properties | ForEach-Object {
        Write-Host "     $($_.Name): $($_.Value * 100)%"
    }
} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Tester la prédiction de délai
Write-Host "`n4. Prédiction de délai:" -ForegroundColor Cyan
try {
    $predDelai = Invoke-RestMethod -Uri "http://localhost:8000/api/ia-analyses/predic_delai/?dossier=$dossierId" -Headers $headers
    Write-Host "✅ Prédiction:" -ForegroundColor Green
    Write-Host "   Délai total estimé: $($predDelai.delai_total_estime) jours"
    Write-Host "   Délai écoulé: $($predDelai.delai_ecoule) jours"
    Write-Host "   Délai restant estimé: $($predDelai.delai_restant_estime) jours"
} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Voir le détail du dossier avec prédictions intégrées
Write-Host "`n5. Détail du dossier avec prédictions:" -ForegroundColor Cyan
$dossierDetail = Invoke-RestMethod -Uri "http://localhost:8000/api/dossiers/$dossierId/" -Headers $headers
if ($dossierDetail.prediction_statut) {
    Write-Host "✅ Prédictions intégrées:" -ForegroundColor Green
    Write-Host "   Statut prédit: $($dossierDetail.prediction_statut.statut_pred)"
    Write-Host "   Délai restant: $($dossierDetail.prediction_delai.delai_restant_estime) jours"
} else {
    Write-Host "❌ Prédictions non disponibles" -ForegroundColor Red
}

Write-Host "`n=== FIN DU TEST ===" -ForegroundColor Cyan