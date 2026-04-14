# generate_test_data.py
import os
import sys
import django
import random
from datetime import datetime, timedelta

# Configuration Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from dossiers.models import Fonctionnaire, Dossier, DossierData, IAAnalyse
from core.models import User
from django.utils import timezone

def generate_test_data(nb_dossiers=20):
    print("=" * 50)
    print("📊 GÉNÉRATION DE DONNÉES DE TEST ML")
    print("=" * 50)
    
    # Récupérer un utilisateur
    user = User.objects.first()
    if not user:
        print("❌ Aucun utilisateur trouvé")
        print("   Créez d'abord un utilisateur avec: python manage.py createsuperuser")
        return
    
    # Récupérer un fonctionnaire
    fonctionnaire = Fonctionnaire.objects.first()
    if not fonctionnaire:
        print("❌ Aucun fonctionnaire trouvé")
        print("   Créez d'abord un fonctionnaire via l'admin ou l'API")
        return
    
    types_dossier = ['PROMOTION', 'MUTATION', 'CONGE', 'RETRAITE']
    statuts = ['TERMINE', 'TERMINE', 'TERMINE', 'EN_COURS', 'REJETE', 'BLOQUE']
    etapes = ['INTERESSE', 'DREN', 'MEN', 'FOP', 'FINANCE']
    
    print(f"\nCréation de {nb_dossiers} dossiers de test...")
    
    for i in range(nb_dossiers):
        # Créer un dossier
        statut = random.choice(statuts)
        date_depot = timezone.now() - timedelta(days=random.randint(10, 90))
        
        dossier = Dossier.objects.create(
            numero_dossier=f"ML-{datetime.now().strftime('%Y%m')}-{i+1:03d}",
            titre=f"Dossier test ML {i+1}",
            type_dossier=random.choice(types_dossier),
            fonctionnaire=fonctionnaire,
            statut=statut,
            etape_actuelle=random.choice(etapes) if statut != 'TERMINE' else 'FINANCE',
            created_by=user,
            date_depot=date_depot
        )
        
        # Ajouter des données
        DossierData.objects.create(
            dossier=dossier,
            data={
                'nom': 'Test',
                'prenom': f'User{i+1}',
                'matricule': f'ML{i+1:03d}',
                'grade_actuel': random.choice(['A1', 'A2', 'B1']),
                'salaire_base': random.randint(100000, 500000),
                'indice': random.choice(['A1', 'A2', 'B1']),
                'date_debut': (date_depot + timedelta(days=5)).strftime('%Y-%m-%d'),
                'date_fin': (date_depot + timedelta(days=random.randint(15, 45))).strftime('%Y-%m-%d')
            }
        )
        
        # Simuler une date de clôture pour les dossiers terminés
        if statut == 'TERMINE':
            jours = random.randint(5, 45)
            dossier.date_cloture = date_depot + timedelta(days=jours)
            dossier.save()
        
        # Créer une analyse IA avec des anomalies variées
        nb_anomalies = random.randint(0, 4)
        anomalies = []
        score_risque = 0
        
        if nb_anomalies > 0:
            types_anomalies = ['champs_manquants', 'incoherence_dates', 'salaire_trop_bas', 'documents_manquants']
            for j in range(nb_anomalies):
                type_anomalie = random.choice(types_anomalies)
                anomalies.append({
                    'type': type_anomalie,
                    'message': f"Anomalie {type_anomalie} détectée"
                })
                score_risque += random.randint(15, 30)
        
        score_risque = min(score_risque, 100)
        
        if score_risque < 20:
            classification = "Conforme"
        elif score_risque < 40:
            classification = "A risque faible"
        elif score_risque < 60:
            classification = "A risque modéré"
        elif score_risque < 80:
            classification = "A risque élevé"
        else:
            classification = "Bloqué"
        
        IAAnalyse.objects.create(
            dossier=dossier,
            type_analyse='RULE_BASED',
            resultats={
                'score_risque': score_risque,
                'classification': classification,
                'anomalies': anomalies,
                'resume': {
                    'total_anomalies': nb_anomalies,
                    'niveau_risque': classification
                }
            },
            score_risque=score_risque,
            classification=classification
        )
        
        print(f"   ✓ {dossier.numero_dossier}: {statut} - Score: {score_risque}")
    
    print(f"\n✅ {nb_dossiers} dossiers créés avec succès!")
    
    # Statistiques
    total = Dossier.objects.count()
    avec_analyse = Dossier.objects.filter(analyses_ia__isnull=False).distinct().count()
    avec_cloture = Dossier.objects.exclude(date_cloture__isnull=True).count()
    termines = Dossier.objects.filter(statut='TERMINE').count()
    
    print(f"\n📊 Statistiques finales:")
    print(f"   Total dossiers: {total}")
    print(f"   Avec analyse IA: {avec_analyse}")
    print(f"   Avec date clôture: {avec_cloture}")
    print(f"   Dossiers terminés: {termines}")
    print(f"   Exploitables pour ML: {min(avec_analyse, avec_cloture, termines)}")

if __name__ == "__main__":
    generate_test_data(20)