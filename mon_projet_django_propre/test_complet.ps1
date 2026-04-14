# test_complet.ps1
Write-Host "=== TEST COMPLET DE L'API ===" -ForegroundColor Cyan

# 1. Connexion
Write-Host "`n1. Connexion avec interesse@example.com..." -ForegroundColor Yellow
$body = @{
    email = "interesse@example.com"
    password = "password123"
} | ConvertTo-Json

$login = Invoke-RestMethod "http://localhost:8000/api/auth/login/" -Method POST -Body $body -ContentType "application/json"
$headers = @{ Authorization = "Bearer $($login.access)" }
Write-Host "✅ Connecté" -ForegroundColor Green

# 2. Récupérer l'utilisateur
Write-Host "`n2. Informations utilisateur:" -ForegroundColor Yellow
$me = Invoke-RestMethod "http://localhost:8000/api/users/me/" -Headers $headers
Write-Host "   Email: $($me.email)" -ForegroundColor Cyan
Write-Host "   Rôle: $($me.role_detail.name)" -ForegroundColor Cyan
Write-Host "   Nom: $($me.first_name) $($me.last_name)" -ForegroundColor Cyan

# 3. Créer un dossier
Write-Host "`n3. Création d'un dossier test..." -ForegroundColor Yellow
$dossierBody = @{
    titre = "Dossier test $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    type_dossier = "PROMOTION"
    code_mouvement = "02"
    fonctionnaire_nom = "Intéressé"
    fonctionnaire_prenom = "Test"
    fonctionnaire_matricule = "TEST001"
} | ConvertTo-Json

$dossier = Invoke-RestMethod "http://localhost:8000/api/dossiers/" -Method POST -Headers $headers -Body $dossierBody -ContentType "application/json"
Write-Host "✅ Dossier créé:" -ForegroundColor Green
Write-Host "   Numéro: $($dossier.numero_dossier)" -ForegroundColor Cyan
Write-Host "   Titre: $($dossier.titre)" -ForegroundColor Cyan
Write-Host "   Statut: $($dossier.statut)" -ForegroundColor Cyan

# 4. Récupérer les dossiers
Write-Host "`n4. Liste des dossiers:" -ForegroundColor Yellow
$dossiers = Invoke-RestMethod "http://localhost:8000/api/dossiers/" -Headers $headers
$dossiersList = $dossiers.results
Write-Host "   Total: $($dossiersList.Count) dossiers" -ForegroundColor Green
$dossiersList | Select-Object -First 3 | ForEach-Object {
    Write-Host "   - $($_.numero_dossier): $($_.titre) [$($_.statut)]" -ForegroundColor Gray
}

Write-Host "`n=== TEST RÉUSSI ===" -ForegroundColor Green