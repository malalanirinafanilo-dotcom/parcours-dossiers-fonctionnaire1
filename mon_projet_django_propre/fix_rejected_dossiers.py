# fix_rejected_dossiers.py
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from dossiers.models import Dossier, HistoriqueAction

def fix_rejected_dossiers():
    print("=" * 60)
    print("🔧 CORRECTION DES DOSSIERS REJETÉS")
    print("=" * 60)
    
    # Trouver tous les dossiers avec statut REJETE
    dossiers_rejetes = Dossier.objects.filter(statut='REJETE')
    print(f"\n📊 {dossiers_rejetes.count()} dossiers avec statut REJETE trouvés")
    
    for dossier in dossiers_rejetes:
        print(f"\n📋 Dossier {dossier.numero_dossier}:")
        print(f"   - Statut actuel: {dossier.statut}")
        print(f"   - Étape actuelle: {dossier.etape_actuelle}")
        print(f"   - Motif rejet: {dossier.motif_rejet}")
        
        # Récupérer le dernier rejet dans l'historique
        dernier_rejet = HistoriqueAction.objects.filter(
            dossier=dossier,
            action='REJET'
        ).order_by('-created_at').first()
        
        if dernier_rejet:
            motif = dernier_rejet.commentaire
            print(f"   - Motif dans historique: {motif}")
        else:
            motif = dossier.motif_rejet or "Motif non spécifié"
        
        # CORRECTION: Mettre en BROUILLON à l'étape INTERESSE
        dossier.statut = 'BROUILLON'
        dossier.etape_actuelle = 'INTERESSE'
        dossier.motif_rejet = motif
        dossier.save()
        
        print(f"   ✅ Corrigé: {dossier.statut} à {dossier.etape_actuelle}")
    
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
        
        print("\n  Historique des actions:")
        historique = HistoriqueAction.objects.filter(dossier=dossier).order_by('-created_at')
        for h in historique[:10]:
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
            print("Usage: python fix_rejected_dossiers.py check <dossier_id>")
    else:
        fix_rejected_dossiers()