# scripts/test_flux_complet.py
#!/usr/bin/env python
import os
import sys
import django
import uuid
from datetime import datetime, timedelta

# Ajouter le chemin du projet
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import User, Notification
from dossiers.models import Dossier, Fonctionnaire, HistoriqueAction
from django.db.models import Q

def test_flux_complet():
    print("=" * 60)
    print("🧪 TEST DU FLUX COMPLET")
    print("=" * 60)
    
    # Récupérer les utilisateurs
    try:
        interesse = User.objects.get(email='interesse@example.com')
        dren = User.objects.get(email='dren@example.com')
        men = User.objects.get(email='men@example.com')
        fop = User.objects.get(email='fop@example.com')
        finance = User.objects.get(email='finance@example.com')
        
        print(f"\n👤 Utilisateurs trouvés:")
        print(f"   - Intéressé: {interesse.email} (ID: {interesse.id})")
        print(f"   - DREN: {dren.email}")
        print(f"   - MEN: {men.email}")
        print(f"   - FOP: {fop.email}")
        print(f"   - Finance: {finance.email}")
    except User.DoesNotExist as e:
        print(f"❌ Erreur: {e}")
        print("   Veuillez d'abord exécuter: python scripts/setup_test_data.py")
        return
    
    # Récupérer le fonctionnaire
    try:
        fonctionnaire = Fonctionnaire.objects.get(matricule='F001')
        print(f"\n👤 Fonctionnaire: {fonctionnaire.nom} {fonctionnaire.prenom} (ID: {fonctionnaire.id})")
    except Fonctionnaire.DoesNotExist:
        print("❌ Fonctionnaire non trouvé")
        return
    
    # Récupérer le workflow
    from workflow.models import Workflow
    try:
        workflow = Workflow.objects.get(code='WORKFLOW_STANDARD')
        print(f"📋 Workflow: {workflow.name}")
    except Workflow.DoesNotExist:
        print("❌ Workflow non trouvé")
        return
    
    # Créer un nouveau dossier de test
    dossier_numero = f"TEST-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
    
    dossier = Dossier.objects.create(
        numero_dossier=dossier_numero,
        titre="Dossier de test flux complet - Validation Finance",
        type_dossier="PROMOTION",
        fonctionnaire=fonctionnaire,
        workflow=workflow,
        statut='BROUILLON',
        etape_actuelle='INTERESSE',
        created_by=interesse,
        etapes_validation={}
    )
    
    print(f"\n📁 DOSSIER CRÉÉ: {dossier.numero_dossier}")
    print(f"   - ID: {dossier.id}")
    print(f"   - Étape: {dossier.etape_actuelle}")
    print(f"   - Statut: {dossier.statut}")
    print(f"   - Créé par: {dossier.created_by.email}")
    
    # Étape 1: Intéressé envoie à DREN
    print(f"\n📤 ÉTAPE 1: Intéressé envoie à DREN")
    try:
        dossier.envoyer_a_dren(interesse)
        dossier.refresh_from_db()
        print(f"   ✅ Dossier maintenant chez DREN")
        print(f"   - Étape: {dossier.etape_actuelle}")
        print(f"   - Statut: {dossier.statut}")
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
    
    # Étape 2: DREN valide
    print(f"\n✅ ÉTAPE 2: DREN valide")
    try:
        dossier.valider_etape(dren)
        dossier.refresh_from_db()
        print(f"   ✅ Dossier maintenant chez MEN")
        print(f"   - Étape: {dossier.etape_actuelle}")
        print(f"   - Statut: {dossier.statut}")
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
    
    # Étape 3: MEN valide
    print(f"\n✅ ÉTAPE 3: MEN valide")
    try:
        dossier.valider_etape(men)
        dossier.refresh_from_db()
        print(f"   ✅ Dossier maintenant chez FOP")
        print(f"   - Étape: {dossier.etape_actuelle}")
        print(f"   - Statut: {dossier.statut}")
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
    
    # Étape 4: FOP valide
    print(f"\n✅ ÉTAPE 4: FOP valide")
    try:
        dossier.valider_etape(fop)
        dossier.refresh_from_db()
        print(f"   ✅ Dossier maintenant chez Finance")
        print(f"   - Étape: {dossier.etape_actuelle}")
        print(f"   - Statut: {dossier.statut}")
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
    
    # Étape 5: Finance valide (TERMINE)
    print(f"\n✅ ÉTAPE 5: Finance valide (finalisation)")
    try:
        dossier.valider_etape(finance)
        dossier.refresh_from_db()
        print(f"   ✅ Dossier TERMINÉ")
        print(f"   - Étape: {dossier.etape_actuelle}")
        print(f"   - Statut: {dossier.statut}")
        print(f"   - Date clôture: {dossier.date_cloture}")
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
    
    # Vérifier que l'intéressé peut voir le dossier terminé
    print(f"\n🔍 VÉRIFICATION: L'intéressé voit-il le dossier terminé ?")
    
    dossiers_interesse = Dossier.objects.filter(
        Q(created_by=interesse) |
        Q(fonctionnaire__email=interesse.email) |
        Q(etape_actuelle='INTERESSE')
    )
    
    print(f"\n📊 Dossiers visibles par l'intéressé ({dossiers_interesse.count()}):")
    for d in dossiers_interesse:
        print(f"   - {d.numero_dossier}: {d.statut} (étape: {d.etape_actuelle})")
    
    # Vérifier que le dossier terminé est dans la liste
    if dossiers_interesse.filter(id=dossier.id).exists():
        print(f"\n✅ SUCCÈS: L'intéressé voit le dossier terminé !")
    else:
        print(f"\n❌ ÉCHEC: L'intéressé ne voit pas le dossier terminé")
        print(f"   Le dossier {dossier.numero_dossier} (ID: {dossier.id}) n'est pas dans la liste")
    
    # Vérifier les notifications
    notifications = Notification.objects.filter(user=interesse).order_by('-created_at')
    print(f"\n🔔 Notifications pour l'intéressé ({notifications.count()}):")
    for notif in notifications:
        print(f"   - {notif.type}: {notif.titre} - {notif.message[:50]}...")
    
    print("\n" + "=" * 60)
    print("✅ TEST TERMINÉ")
    print("=" * 60)

if __name__ == "__main__":
    test_flux_complet()