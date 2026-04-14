# test_ia_corrige.ps1
Write-Host "=== TEST IA RULE-BASED (CORRIGÉ) ===" -ForegroundColor Cyan

# 1. Connexion
Write-Host "`n1. Connexion..." -ForegroundColor Yellow
$login = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login/" -Method POST -Body '{"email":"utilisateur@example.com","password":"password123"}' -ContentType "application/json"
$token = $login.access
$headers = @{ "Authorization" = "Bearer $token" }
Write-Host "✅ Connecté: $($login.email)" -ForegroundColor Green

# 2. Récupérer un fonctionnaire
Write-Host "`n2. Recherche d'un fonctionnaire..." -ForegroundColor Yellow
$fonctionnaires = Invoke-RestMethod -Uri "http://localhost:8000/api/fonctionnaires/" -Headers $headers
if ($fonctionnaires.results.Count -eq 0) {
    Write-Host "❌ Aucun fonctionnaire trouvé. Créez-en un d'abord." -ForegroundColor Red
    exit
}
$fonctionnaireId = $fonctionnaires.results[0].id
Write-Host "✅ Fonctionnaire sélectionné: $($fonctionnaires.results[0].nom) $($fonctionnaires.results[0].prenom)" -ForegroundColor Green

# 3. Créer un dossier avec anomalies
Write-Host "`n3. Création d'un dossier avec anomalies..." -ForegroundColor Yellow
$body = @{
    titre = "Dossier test IA"
    type_dossier = "PROMOTION"
    fonctionnaire = $fonctionnaireId
    data = @{
        nom = "Dupont"
        prenom = "Jean"
        matricule = "F001"
        grade_actuel = "A1"
        grade_demande = "A2"
        date_prise_fonction = "2020-01-01"
        salaire_base = 50000  # Trop bas pour l'indice A1
        indice = "A1"
        date_debut = "2024-01-01"
        date_fin = "2023-12-01"  # Incohérente (fin < début)
    }
} | ConvertTo-Json -Depth 3

$dossier = Invoke-RestMethod -Uri "http://localhost:8000/api/dossiers/" -Method POST -Headers $headers -Body $body -ContentType "application/json"
$dossierId = $dossier.id
Write-Host "✅ Dossier créé: $($dossier.numero_dossier)" -ForegroundColor Green

# 4. Attendre l'analyse automatique
Write-Host "`n4. Attente de l'analyse automatique (3 secondes)..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# 5. Récupérer l'analyse
Write-Host "`n5. Récupération de l'analyse:" -ForegroundColor Cyan
try {
    $analyse = Invoke-RestMethod -Uri "http://localhost:8000/api/ia-analyses/dernier_analyse/?dossier=$dossierId" -Headers $headers
    Write-Host "✅ Analyse trouvée!" -ForegroundColor Green
    Write-Host "Score de risque: $($analyse.resultats.score_risque)/100" -ForegroundColor Yellow
    Write-Host "Classification: $($analyse.resultats.classification)" -ForegroundColor Yellow
    Write-Host "Anomalies détectées: $($analyse.resultats.anomalies.Count)" -ForegroundColor Yellow
    
    if ($analyse.resultats.anomalies.Count -gt 0) {
        Write-Host "`nDétail des anomalies:" -ForegroundColor Red
        $i = 1
        foreach ($anomalie in $analyse.resultats.anomalies) {
            Write-Host "  $i. $($anomalie.type): $($anomalie.message)" -ForegroundColor Red
            $i++
        }
    } else {
        Write-Host "✅ Aucune anomalie détectée" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Aucune analyse disponible pour le moment" -ForegroundColor Red
}

# 6. Voir le dossier avec l'analyse intégrée
Write-Host "`n6. Détail du dossier avec analyse IA:" -ForegroundColor Yellow
$dossierDetail = Invoke-RestMethod -Uri "http://localhost:8000/api/dossiers/$dossierId/" -Headers $headers
if ($dossierDetail.derniere_analyse_ia) {
    Write-Host "✅ Analyse IA intégrée dans le détail du dossier" -ForegroundColor Green
    Write-Host "Score: $($dossierDetail.derniere_analyse_ia.resultats.score_risque)/100"
} else {
    Write-Host "❌ Analyse IA non intégrée dans le détail" -ForegroundColor Red
}

Write-Host "`n=== TEST TERMINÉ ===" -ForegroundColor Cyan