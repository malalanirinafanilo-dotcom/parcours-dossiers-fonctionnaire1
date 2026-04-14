# scripts/setup_test_data.py
#!/usr/bin/env python
import os
import sys
import django
import uuid
from datetime import datetime, timedelta

# Ajouter le chemin du projet
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from core.models import Role
from dossiers.models import Dossier, Fonctionnaire, HistoriqueAction
from workflow.models import Workflow

User = get_user_model()

def setup_test_data():
    print("=" * 60)
    print("CONFIGURATION DES DONNÉES DE TEST")
    print("=" * 60)
    
    # 1. Créer ou récupérer les rôles
    roles = {}
    roles_data = [
        {'code': 'ADMIN', 'name': 'ADMIN', 'description': 'Administrateur système'},
        {'code': 'DREN', 'name': 'DREN', 'description': 'Direction Régionale'},
        {'code': 'MEN', 'name': 'MEN', 'description': 'Ministère Éducation'},
        {'code': 'FOP', 'name': 'FOP', 'description': 'Formation Professionnelle'},
        {'code': 'FINANCE', 'name': 'FINANCE', 'description': 'Direction des Finances'},
        {'code': 'UTILISATEUR', 'name': 'UTILISATEUR', 'description': 'Utilisateur standard (Intéressé)'},
    ]
    
    for role_data in roles_data:
        role, created = Role.objects.get_or_create(
            code=role_data['code'],
            defaults={
                'name': role_data['name'],
                'description': role_data['description']
            }
        )
        roles[role_data['code']] = role
        if created:
            print(f"✅ Rôle créé: {role_data['code']}")
        else:
            print(f"✓ Rôle existant: {role_data['code']}")
    
    # 2. Créer les utilisateurs de test
    users = {}
    test_users = [
        {'email': 'interesse@example.com', 'role': 'UTILISATEUR', 'first_name': 'Jean', 'last_name': 'Rakoto'},
        {'email': 'dren@example.com', 'role': 'DREN', 'first_name': 'Marie', 'last_name': 'Rasoa'},
        {'email': 'men@example.com', 'role': 'MEN', 'first_name': 'Paul', 'last_name': 'Rabe'},
        {'email': 'fop@example.com', 'role': 'FOP', 'first_name': 'Faly', 'last_name': 'Randria'},
        {'email': 'finance@example.com', 'role': 'FINANCE', 'first_name': 'Niry', 'last_name': 'Ranaivo'},
        {'email': 'admin@example.com', 'role': 'ADMIN', 'first_name': 'Admin', 'last_name': 'System'},
    ]
    
    for user_data in test_users:
        user, created = User.objects.get_or_create(
            email=user_data['email'],
            defaults={
                'username': user_data['email'].split('@')[0],
                'first_name': user_data['first_name'],
                'last_name': user_data['last_name'],
                'role': roles[user_data['role']],
                'is_active': True,
                'is_staff': user_data['role'] == 'ADMIN',
                'is_superuser': user_data['role'] == 'ADMIN',
            }
        )
        if created:
            user.set_password('password123')
            user.save()
            print(f"✅ Utilisateur créé: {user_data['email']} (mdp: password123)")
        else:
            # Mettre à jour le mot de passe pour être sûr
            user.set_password('password123')
            user.role = roles[user_data['role']]
            user.save()
            print(f"✓ Utilisateur existant mis à jour: {user_data['email']}")
        
        users[user_data['role']] = user
    
    # 3. Créer un workflow standard
    workflow, created = Workflow.objects.get_or_create(
        code='WORKFLOW_STANDARD',
        defaults={
            'name': 'Workflow Standard',
            'description': 'Intéressé → DREN → MEN → FOP → FINANCE',
            'steps': ['INTERESSE', 'DREN', 'MEN', 'FOP', 'FINANCE'],
            'roles_autorises': ['UTILISATEUR', 'DREN', 'MEN', 'FOP', 'FINANCE'],
            'delai_maximum': 45,
            'is_active': True
        }
    )
    if created:
        print(f"✅ Workflow créé: {workflow.name}")
    else:
        print(f"✓ Workflow existant: {workflow.name}")
    
    # 4. Créer un fonctionnaire de test
    fonctionnaire, created = Fonctionnaire.objects.get_or_create(
        matricule='F001',
        defaults={
            'nom': 'Rakoto',
            'prenom': 'Jean',
            'date_naissance': '1985-05-15',
            'email': 'jean.rakoto@education.mg',
            'telephone': '0341234567',
            'categorie': 'A',
            'grade': 'Grade 1'
        }
    )
    if created:
        print(f"✅ Fonctionnaire créé: {fonctionnaire.nom} {fonctionnaire.prenom}")
    else:
        print(f"✓ Fonctionnaire existant: {fonctionnaire.nom} {fonctionnaire.prenom}")
    
    # 5. Créer des dossiers de test pour chaque étape
    print("\n📁 Création des dossiers de test...")
    
    # Dossier pour Intéressé (BROUILLON)
    dossier1, created = Dossier.objects.get_or_create(
        numero_dossier='DOS-2024-001',
        defaults={
            'titre': 'Demande de promotion',
            'type_dossier': 'PROMOTION',
            'fonctionnaire': fonctionnaire,
            'workflow': workflow,
            'statut': 'BROUILLON',
            'etape_actuelle': 'INTERESSE',
            'created_by': users['UTILISATEUR'],
            'etapes_validation': {}
        }
    )
    if created:
        HistoriqueAction.objects.create(
            dossier=dossier1,
            user=users['UTILISATEUR'],
            action='CREATION',
            etape='INTERESSE',
            commentaire='Création du dossier'
        )
        print(f"✅ Dossier créé: {dossier1.numero_dossier} (BROUILLON)")
    
    # Dossier chez DREN
    dossier2, created = Dossier.objects.get_or_create(
        numero_dossier='DOS-2024-002',
        defaults={
            'titre': 'Demande de mutation',
            'type_dossier': 'MUTATION',
            'fonctionnaire': fonctionnaire,
            'workflow': workflow,
            'statut': 'EN_COURS',
            'etape_actuelle': 'DREN',
            'created_by': users['UTILISATEUR'],
            'etapes_validation': {
                'INTERESSE': {
                    'valide_par': users['UTILISATEUR'].email,
                    'nom_utilisateur': f"{users['UTILISATEUR'].first_name} {users['UTILISATEUR'].last_name}",
                    'date': datetime.now().isoformat()
                }
            }
        }
    )
    if created:
        print(f"✅ Dossier créé: {dossier2.numero_dossier} (chez DREN)")
    
    # Dossier chez MEN
    dossier3, created = Dossier.objects.get_or_create(
        numero_dossier='DOS-2024-003',
        defaults={
            'titre': 'Demande de retraite',
            'type_dossier': 'RETRAITE',
            'fonctionnaire': fonctionnaire,
            'workflow': workflow,
            'statut': 'EN_COURS',
            'etape_actuelle': 'MEN',
            'created_by': users['UTILISATEUR'],
            'etapes_validation': {
                'INTERESSE': {
                    'valide_par': users['UTILISATEUR'].email,
                    'nom_utilisateur': f"{users['UTILISATEUR'].first_name} {users['UTILISATEUR'].last_name}",
                    'date': datetime.now().isoformat()
                },
                'DREN': {
                    'valide_par': users['DREN'].email,
                    'nom_utilisateur': f"{users['DREN'].first_name} {users['DREN'].last_name}",
                    'date': datetime.now().isoformat()
                }
            }
        }
    )
    if created:
        print(f"✅ Dossier créé: {dossier3.numero_dossier} (chez MEN)")
    
    # Dossier chez FOP
    dossier4, created = Dossier.objects.get_or_create(
        numero_dossier='DOS-2024-004',
        defaults={
            'titre': 'Demande de congé',
            'type_dossier': 'CONGE',
            'fonctionnaire': fonctionnaire,
            'workflow': workflow,
            'statut': 'EN_COURS',
            'etape_actuelle': 'FOP',
            'created_by': users['UTILISATEUR'],
            'etapes_validation': {
                'INTERESSE': {
                    'valide_par': users['UTILISATEUR'].email,
                    'nom_utilisateur': f"{users['UTILISATEUR'].first_name} {users['UTILISATEUR'].last_name}",
                    'date': datetime.now().isoformat()
                },
                'DREN': {
                    'valide_par': users['DREN'].email,
                    'nom_utilisateur': f"{users['DREN'].first_name} {users['DREN'].last_name}",
                    'date': datetime.now().isoformat()
                },
                'MEN': {
                    'valide_par': users['MEN'].email,
                    'nom_utilisateur': f"{users['MEN'].first_name} {users['MEN'].last_name}",
                    'date': datetime.now().isoformat()
                }
            }
        }
    )
    if created:
        print(f"✅ Dossier créé: {dossier4.numero_dossier} (chez FOP)")
    
    # Dossier chez FINANCE
    dossier5, created = Dossier.objects.get_or_create(
        numero_dossier='DOS-2024-005',
        defaults={
            'titre': 'Demande d\'indemnité',
            'type_dossier': 'REGULARISATION',
            'fonctionnaire': fonctionnaire,
            'workflow': workflow,
            'statut': 'EN_COURS',
            'etape_actuelle': 'FINANCE',
            'created_by': users['UTILISATEUR'],
            'etapes_validation': {
                'INTERESSE': {
                    'valide_par': users['UTILISATEUR'].email,
                    'nom_utilisateur': f"{users['UTILISATEUR'].first_name} {users['UTILISATEUR'].last_name}",
                    'date': datetime.now().isoformat()
                },
                'DREN': {
                    'valide_par': users['DREN'].email,
                    'nom_utilisateur': f"{users['DREN'].first_name} {users['DREN'].last_name}",
                    'date': datetime.now().isoformat()
                },
                'MEN': {
                    'valide_par': users['MEN'].email,
                    'nom_utilisateur': f"{users['MEN'].first_name} {users['MEN'].last_name}",
                    'date': datetime.now().isoformat()
                },
                'FOP': {
                    'valide_par': users['FOP'].email,
                    'nom_utilisateur': f"{users['FOP'].first_name} {users['FOP'].last_name}",
                    'date': datetime.now().isoformat()
                }
            }
        }
    )
    if created:
        print(f"✅ Dossier créé: {dossier5.numero_dossier} (chez FINANCE)")
    
    # Dossier TERMINE
    dossier6, created = Dossier.objects.get_or_create(
        numero_dossier='DOS-2024-006',
        defaults={
            'titre': 'Dossier terminé',
            'type_dossier': 'PROMOTION',
            'fonctionnaire': fonctionnaire,
            'workflow': workflow,
            'statut': 'TERMINE',
            'etape_actuelle': 'TERMINE',
            'created_by': users['UTILISATEUR'],
            'etapes_validation': {
                'INTERESSE': {
                    'valide_par': users['UTILISATEUR'].email,
                    'nom_utilisateur': f"{users['UTILISATEUR'].first_name} {users['UTILISATEUR'].last_name}",
                    'date': (datetime.now() - timedelta(days=10)).isoformat()
                },
                'DREN': {
                    'valide_par': users['DREN'].email,
                    'nom_utilisateur': f"{users['DREN'].first_name} {users['DREN'].last_name}",
                    'date': (datetime.now() - timedelta(days=8)).isoformat()
                },
                'MEN': {
                    'valide_par': users['MEN'].email,
                    'nom_utilisateur': f"{users['MEN'].first_name} {users['MEN'].last_name}",
                    'date': (datetime.now() - timedelta(days=6)).isoformat()
                },
                'FOP': {
                    'valide_par': users['FOP'].email,
                    'nom_utilisateur': f"{users['FOP'].first_name} {users['FOP'].last_name}",
                    'date': (datetime.now() - timedelta(days=4)).isoformat()
                },
                'FINANCE': {
                    'valide_par': users['FINANCE'].email,
                    'nom_utilisateur': f"{users['FINANCE'].first_name} {users['FINANCE'].last_name}",
                    'date': (datetime.now() - timedelta(days=2)).isoformat()
                }
            },
            'date_cloture': datetime.now()
        }
    )
    if created:
        print(f"✅ Dossier créé: {dossier6.numero_dossier} (TERMINE)")
    
    # Dossier REJETE
    dossier7, created = Dossier.objects.get_or_create(
        numero_dossier='DOS-2024-007',
        defaults={
            'titre': 'Dossier rejeté',
            'type_dossier': 'MUTATION',
            'fonctionnaire': fonctionnaire,
            'workflow': workflow,
            'statut': 'REJETE',
            'etape_actuelle': 'REJETE',
            'motif_rejet': 'Documents incomplets',
            'created_by': users['UTILISATEUR'],
            'etapes_validation': {
                'INTERESSE': {
                    'valide_par': users['UTILISATEUR'].email,
                    'nom_utilisateur': f"{users['UTILISATEUR'].first_name} {users['UTILISATEUR'].last_name}",
                    'date': (datetime.now() - timedelta(days=5)).isoformat()
                },
                'DREN': {
                    'valide_par': users['DREN'].email,
                    'nom_utilisateur': f"{users['DREN'].first_name} {users['DREN'].last_name}",
                    'date': (datetime.now() - timedelta(days=3)).isoformat()
                }
            }
        }
    )
    if created:
        print(f"✅ Dossier créé: {dossier7.numero_dossier} (REJETE)")
    
    print("\n" + "=" * 60)
    print("✅ CONFIGURATION TERMINÉE AVEC SUCCÈS!")
    print("=" * 60)
    print("\n📊 RÉCAPITULATIF:")
    print(f"   - Rôles: {len(roles)}")
    print(f"   - Utilisateurs: {len(users)}")
    print(f"   - Dossiers créés: 7")
    print("\n🔑 IDENTIFIANTS DE CONNEXION:")
    print("   (mot de passe: password123)")
    for role, user in users.items():
        print(f"   - {role}: {user.email}")
    print("\n📝 WORKFLOW:")
    print("   Intéressé → DREN → MEN → FOP → FINANCE → TERMINE")
    print("=" * 60)

if __name__ == "__main__":
    setup_test_data()