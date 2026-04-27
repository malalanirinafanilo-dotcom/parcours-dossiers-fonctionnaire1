# bootstrap.py
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from core.models import Role

User = get_user_model()

print("🚀 Exécution du script de bootstrap...")

# Créer les rôles
roles_data = [
    {'code': 'ADMIN', 'name': 'ADMIN', 'description': 'Administrateur'},
    {'code': 'DREN', 'name': 'DREN', 'description': 'Direction Régionale'},
    {'code': 'MEN', 'name': 'MEN', 'description': 'Ministère'},
    {'code': 'FOP', 'name': 'FOP', 'description': 'Formation Pro'},
    {'code': 'FINANCE', 'name': 'FINANCE', 'description': 'Finance'},
    {'code': 'UTILISATEUR', 'name': 'UTILISATEUR', 'description': 'Utilisateur'},
]

for role_data in roles_data:
    role, created = Role.objects.get_or_create(
        code=role_data['code'],
        defaults={'name': role_data['name'], 'description': role_data['description']}
    )
    if created:
        print(f"✅ Rôle créé: {role.code}")

# Créer les utilisateurs
users_data = [
    {'username': 'interesse', 'email': 'interesse@example.com', 'role_code': 'UTILISATEUR', 'password': 'password123', 'first_name': 'Jean', 'last_name': 'Rakoto'},
    {'username': 'dren', 'email': 'dren@example.com', 'role_code': 'DREN', 'password': 'password123', 'first_name': 'Marie', 'last_name': 'Rasoa'},
    {'username': 'men', 'email': 'men@example.com', 'role_code': 'MEN', 'password': 'password123', 'first_name': 'Paul', 'last_name': 'Rabe'},
    {'username': 'fop', 'email': 'fop@example.com', 'role_code': 'FOP', 'password': 'password123', 'first_name': 'Faly', 'last_name': 'Randria'},
    {'username': 'finance', 'email': 'finance@example.com', 'role_code': 'FINANCE', 'password': 'password123', 'first_name': 'Niry', 'last_name': 'Ranaivo'},
    {'username': 'admin', 'email': 'admin@example.com', 'role_code': 'ADMIN', 'password': 'admin123', 'first_name': 'Admin', 'last_name': 'System', 'is_staff': True, 'is_superuser': True},
]

for user_data in users_data:
    try:
        role = Role.objects.get(code=user_data['role_code'])
        user, created = User.objects.get_or_create(
            username=user_data['username'],
            defaults={
                'email': user_data['email'],
                'role': role,
                'first_name': user_data['first_name'],
                'last_name': user_data['last_name'],
                'is_staff': user_data.get('is_staff', False),
                'is_superuser': user_data.get('is_superuser', False),
            }
        )
        if not created:
            user.set_password(user_data['password'])
            user.save()
            print(f"✅ Mot de passe mis à jour pour: {user.username}")
        else:
            print(f"✅ Utilisateur créé: {user.username}")
    except Role.DoesNotExist:
        print(f"❌ Rôle {user_data['role_code']} non trouvé")

print("✅ Script de bootstrap terminé !")