# dossiers/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Dossier, Document
from .ia_service import analyse_dossier
import threading
import logging

logger = logging.getLogger(__name__)

@receiver(post_save, sender=Dossier)
def dossier_post_save(sender, instance, created, **kwargs):
    """
    Déclenche une analyse IA après la création ou modification d'un dossier
    """
    def run_analysis():
        try:
            resultat = analyse_dossier(str(instance.id))
            if resultat['success']:
                logger.info(f"✅ Analyse IA pour dossier {instance.numero_dossier}: {resultat['resultats']['classification']}")
            else:
                logger.error(f"❌ Erreur analyse IA: {resultat['error']}")
        except Exception as e:
            logger.error(f"❌ Erreur analyse IA: {e}")
    
    # Lancer dans un thread séparé pour ne pas bloquer
    thread = threading.Thread(target=run_analysis)
    thread.daemon = True
    thread.start()

@receiver(post_save, sender=Document)
def document_post_save(sender, instance, created, **kwargs):
    """
    Réanalyse le dossier quand un document est ajouté
    """
    if created:
        def run_analysis():
            try:
                resultat = analyse_dossier(str(instance.dossier.id))
                if resultat['success']:
                    logger.info(f"✅ Réanalyse après ajout document pour dossier {instance.dossier.numero_dossier}")
            except Exception as e:
                logger.error(f"❌ Erreur réanalyse: {e}")
        
        thread = threading.Thread(target=run_analysis)
        thread.daemon = True
        thread.start()