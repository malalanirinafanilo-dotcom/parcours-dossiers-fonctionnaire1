# test_document_url.ps1
Write-Host "=== TEST ACCÈS DOCUMENTS ===" -ForegroundColor Cyan

# 1. Connexion
$body = @{
    email = "interesse@example.com"
    password = "password123"
} | ConvertTo-Json

$login = Invoke-RestMethod "http://localhost:8000/api/auth/login/" -Method POST -Body $body -ContentType "application/json"
$headers = @{ Authorization = "Bearer $($login.access)" }

# 2. Récupérer les dossiers
$dossiers = Invoke-RestMethod "http://localhost:8000/api/dossiers/" -Headers $headers
$dossier = $dossiers.results | Where-Object { $_.documents_count -gt 0 } | Select-Object -First 1

if ($dossier) {
    Write-Host "`n📁 Dossier avec documents: $($dossier.numero_dossier)" -ForegroundColor Green
    
    # 3. Récupérer les documents
    $docs = Invoke-RestMethod "http://localhost:8000/api/documents/?dossier=$($dossier.id)" -Headers $headers
    $documents = $docs.results
    
    foreach ($doc in $documents) {
        Write-Host "`n📄 Document: $($doc.nom)" -ForegroundColor Yellow
        Write-Host "   URL: $($doc.url)" -ForegroundColor Cyan
        Write-Host "   Fichier: $($doc.fichier)" -ForegroundColor Cyan
        
        # Tester l'accès
        try {
            $url = $doc.url
            if ($url -and $url.StartsWith('/')) {
                $url = "http://localhost:8000$url"
            }
            
            $response = Invoke-WebRequest -Uri $url -Method Head -UseBasicParsing -ErrorAction Stop
            Write-Host "   ✅ Accessible (HTTP $($response.StatusCode))" -ForegroundColor Green
        } catch {
            Write-Host "   ❌ Non accessible: $_" -ForegroundColor Red
        }
    }
} else {
    Write-Host "❌ Aucun dossier avec documents trouvé" -ForegroundColor Red
}