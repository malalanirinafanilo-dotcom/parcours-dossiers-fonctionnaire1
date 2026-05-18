# api/views.py - VERSION COMPLÈTE CORRIGÉE
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.permissions import AllowAny
from django.db.models import Q
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.http import JsonResponse
from django.conf import settings
from core.models import User, Role, Notification, AdminActionLog, SystemSetting
from dossiers.models import Fonctionnaire, Dossier, Document, HistoriqueAction, IAAnalyse
from workflow.models import Workflow
from .serializers import (
    UserSerializer, RoleSerializer, LoginSerializer,
    FonctionnaireSerializer, WorkflowSerializer, DossierSerializer,
    DossierDetailSerializer, DocumentSerializer,
    HistoriqueActionSerializer, IAAnalyseSerializer,
    ValidationActionSerializer, RejetActionSerializer,
    NotificationSerializer,
    UserCreateUpdateSerializer, AdminActionLogSerializer, SystemSettingSerializer
)
from .permissions import IsSuperUser, IsAdminUser
import logging
import traceback
import uuid
import os

logger = logging.getLogger(__name__)


# ==================== VUE DE DÉBOGAGE ====================

@api_view(['GET'])
@permission_classes([AllowAny])
def debug_media(request):
    """Vue de débogage pour vérifier la configuration des médias"""
    media_root = settings.MEDIA_ROOT
    media_url = settings.MEDIA_URL
    
    fichiers = []
    if os.path.exists(media_root):
        for root, dirs, files in os.walk(media_root):
            for file in files:
                rel_path = os.path.relpath(os.path.join(root, file), media_root)
                fichiers.append({
                    'nom': file,
                    'chemin': rel_path,
                    'url': f"{media_url}{rel_path.replace(os.sep, '/')}",
                    'taille': os.path.getsize(os.path.join(root, file))
                })
    
    return JsonResponse({
        'media_root': str(media_root),
        'media_url': media_url,
        'fichiers': fichiers,
        'debug': settings.DEBUG
    })


# ==================== AUTHENTIFICATION ====================

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        
        user_role = None
        if hasattr(self.user, 'role') and self.user.role:
            user_role = {
                'id': self.user.role.id,
                'code': self.user.role.code,
                'name': self.user.role.name
            }
        
        data['user'] = {
            'id': str(self.user.id),
            'email': self.user.email,
            'username': self.user.username,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'is_superuser': self.user.is_superuser,
            'is_active': self.user.is_active,
            'is_blocked': getattr(self.user, 'is_blocked', False),
            'role': user_role,
            'phone_number': getattr(self.user, 'phone_number', ''),
            'created_at': self.user.date_joined.isoformat() if hasattr(self.user, 'date_joined') else None,
        }
        
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


# ==================== VIEWSETS PRINCIPAUX ====================

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    def get_permissions(self):
        if self.action == 'create':
            return [permissions.IsAdminUser()]
        return super().get_permissions()


class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [permissions.IsAuthenticated]


class FonctionnaireViewSet(viewsets.ModelViewSet):
    queryset = Fonctionnaire.objects.all()
    serializer_class = FonctionnaireSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(nom__icontains=search) |
                Q(prenom__icontains=search) |
                Q(matricule__icontains=search)
            )
        return queryset


class WorkflowViewSet(viewsets.ModelViewSet):
    queryset = Workflow.objects.all()
    serializer_class = WorkflowSerializer
    permission_classes = [permissions.IsAuthenticated]


# ==================== DOSSIER VIEWSET AVEC FILTRAGE PAR RÔLE ====================

class DossierViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les dossiers avec filtrage automatique selon le rôle
    """
    queryset = Dossier.objects.all().select_related(
        'fonctionnaire', 'workflow', 'assigne_a', 'created_by'
    ).prefetch_related(
        'documents', 'historique', 'analyses_ia'
    )
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return DossierDetailSerializer
        return DossierSerializer
    
    def get_queryset(self):
        """
        FILTRAGE CRITIQUE : Filtre les dossiers selon le rôle de l'utilisateur
        Utilise la méthode peut_voir du modèle Dossier
        """
        user = self.request.user
        queryset = super().get_queryset()
        
        if not user or not user.is_authenticated:
            return queryset.none()
        
        # Superuser voit TOUS les dossiers
        if user.is_superuser:
            print(f"👑 SUPERUSER {user.email} - voit tous les dossiers")
            return queryset
        
        # Filtrage selon le rôle avec la méthode peut_voir
        role_code = user.role.code if user.role else 'UTILISATEUR'
        print(f"🔍 FILTRAGE pour {user.email} (rôle: {role_code})")
        
        # Utiliser la méthode peut_voir pour chaque dossier
        filtered_ids = []
        for dossier in queryset:
            if dossier.peut_voir(user):
                filtered_ids.append(dossier.id)
        
        result = queryset.filter(id__in=filtered_ids)
        
        # Log du résultat
        print(f"   📊 Résultat: {result.count()} dossiers sur {queryset.count()} total")
        print(f"   📊 Détail: Terminés={result.filter(statut='TERMINE').count()}, "
              f"À traiter={result.filter(etape_actuelle=role_code if role_code in ['DREN','MEN','FOP','FINANCE'] else '').count()}")
        
        return result
    
    def perform_create(self, serializer):
        numero = f"DOS-{timezone.now().strftime('%Y%m')}-{str(uuid.uuid4())[:8].upper()}"
        dossier = serializer.save(
            created_by=self.request.user,
            numero_dossier=numero,
            statut='BROUILLON',
            etape_actuelle='INTERESSE'
        )
        HistoriqueAction.objects.create(
            dossier=dossier,
            user=self.request.user,
            action='CREATION',
            etape='INTERESSE',
            commentaire='Dossier créé'
        )
    
    @action(detail=True, methods=['post'])
    def envoyer(self, request, pk=None):
        dossier = self.get_object()
        try:
            dossier.envoyer_a_dren(request.user)
            serializer = self.get_serializer(dossier)
            return Response({
                'message': 'Dossier envoyé avec succès à la DREN',
                'dossier': serializer.data
            })
        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Erreur: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def valider(self, request, pk=None):
        dossier = self.get_object()
        try:
            dossier.valider_etape(
                user=request.user,
                commentaire=request.data.get('commentaire', '')
            )
            dossier.refresh_from_db()
            serializer = self.get_serializer(dossier)
            return Response({
                'message': 'Étape validée avec succès',
                'dossier': serializer.data
            })
        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Erreur: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def rejeter(self, request, pk=None):
        dossier = self.get_object()
        serializer = RejetActionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        try:
            dossier.rejeter(
                user=request.user,
                motif=serializer.validated_data['motif']
            )
            dossier.refresh_from_db()
            return Response({
                'success': True,
                'message': 'Dossier rejeté avec succès',
                'statut': dossier.statut,
                'etape_actuelle': dossier.etape_actuelle,
                'motif_rejet': dossier.motif_rejet
            })
        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Erreur: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['get'])
    def workflow(self, request, pk=None):
        dossier = self.get_object()
        ordre_etapes = ['INTERESSE', 'DREN', 'MEN', 'FOP', 'FINANCE']
        etapes_dict = dict(Dossier.ETAPES_WORKFLOW)
        
        data = {
            'numero_dossier': dossier.numero_dossier,
            'titre': dossier.titre,
            'statut': dossier.statut,
            'etape_actuelle': dossier.etape_actuelle,
            'etapes': []
        }
        
        for etape in ordre_etapes:
            etape_data = {
                'code': etape,
                'nom': etapes_dict.get(etape, etape),
                'est_terminee': etape in dossier.etapes_validation,
                'est_actuelle': etape == dossier.etape_actuelle,
                'validation': dossier.etapes_validation.get(etape, None)
            }
            data['etapes'].append(etape_data)
        
        return Response(data)
    
    @action(detail=True, methods=['post'])
    def assigner(self, request, pk=None):
        dossier = self.get_object()
        user_id = request.data.get('user_id')
        try:
            user = User.objects.get(id=user_id)
            dossier.assigne_a = user
            dossier.save()
            HistoriqueAction.objects.create(
                dossier=dossier,
                user=request.user,
                action='TRANSFERT',
                etape=dossier.etape_actuelle,
                metadata={'assigne_a': user.email}
            )
            return Response({'message': f'Dossier assigné à {user.email}'})
        except User.DoesNotExist:
            return Response({'error': 'Utilisateur non trouvé'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'])
    def analyser_ia(self, request, pk=None):
        dossier = self.get_object()
        
        try:
            from dossiers.ia_service import analyse_dossier
            resultat = analyse_dossier(str(dossier.id))
            
            if resultat['success']:
                analyse = dossier.analyses_ia.filter(type_analyse='RULE_BASED').first()
                serializer = IAAnalyseSerializer(analyse, context={'request': request})
                
                return Response({
                    'success': True,
                    'message': 'Analyse IA effectuée avec succès',
                    'analyse': serializer.data
                })
            else:
                return Response({
                    'success': False,
                    'error': resultat['error']
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Erreur analyse IA: {e}")
            traceback.print_exc()
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        dossier_id = self.request.query_params.get('dossier')
        if dossier_id:
            queryset = queryset.filter(dossier_id=dossier_id)
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(upload_by=self.request.user)


class HistoriqueViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = HistoriqueAction.objects.all()
    serializer_class = HistoriqueActionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        dossier_id = self.request.query_params.get('dossier')
        if dossier_id:
            queryset = queryset.filter(dossier_id=dossier_id)
        return queryset


class IAAnalyseViewSet(viewsets.ModelViewSet):
    queryset = IAAnalyse.objects.all()
    serializer_class = IAAnalyseSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        dossier_id = self.request.query_params.get('dossier')
        if dossier_id:
            queryset = queryset.filter(dossier_id=dossier_id)
        return queryset
    
    @action(detail=False, methods=['post'])
    def analyser_dossier(self, request):
        dossier_id = request.data.get('dossier_id')
        if not dossier_id:
            return Response({'error': 'dossier_id requis'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            from dossiers.ia_service import analyse_dossier
            resultat = analyse_dossier(dossier_id)
            if resultat['success']:
                return Response(resultat['resultats'])
            else:
                return Response({'error': resultat['error']}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Erreur analyse IA: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')
    
    @action(detail=True, methods=['post'])
    def marquer_lue(self, request, pk=None):
        notification = self.get_object()
        notification.lu = True
        notification.save()
        return Response({'status': 'notification marquée comme lue'})
    
    @action(detail=False, methods=['post'])
    def marquer_toutes_lues(self, request):
        Notification.objects.filter(user=request.user, lu=False).update(lu=True)
        return Response({'status': 'toutes les notifications marquées comme lues'})
    
    @action(detail=False, methods=['get'])
    def non_lues(self, request):
        notifications = Notification.objects.filter(user=request.user, lu=False)
        serializer = self.get_serializer(notifications, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def compte_non_lues(self, request):
        count = Notification.objects.filter(user=request.user, lu=False).count()
        return Response({'count': count})


# ==================== PROFIL UTILISATEUR ====================

class UserProfileViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return User.objects.filter(id=self.request.user.id)
    
    @action(detail=False, methods=['get', 'patch'])
    def me(self, request):
        user = request.user
        if request.method == 'GET':
            serializer = self.get_serializer(user)
            return Response(serializer.data)
        else:
            serializer = UserSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ==================== VUES ADMIN (SUPERUSER) ====================

class AdminUserViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, IsSuperUser]
    queryset = User.objects.all().order_by('-created_at')
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return UserCreateUpdateSerializer
        return UserSerializer
    
    @action(detail=True, methods=['post'])
    def block(self, request, pk=None):
        user = self.get_object()
        
        if user.is_superuser:
            return Response({'error': 'Impossible de bloquer un superutilisateur'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        user.is_blocked = True
        user.is_active = False
        user.blocked_at = timezone.now()
        user.blocked_by = request.user
        user.save()
        
        AdminActionLog.objects.create(
            admin=request.user,
            action_type='BLOCK',
            target_user=user,
            description=f"Utilisateur {user.email} bloqué",
            ip_address=self.get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            metadata={'reason': request.data.get('reason', '')}
        )
        
        return Response({'message': f'Utilisateur {user.email} bloqué avec succès'})
    
    @action(detail=True, methods=['post'])
    def unblock(self, request, pk=None):
        user = self.get_object()
        user.is_blocked = False
        user.is_active = True
        user.blocked_at = None
        user.blocked_by = None
        user.save()
        
        AdminActionLog.objects.create(
            admin=request.user,
            action_type='UNBLOCK',
            target_user=user,
            description=f"Utilisateur {user.email} débloqué",
            ip_address=self.get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        return Response({'message': f'Utilisateur {user.email} débloqué avec succès'})
    
    @action(detail=True, methods=['post'])
    def toggle_superuser(self, request, pk=None):
        user = self.get_object()
        
        if user == request.user:
            return Response({'error': 'Vous ne pouvez pas modifier votre propre statut'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        user.is_superuser = not user.is_superuser
        user.save()
        
        status_text = "superutilisateur" if user.is_superuser else "utilisateur normal"
        
        AdminActionLog.objects.create(
            admin=request.user,
            action_type='UPDATE',
            target_user=user,
            description=f"Statut de {user.email} changé en {status_text}",
            ip_address=self.get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        return Response({'message': f"{user.email} est maintenant {status_text}"})
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        total_users = User.objects.count()
        superusers = User.objects.filter(is_superuser=True).count()
        blocked_users = User.objects.filter(is_blocked=True).count()
        active_users = User.objects.filter(is_active=True, is_blocked=False).count()
        new_users_today = User.objects.filter(created_at__date=timezone.now().date()).count()
        active_sessions_24h = User.objects.filter(last_login__gte=timezone.now() - timezone.timedelta(hours=24)).count()
        admin_actions_today = AdminActionLog.objects.filter(created_at__date=timezone.now().date()).count()
        
        return Response({
            'total_users': total_users,
            'superusers': superusers,
            'blocked_users': blocked_users,
            'active_users': active_users,
            'new_users_today': new_users_today,
            'active_sessions_24h': active_sessions_24h,
            'admin_actions_today': admin_actions_today,
        })
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class AdminDashboardViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated, IsSuperUser]
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        now = timezone.now()
        today = now.date()
        
        return Response({
            'total_users': User.objects.count(),
            'new_users_today': User.objects.filter(created_at__date=today).count(),
            'active_sessions_24h': User.objects.filter(last_login__gte=now - timezone.timedelta(hours=24)).count(),
            'admin_actions_today': AdminActionLog.objects.filter(created_at__date=today).count(),
        })
    
    @action(detail=False, methods=['get'])
    def recent_activity(self, request):
        recent_logs = AdminActionLog.objects.all().select_related('admin', 'target_user')[:20]
        recent_users = User.objects.all().order_by('-created_at')[:10]
        
        logs_serializer = AdminActionLogSerializer(recent_logs, many=True)
        users_serializer = UserSerializer(recent_users, many=True)
        
        return Response({
            'recent_logs': logs_serializer.data,
            'recent_users': users_serializer.data,
        })


class AdminLogViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.IsAuthenticated, IsSuperUser]
    queryset = AdminActionLog.objects.all().select_related('admin', 'target_user')
    serializer_class = AdminActionLogSerializer
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        logs = self.get_queryset()[:50]
        serializer = self.get_serializer(logs, many=True)
        return Response(serializer.data)


class AdminSettingViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, IsSuperUser]
    queryset = SystemSetting.objects.all()
    serializer_class = SystemSettingSerializer
    
    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(updated_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def get_by_key(self, request):
        key = request.query_params.get('key')
        try:
            setting = SystemSetting.objects.get(key=key)
            return Response({'value': setting.value})
        except SystemSetting.DoesNotExist:
            return Response({'value': None})


class ParametresViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des paramètres système. Accessible UNIQUEMENT aux administrateurs."""
    queryset = SystemSetting.objects.all()
    serializer_class = SystemSettingSerializer
    permission_classes = [IsAdminUser]
    
    @action(detail=False, methods=['get'])
    def public(self, request):
        public_keys = ['app_name', 'language', 'timezone']
        settings = SystemSetting.objects.filter(key__in=public_keys)
        serializer = self.get_serializer(settings, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        total = SystemSetting.objects.count()
        return Response({
            'total_settings': total,
            'categories': {
                'email': SystemSetting.objects.filter(key__startswith='email_').count(),
                'security': SystemSetting.objects.filter(key__startswith='security_').count(),
                'app': SystemSetting.objects.filter(key__startswith='app_').count(),
            }
        })


# ==================== ENDPOINTS POUR CRÉER LES COMPTES ====================

@api_view(['GET'])
@permission_classes([AllowAny])
def create_admin_endpoint(request):
    """Endpoint pour créer le compte administrateur et tous les utilisateurs de démonstration"""
    from django.contrib.auth import get_user_model
    from core.models import Role
    User = get_user_model()

    # 1. Création des rôles
    roles_data = [
        ('ADMIN', 'Administrateur'),
        ('DREN', 'Direction Régionale'),
        ('MEN', 'Ministère'),
        ('FOP', 'Formation Pro'),
        ('FINANCE', 'Finance'),
        ('UTILISATEUR', 'Utilisateur'),
    ]
    for code, name in roles_data:
        Role.objects.get_or_create(code=code, defaults={'name': name})

    # 2. Création de tous les utilisateurs
    users_to_create = [
        ('admin', 'admin@example.com', 'admin123', 'ADMIN', True, True, 'Admin', 'System'),
        ('interesse', 'interesse@example.com', 'password123', 'UTILISATEUR', False, False, 'Jean', 'Rakoto'),
        ('dren', 'dren@example.com', 'password123', 'DREN', False, False, 'Marie', 'Rasoa'),
        ('men', 'men@example.com', 'password123', 'MEN', False, False, 'Paul', 'Rabe'),
        ('fop', 'fop@example.com', 'password123', 'FOP', False, False, 'Faly', 'Randria'),
        ('finance', 'finance@example.com', 'password123', 'FINANCE', False, False, 'Niry', 'Ranaivo'),
    ]

    created_users = []
    for username, email, pwd, role_code, is_staff, is_superuser, first_name, last_name in users_to_create:
        try:
            User.objects.filter(username=username).delete()
            user = User.objects.create_user(
                username=username,
                email=email,
                password=pwd,
                first_name=first_name,
                last_name=last_name
            )
            user.role = Role.objects.get(code=role_code)
            user.is_staff = is_staff
            user.is_superuser = is_superuser
            user.save()
            created_users.append(f"{username} ({role_code})")
        except Exception as e:
            return Response({'error': f"Erreur lors de la création de {username}: {str(e)}"}, status=500)

    return Response({
        'status': 'success',
        'message': f'Comptes créés avec succès : {", ".join(created_users)}',
        'credentials': {
            'Admin': {'username': 'admin', 'password': 'admin123'},
            'Intéressé': {'username': 'interesse', 'password': 'password123'},
            'DREN': {'username': 'dren', 'password': 'password123'},
            'MEN': {'username': 'men', 'password': 'password123'},
            'FOP': {'username': 'fop', 'password': 'password123'},
            'Finance': {'username': 'finance', 'password': 'password123'},
        }
    })


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def create_all_users(request):
    """Endpoint pour créer tous les utilisateurs de démonstration"""
    from django.contrib.auth import get_user_model
    from core.models import Role
    
    User = get_user_model()
    
    # Créer les rôles
    roles_data = [
        ('ADMIN', 'Administrateur'),
        ('DREN', 'Direction Régionale'),
        ('MEN', 'Ministère'),
        ('FOP', 'Formation Pro'),
        ('FINANCE', 'Finance'),
        ('UTILISATEUR', 'Utilisateur'),
    ]
    
    for code, name in roles_data:
        Role.objects.get_or_create(code=code, defaults={'name': name})
    
    # Créer les utilisateurs
    users_data = [
        ('admin', 'admin@example.com', 'admin123', 'ADMIN', True, True, 'Admin', 'System'),
        ('interesse', 'interesse@example.com', 'password123', 'UTILISATEUR', False, False, 'Jean', 'Rakoto'),
        ('dren', 'dren@example.com', 'password123', 'DREN', False, False, 'Marie', 'Rasoa'),
        ('men', 'men@example.com', 'password123', 'MEN', False, False, 'Paul', 'Rabe'),
        ('fop', 'fop@example.com', 'password123', 'FOP', False, False, 'Faly', 'Randria'),
        ('finance', 'finance@example.com', 'password123', 'FINANCE', False, False, 'Niry', 'Ranaivo'),
    ]
    
    results = []
    for username, email, password, role_code, is_staff, is_super, first, last in users_data:
        try:
            role = Role.objects.get(code=role_code)
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': email,
                    'role': role,
                    'first_name': first,
                    'last_name': last,
                    'is_staff': is_staff,
                    'is_superuser': is_super,
                }
            )
            if not created:
                user.set_password(password)
                user.save()
            results.append({'username': username, 'created': created, 'password': password})
        except Role.DoesNotExist:
            results.append({'username': username, 'error': f'Rôle {role_code} non trouvé'})
    
    return Response({
        'status': 'success',
        'users': results,
        'credentials': [
            {'username': 'admin', 'password': 'admin123', 'role': 'Superutilisateur'},
            {'username': 'interesse', 'password': 'password123', 'role': 'Intéressé'},
            {'username': 'dren', 'password': 'password123', 'role': 'DREN'},
            {'username': 'men', 'password': 'password123', 'role': 'MEN'},
            {'username': 'fop', 'password': 'password123', 'role': 'FOP'},
            {'username': 'finance', 'password': 'password123', 'role': 'Finance'},
        ]
    })