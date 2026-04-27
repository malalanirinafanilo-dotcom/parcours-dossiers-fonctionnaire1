# bootstrap.py
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

print("🚀 Création du compte admin...")

# Supprimer l'admin s'il existe pour éviter les doublons
User.objects.filter(username='admin').delete()

# Créer un nouvel admin
admin = User.objects.create_user(
    username='admin',
    email='admin@example.com',
    password='admin123',
    first_name='Admin',
    last_name='System'
)
admin.is_staff = True
admin.is_superuser = True
admin.save()

print("✅ Admin créé avec succès !")
print("   Nom d'utilisateur: admin")
print("   Mot de passe: admin123")