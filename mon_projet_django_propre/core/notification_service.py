# core/notification_service.py
from .models import Notification
from core.models import User
import logging

logger = logging.getLogger(__name__)

class NotificationService:
    """
    Service de gestion des notifications
    """
    
    @staticmethod
    def creer_notification(user, titre, message, type='INFO', dossier=None, action_requise=False):
        """
        Crée une notification pour un utilisateur
        """
        try:
            notification = Notification.objects.create(
                user=user,
                titre=titre,
                message=message,
                type=type,
                dossier=dossier,
                action_requise=action_requise
            )
            logger.info(f"✅ Notification créée pour {user.email}: {titre}")
            print(f"📬 Notification créée: {titre} -> {user.email}")
            return notification
        except Exception as e:
            logger.error(f"❌ Erreur création notification: {e}")
            print(f"❌ Erreur création notification: {e}")
            return None
    
    @staticmethod
    def notifier_transfert_dossier(dossier, ancien_utilisateur, nouvel_utilisateur):
        """
        Notifie quand un dossier est transféré
        """
        # Notification pour le nouvel utilisateur (celui qui reçoit)
        titre = f"📥 Nouveau dossier à traiter"
        message = f"Le dossier {dossier.numero_dossier} - {dossier.titre} vous a été transféré pour validation à l'étape {dossier.get_etape_actuelle_display()}."
        NotificationService.creer_notification(
            user=nouvel_utilisateur,
            titre=titre,
            message=message,
            type='WARNING',
            dossier=dossier,
            action_requise=True
        )
        
        # Notification pour l'ancien utilisateur (celui qui a envoyé)
        titre = f"📤 Dossier transféré avec succès"
        message = f"Le dossier {dossier.numero_dossier} a été transféré à {nouvel_utilisateur.get_full_name()}."
        NotificationService.creer_notification(
            user=ancien_utilisateur,
            titre=titre,
            message=message,
            type='SUCCESS',
            dossier=dossier
        )
    
    @staticmethod
    def notifier_validation_dossier(dossier, validateur):
        """
        Notifie quand un dossier est validé
        """
        if not dossier.created_by:
            return
            
        titre = f"✅ Dossier validé"
        message = f"Votre dossier {dossier.numero_dossier} a été validé par {validateur.get_full_name()} à l'étape {dossier.get_etape_actuelle_display()}."
        NotificationService.creer_notification(
            user=dossier.created_by,
            titre=titre,
            message=message,
            type='SUCCESS',
            dossier=dossier
        )
    
    @staticmethod
    def notifier_rejet_dossier(dossier, rejeteur, motif):
        """
        Notifie quand un dossier est rejeté
        """
        if not dossier.created_by:
            return
            
        titre = f"❌ Dossier rejeté"
        message = f"Votre dossier {dossier.numero_dossier} a été rejeté par {rejeteur.get_full_name()}. Motif : {motif}"
        NotificationService.creer_notification(
            user=dossier.created_by,
            titre=titre,
            message=message,
            type='ERROR',
            dossier=dossier,
            action_requise=True
        )
    
    @staticmethod
    def notifier_creation_dossier(dossier):
        """
        Notifie quand un dossier est créé
        """
        if not dossier.created_by:
            return
            
        titre = f"📝 Dossier créé"
        message = f"Votre dossier {dossier.numero_dossier} a été créé avec succès."
        NotificationService.creer_notification(
            user=dossier.created_by,
            titre=titre,
            message=message,
            type='INFO',
            dossier=dossier
        )
    
    @staticmethod
    def get_notifications_for_user(user, non_lues_seulement=False):
        """
        Récupère les notifications d'un utilisateur
        """
        queryset = Notification.objects.filter(user=user)
        if non_lues_seulement:
            queryset = queryset.filter(lu=False)
        return queryset.order_by('-created_at')
    
    @staticmethod
    def marquer_comme_lue(notification_id):
        """
        Marque une notification comme lue
        """
        try:
            notification = Notification.objects.get(id=notification_id)
            notification.lu = True
            notification.save()
            return True
        except Notification.DoesNotExist:
            return False
    
    @staticmethod
    def marquer_toutes_comme_lues(user):
        """
        Marque toutes les notifications d'un utilisateur comme lues
        """
        Notification.objects.filter(user=user, lu=False).update(lu=True)