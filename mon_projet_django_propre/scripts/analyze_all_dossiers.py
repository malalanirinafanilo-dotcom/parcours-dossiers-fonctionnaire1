#!/usr/bin/env python
import os
import sys
import django

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from dossiers.models import Dossier
from dossiers.ia_service import analyse_dossier

def analyze_all_dossiers():
    """Analyse tous les dossiers qui n'ont pas d'analyse IA"""
    
    print("=" * 60)
    print("🔍 ANALYSE DE TOUS LES DOSSIERS")
    print("=" * 60)
    
    # Récupérer tous les dossiers
    dossiers = Dossier.objects.all()
    total = dossiers.count()
    
    print(f"📊 {total} dossiers trouvés")
    
    analyses_creees = 0
    deja_analyse = 0
    erreurs = 0
    
    for i, dossier in enumerate(dossiers, 1):
        print(f"\n[{i}/{total}] Analyse du dossier {dossier.numero_dossier}...")
        
        # Vérifier si une analyse existe déjà
        if dossier.analyses_ia.filter(type_analyse='RULE_BASED').exists():
            print(f"  ⏭️ Analyse déjà existante")
            deja_analyse += 1
            continue
        
        try:
            resultat = analyse_dossier(str(dossier.id))
            
            if resultat['success']:
                analyses_creees += 1
                score = resultat['resultats']['score_risque']
                print(f"  ✅ Analyse créée - Score: {score}")
            else:
                erreurs += 1
                print(f"  ❌ Erreur: {resultat['error']}")
                
        except Exception as e:
            erreurs += 1
            print(f"  ❌ Exception: {e}")
    
    print("\n" + "=" * 60)
    print(f"✅ RÉSULTAT:")
    print(f"   - Nouvelles analyses: {analyses_creees}")
    print(f"   - Déjà analysés: {deja_analyse}")
    print(f"   - Erreurs: {erreurs}")
    print(f"   - Total: {total}")
    print("=" * 60)

if __name__ == "__main__":
    analyze_all_dossiers()