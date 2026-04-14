# create_test_dossier.ps1
Write-Host "=== CRÉATION D'UN DOSSIER TEST ===" -ForegroundColor Cyan

# 1. Connexion
$login = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login/" `
    -Method POST `
    -Headers @{ "Content-Type" = "application/json" } `
    -Body '{"email":"interesse@example.com","password":"password123"}'

$token = $login.access
$headers = @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" }

# 2. Récupérer un fonctionnaire
$fonctionnaires = Invoke-RestMethod -Uri "http://localhost:8000/api/fonctionnaires/" -Headers $headers
if ($fonctionnaires.results.Count -eq 0) {
    Write-Host "❌ Aucun fonctionnaire trouvé" -ForegroundColor Red
    exit 1
}
$fonctionnaireId = $fonctionnaires.results[0].id

# 3. Créer un dossier
$dossierBody = @{
    titre = "Dossier test automatique"
    type_dossier = "PROMOTION"
    fonctionnaire = $fonctionnaireId
    code_mouvement = "02"
    fonctionnaire_nom = "Test"
    fonctionnaire_prenom = "User"
    statut = "BROUILLON"
    etape_actuelle = "INTERESSE"
} | ConvertTo-Json

$dossier = Invoke-RestMethod -Uri "http://localhost:8000/api/dossiers/" `
    -Method POST `
    -Headers $headers `
    -Body $dossierBody

Write-Host "✅ Dossier créé avec succès !" -ForegroundColor Green
Write-Host "ID: $($dossier.id)" -ForegroundColor Cyan
Write-Host "Numéro: $($dossier.numero_dossier)" -ForegroundColor Cyan