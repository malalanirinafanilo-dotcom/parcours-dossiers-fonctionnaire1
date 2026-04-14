# test_serializer.py
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from dossiers.models import Dossier
from api.serializers import DossierDetailSerializer

def test_serializer():
    # Prendre un dossier existant
    dossier = Dossier.objects.first()
    if not dossier:
        print("❌ Aucun dossier trouvé")
        return
    
    print(f"📋 Test avec dossier: {dossier.id} - {dossier.numero_dossier}")
    
    try:
        serializer = DossierDetailSerializer(dossier)
        data = serializer.data
        print("✅ Sérialisation réussie!")
        print(f"📊 Champs: {list(data.keys())}")
    except Exception as e:
        print(f"❌ Erreur: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_serializer()