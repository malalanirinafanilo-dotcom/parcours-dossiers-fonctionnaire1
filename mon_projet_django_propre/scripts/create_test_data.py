# scripts/create_test_data.py
#!/usr/bin/env python
import os
import sys
import django
import random
from datetime import datetime, timedelta

# Ajouter le chemin du projet
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from dossiers.models import Dossier, Fonctionnaire
from core.models import User

def create_test_data():
    print("Création de données de test...")
    
    # Récupérer l'utilisateur intéressé
    try:
        interesse = User.objects.get(email='interesse@example.com')
    except User.DoesNotExist:
        print("❌ Utilisateur interesse@example.com non trouvé")
        print("Exécutez d'abord: python scripts/setup_test_data.py")
        return
    
    # Récupérer ou créer un fonctionnaire
    fonctionnaire, created = Fonctionnaire.objects.get_or_create(
        matricule='F001',
        defaults={
            'nom': 'Rakoto',
            'prenom': 'Jean',
            'date_naissance': '1985-05-15',
            'categorie': 'A',
            'grade': 'Grade 1'
        }
    )
    
    # Créer des dossiers de test
    statuts = ['BROUILLON', 'EN_ATTENTE_DREN', 'EN_ATTENTE_MEN', 'EN_ATTENTE_FOP', 'EN_ATTENTE_FINANCE', 'TERMINE', 'REJETE']
    etapes = ['INTERESSE', 'DREN', 'MEN', 'FOP', 'FINANCE', 'TERMINE', 'REJETE']
    
    for i in range(20):
        date_depot = datetime.now() - timedelta(days=random.randint(1, 60))
        statut = random.choice(statuts)
        etape = random.choice(etapes)
        
        dossier, created = Dossier.objects.get_or_create(
            numero_dossier=f"TEST-2024-{i+100:03d}",
            defaults={
                'titre': f"Dossier de test {i+1}",
                'type_dossier': random.choice(['PROMOTION', 'MUTATION', 'CONGE', 'RETRAITE']),
                'fonctionnaire': fonctionnaire,
                'statut': statut,
                'etape_actuelle': etape,
                'created_by': interesse,
                'date_depot': date_depot,
                'etapes_validation': {}
            }
        )
        
        if created:
            print(f"✅ Dossier créé: {dossier.numero_dossier} ({statut})")
    
    print("\n✅ Données de test créées avec succès!")

if __name__ == "__main__":
    create_test_data()