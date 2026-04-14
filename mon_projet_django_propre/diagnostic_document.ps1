# diagnostic_document.ps1
Write-Host "=== DIAGNOSTIC DES DOCUMENTS ===" -ForegroundColor Cyan

# 1. Connexion
$body = @{
    email = "interesse@example.com"
    password = "password123"
} | ConvertTo-Json

$login = Invoke-RestMethod "http://localhost:8000/api/auth/login/" -Method POST -Body $body -ContentType "application/json"
$headers = @{ Authorization = "Bearer $($login.access)" }

# 2. Récupérer les documents
$docs = Invoke-RestMethod "http://localhost:8000/api/documents/" -Headers $headers

Write-Host "`n📊 Documents trouvés: $($docs.results.Count)" -ForegroundColor Green

foreach ($doc in $docs.results) {
    Write-Host "`n📄 Document: $($doc.nom)" -ForegroundColor Yellow
    Write-Host "   📁 ID: $($doc.id)" -ForegroundColor Gray
    Write-Host "   📁 Dossier ID: $($doc.dossier)" -ForegroundColor Gray
    Write-Host "   🔗 URL: $($doc.url)" -ForegroundColor Cyan
    Write-Host "   📁 Fichier: $($doc.fichier)" -ForegroundColor Cyan
    Write-Host "   📏 Taille: $($doc.taille)" -ForegroundColor Cyan
    Write-Host "   📅 Créé le: $($doc.created_at)" -ForegroundColor Gray
}