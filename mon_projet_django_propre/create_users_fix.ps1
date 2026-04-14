# create_users_fix.ps1
Write-Host "=== CRÉATION DES UTILISATEURS MANQUANTS ===" -ForegroundColor Cyan

# Créer un fichier Python temporaire
$pythonScript = @"
from core.models import Role, User
from django.contrib.auth.hashers import make_password

# Créer les rôles
roles = [
    ('ADMIN', 'ADMIN', 'Administrateur système'),
    ('DREN', 'DREN', 'Direction Régionale'),
    ('MEN', 'MEN', 'Ministère Éducation'),
    ('FOP', 'FOP', 'Formation Professionnelle'),
    ('FINANCE', 'FINANCE', 'Finance'),
    ('UTILISATEUR', 'UTILISATEUR', 'Utilisateur standard'),
]

for code, name, description in roles:
    role, created = Role.objects.get_or_create(code=code, defaults={'name': name, 'description': description})
    print(f"{'✅ Créé' if created else '⚠️ Existe déjà'}: {code}")

# Créer les utilisateurs
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
    print(f"{'✅ Créé' if created else '⚠️ Existe déjà'}: {email}")

# Vérification finale
print("\n=== UTILISATEURS DANS LA BASE ===")
for user in User.objects.all().order_by('email'):
    print(f"👤 {user.email} - Rôle: {user.role.code if user.role else 'Aucun'} - Actif: {user.is_active}")
"@

# Sauvegarder dans un fichier
$pythonScript | Out-File -FilePath "create_users.py" -Encoding utf8

# Exécuter le script
Write-Host "`nExécution du script de création..." -ForegroundColor Yellow
python manage.py shell < create_users.py

# Nettoyer
Remove-Item "create_users.py"

Write-Host "`n=== TERMINÉ ===" -ForegroundColor Cyan
Write-Host "🚀 Vous pouvez maintenant tester la connexion avec :" -ForegroundColor Green
Write-Host "   interesse@example.com / password123" -ForegroundColor Yellow