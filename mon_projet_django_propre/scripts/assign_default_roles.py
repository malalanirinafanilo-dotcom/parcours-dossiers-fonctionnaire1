# scripts/assign_default_roles.py
import os
import sys
import django

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import User, Role

def assign_default_roles():
    # Créer les rôles par défaut
    roles = {
        'ADMIN': 'Administrateur',
        'DREN': 'Direction Régionale',
        'MEN': 'Ministère',
        'FOP': 'Formation Pro',
        'FINANCE': 'Finance',
        'UTILISATEUR': 'Utilisateur',
    }
    
    role_objects = {}
    for code, name in roles.items():
        role, created = Role.objects.get_or_create(code=code, defaults={'name': name})
        role_objects[code] = role
        if created:
            print(f"✅ Rôle créé: {code}")
    
    # Assigner les rôles aux utilisateurs
    for user in User.objects.all():
        if user.is_superuser:
            user.role = role_objects['ADMIN']
            user.save()
            print(f"✅ {user.email} → ADMIN")
        elif not user.role:
            user.role = role_objects['UTILISATEUR']
            user.save()
            print(f"✅ {user.email} → UTILISATEUR")

if __name__ == '__main__':
    assign_default_roles()