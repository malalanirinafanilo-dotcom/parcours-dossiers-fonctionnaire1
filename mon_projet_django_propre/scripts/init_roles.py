# scripts/init_roles.py
import os
import sys
import django

# Ajouter le chemin du projet
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import Role

def init_roles():
    roles = [
        {'code': 'ADMIN', 'name': 'ADMIN', 'description': 'Administrateur système'},
        {'code': 'DREN', 'name': 'DREN', 'description': 'Directeur Régional'},
        {'code': 'MEN', 'name': 'MEN', 'description': 'Ministère Éducation'},
        {'code': 'FOP', 'name': 'FOP', 'description': 'Formation Professionnelle'},
        {'code': 'FINANCE', 'name': 'FINANCE', 'description': 'Direction des Finances'},
        {'code': 'UTILISATEUR', 'name': 'UTILISATEUR', 'description': 'Utilisateur standard'},
    ]
    
    for role_data in roles:
        role, created = Role.objects.get_or_create(
            code=role_data['code'],
            defaults={
                'name': role_data['name'],
                'description': role_data['description']
            }
        )
        if created:
            print(f"Rôle créé: {role.code}")
        else:
            print(f"Rôle existant: {role.code}")

if __name__ == '__main__':
    init_roles()
    print("Initialisation des rôles terminée!")