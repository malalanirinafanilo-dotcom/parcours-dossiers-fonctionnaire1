# api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import *

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'roles', RoleViewSet, basename='role')
router.register(r'fonctionnaires', FonctionnaireViewSet, basename='fonctionnaire')
router.register(r'workflows', WorkflowViewSet, basename='workflow')
router.register(r'dossiers', DossierViewSet, basename='dossier')
router.register(r'documents', DocumentViewSet, basename='document')
router.register(r'historique', HistoriqueViewSet, basename='historique')
router.register(r'ia-analyses', IAAnalyseViewSet, basename='ia-analyse')
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('debug/media/', debug_media, name='debug_media'),
    path('create-admin/', create_admin_endpoint, name='create-admin'),
    path('create-all-users/', create_all_users, name='create-all-users'),
]