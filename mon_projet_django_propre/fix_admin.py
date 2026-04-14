# fix_admin.py
import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import User
from django.contrib.auth import authenticate

def fix_admin():
    print("=" * 50)
    print("🔧 CORRECTION DU MOT DE PASSE ADMIN")
    print("=" * 50)
    
    try:
        admin = User.objects.get(email='admin@example.com')
        print(f"✓ Admin trouvé: {admin.email}")
        
        # Réinitialiser le mot de passe
        admin.set_password('admin123')
        admin.is_active = True
        admin.is_staff = True
        admin.is_superuser = True
        admin.save()
        print("✓ Mot de passe réinitialisé à 'admin123'")
        
        # Tester
        test = authenticate(email='admin@example.com', password='admin123')
        if test:
            print("✓ Authentification admin fonctionnelle")
        else:
            print("✗ Problème d'authentification persiste")
            
    except User.DoesNotExist:
        print("✗ Admin non trouvé, création...")
        from core.models import Role
        role_admin, _ = Role.objects.get_or_create(code='ADMIN', defaults={'name': 'ADMIN'})
        
        admin = User.objects.create_superuser(
            email='admin@example.com',
            username='admin',
            password='admin123',
            role=role_admin
        )
        print("✓ Admin créé avec succès")
    
    # Liste tous les utilisateurs avec leurs rôles
    print("\n📋 Utilisateurs disponibles:")
    for user in User.objects.all():
        print(f"  - {user.email}: rôle={user.role.code if user.role else 'Aucun'}, actif={user.is_active}")

if __name__ == "__main__":
    fix_admin()