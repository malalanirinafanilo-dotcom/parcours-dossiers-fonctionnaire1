# api/urls.py - VERSION CORRIGÉE
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import *

# Création du routeur principal
router = DefaultRouter()

# Enregistrement des ViewSets
router.register(r'users', UserViewSet, basename='user')
router.register(r'roles', RoleViewSet, basename='role')
router.register(r'fonctionnaires', FonctionnaireViewSet, basename='fonctionnaire')
router.register(r'workflows', WorkflowViewSet, basename='workflow')
router.register(r'dossiers', DossierViewSet, basename='dossier')
router.register(r'documents', DocumentViewSet, basename='document')
router.register(r'historique', HistoriqueViewSet, basename='historique')
router.register(r'ia-analyses', IAAnalyseViewSet, basename='ia-analyse')
router.register(r'notifications', NotificationViewSet, basename='notification')

# URLs de l'API
urlpatterns = [
    # Inclusion de toutes les URLs générées par le router
    path('', include(router.urls)),
    
    # URLs d'authentification JWT
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # URL de débogage média
    path('debug/media/', debug_media, name='debug_media'),
]