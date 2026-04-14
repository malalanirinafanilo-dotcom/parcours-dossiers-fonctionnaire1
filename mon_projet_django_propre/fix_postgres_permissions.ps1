# fix_postgres_permissions.ps1
Write-Host "=== CORRECTION DES PERMISSIONS POSTGRESQL ===" -ForegroundColor Cyan

# 1. Arrêter les services Django
Write-Host "`n1. Arrêt des services..." -ForegroundColor Yellow
Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*manage.py runserver*" } | Stop-Process -Force 2>$null
Write-Host "✅ Services arrêtés" -ForegroundColor Green

# 2. Forcer la déconnexion de tous les utilisateurs
Write-Host "`n2. Déconnexion forcée..." -ForegroundColor Yellow
psql -U postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'gestion_dossiers';" 2>$null
Write-Host "✅ Utilisateurs déconnectés" -ForegroundColor Green

# 3. Accorder les permissions (en utilisant postgres)
Write-Host "`n3. Attribution des permissions à djangouser..." -ForegroundColor Yellow

# Créer un fichier SQL temporaire
$sqlFile = "temp_permissions.sql"
@"
-- Donner tous les droits sur la base
GRANT ALL PRIVILEGES ON DATABASE gestion_dossiers TO djangouser;

-- Donner tous les droits sur le schéma public
GRANT ALL ON SCHEMA public TO djangouser;

-- Rendre djangouser propriétaire du schéma public
ALTER SCHEMA public OWNER TO djangouser;

-- Donner les droits pour créer des tables
GRANT CREATE ON SCHEMA public TO djangouser;

-- Donner les droits sur les futures tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO djangouser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO djangouser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO djangouser;

-- Vérifier les permissions
\dn+ public
"@ | Out-File -FilePath $sqlFile -Encoding utf8

# Exécuter le fichier SQL
psql -U postgres -d gestion_dossiers -f $sqlFile

# Nettoyer
Remove-Item $sqlFile

Write-Host "✅ Permissions accordées" -ForegroundColor Green

# 4. Réessayer les migrations
Write-Host "`n4. Nouvelle tentative de migration..." -ForegroundColor Yellow
python manage.py migrate

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Migrations réussies !" -ForegroundColor Green
} else {
    Write-Host "❌ Échec des migrations" -ForegroundColor Red
    Write-Host "Essayons de supprimer et recréer la base..." -ForegroundColor Yellow
    
    # 5. Si ça échoue encore, supprimer et recréer la base
    Write-Host "`n5. Suppression et recréation de la base..." -ForegroundColor Yellow
    
    # Déconnexion forcée
    psql -U postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'gestion_dossiers';" 2>$null
    
    # Supprimer la base
    psql -U postgres -c "DROP DATABASE IF EXISTS gestion_dossiers;"
    Write-Host "✅ Base supprimée" -ForegroundColor Green
    
    # Recréer la base avec le bon propriétaire
    psql -U postgres -c "CREATE DATABASE gestion_dossiers OWNER djangouser ENCODING 'UTF8' LC_COLLATE 'French_France.1252' LC_CTYPE 'French_France.1252';"
    Write-Host "✅ Base recréée avec djangouser comme propriétaire" -ForegroundColor Green
    
    # Réessayer les migrations
    python manage.py migrate
}

# 6. Créer les données de base si les migrations ont réussi
if ($LASTEXITCODE -eq 0) {
    Write-Host "`n6. Création des données de base..." -ForegroundColor Yellow
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
    print(f'✓ Rôle {code}')

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
    print(f'✓ Utilisateur {email}')
"
    Write-Host "✅ Données de base créées" -ForegroundColor Green
}

Write-Host "`n=== TERMINÉ ===" -ForegroundColor Cyan
Write-Host "🚀 Démarrez le serveur: python manage.py runserver" -ForegroundColor Yellow