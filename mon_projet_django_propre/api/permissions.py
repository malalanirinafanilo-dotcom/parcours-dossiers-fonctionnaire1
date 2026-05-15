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