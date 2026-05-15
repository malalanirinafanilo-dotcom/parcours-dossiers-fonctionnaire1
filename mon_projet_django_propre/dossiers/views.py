from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.core.exceptions import ValidationError
from django.db.models import Q
from .models import Dossier
from .serializers import DossierSerializer, DossierDetailSerializer


class DossierViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour la gestion des dossiers.
    """
    queryset = Dossier.objects.all()
    serializer_class = DossierSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        """Utilise un sérialiseur différent pour les détails"""
        if self.action == 'retrieve':
            return DossierDetailSerializer
        return DossierSerializer

    def get_queryset(self):
        """Filtre les dossiers selon le rôle de l'utilisateur"""
        queryset = super().get_queryset()
        user = self.request.user

        if not user or not user.role:
            return queryset.none()

        role_code = user.role.code

        # ADMIN voit tout
        if role_code == 'ADMIN':
            return queryset

        # UTILISATEUR (Intéressé) voit ses propres dossiers
        if role_code == 'UTILISATEUR':
            return queryset.filter(
                Q(created_by=user) |
                Q(fonctionnaire__email=user.email) |
                Q(etape_actuelle='INTERESSE')
            )

        # Mapping des rôles vers les étapes
        role_to_etape = {
            'DREN': 'DREN',
            'MEN': 'MEN',
            'FOP': 'FOP',
            'FINANCE': 'FINANCE',
        }

        etape_role = role_to_etape.get(role_code)

        if etape_role:
            # Dossiers à traiter + déjà validés + terminés + rejetés
            a_traiter = Q(etape_actuelle=etape_role) & Q(statut=f'EN_ATTENTE_{etape_role}')
            deja_valides = Q(**{f'etapes_validation__{etape_role}__isnull': False})
            termines = Q(statut='TERMINE')
            rejetes = Q(motif_rejet__isnull=False)

            return queryset.filter(a_traiter | deja_valides | termines | rejetes)

        return queryset.none()

    def perform_create(self, serializer):
        """Crée un nouveau dossier avec numéro automatique"""
        import uuid
        from django.utils import timezone

        numero = f"DOS-{timezone.now().strftime('%Y%m')}-{str(uuid.uuid4())[:8].upper()}"
        serializer.save(
            created_by=self.request.user,
            numero_dossier=numero,
            statut='BROUILLON',
            etape_actuelle='INTERESSE'
        )

    @action(detail=True, methods=['post'])
    def envoyer(self, request, pk=None):
        """
        Action : Envoyer le dossier à la DREN.
        """
        dossier = self.get_object()
        try:
            dossier.envoyer_a_dren(request.user)
            serializer = self.get_serializer(dossier)
            return Response({
                'success': True,
                'message': 'Dossier envoyé avec succès à la DREN',
                'dossier': serializer.data
            })
        except ValidationError as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def valider(self, request, pk=None):
        """
        Action : Valider l'étape actuelle du dossier.
        """
        dossier = self.get_object()
        commentaire = request.data.get('commentaire', '')

        try:
            dossier.valider_etape(request.user, commentaire)
            dossier.refresh_from_db()
            serializer = self.get_serializer(dossier)
            return Response({
                'success': True,
                'message': f'Étape {dossier.etape_actuelle} validée avec succès',
                'dossier': serializer.data
            })
        except ValidationError as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def rejeter(self, request, pk=None):
        """
        Action : Rejeter le dossier avec un motif.
        """
        dossier = self.get_object()
        motif = request.data.get('motif')

        if not motif:
            return Response({
                'success': False,
                'error': 'Le motif du rejet est obligatoire'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            dossier.rejeter(request.user, motif)
            dossier.refresh_from_db()
            serializer = self.get_serializer(dossier)
            return Response({
                'success': True,
                'message': 'Dossier rejeté avec succès',
                'dossier': serializer.data,
                'statut': dossier.statut,
                'etape_actuelle': dossier.etape_actuelle,
                'motif_rejet': dossier.motif_rejet
            })
        except ValidationError as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get'])
    def workflow(self, request, pk=None):
        """
        Action : Récupère l'état du workflow pour un dossier.
        """
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
            validation = dossier.etapes_validation.get(etape, None)

            etape_data = {
                'code': etape,
                'nom': etapes_dict.get(etape, etape),
                'est_terminee': etape in dossier.etapes_validation,
                'est_actuelle': etape == dossier.etape_actuelle,
                'validation': validation
            }
            data['etapes'].append(etape_data)

        return Response(data)

    @action(detail=True, methods=['post'])
    def assigner(self, request, pk=None):
        """
        Action : Assigne un dossier à un utilisateur.
        """
        dossier = self.get_object()
        user_id = request.data.get('user_id')

        if not user_id:
            return Response({
                'success': False,
                'error': 'user_id requis'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            from core.models import User
            user = User.objects.get(id=user_id)
            dossier.assigne_a = user
            dossier.save()

            # Créer une entrée dans l'historique
            from dossiers.models import HistoriqueAction
            HistoriqueAction.objects.create(
                dossier=dossier,
                user=request.user,
                action='ASSIGNATION',
                etape=dossier.etape_actuelle,
                metadata={'assigne_a': user.email}
            )

            return Response({
                'success': True,
                'message': f'Dossier assigné à {user.email}'
            })
        except User.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Utilisateur non trouvé'
            }, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def analyser_ia(self, request, pk=None):
        """
        Action : Lance l'analyse IA du dossier.
        """
        dossier = self.get_object()

        try:
            from dossiers.ia_service import analyse_dossier
            resultat = analyse_dossier(str(dossier.id))

            if resultat['success']:
                from .serializers import IAAnalyseSerializer
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
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)