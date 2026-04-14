# check_dossier_data.py
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from dossiers.models import Dossier
from api.serializers import DossierSerializer

def check_dossier_data():
    print("=" * 60)
    print("🔍 VÉRIFICATION DES DONNÉES DES DOSSIERS")
    print("=" * 60)
    
    dossiers = Dossier.objects.all()[:5]
    print(f"\n📊 {len(dossiers)} dossiers trouvés")
    
    for dossier in dossiers:
        print(f"\n📋 Dossier: {dossier.numero_dossier}")
        print(f"  - Titre: {dossier.titre}")
        print(f"  - Type: {dossier.type_dossier}")
        print(f"  - Code: {dossier.code_mouvement}")
        print(f"  - Statut: {dossier.statut}")
        print(f"  - Étape: {dossier.etape_actuelle}")
        
        if dossier.fonctionnaire:
            print(f"  - Fonctionnaire ID: {dossier.fonctionnaire.id}")
            print(f"  - Nom: {dossier.fonctionnaire.nom}")
            print(f"  - Prénom: {dossier.fonctionnaire.prenom}")
        else:
            print("  ❌ PAS DE FONCTIONNAIRE ASSOCIÉ")
        
        # Vérifier ce que le sérialiseur renvoie
        serializer = DossierSerializer(dossier)
        data = serializer.data
        print(f"\n  📤 Données sérialisées:")
        print(f"  - fonctionnaire_nom: {data.get('fonctionnaire_nom')}")
        print(f"  - fonctionnaire_prenom: {data.get('fonctionnaire_prenom')}")
        print(f"  - code_mouvement: {data.get('code_mouvement')}")
        print(f"  - statut: {data.get('statut')}")
        
        print("-" * 40)

if __name__ == "__main__":
    check_dossier_data()