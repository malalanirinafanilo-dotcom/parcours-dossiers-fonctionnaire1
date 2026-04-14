# reset_admin.py
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import User, Role

def reset_admin():
    print("=== RÉINITIALISATION ADMIN ===")
    
    # Créer le rôle ADMIN si nécessaire
    role_admin, created = Role.objects.get_or_create(
        code='ADMIN',
        defaults={
            'name': 'ADMIN',
            'description': 'Administrateur système'
        }
    )
    if created:
        print("✓ Rôle ADMIN créé")
    
    # Chercher l'utilisateur
    email = 'admin@example.com'
    password = 'admin123'
    
    try:
        user = User.objects.get(email=email)
        print(f"✓ Utilisateur trouvé: {email}")
        
        # Mettre à jour le mot de passe
        user.set_password(password)
        user.role = role_admin
        user.is_active = True
        user.is_staff = True
        user.is_superuser = True
        user.save()
        print(f"✓ Mot de passe réinitialisé à: {password}")
        
    except User.DoesNotExist:
        print(f"✗ Utilisateur {email} non trouvé, création...")
        
        user = User.objects.create_superuser(
            email=email,
            username='admin',
            password=password,
            role=role_admin
        )
        print(f"✓ Utilisateur créé avec: {email} / {password}")
    
    # Vérification finale
    print("\n=== VÉRIFICATION ===")
    print(f"Email: {user.email}")
    print(f"Username: {user.username}")
    print(f"Role: {user.role}")
    print(f"is_active: {user.is_active}")
    print(f"is_staff: {user.is_staff}")
    print(f"is_superuser: {user.is_superuser}")
    
    # Tester l'authentification
    from django.contrib.auth import authenticate
    test_user = authenticate(email=email, password=password)
    if test_user:
        print("✓ Authentification API fonctionnelle")
    else:
        print("✗ Problème d'authentification")
    
    return user

if __name__ == "__main__":
    reset_admin()