# api/urls.py - VERSION COMPLÈTE ET CORRIGÉE
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    # Vues existantes
    UserViewSet, RoleViewSet, FonctionnaireViewSet, WorkflowViewSet,
    DossierViewSet, DocumentViewSet, HistoriqueViewSet, IAAnalyseViewSet,
    NotificationViewSet, CustomTokenObtainPairView, debug_media,
    create_admin_endpoint, create_all_users,
    # Profil utilisateur
    UserProfileViewSet,
    # Vues admin
    AdminUserViewSet, AdminDashboardViewSet, AdminLogViewSet, AdminSettingViewSet
)

# ==================== ROUTER PRINCIPAL ====================
router = DefaultRouter()

# ==================== ROUTES EXISTANTES ====================
router.register(r'users', UserViewSet, basename='user')
router.register(r'roles', RoleViewSet, basename='role')
router.register(r'fonctionnaires', FonctionnaireViewSet, basename='fonctionnaire')
router.register(r'workflows', WorkflowViewSet, basename='workflow')
router.register(r'dossiers', DossierViewSet, basename='dossier')
router.register(r'documents', DocumentViewSet, basename='document')
router.register(r'historique', HistoriqueViewSet, basename='historique')
router.register(r'ia-analyses', IAAnalyseViewSet, basename='ia-analyse')
router.register(r'notifications', NotificationViewSet, basename='notification')

# ==================== PROFIL UTILISATEUR ====================
router.register(r'profile', UserProfileViewSet, basename='profile')

# ==================== ROUTES ADMIN (SUPERUSER) ====================
router.register(r'admin/users', AdminUserViewSet, basename='admin-users')
router.register(r'admin/dashboard', AdminDashboardViewSet, basename='admin-dashboard')
router.register(r'admin/logs', AdminLogViewSet, basename='admin-logs')
router.register(r'admin/settings', AdminSettingViewSet, basename='admin-settings')

# ==================== URLS ====================
urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('debug/media/', debug_media, name='debug_media'),
    path('create-admin/', create_admin_endpoint, name='create-admin'),
    path('create-all-users/', create_all_users, name='create-all-users'),
]