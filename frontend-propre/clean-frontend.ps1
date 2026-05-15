# clean-frontend.ps1 - Nettoyage complet du frontend
# Version sans caractères speciaux pour compatibilite PowerShell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "         NETTOYAGE COMPLET DU FRONTEND" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Set-Location "E:\mon-projet-final\frontend-propre"

Write-Host ""
Write-Host "DOSSIER DE TRAVAIL :" -ForegroundColor Green
Write-Host "  $(Get-Location)" -ForegroundColor Gray

# ============================================================
# 1. ARRETER LES PROCESSUS NODE
# ============================================================
Write-Host ""
Write-Host "----------------------------------------" -ForegroundColor Cyan
Write-Host "1. ARRET DES PROCESSUS NODE" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Cyan

$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue

if ($nodeProcesses) {
    Write-Host "Processus trouves :" -ForegroundColor Cyan
    foreach ($proc in $nodeProcesses) {
        Write-Host "  - PID: $($proc.Id)" -ForegroundColor Gray
        try {
            Stop-Process -Id $proc.Id -Force -ErrorAction Stop
            Write-Host "  -> Processus $($proc.Id) arrete" -ForegroundColor Green
        } catch {
            Write-Host "  -> Impossible d'arreter le processus $($proc.Id)" -ForegroundColor Red
        }
    }
} else {
    Write-Host "Aucun processus Node.js en cours" -ForegroundColor Gray
}

# ============================================================
# 2. SUPPRESSION DE NODE_MODULES
# ============================================================
Write-Host ""
Write-Host "----------------------------------------" -ForegroundColor Cyan
Write-Host "2. SUPPRESSION DE NODE_MODULES" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Cyan

if (Test-Path "node_modules") {
    Write-Host "Suppression en cours..." -ForegroundColor Yellow
    
    # Methode 1 : Suppression directe
    try {
        Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction Stop
        Write-Host "SUCCES: node_modules supprime" -ForegroundColor Green
    } catch {
        Write-Host "ATTENTION: Suppression directe impossible" -ForegroundColor Yellow
        
        # Methode 2 : Renommage puis suppression
        $oldName = "node_modules_old_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
        try {
            Rename-Item -Path "node_modules" -NewName $oldName -ErrorAction Stop
            Write-Host "Dossier renomme en : $oldName" -ForegroundColor Green
            
            Start-Sleep -Seconds 2
            
            Remove-Item -Path $oldName -Recurse -Force -ErrorAction Stop
            Write-Host "SUCCES: $oldName supprime" -ForegroundColor Green
        } catch {
            Write-Host "ERREUR: Echec de la suppression" -ForegroundColor Red
            Write-Host ""
            Write-Host "SOLUTIONS :" -ForegroundColor Yellow
            Write-Host "  - Fermez VS Code et tous les terminaux"
            Write-Host "  - Redemarrez votre ordinateur"
            Write-Host "  - Ou executez ce script en Administrateur"
            Write-Host ""
        }
    }
} else {
    Write-Host "node_modules n'existe pas" -ForegroundColor Gray
}

# ============================================================
# 3. SUPPRESSION DES FICHIERS TEMPORAIRES
# ============================================================
Write-Host ""
Write-Host "----------------------------------------" -ForegroundColor Cyan
Write-Host "3. SUPPRESSION DES FICHIERS TEMPORAIRES" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Cyan

$filesToDelete = @(
    "package-lock.json",
    "yarn.lock",
    ".vite",
    "dist",
    ".cache",
    "build"
)

foreach ($item in $filesToDelete) {
    if (Test-Path $item) {
        try {
            $itemInfo = Get-Item $item -ErrorAction SilentlyContinue
            if ($itemInfo.PSIsContainer) {
                Remove-Item -Path $item -Recurse -Force -ErrorAction Stop
                Write-Host "SUPPRIME: $item (dossier)" -ForegroundColor Green
            } else {
                Remove-Item -Path $item -Force -ErrorAction Stop
                Write-Host "SUPPRIME: $item (fichier)" -ForegroundColor Green
            }
        } catch {
            Write-Host "ATTENTION: Impossible de supprimer $item" -ForegroundColor Yellow
        }
    }
}

# ============================================================
# 4. NETTOYAGE DU CACHE NPM
# ============================================================
Write-Host ""
Write-Host "----------------------------------------" -ForegroundColor Cyan
Write-Host "4. NETTOYAGE DU CACHE NPM" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Cyan

Write-Host "Nettoyage en cours..." -ForegroundColor Yellow
try {
    npm cache clean --force 2>&1 | Out-Null
    Write-Host "SUCCES: Cache npm nettoye" -ForegroundColor Green
} catch {
    Write-Host "ATTENTION: Erreur lors du nettoyage du cache" -ForegroundColor Yellow
}

# ============================================================
# 5. VERIFICATION FINALE
# ============================================================
Write-Host ""
Write-Host "----------------------------------------" -ForegroundColor Cyan
Write-Host "5. VERIFICATION FINALE" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Cyan

Write-Host ""
Write-Host "ETAT DES DOSSIERS :" -ForegroundColor Cyan

$nodeModulesExists = Test-Path "node_modules"
if ($nodeModulesExists) {
    Write-Host "  node_modules : EXISTE ENCORE" -ForegroundColor Red
} else {
    Write-Host "  node_modules : SUPPRIME" -ForegroundColor Green
}

$packageLockExists = Test-Path "package-lock.json"
if ($packageLockExists) {
    Write-Host "  package-lock.json : EXISTE ENCORE" -ForegroundColor Red
} else {
    Write-Host "  package-lock.json : SUPPRIME" -ForegroundColor Green
}

$viteExists = Test-Path ".vite"
if ($viteExists) {
    Write-Host "  .vite : EXISTE ENCORE" -ForegroundColor Red
} else {
    Write-Host "  .vite : SUPPRIME" -ForegroundColor Green
}

$distExists = Test-Path "dist"
if ($distExists) {
    Write-Host "  dist : EXISTE ENCORE" -ForegroundColor Red
} else {
    Write-Host "  dist : SUPPRIME" -ForegroundColor Green
}

# ============================================================
# RESUME
# ============================================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "           NETTOYAGE TERMINE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "PROCHAINES ETAPES :" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1.  Reinstaller les dependances :" -ForegroundColor Gray
Write-Host "      npm install --legacy-peer-deps" -ForegroundColor Green
Write-Host ""
Write-Host "  2.  Demarrer le serveur :" -ForegroundColor Gray
Write-Host "      npm run dev" -ForegroundColor Green
Write-Host ""
Write-Host "  3.  Acceder a l'application :" -ForegroundColor Gray
Write-Host "      http://localhost:5173" -ForegroundColor Green
Write-Host ""

# ============================================================
# PROPOSITION D'INSTALLATION AUTOMATIQUE
# ============================================================
Write-Host "----------------------------------------" -ForegroundColor Cyan
$install = Read-Host "Voulez-vous lancer l'installation maintenant ? (O/N)"

if ($install -eq "O" -or $install -eq "o") {
    Write-Host ""
    Write-Host "Lancement de npm install..." -ForegroundColor Green
    npm install --legacy-peer-deps
    
    Write-Host ""
    Write-Host "Lancement de npm run dev..." -ForegroundColor Green
    npm run dev
} else {
    Write-Host ""
    Write-Host "Vous pouvez lancer manuellement :" -ForegroundColor Gray
    Write-Host "  npm install --legacy-peer-deps" -ForegroundColor Yellow
    Write-Host "  npm run dev" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "              FIN DU SCRIPT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan