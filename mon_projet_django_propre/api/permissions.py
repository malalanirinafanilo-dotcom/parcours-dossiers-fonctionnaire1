# api/permissions.py
from rest_framework import permissions


class IsSuperUser(permissions.BasePermission):
    """Permission pour les super utilisateurs uniquement"""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_superuser
    
    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)


class IsOwnerOrSuperUser(permissions.BasePermission):
    """Permet à l'utilisateur de modifier ses données, ou au superuser"""
    
    def has_object_permission(self, request, view, obj):
        if request.user and request.user.is_superuser:
            return True
        return obj == request.user


class IsAdminUser(permissions.BasePermission):
    """
    Permission pour les administrateurs.
    Vérifie si l'utilisateur est superuser ou a le rôle ADMIN.
    """
    
    def has_permission(self, request, view):
        # Vérifier que l'utilisateur est authentifié
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Vérifier si c'est un superuser
        if request.user.is_superuser:
            return True
        
        # Vérifier si le rôle est ADMIN
        if hasattr(request.user, 'role') and request.user.role:
            return request.user.role.code == 'ADMIN'
        
        return False


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Lecture seule pour tous, mais seuls les admins peuvent modifier.
    """
    
    def has_permission(self, request, view):
        # Les requêtes GET sont autorisées pour tous les utilisateurs authentifiés
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        
        # Les méthodes POST, PUT, DELETE sont réservées aux admins
        return request.user and request.user.is_authenticated and (
            request.user.is_superuser or 
            (hasattr(request.user, 'role') and request.user.role and request.user.role.code == 'ADMIN')
        )


class IsAdminOrOwner(permissions.BasePermission):
    """
    Seul le propriétaire ou l'admin peut accéder/modifier.
    """
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # L'admin a tous les droits
        if request.user.is_superuser or (
            hasattr(request.user, 'role') and request.user.role and request.user.role.code == 'ADMIN'
        ):
            return True
        
        # Sinon, seul le propriétaire (créateur) peut accéder
        if hasattr(obj, 'created_by'):
            return obj.created_by == request.user
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        return False


class IsDrenOrMenOrFopOrFinance(permissions.BasePermission):
    """
    Permission pour les rôles spécifiques du workflow.
    """
    
    ALLOWED_ROLES = ['DREN', 'MEN', 'FOP', 'FINANCE']
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Superuser a tous les droits
        if request.user.is_superuser:
            return True
        
        # Vérifier le rôle
        if hasattr(request.user, 'role') and request.user.role:
            return request.user.role.code in self.ALLOWED_ROLES
        
        return False


class IsInteresse(permissions.BasePermission):
    """
    Permission pour l'utilisateur intéressé.
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Superuser a tous les droits
        if request.user.is_superuser:
            return True
        
        # Vérifier le rôle
        if hasattr(request.user, 'role') and request.user.role:
            return request.user.role.code == 'UTILISATEUR'
        
        return False


class CanValidateDossier(permissions.BasePermission):
    """
    Vérifie si l'utilisateur peut valider l'étape actuelle du dossier.
    """
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Superuser peut tout valider
        if request.user.is_superuser:
            return True
        
        # Vérifier le rôle
        if not hasattr(request.user, 'role') or not request.user.role:
            return False
        
        role_code = request.user.role.code
        
        # Mapping rôle -> étape
        role_to_etape = {
            'DREN': 'DREN',
            'MEN': 'MEN',
            'FOP': 'FOP',
            'FINANCE': 'FINANCE',
        }
        
        etape_requise = role_to_etape.get(role_code)
        
        if etape_requise:
            return obj.etape_actuelle == etape_requise and obj.statut == f'EN_ATTENTE_{etape_requise}'
        
        return False