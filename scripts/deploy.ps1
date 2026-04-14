# Script de déploiement pour Windows
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "  DÉPLOIEMENT APPLICATION GESTION DOSSIERS" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta

# 1. Installation des dépendances
Write-Host "[1/6] Installation des dépendances..." -ForegroundColor Blue

# Backend
Write-Host "  → Backend Django" -ForegroundColor Yellow
Set-Location -Path "E:\dossier bureau\important\mon-projet-final\mon_projet_django"
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt

# Frontend
Write-Host "  → Frontend React" -ForegroundColor Yellow
Set-Location -Path "E:\dossier bureau\important\mon-projet-final\react1"
npm install

# 2. Configuration base de données
Write-Host "[2/6] Configuration PostgreSQL..." -ForegroundColor Blue
# À exécuter manuellement si PostgreSQL est installé
Write-Host "  → Assurez-vous que PostgreSQL est installé et lancé" -ForegroundColor Yellow
Write-Host "  → Exécutez le script init_db.sql dans pgAdmin ou psql" -ForegroundColor Yellow

# 3. Migrations Django
Write-Host "[3/6] Migrations Django..." -ForegroundColor Blue
Set-Location -Path "E:\dossier bureau\important\mon-projet-final\mon_projet_django"
python manage.py makemigrations
python manage.py migrate

# 4. Démarrer Redis (si installé)
Write-Host "[4/6] Démarrage Redis..." -ForegroundColor Blue
Write-Host "  → Si Redis n'est pas installé, téléchargez Memurai pour Windows" -ForegroundColor Yellow

# 5. Démarrer les serveurs
Write-Host "[5/6] Démarrage des serveurs..." -ForegroundColor Blue

Write-Host "✅ Déploiement terminé !" -ForegroundColor Green
Write-Host "   Pour lancer les serveurs:" -ForegroundColor Green
Write-Host "   1. Redis: redis-server (ou lancez Memurai)" -ForegroundColor Green
Write-Host "   2. Celery: cd mon_projet_django && celery -A mon_site worker --loglevel=info --pool=solo" -ForegroundColor Green
Write-Host "   3. Django: cd mon_projet_django && python manage.py runserver" -ForegroundColor Green
Write-Host "   4. React: cd react1 && npm run dev" -ForegroundColor Green
Write-Host ""
Write-Host "Identifiants par défaut:" -ForegroundColor Yellow
Write-Host "  Email: admin@education.gouv.fr" -ForegroundColor Yellow
Write-Host "  Mot de passe: Admin123!" -ForegroundColor Yellow