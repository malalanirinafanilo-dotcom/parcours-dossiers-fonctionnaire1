# fix_postgres_encoding.ps1
Write-Host "=== CORRECTION COMPLÈTE ENCODAGE POSTGRESQL ===" -ForegroundColor Cyan

# Arrêter les services
Write-Host "`n1. Arrêt des services..." -ForegroundColor Yellow
Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*celery*" } | Stop-Process -Force
Get-Process -Name "redis-server" -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host "✅ Services arrêtés" -ForegroundColor Green

# Sauvegarde des données
Write-Host "`n2. Sauvegarde des données..." -ForegroundColor Yellow
cd E:\dossier bureau\mon-projet-final\mon_projet_django_propre
python manage.py dumpdata --natural-foreign --natural-primary -e contenttypes -e auth.Permission > backup_complet.json
Write-Host "✅ Sauvegarde créée: backup_complet.json" -ForegroundColor Green

# Supprimer et recréer la base avec UTF8 et locale française correcte
Write-Host "`n3. Recréation de la base avec UTF8 et locale française..." -ForegroundColor Yellow

# Définir les bonnes locales pour UTF8
$env:PGCLIENTENCODING = "UTF8"

# Supprimer l'ancienne base
psql -U postgres -c "DROP DATABASE IF EXISTS gestion_dossiers;"
Write-Host "✅ Ancienne base supprimée" -ForegroundColor Green

# Créer la nouvelle base avec UTF8 et locale française UTF8
psql -U postgres -c "CREATE DATABASE gestion_dossiers WITH ENCODING 'UTF8' LC_COLLATE='fr_FR.UTF-8' LC_CTYPE='fr_FR.UTF-8' OWNER djangouser;"
Write-Host "✅ Nouvelle base créée avec UTF8 et locale fr_FR.UTF-8" -ForegroundColor Green

# Vérifier la configuration
Write-Host "`n4. Vérification de la configuration..." -ForegroundColor Yellow
$verif = psql -U postgres -d gestion_dossiers -c "\l gestion_dossiers"
Write-Host $verif -ForegroundColor Yellow

# Migrations
Write-Host "`n5. Migration des modèles..." -ForegroundColor Yellow
python manage.py migrate
Write-Host "✅ Migration terminée" -ForegroundColor Green

# Créer les rôles de base
Write-Host "`n6. Création des rôles de base..." -ForegroundColor Yellow
python manage.py shell -c "
from core.models import Role
roles = [
    ('ADMIN', 'ADMIN', 'Administrateur système'),
    ('DREN', 'DREN', 'Direction Régionale'),
    ('MEN', 'MEN', 'Ministère Éducation'),
    ('FOP', 'FOP', 'Formation Professionnelle'),
    ('FINANCE', 'FINANCE', 'Finance'),
    ('UTILISATEUR', 'UTILISATEUR', 'Utilisateur standard'),
]
for code, name, description in roles:
    Role.objects.get_or_create(code=code, defaults={'name': name, 'description': description})
print('✅ Rôles créés')
"
Write-Host "✅ Rôles créés" -ForegroundColor Green

# Créer les utilisateurs de test
Write-Host "`n7. Création des utilisateurs de test..." -ForegroundColor Yellow
python manage.py shell -c "
from core.models import User, Role
from django.contrib.auth.hashers import make_password

users = [
    ('admin@example.com', 'admin', 'admin123', 'ADMIN', 'Admin', 'System'),
    ('interesse@example.com', 'interesse', 'password123', 'UTILISATEUR', 'Intéressé', 'Test'),
    ('dren@example.com', 'dren', 'password123', 'DREN', 'DREN', 'Test'),
    ('men@example.com', 'men', 'password123', 'MEN', 'MEN', 'Test'),
    ('fop@example.com', 'fop', 'password123', 'FOP', 'FOP', 'Test'),
    ('finance@example.com', 'finance', 'password123', 'FINANCE', 'Finance', 'Test'),
]

for email, username, password, role_code, first_name, last_name in users:
    role = Role.objects.get(code=role_code)
    user, created = User.objects.get_or_create(
        email=email,
        defaults={
            'username': username,
            'password': make_password(password),
            'role': role,
            'first_name': first_name,
            'last_name': last_name,
            'is_active': True,
            'is_staff': role_code == 'ADMIN',
            'is_superuser': role_code == 'ADMIN',
        }
    )
    if created:
        print(f'✅ Utilisateur créé: {email}')
    else:
        print(f'⚠️ Utilisateur existe déjà: {email}')
"
Write-Host "✅ Utilisateurs créés" -ForegroundColor Green

# Restaurer les données
Write-Host "`n8. Restauration des données..." -ForegroundColor Yellow
Write-Host "Voulez-vous restaurer les anciennes données ? (o/N)" -ForegroundColor Yellow
$reponse = Read-Host
if ($reponse -eq 'o') {
    python manage.py loaddata backup_complet.json
    Write-Host "✅ Données restaurées" -ForegroundColor Green
}

Write-Host "`n9. Redémarrage des services..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "redis-server"
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'E:\dossier bureau\mon-projet-final\mon_projet_django_propre'; .\venv\Scripts\Activate.ps1; celery -A config worker --loglevel=info"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'E:\dossier bureau\mon-projet-final\mon_projet_django_propre'; .\venv\Scripts\Activate.ps1; python manage.py runserver"
Write-Host "✅ Services démarrés" -ForegroundColor Green

Write-Host "`n=== TERMINÉ ===" -ForegroundColor Cyan
Write-Host "✅ La base est maintenant correctement configurée en UTF8 avec locale française" -ForegroundColor Green
Write-Host "🌐 Rechargez votre application frontend (F5)" -ForegroundColor Yellow