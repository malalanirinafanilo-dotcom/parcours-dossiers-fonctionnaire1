from core.models import User

# Créer un admin avec un email différent
admin2, created = User.objects.get_or_create(
    email='superadmin@example.com',
    defaults={
        'username': 'superadmin',
        'first_name': 'Super',
        'last_name': 'Admin',
        'is_superuser': True,
        'is_staff': True,
        'is_active': True
    }
)
admin2.set_password('admin123#')
admin2.save()
print(f"Admin cree: {admin2.email}")
print(f"Mot de passe: Admin@2024#Securite!")