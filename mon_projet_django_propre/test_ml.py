# test_ml.py
#!/usr/bin/env python
import os
import sys
import django

# Ajouter le chemin du projet
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Initialiser Django
django.setup()

def test_ml():
    print("=" * 60)
    print("🧪 TEST DES SERVICES ML (SANS NUMPY)")
    print("=" * 60)
    
    try:
        from dossiers.models import Dossier
        from dossiers.ml_services.prediction_service import prediction_service
        from dossiers.ml_services.data_preparation import DataPreparationService
        
        # 1. Vérifier qu'il y a des dossiers
        total_dossiers = Dossier.objects.count()
        print(f"\n📁 Nombre de dossiers: {total_dossiers}")
        
        if total_dossiers == 0:
            print("⚠️ Aucun dossier trouvé dans la base de données")
            print("   Créez d'abord des dossiers de test avec:")
            print("   python manage.py shell < scripts/create_test_data.py")
            return
        
        # 2. Statistiques
        print("\n📊 Statistiques des dossiers:")
        stats = DataPreparationService.get_summary_statistics()
        for key, value in stats.items():
            print(f"   {key}: {value}")
        
        # 3. Vérifier les dossiers terminés pour l'entraînement
        dossiers_termines = Dossier.objects.filter(statut='TERMINE').count()
        print(f"\n📊 Dossiers terminés: {dossiers_termines}")
        
        if dossiers_termines < 5:
            print("⚠️ Pas assez de dossiers terminés pour un entraînement significatif")
            print("   Besoin d'au moins 5 dossiers terminés")
        
        # 4. Entraînement
        print("\n🧠 Entraînement des modèles...")
        success = prediction_service.train_models(force_retrain=True)
        
        if success:
            print("✅ Modèles entraînés avec succès")
            
            # 5. Tester sur un dossier
            dossier = Dossier.objects.first()
            if dossier:
                print(f"\n🔍 Test sur dossier {dossier.numero_dossier}:")
                analyse = prediction_service.analyse_complete(dossier)
                print(f"   Durée estimée: {analyse['predictions']['duree']['duree_estimee']} jours")
                print(f"   Durée écoulée: {analyse['predictions']['duree']['duree_ecoulee']} jours")
                print(f"   Risque rejet: {analyse['predictions']['rejet']['probabilite_rejet']}% ({analyse['predictions']['rejet']['niveau_risque']})")
        else:
            print("⚠️ Pas assez de données pour l'entraînement")
            print("   Besoin d'au moins 10 dossiers avec des données complètes")
            
    except Exception as e:
        print(f"❌ Erreur: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n" + "=" * 60)

if __name__ == "__main__":
    test_ml()