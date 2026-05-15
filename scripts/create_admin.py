# scripts/create_admin.py
import os
import sys
import django

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import User

def create_admin():
    email = 'admin@example.com'
    password = 'Admin@2024#Securite!'
    
    admin, created = User.objects.get_or_create(
        email=email,
        defaults={
            'username': 'admin',
            'first_name': 'Admin',
            'last_name': 'System',
            'is_superuser': True,
            'is_staff': True,
            'is_active': True
        }
    )
    
    if not created:
        admin.is_superuser = True
        admin.is_staff = True
        admin.is_active = True
    
    admin.set_password(password)
    admin.save()
    
    print(f"{'Créé' if created else 'Mis à jour'} : {admin.email}")
    print(f"is_superuser: {admin.is_superuser}")
    print(f"Mot de passe: {password}")

if __name__ == '__main__':
    create_admin()