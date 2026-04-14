# verification_complete.ps1 - Version complete et corrigee
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "VERIFICATION COMPLETE DE LA STACK" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 1. PYTHON
Write-Host "PYTHON" -ForegroundColor Blue
try {
    $pyVer = python --version 2>&1
    Write-Host "  Version: $pyVer" -ForegroundColor Green
    
    $pyPath = python -c "import sys; print(sys.executable)" 2>&1
    Write-Host "  Chemin: $pyPath" -ForegroundColor Green
} catch {
    Write-Host "  ERREUR: Python non trouve" -ForegroundColor Red
}
Write-Host ""

# 2. DJANGO ET PACKAGES
Write-Host "DJANGO" -ForegroundColor Blue
try {
    $djVer = python -m django --version 2>&1
    Write-Host "  Django version: $djVer" -ForegroundColor Green
    
    # Packages Django
    $drf = pip show djangorestframework 2>$null | Select-String "Version"
    if ($drf) { Write-Host "  $drf" -ForegroundColor Green }
    
    $cors = pip show django-cors-headers 2>$null | Select-String "Version"
    if ($cors) { Write-Host "  $cors" -ForegroundColor Green }
    
    $pg = pip show psycopg2-binary 2>$null | Select-String "Version"
    if ($pg) { Write-Host "  $pg" -ForegroundColor Green }
    
    $pillow = pip show pillow 2>$null | Select-String "Version"
    if ($pillow) { Write-Host "  $pillow" -ForegroundColor Green }
    
} catch {
    Write-Host "  ERREUR: Django non trouve" -ForegroundColor Red
}
Write-Host ""

# 3. POSTGRESQL (version corrigee)
Write-Host "POSTGRESQL" -ForegroundColor Blue
try {
    $pgVer = psql --version 2>&1
    Write-Host "  Client: $pgVer" -ForegroundColor Green
    
    # Tester la connexion (optionnel)
    $pgTest = psql -U postgres -h localhost -p 5432 -c "SELECT 1" 2>$null
    if ($pgTest) {
        Write-Host "  Connexion: OK" -ForegroundColor Green
    } else {
        Write-Host "  Connexion: Impossible (verifiez mot de passe)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  PostgreSQL client non trouve" -ForegroundColor Red
}
Write-Host ""

# 4. REACT
Write-Host "REACT" -ForegroundColor Blue
if (Test-Path "react") {
    Push-Location "react"
    try {
        $nodeVer = node --version 2>&1
        Write-Host "  Node.js: $nodeVer" -ForegroundColor Green
        
        $npmVer = npm --version 2>&1
        Write-Host "  npm: $npmVer" -ForegroundColor Green
        
        if (Test-Path "package.json") {
            Write-Host "  package.json: trouve" -ForegroundColor Green
            
            $reactVer = npm list react --depth=0 2>$null | Select-String "react@"
            if ($reactVer) { Write-Host "  $reactVer" }
            
            $axiosVer = npm list axios --depth=0 2>$null | Select-String "axios@"
            if ($axiosVer) { Write-Host "  $axiosVer" }
            
            $bootstrapVer = npm list bootstrap --depth=0 2>$null | Select-String "bootstrap@"
            if ($bootstrapVer) { Write-Host "  $bootstrapVer" }
        } else {
            Write-Host "  package.json: non trouve" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  ERREUR: React non fonctionnel" -ForegroundColor Red
    }
    Pop-Location
} else {
    Write-Host "  Dossier React non trouve" -ForegroundColor Yellow
}
Write-Host ""

# 5. TEST API
Write-Host "TEST API" -ForegroundColor Blue
try {
    $apiTest = curl -Method HEAD -TimeoutSec 2 http://127.0.0.1:8000/api/cours/ 2>$null
    if ($apiTest) {
        Write-Host "  API Django: OK (port 8000)" -ForegroundColor Green
    } else {
        Write-Host "  API Django: Non accessible (lancez 'python manage.py runserver')" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  API Django: Non accessible" -ForegroundColor Yellow
}
Write-Host ""

# 6. RESUME
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "RESUME DES VERSIONS" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Python
try { $pyVer = python --version 2>&1 } catch { $pyVer = "Non trouve" }
Write-Host "  Python: $pyVer" -ForegroundColor Green

# Django
try { $djVer = python -m django --version 2>&1 } catch { $djVer = "Non trouve" }
Write-Host "  Django: $djVer" -ForegroundColor Green

# PostgreSQL
try { $pgVer = psql --version 2>&1 } catch { $pgVer = "Non trouve" }
Write-Host "  PostgreSQL: $pgVer" -ForegroundColor Green

# React
if (Test-Path "react") {
    Push-Location "react"
    try {
        $reactVer = npm list react --depth=0 2>$null | Select-String "react@" | ForEach-Object { $_ -replace '.*react@', '' }
        Write-Host "  React: $reactVer" -ForegroundColor Green
    } catch {
        Write-Host "  React: Non trouve" -ForegroundColor Yellow
    }
    Pop-Location
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "VERIFICATION TERMINEE" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan