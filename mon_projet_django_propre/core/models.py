# core/models.py - VERSION CORRIGÉE AVEC TOUS LES MODÈLES
from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid
from django.utils import timezone


class User(AbstractUser):
    """Modèle utilisateur personnalisé"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, blank=True)
    
    # Statut utilisateur
    is_superuser = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_blocked = models.BooleanField(default=False)
    
    # Informations de blocage
    blocked_at = models.DateTimeField(null=True, blank=True)
    blocked_by = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True)
    
    # Connexion
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    
    # Dates
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Relations
    role = models.ForeignKey('Role', on_delete=models.PROTECT, null=True, blank=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    class Meta:
        db_table = 'core_users'
    
    def __str__(self):
        return self.email
    
    @property
    def is_admin(self):
        return self.is_superuser
    
    def block(self, blocked_by_user, reason=None):
        self.is_blocked = True
        self.is_active = False
        self.blocked_at = timezone.now()
        self.blocked_by = blocked_by_user
        self.save()
    
    def unblock(self):
        self.is_blocked = False
        self.is_active = True
        self.blocked_at = None
        self.blocked_by = None
        self.save()


class Role(models.Model):
    """Rôles utilisateur"""
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    
    class Meta:
        db_table = 'core_roles'
    
    def __str__(self):
        return self.name


class Notification(models.Model):
    """Notifications aux utilisateurs"""
    NOTIFICATION_TYPES = [
        ('INFO', 'Information'),
        ('SUCCESS', 'Succès'),
        ('WARNING', 'Avertissement'),
        ('ERROR', 'Erreur'),
        ('ADMIN', 'Message admin'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default='INFO')
    titre = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    lu = models.BooleanField(default=False)  # Alias
    action_requise = models.BooleanField(default=False)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='sent_notifications')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'core_notifications'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.titre} - {self.user.email}"


class AdminActionLog(models.Model):
    """Journal des actions des administrateurs"""
    ACTION_TYPES = [
        ('CREATE', 'Création'),
        ('UPDATE', 'Modification'),
        ('DELETE', 'Suppression'),
        ('BLOCK', 'Blocage'),
        ('UNBLOCK', 'Déblocage'),
        ('LOGIN', 'Connexion'),
        ('LOGOUT', 'Déconnexion'),
        ('SETTINGS', 'Modification paramètres'),
        ('ROLE_CHANGE', 'Changement rôle'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    admin = models.ForeignKey(User, on_delete=models.CASCADE, related_name='admin_actions')
    action_type = models.CharField(max_length=50, choices=ACTION_TYPES)
    target_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='targeted_actions')
    description = models.TextField()
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True)
    metadata = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'core_admin_logs'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.admin.email} - {self.action_type} - {self.created_at}"


class SystemSetting(models.Model):
    """Paramètres système"""
    key = models.CharField(max_length=100, unique=True)
    value = models.TextField()
    description = models.TextField(blank=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'core_system_settings'
    
    def __str__(self):
        return f"{self.key} = {self.value[:50]}"