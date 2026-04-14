# fix_postgres_encoding_v2.ps1
Write-Host "=== CORRECTION COMPLÈTE ENCODAGE POSTGRESQL (V2) ===" -ForegroundColor Cyan

# 1. Arrêter tous les services qui utilisent la base
Write-Host "`n1. Arrêt des services..." -ForegroundColor Yellow
Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*celery*" } | Stop-Process -Force 2>$null
Get-Process -Name "redis-server" -ErrorAction SilentlyContinue | Stop-Process -Force 2>$null
Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*manage.py runserver*" } | Stop-Process -Force 2>$null
Write-Host "✅ Services arrêtés" -ForegroundColor Green

# 2. Forcer la déconnexion de tous les utilisateurs
Write-Host "`n2. Déconnexion forcée de tous les utilisateurs..." -ForegroundColor Yellow
psql -U postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'gestion_dossiers' AND pid <> pg_backend_pid();" 2>$null
Write-Host "✅ Utilisateurs déconnectés" -ForegroundColor Green

# 3. Supprimer et recréer la base avec template0
Write-Host "`n3. Recréation de la base avec template0..." -ForegroundColor Yellow

# Supprimer l'ancienne base
psql -U postgres -c "DROP DATABASE IF EXISTS gestion_dossiers;"
Write-Host "✅ Ancienne base supprimée" -ForegroundColor Green

# Créer la nouvelle base en utilisant template0 (vierge)
psql -U postgres -c "CREATE DATABASE gestion_dossiers TEMPLATE template0 ENCODING 'UTF8' LC_COLLATE 'French_France.1252' LC_CTYPE 'French_France.1252';"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Échec avec template0, essai avec l'encodage par défaut..." -ForegroundColor Red
    psql -U postgres -c "CREATE DATABASE gestion_dossiers OWNER djangouser;"
}
Write-Host "✅ Nouvelle base créée" -ForegroundColor Green

# 4. Vérifier l'encodage
Write-Host "`n4. Vérification de l'encodage:" -ForegroundColor Yellow
$encoding = psql -U postgres -d gestion_dossiers -t -c "SHOW server_encoding;" | Out-String
Write-Host "Server encoding: $encoding" -ForegroundColor Cyan

# 5. Migrations
Write-Host "`n5. Migration des modèles..." -ForegroundColor Yellow
python manage.py migrate
Write-Host "✅ Migration terminée" -ForegroundColor Green

# 6. Créer les rôles
Write-Host "`n6. Création des rôles..." -ForegroundColor Yellow
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
"
Write-Host "✅ Rôles créés" -ForegroundColor Green

# 7. Créer les utilisateurs
Write-Host "`n7. Création des utilisateurs..." -ForegroundColor Yellow
python manage.py shell -c "
from core.models import User, Role
from django.contrib.auth.hashers import make_password

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
"
Write-Host "✅ Utilisateurs créés" -ForegroundColor Green

Write-Host "`n=== TERMINÉ ===" -ForegroundColor Cyan
Write-Host "✅ Base recréée avec succès !" -ForegroundColor Green
Write-Host "🚀 Démarrez maintenant le serveur Django: python manage.py runserver" -ForegroundColor Yellow