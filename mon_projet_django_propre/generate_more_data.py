# generate_more_data.py
import os
import sys
import django
import random
from datetime import datetime, timedelta

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from dossiers.models import Fonctionnaire, Dossier, DossierData, IAAnalyse
from core.models import User
from django.utils import timezone

def generate_more_data(nb_dossiers=10):
    print("=" * 50)
    print("📊 GÉNÉRATION DE DONNÉES SUPPLÉMENTAIRES")
    print("=" * 50)
    
    user = User.objects.first()
    fonctionnaire = Fonctionnaire.objects.first()
    
    if not user or not fonctionnaire:
        print("❌ Utilisateur ou fonctionnaire manquant")
        return
    
    types_dossier = ['PROMOTION', 'MUTATION', 'CONGE', 'RETRAITE']
    
    print(f"\nCréation de {nb_dossiers} dossiers TERMINÉS...")
    
    for i in range(nb_dossiers):
        # Créer un dossier TERMINE avec date de clôture
        date_depot = timezone.now() - timedelta(days=random.randint(30, 90))
        jours_traitement = random.randint(10, 40)
        date_cloture = date_depot + timedelta(days=jours_traitement)
        
        dossier = Dossier.objects.create(
            numero_dossier=f"ML-TERMINE-{datetime.now().strftime('%Y%m')}-{i+1:03d}",
            titre=f"Dossier terminé ML {i+1}",
            type_dossier=random.choice(types_dossier),
            fonctionnaire=fonctionnaire,
            statut='TERMINE',
            etape_actuelle='FINANCE',
            created_by=user,
            date_depot=date_depot,
            date_cloture=date_cloture
        )
        
        DossierData.objects.create(
            dossier=dossier,
            data={
                'nom': 'Test',
                'prenom': f'User{i+1}',
                'matricule': f'MLT{i+1:03d}',
                'grade_actuel': random.choice(['A1', 'A2', 'B1']),
                'salaire_base': random.randint(100000, 500000),
                'indice': random.choice(['A1', 'A2', 'B1'])
            }
        )
        
        # Créer analyse IA
        score_risque = random.randint(10, 90)
        if score_risque < 30:
            classification = "Conforme"
        elif score_risque < 60:
            classification = "A risque modéré"
        else:
            classification = "A risque élevé"
        
        IAAnalyse.objects.create(
            dossier=dossier,
            type_analyse='RULE_BASED',
            resultats={
                'score_risque': score_risque,
                'classification': classification,
                'anomalies': []
            },
            score_risque=score_risque,
            classification=classification
        )
        
        print(f"   ✓ {dossier.numero_dossier}: terminé en {jours_traitement} jours - Score: {score_risque}")
    
    print(f"\n✅ {nb_dossiers} dossiers terminés créés!")
    
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
    generate_more_data(10)