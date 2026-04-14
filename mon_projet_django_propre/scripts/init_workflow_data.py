#!/usr/bin/env python
import os
import sys
import django
import uuid
from datetime import datetime, timedelta

# Ajouter le chemin du projet au PYTHONPATH
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Configurer Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import User, Role
from dossiers.models import Fonctionnaire, Dossier, HistoriqueAction
from workflow.models import Workflow

def create_test_data():
    print("Création des données de test...")
    
    # Créer ou récupérer les rôles
    roles = {}
    for role_code in ['ADMIN', 'DREN', 'MEN', 'FOP', 'FINANCE', 'UTILISATEUR']:
        role, created = Role.objects.get_or_create(
            code=role_code,
            defaults={
                'name': role_code, 
                'description': f'Rôle {role_code}'
            }
        )
        roles[role_code] = role
        if created:
            print(f"  ✓ Rôle {role_code} créé")
    
    # Créer des utilisateurs pour chaque rôle
    users = {}
    for role_code, role in roles.items():
        email = f"{role_code.lower()}@example.com"
        username = role_code.lower()
        
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': username,
                'first_name': f'User {role_code}',
                'last_name': 'Test',
                'role': role,
                'is_active': True,
                'is_staff': True if role_code == 'ADMIN' else False
            }
        )
        if created:
            user.set_password('password123')
            user.save()
            print(f"  ✓ Utilisateur {email} créé (mot de passe: password123)")
        else:
            # Mettre à jour le mot de passe si l'utilisateur existe déjà
            user.set_password('password123')
            user.role = role
            user.save()
            print(f"  ✓ Utilisateur {email} mis à jour")
        
        users[role_code] = user
    
    # Créer un fonctionnaire de test
    fonct, created = Fonctionnaire.objects.get_or_create(
        matricule='F001',
        defaults={
            'nom': 'Dupont',
            'prenom': 'Jean',
            'date_naissance': '1980-01-01',
            'email': 'jean.dupont@example.com',
            'telephone': '0123456789',
            'adresse': '123 Rue Example',
            'categorie': 'A',
            'grade': 'Grade 1'
        }
    )
    if created:
        print(f"  ✓ Fonctionnaire {fonct.nom} {fonct.prenom} créé")
    
    # Créer un workflow de test
    workflow, created = Workflow.objects.get_or_create(
        code='WORKFLOW_STANDARD',
        defaults={
            'name': 'Workflow Standard',
            'description': 'Workflow standard avec étapes Intéressé -> DREN -> MEN -> FOP -> Finance',
            'steps': ['INTERESSE', 'DREN', 'MEN', 'FOP', 'FINANCE'],
            'roles_autorises': ['UTILISATEUR', 'DREN', 'MEN', 'FOP', 'FINANCE'],
            'delai_maximum': 30,
            'is_active': True
        }
    )
    if created:
        print(f"  ✓ Workflow {workflow.name} créé")
    
    # Créer quelques dossiers de test
    dossiers_crees = 0
    for i in range(1, 4):
        numero = f"DOS-2024-{i:03d}"
        dossier, created = Dossier.objects.get_or_create(
            numero_dossier=numero,
            defaults={
                'titre': f'Dossier test {i}',
                'type_dossier': 'Demande de promotion',
                'fonctionnaire': fonct,
                'workflow': workflow,
                'statut': 'EN_COURS',
                'etape_actuelle': 'INTERESSE',
                'created_by': users['UTILISATEUR'],
                'etapes_validation': {}
            }
        )
        
        if created:
            dossiers_crees += 1
            print(f"  ✓ Dossier {numero} créé")
            
            # Ajouter un historique
            HistoriqueAction.objects.create(
                dossier=dossier,
                user=users['UTILISATEUR'],
                action='CREATION',
                etape='INTERESSE',
                commentaire='Création du dossier'
            )
    
    print(f"\n=== RÉSUMÉ ===")
    print(f"✓ {len(roles)} rôles configurés")
    print(f"✓ {len(users)} utilisateurs créés/mis à jour")
    print(f"✓ {dossiers_crees} dossiers créés")
    
    print("\n=== IDENTIFIANTS DE CONNEXION ===")
    print("Utilisateurs (mot de passe: password123):")
    for role_code, user in users.items():
        print(f"  {role_code}: {user.email}")
    
    print("\n=== ENDPOINTS À TESTER ===")
    print("  POST /api/auth/login/ - Connexion")
    print("  GET /api/dossiers/ - Liste des dossiers")
    print("  POST /api/dossiers/{id}/valider/ - Valider une étape")
    print("  POST /api/dossiers/{id}/rejeter/ - Rejeter un dossier")
    print("  GET /api/dossiers/{id}/workflow/ - Voir l'état du workflow")

if __name__ == "__main__":
    print("Initialisation des données de test...")
    try:
        create_test_data()
        print("\n✅ Initialisation terminée avec succès!")
    except Exception as e:
        print(f"\n❌ Erreur: {e}")
        import traceback
        traceback.print_exc()