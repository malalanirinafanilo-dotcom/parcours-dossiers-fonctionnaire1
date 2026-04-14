# dossiers/tasks.py
from celery import shared_task
from django.utils import timezone
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3)
def analyser_dossier_task(self, dossier_id):
    """
    Tâche asynchrone pour analyser un dossier avec l'IA
    """
    try:
        from .models import Dossier
        from .ia_service import analyse_dossier
        
        logger.info(f"Début de l'analyse IA pour le dossier {dossier_id}")
        
        # Récupérer le dossier
        dossier = Dossier.objects.get(id=dossier_id)
        
        # Lancer l'analyse
        resultat = analyse_dossier(dossier_id)
        
        if resultat['success']:
            logger.info(f"✅ Analyse IA réussie pour {dossier.numero_dossier}")
            return {
                'status': 'success',
                'dossier': dossier.numero_dossier,
                'score': resultat['resultats']['score_risque']
            }
        else:
            logger.error(f"❌ Échec analyse IA pour {dossier_id}: {resultat['error']}")
            raise self.retry(exc=Exception(resultat['error']), countdown=60)
            
    except Dossier.DoesNotExist:
        logger.error(f"❌ Dossier {dossier_id} non trouvé")
        return {'status': 'error', 'message': 'Dossier non trouvé'}
    except Exception as e:
        logger.error(f"❌ Erreur inattendue: {e}")
        if self.request.retries < self.max_retries:
            raise self.retry(exc=e, countdown=60)
        return {'status': 'error', 'message': str(e)}

@shared_task
def envoyer_notification_email_task(email, sujet, message):
    """
    Tâche pour envoyer un email de notification
    """
    try:
        from django.core.mail import send_mail
        from django.conf import settings
        
        logger.info(f"Envoi d'email à {email}")
        
        send_mail(
            sujet,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )
        
        logger.info(f"✅ Email envoyé à {email}")
        return {'status': 'success', 'email': email}
        
    except Exception as e:
        logger.error(f"❌ Erreur envoi email: {e}")
        return {'status': 'error', 'message': str(e)}

@shared_task
def nettoyer_fichiers_temporaires():
    """
    Tâche planifiée pour nettoyer les fichiers temporaires
    """
    try:
        import os
        from django.conf import settings
        
        logger.info("Nettoyage des fichiers temporaires...")
        
        # Chemin du dossier temporaire
        temp_dir = os.path.join(settings.MEDIA_ROOT, 'temp')
        nb_fichiers = 0
        
        if os.path.exists(temp_dir):
            # Supprimer les fichiers plus vieux que 24h
            cutoff = timezone.now() - timedelta(hours=24)
            
            for filename in os.listdir(temp_dir):
                filepath = os.path.join(temp_dir, filename)
                filetime = timezone.datetime.fromtimestamp(
                    os.path.getctime(filepath)
                )
                
                if filetime < cutoff:
                    os.remove(filepath)
                    nb_fichiers += 1
        
        logger.info(f"✅ {nb_fichiers} fichiers temporaires nettoyés")
        return {'status': 'success', 'fichiers_supprimes': nb_fichiers}
        
    except Exception as e:
        logger.error(f"❌ Erreur nettoyage: {e}")
        return {'status': 'error', 'message': str(e)}

@shared_task
def analyse_ia_quotidienne():
    """
    Tâche planifiée pour analyser tous les dossiers en cours
    """
    try:
        from .models import Dossier
        
        logger.info("Début de l'analyse IA quotidienne")
        
        dossiers = Dossier.objects.filter(
            statut__in=['EN_COURS', 'EN_ATTENTE']
        )
        
        resultats = []
        for dossier in dossiers:
            try:
                # Appeler la tâche d'analyse de façon asynchrone
                analyser_dossier_task.delay(str(dossier.id))
                resultats.append({
                    'dossier': dossier.numero_dossier,
                    'status': 'planifié'
                })
            except Exception as e:
                resultats.append({
                    'dossier': dossier.numero_dossier,
                    'status': 'erreur',
                    'error': str(e)
                })
        
        logger.info(f"✅ {len(resultats)} analyses planifiées")
        return {
            'status': 'success',
            'total': len(resultats),
            'resultats': resultats
        }
        
    except Exception as e:
        logger.error(f"❌ Erreur analyse quotidienne: {e}")
        return {'status': 'error', 'message': str(e)}