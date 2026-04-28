# api/views.py - VERSION COMPLÈTE AVEC ENDPOINT CREATE-ADMIN
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
from core.models import User, Role, Notification
from dossiers.models import Fonctionnaire, Dossier, Document, HistoriqueAction, IAAnalyse
from workflow.models import Workflow
from .serializers import (
    UserSerializer, RoleSerializer, LoginSerializer,
    FonctionnaireSerializer, WorkflowSerializer, DossierSerializer,
    DossierDetailSerializer, DocumentSerializer,
    HistoriqueActionSerializer, IAAnalyseSerializer,
    ValidationActionSerializer, RejetActionSerializer,
    NotificationSerializer
)
import logging
import traceback
import uuid
import os

logger = logging.getLogger(__name__)


# ==================== VUE DE DÉBOGAGE MÉDIA ====================

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


# ==================== VIEWSETS PRINCIPAUX ====================

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = TokenObtainPairSerializer


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


class DossierViewSet(viewsets.ModelViewSet):
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
        queryset = super().get_queryset()
        user = self.request.user
        
        if not user or not user.role:
            return queryset.none()
        
        role_code = user.role.code
        
        if role_code == 'ADMIN':
            return queryset
        
        if role_code == 'UTILISATEUR':
            return queryset.filter(
                Q(created_by=user) |
                Q(fonctionnaire__email=user.email) |
                Q(etape_actuelle='INTERESSE')
            )
        
        role_to_etape = {
            'DREN': 'DREN',
            'MEN': 'MEN',
            'FOP': 'FOP',
            'FINANCE': 'FINANCE',
        }
        
        etape_role = role_to_etape.get(role_code)
        
        if etape_role:
            a_traiter = Q(etape_actuelle=etape_role) & Q(statut=f'EN_ATTENTE_{etape_role}')
            deja_valides = Q(**{f'etapes_validation__{etape_role}__isnull': False})
            termines = Q(statut='TERMINE')
            rejetes = Q(motif_rejet__isnull=False)
            
            queryset = queryset.filter(a_traiter | deja_valides | termines | rejetes)
        
        return queryset.distinct()
    
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
            logger.error(f"❌ Erreur: {e}")
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
            logger.error(f"❌ Erreur: {e}")
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
            logger.error(f"❌ Erreur: {e}")
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
            logger.error(f"❌ Erreur analyse IA: {e}")
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
            logger.error(f"❌ Erreur analyse IA: {e}")
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


# ==================== ENDPOINT CREATE ADMIN ====================

@api_view(['GET'])
@permission_classes([AllowAny])
def create_admin_endpoint(request):
    """Endpoint temporaire pour créer un compte administrateur"""
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    # Supprimer l'admin s'il existe
    User.objects.filter(username='admin').delete()
    
    # Créer un nouvel admin
    admin = User.objects.create_user(
        username='admin',
        email='admin@example.com',
        password='admin123',
        first_name='Admin',
        last_name='System'
    )
    admin.is_staff = True
    admin.is_superuser = True
    admin.save()
    
    return Response({
        'status': 'success',
        'message': 'Admin créé avec succès',
        'username': 'admin',
        'password': 'admin123'
    })