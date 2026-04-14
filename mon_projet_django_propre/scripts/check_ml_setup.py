#!/usr/bin/env python
"""
Script pour vérifier que la configuration ML est correcte
"""

import os
import sys
import django

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

def check_ml_setup():
    print("=" * 60)
    print("🔍 VÉRIFICATION DE LA CONFIGURATION ML")
    print("=" * 60)
    
    # 1. Vérifier les packages
    try:
        import numpy
        print(f"✅ numpy {numpy.__version__}")
    except ImportError:
        print("❌ numpy non installé")
    
    try:
        import pandas
        print(f"✅ pandas {pandas.__version__}")
    except ImportError:
        print("❌ pandas non installé")
    
    try:
        import sklearn
        print(f"✅ scikit-learn {sklearn.__version__}")
    except ImportError:
        print("❌ scikit-learn non installé")
    
    try:
        import joblib
        print(f"✅ joblib {joblib.__version__}")
    except ImportError:
        print("❌ joblib non installé")
    
    # 2. Vérifier les dossiers
    from pathlib import Path
    base_dir = Path(__file__).resolve().parent.parent
    models_dir = base_dir / 'dossiers' / 'ml_models'
    
    if models_dir.exists():
        print(f"✅ Dossier ml_models: {models_dir}")
        
        # Lister les modèles existants
        models = list(models_dir.glob('*.pkl'))
        if models:
            print(f"   Modèles trouvés: {len(models)}")
            for model in models:
                size = model.stat().st_size / 1024
                print(f"     - {model.name} ({size:.1f} KB)")
        else:
            print("   ⚠️ Aucun modèle trouvé")
    else:
        print(f"❌ Dossier ml_models manquant: {models_dir}")
    
    # 3. Vérifier les données
    from dossiers.models import Dossier
    total = Dossier.objects.count()
    print(f"\n📊 Données disponibles: {total} dossiers")
    
    if total < 30:
        print("   ⚠️ Moins de 30 dossiers - insuffisant pour le ML")
    else:
        print("   ✅ Nombre de dossiers suffisant")
    
    termines = Dossier.objects.filter(statut='TERMINE').count()
    print(f"   Dossiers terminés: {termines}")
    
    with_rejet = Dossier.objects.exclude(motif_rejet__isnull=True).count()
    print(f"   Dossiers rejetés: {with_rejet}")
    
    print("=" * 60)

if __name__ == "__main__":
    check_ml_setup()