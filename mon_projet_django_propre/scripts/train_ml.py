#!/usr/bin/env python
"""
Script pour entraîner les modèles ML
Usage: python scripts/train_ml.py [--force]
"""

import os
import sys
import django
import argparse

# Configuration Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from dossiers.ml_services.model_training import ModelTrainingService

def main():
    parser = argparse.ArgumentParser(description='Entraîne les modèles ML')
    parser.add_argument('--force', action='store_true', 
                       help='Force le réentraînement')
    args = parser.parse_args()
    
    print("=" * 60)
    print("🧠 ENTRAÎNEMENT DES MODÈLES MACHINE LEARNING")
    print("=" * 60)
    
    service = ModelTrainingService()
    success = service.train_all(force_retrain=args.force)
    
    if success:
        print("\n✅ Entraînement terminé avec succès!")
        
        # Tester sur un dossier existant
        from dossiers.models import Dossier
        from dossiers.ml_services.prediction_service import PredictionService
        
        dossiers = Dossier.objects.all()[:3]
        if dossiers:
            print("\n🔍 Tests de prédiction:")
            pred_service = PredictionService()
            
            for dossier in dossiers:
                print(f"\nDossier: {dossier.numero_dossier}")
                
                # Analyse complète
                analyse = pred_service.analyse_complete(dossier)
                
                print(f"  Statut prédit: {analyse['prediction_statut']['statut_pred']} "
                      f"(confiance: {analyse['prediction_statut']['confiance']:.2%})")
                print(f"  Délai estimé: {analyse['prediction_delai']['delai_total_estime']} jours")
                
                if analyse['recommandations']:
                    print("  Recommandations:")
                    for rec in analyse['recommandations']:
                        print(f"    - {rec['message']}")
    else:
        print("\n⚠️ L'entraînement a rencontré des problèmes")
        print("   Vérifiez que vous avez assez de données (>30 dossiers)")
    
    print("=" * 60)

if __name__ == "__main__":
    main()