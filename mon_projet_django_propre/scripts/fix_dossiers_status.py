# scripts/fix_dossiers_status.py
#!/usr/bin/env python
import os
import sys
import django

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from dossiers.models import Dossier

def fix_dossiers_status():
    """Corrige les statuts des dossiers existants"""
    print("=" * 60)
    print("CORRECTION DES STATUTS DES DOSSIERS")
    print("=" * 60)
    
    dossiers = Dossier.objects.all()
    print(f"📊 {dossiers.count()} dossiers trouvés")
    
    corrections = 0
    
    for dossier in dossiers:
        ancien_statut = dossier.statut
        besoin_correction = False
        
        # Mapping des statuts corrects
        if dossier.etape_actuelle == 'INTERESSE' and dossier.statut not in ['BROUILLON', 'REJETE']:
            dossier.statut = 'BROUILLON'
            besoin_correction = True
            print(f"📝 {dossier.numero_dossier}: INTERESSE → statut BROUILLON")
        
        elif dossier.etape_actuelle == 'DREN' and dossier.statut != 'EN_ATTENTE_DREN':
            dossier.statut = 'EN_ATTENTE_DREN'
            besoin_correction = True
            print(f"📝 {dossier.numero_dossier}: DREN → statut EN_ATTENTE_DREN")
        
        elif dossier.etape_actuelle == 'MEN' and dossier.statut != 'EN_ATTENTE_MEN':
            dossier.statut = 'EN_ATTENTE_MEN'
            besoin_correction = True
            print(f"📝 {dossier.numero_dossier}: MEN → statut EN_ATTENTE_MEN")
        
        elif dossier.etape_actuelle == 'FOP' and dossier.statut != 'EN_ATTENTE_FOP':
            dossier.statut = 'EN_ATTENTE_FOP'
            besoin_correction = True
            print(f"📝 {dossier.numero_dossier}: FOP → statut EN_ATTENTE_FOP")
        
        elif dossier.etape_actuelle == 'FINANCE' and dossier.statut != 'EN_ATTENTE_FINANCE':
            dossier.statut = 'EN_ATTENTE_FINANCE'
            besoin_correction = True
            print(f"📝 {dossier.numero_dossier}: FINANCE → statut EN_ATTENTE_FINANCE")
        
        elif dossier.etape_actuelle == 'TERMINE' and dossier.statut != 'TERMINE':
            dossier.statut = 'TERMINE'
            besoin_correction = True
            print(f"📝 {dossier.numero_dossier}: TERMINE → statut TERMINE")
        
        if besoin_correction:
            dossier.save()
            corrections += 1
            print(f"   ✅ {ancien_statut} → {dossier.statut}")
    
    print("\n" + "=" * 60)
    print(f"✅ {corrections} dossiers corrigés sur {dossiers.count()}")
    print("=" * 60)

if __name__ == "__main__":
    fix_dossiers_status()