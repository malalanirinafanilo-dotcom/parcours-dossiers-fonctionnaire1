# check_roles.py
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import User
from dossiers.models import Dossier

print("=" * 60)
print("VÉRIFICATION DES RÔLES ET DOSSIERS")
print("=" * 60)

# 1. Lister tous les utilisateurs avec leurs rôles
print("\n1. UTILISATEURS ET RÔLES:")
for user in User.objects.all():
    role_code = user.role.code if user.role else "Pas de rôle"
    print(f"   - {user.email}: {role_code}")

# 2. Vérifier un dossier spécifique (exemple avec un ID)
print("\n2. VÉRIFICATION D'UN DOSSIER:")
dossier = Dossier.objects.first()
if dossier:
    print(f"   Dossier: {dossier.numero_dossier}")
    print(f"   Titre: {dossier.titre}")
    print(f"   Statut: {dossier.statut}")
    print(f"   Étape actuelle: {dossier.etape_actuelle}")
    print(f"   Créé par: {dossier.created_by.email if dossier.created_by else 'Inconnu'}")
    
    # Vérifier les validations possibles
    print("\n3. QUI PEUT VALIDER CE DOSSIER?")
    roles_etapes = {
        'DREN': 'DREN',
        'MEN': 'MEN',
        'FOP': 'FOP',
        'FINANCE': 'FINANCE'
    }
    
    for role, etape in roles_etapes.items():
        if dossier.etape_actuelle == etape:
            print(f"   ✅ {role} peut valider (étape = {etape})")
        else:
            print(f"   ❌ {role} ne peut pas valider (étape = {dossier.etape_actuelle}, attendu = {etape})")
else:
    print("   Aucun dossier trouvé")

print("\n" + "=" * 60)