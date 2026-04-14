# fix_permissions.ps1
Write-Host "=== CORRECTION DES PERMISSIONS POSTGRESQL ===" -ForegroundColor Cyan

# 1. Arrêter les services
Write-Host "`n1. Arrêt des services..." -ForegroundColor Yellow
Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*manage.py runserver*" } | Stop-Process -Force 2>$null
Write-Host "✅ Services arrêtés" -ForegroundColor Green

# 2. Accorder les permissions
Write-Host "`n2. Attribution des permissions à djangouser..." -ForegroundColor Yellow

# Connectez-vous en tant que postgres pour donner les droits
psql -U postgres -d gestion_dossiers -c "
-- Donner tous les droits sur le schéma public
GRANT ALL ON SCHEMA public TO djangouser;
GRALL ALL PRIVILEGES ON DATABASE gestion_dossiers TO djangouser;

-- Rendre djangouser propriétaire de la base
ALTER DATABASE gestion_dossiers OWNER TO djangouser;

-- Vérifier les permissions
\du djangouser
\dn+ public
"

Write-Host "✅ Permissions accordées" -ForegroundColor Green

# 3. Réessayer les migrations
Write-Host "`n3. Nouvelle tentative de migration..." -ForegroundColor Yellow
python manage.py migrate
Write-Host "✅ Migration terminée" -ForegroundColor Green

Write-Host "`n=== TERMINÉ ===" -ForegroundColor Cyan
Write-Host "🚀 Démarrez maintenant le serveur: python manage.py runserver" -ForegroundColor Yellow