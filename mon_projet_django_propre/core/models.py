# core/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid

class Role(models.Model):
    ROLE_CHOICES = [
        ('ADMIN', 'Administrateur'),
        ('DREN', 'Directeur Régional'),
        ('MEN', 'Ministère Éducation'),
        ('FOP', 'Formation Professionnelle'),
        ('FINANCE', 'Finance'),
        ('UTILISATEUR', 'Utilisateur'),
    ]
    
    name = models.CharField(max_length=50, choices=ROLE_CHOICES, unique=True)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True)
    
    class Meta:
        db_table = 'core_roles'
    
    def __str__(self):
        return self.get_name_display()

class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    role = models.ForeignKey(Role, on_delete=models.PROTECT, null=True, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    class Meta:
        db_table = 'core_users'
    
    def __str__(self):
        return self.email

class Notification(models.Model):
    """
    Modèle pour les notifications
    """
    NOTIFICATION_TYPES = [
        ('INFO', 'Information'),
        ('SUCCESS', 'Succès'),
        ('WARNING', 'Avertissement'),
        ('ERROR', 'Erreur'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    dossier = models.ForeignKey('dossiers.Dossier', on_delete=models.CASCADE, null=True, blank=True)
    type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default='INFO')
    titre = models.CharField(max_length=200)
    message = models.TextField()
    action_requise = models.BooleanField(default=False)
    lu = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'core_notifications'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.titre} - {self.user.email}"