# Script PowerShell pour configuration de la base de données
Write-Host "Configuration de la base de données..." -ForegroundColor Blue

# Créer les migrations
Write-Host "Création des migrations..." -ForegroundColor Green
python manage.py makemigrations authentication
python manage.py makemigrations dossiers
python manage.py makemigrations workflow
python manage.py makemigrations predictions
python manage.py makemigrations notifications

# Appliquer les migrations
Write-Host "Application des migrations..." -ForegroundColor Green
python manage.py migrate

# Créer un super utilisateur
Write-Host "Création du super utilisateur..." -ForegroundColor Green
python manage.py shell -c "
from apps.authentication.models import User, Role
admin_role, _ = Role.objects.get_or_create(nom='ADMIN')
if not User.objects.filter(email='admin@education.gouv.fr').exists():
    User.objects.create_superuser(
        email='admin@education.gouv.fr',
        username='admin',
        password='Admin123!',
        role=admin_role
    )
    print('Super utilisateur créé avec succès')
else:
    print('Super utilisateur existe déjà')
"

Write-Host "Configuration terminée !" -ForegroundColor Blue