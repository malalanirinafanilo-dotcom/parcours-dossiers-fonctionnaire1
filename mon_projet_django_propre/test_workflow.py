# test_workflow.py
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from dossiers.models import Dossier, Fonctionnaire, HistoriqueAction
from core.models import User
from django.utils import timezone
import uuid

def test_workflow():
    print("=" * 60)
    print("🧪 TEST DU WORKFLOW COMPLET")
    print("=" * 60)
    
    # Récupérer les utilisateurs
    interesse = User.objects.filter(role__code='UTILISATEUR').first()
    dren = User.objects.filter(role__code='DREN').first()
    men = User.objects.filter(role__code='MEN').first()
    fop = User.objects.filter(role__code='FOP').first()
    finance = User.objects.filter(role__code='FINANCE').first()
    
    if not all([interesse, dren, men, fop, finance]):
        print("❌ Certains utilisateurs manquent")
        return
    
    # Récupérer un fonctionnaire
    fonctionnaire = Fonctionnaire.objects.first()
    if not fonctionnaire:
        print("❌ Aucun fonctionnaire trouvé")
        return
    
    print(f"\n👤 Utilisateurs trouvés:")
    print(f"  - Intéressé: {interesse.email}")
    print(f"  - DREN: {dren.email}")
    print(f"  - MEN: {men.email}")
    print(f"  - FOP: {fop.email}")
    print(f"  - Finance: {finance.email}")
    
    # 1. CRÉATION DU DOSSIER
    print("\n1️⃣ CRÉATION DU DOSSIER")
    dossier = Dossier.objects.create(
        numero_dossier=f"TEST-{timezone.now().strftime('%Y%m%d%H%M%S')}",
        titre="Dossier de test workflow",
        type_dossier="PROMOTION",
        code_mouvement="02",
        fonctionnaire=fonctionnaire,
        statut='BROUILLON',
        etape_actuelle='INTERESSE',
        created_by=interesse
    )
    print(f"   ✅ Dossier créé: {dossier.numero_dossier}")
    print(f"   📊 Statut: {dossier.statut}, Étape: {dossier.etape_actuelle}")
    
    # 2. ENVOI À LA DREN
    print("\n2️⃣ ENVOI À LA DREN")
    try:
        dossier.envoyer_a_dren(interesse)
        print(f"   ✅ Dossier envoyé à la DREN")
        print(f"   📊 Nouveau statut: {dossier.statut}, Nouvelle étape: {dossier.etape_actuelle}")
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
    
    # 3. VALIDATION DREN
    print("\n3️⃣ VALIDATION DREN")
    try:
        dossier.valider_etape(dren, "Validé par DREN")
        print(f"   ✅ Dossier validé par DREN")
        print(f"   📊 Nouveau statut: {dossier.statut}, Nouvelle étape: {dossier.etape_actuelle}")
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
    
    # 4. VALIDATION MEN
    print("\n4️⃣ VALIDATION MEN")
    try:
        dossier.valider_etape(men, "Validé par MEN")
        print(f"   ✅ Dossier validé par MEN")
        print(f"   📊 Nouveau statut: {dossier.statut}, Nouvelle étape: {dossier.etape_actuelle}")
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
    
    # 5. VALIDATION FOP
    print("\n5️⃣ VALIDATION FOP")
    try:
        dossier.valider_etape(fop, "Validé par FOP")
        print(f"   ✅ Dossier validé par FOP")
        print(f"   📊 Nouveau statut: {dossier.statut}, Nouvelle étape: {dossier.etape_actuelle}")
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
    
    # 6. VALIDATION FINANCE
    print("\n6️⃣ VALIDATION FINANCE")
    try:
        dossier.valider_etape(finance, "Validé par Finance")
        print(f"   ✅ Dossier validé par Finance")
        print(f"   📊 Nouveau statut: {dossier.statut}, Nouvelle étape: {dossier.etape_actuelle}")
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
    
    # 7. AFFICHER L'HISTORIQUE COMPLET
    print("\n📋 HISTORIQUE COMPLET")
    historique = HistoriqueAction.objects.filter(dossier=dossier).order_by('created_at')
    for h in historique:
        print(f"   - {h.created_at.strftime('%H:%M:%S')} | {h.action} | {h.etape} | {h.commentaire}")
    
    print("\n" + "=" * 60)
    print("✅ TEST TERMINÉ")
    print("=" * 60)

if __name__ == "__main__":
    test_workflow()