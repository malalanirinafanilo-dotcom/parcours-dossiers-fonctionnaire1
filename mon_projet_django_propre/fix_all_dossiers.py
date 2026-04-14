# fix_all_dossiers.py
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from dossiers.models import Dossier, HistoriqueAction
from django.utils import timezone

def fix_all_dossiers():
    print("=" * 60)
    print("🔧 CORRECTION DE TOUS LES DOSSIERS")
    print("=" * 60)
    
    # 1. Corriger les dossiers avec statut REJETE
    dossiers_rejetes = Dossier.objects.filter(statut='REJETE')
    print(f"\n📊 {dossiers_rejetes.count()} dossiers avec statut REJETE trouvés")
    
    for dossier in dossiers_rejetes:
        print(f"  - Correction dossier {dossier.numero_dossier}")
        
        # Récupérer le dernier rejet dans l'historique
        dernier_rejet = HistoriqueAction.objects.filter(
            dossier=dossier,
            action='REJET'
        ).first()
        
        motif = dernier_rejet.commentaire if dernier_rejet else "Motif non spécifié"
        
        # Mettre à jour le dossier
        dossier.statut = 'BROUILLON'
        dossier.etape_actuelle = 'INTERESSE'
        dossier.motif_rejet = motif
        dossier.save()
        
        print(f"     ✓ Nouveau statut: BROUILLON, Motif: {motif[:50]}...")
    
    # 2. Vérifier les dossiers EN_ATTENTE_DREN
    dossiers_dren = Dossier.objects.filter(statut='EN_ATTENTE_DREN')
    print(f"\n📊 {dossiers_dren.count()} dossiers en attente DREN")
    for dossier in dossiers_dren:
        if dossier.etape_actuelle != 'DREN':
            print(f"  - Correction étape dossier {dossier.numero_dossier}")
            dossier.etape_actuelle = 'DREN'
            dossier.save()
    
    # 3. Vérifier les dossiers EN_ATTENTE_MEN
    dossiers_men = Dossier.objects.filter(statut='EN_ATTENTE_MEN')
    print(f"\n📊 {dossiers_men.count()} dossiers en attente MEN")
    for dossier in dossiers_men:
        if dossier.etape_actuelle != 'MEN':
            print(f"  - Correction étape dossier {dossier.numero_dossier}")
            dossier.etape_actuelle = 'MEN'
            dossier.save()
    
    # 4. Vérifier les dossiers EN_ATTENTE_FOP
    dossiers_fop = Dossier.objects.filter(statut='EN_ATTENTE_FOP')
    print(f"\n📊 {dossiers_fop.count()} dossiers en attente FOP")
    for dossier in dossiers_fop:
        if dossier.etape_actuelle != 'FOP':
            print(f"  - Correction étape dossier {dossier.numero_dossier}")
            dossier.etape_actuelle = 'FOP'
            dossier.save()
    
    # 5. Vérifier les dossiers EN_ATTENTE_FINANCE
    dossiers_finance = Dossier.objects.filter(statut='EN_ATTENTE_FINANCE')
    print(f"\n📊 {dossiers_finance.count()} dossiers en attente FINANCE")
    for dossier in dossiers_finance:
        if dossier.etape_actuelle != 'FINANCE':
            print(f"  - Correction étape dossier {dossier.numero_dossier}")
            dossier.etape_actuelle = 'FINANCE'
            dossier.save()
    
    print("\n" + "=" * 60)
    print("✅ CORRECTION TERMINÉE")
    print("=" * 60)

def check_dossier(dossier_id):
    """Vérifier un dossier spécifique"""
    try:
        dossier = Dossier.objects.get(id=dossier_id)
        print(f"\n📋 DOSSIER: {dossier.numero_dossier}")
        print(f"  Statut: {dossier.statut}")
        print(f"  Étape: {dossier.etape_actuelle}")
        print(f"  Motif rejet: {dossier.motif_rejet}")
        print(f"  Créé par: {dossier.created_by.email if dossier.created_by else 'Inconnu'}")
        
        print("\n  Historique:")
        historique = HistoriqueAction.objects.filter(dossier=dossier).order_by('-created_at')
        for h in historique[:5]:
            print(f"    - {h.created_at.strftime('%d/%m/%Y %H:%M')} | {h.action} | {h.etape} | {h.commentaire[:50]}")
        
        return dossier
    except Dossier.DoesNotExist:
        print(f"❌ Dossier {dossier_id} non trouvé")
        return None

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == 'check':
        if len(sys.argv) > 2:
            check_dossier(sys.argv[2])
        else:
            print("Usage: python fix_all_dossiers.py check <dossier_id>")
    else:
        fix_all_dossiers()