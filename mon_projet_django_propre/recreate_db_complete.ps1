# recreate_db_complete.ps1
Write-Host "=== RECRÉATION COMPLÈTE DE LA BASE ===" -ForegroundColor Cyan

# 1. Arrêter tous les services
Write-Host "`n1. Arrêt des services..." -ForegroundColor Yellow
Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*celery*" } | Stop-Process -Force 2>$null
Get-Process -Name "redis-server" -ErrorAction SilentlyContinue | Stop-Process -Force 2>$null
Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*manage.py runserver*" } | Stop-Process -Force 2>$null
Write-Host "✅ Services arrêtés" -ForegroundColor Green

# 2. Sauvegarde
Write-Host "`n2. Sauvegarde des données..." -ForegroundColor Yellow
python manage.py dumpdata > backup_complet.json
Write-Host "✅ Sauvegarde créée" -ForegroundColor Green

# 3. Forcer la déconnexion
Write-Host "`n3. Déconnexion forcée..." -ForegroundColor Yellow
psql -U postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'gestion_dossiers';" 2>$null
Write-Host "✅ Utilisateurs déconnectés" -ForegroundColor Green

# 4. Supprimer la base
Write-Host "`n4. Suppression de la base..." -ForegroundColor Yellow
psql -U postgres -c "DROP DATABASE IF EXISTS gestion_dossiers;"
Write-Host "✅ Base supprimée" -ForegroundColor Green

# 5. Recréer la base avec le bon propriétaire
Write-Host "`n5. Création de la nouvelle base..." -ForegroundColor Yellow
psql -U postgres -c "CREATE DATABASE gestion_dossiers OWNER djangouser ENCODING 'UTF8' LC_COLLATE 'French_France.1252' LC_CTYPE 'French_France.1252';"
Write-Host "✅ Base créée avec djangouser comme propriétaire" -ForegroundColor Green

# 6. Accorder les permissions
Write-Host "`n6. Attribution des permissions..." -ForegroundColor Yellow
psql -U postgres -d gestion_dossiers -c "
-- Donner tous les droits
GRANT ALL ON SCHEMA public TO djangouser;
GRANT ALL PRIVILEGES ON DATABASE gestion_dossiers TO djangouser;

-- Vérifier
SELECT current_user;
SELECT session_user;
"
Write-Host "✅ Permissions accordées" -ForegroundColor Green

# 7. Migrations
Write-Host "`n7. Migration des modèles..." -ForegroundColor Yellow
python manage.py migrate
Write-Host "✅ Migration terminée" -ForegroundColor Green

# 8. Créer les données de base
Write-Host "`n8. Création des données de base..." -ForegroundColor Yellow
python manage.py shell -c "
from core.models import Role, User
from django.contrib.auth.hashers import make_password

# Rôles
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

# Utilisateurs
users = [
    ('admin@example.com', 'admin', 'admin123', 'ADMIN', 'Admin', 'Système'),
    ('interesse@example.com', 'interesse', 'password123', 'UTILISATEUR', 'Intéressé', 'Test'),
    ('dren@example.com', 'dren', 'password123', 'DREN', 'DREN', 'Test'),
    ('men@example.com', 'men', 'password123', 'MEN', 'MEN', 'Test'),
    ('fop@example.com', 'fop', 'password123', 'FOP', 'FOP', 'Test'),
    ('finance@example.com', 'finance', 'password123', 'FINANCE', 'Finance', 'Test'),
]

for email, username, password, role_code, first_name, last_name in users:
    role = Role.objects.get(code=role_code)
    User.objects.get_or_create(
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
print('✅ Données de base créées')
"
Write-Host "✅ Données de base créées" -ForegroundColor Green

# 9. Vérification finale
Write-Host "`n9. Vérification de la base..." -ForegroundColor Yellow
$verif = psql -U postgres -d gestion_dossiers -c "\du djangouser" 2>$null
Write-Host $verif

Write-Host "`n=== TERMINÉ AVEC SUCCÈS ===" -ForegroundColor Green
Write-Host "🚀 Démarrez le serveur: python manage.py runserver" -ForegroundColor Yellow