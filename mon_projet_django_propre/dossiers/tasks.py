# dossiers/tasks.py
from celery import shared_task
from django.utils import timezone
import logging
from .models import Dossier, IAAnalyse
from .ml_services.prediction_service import prediction_service

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3, queue='ml_tasks')
def analyze_dossier_task(self, dossier_id):
    """
    Tâche asynchrone pour analyser un dossier avec ML
    """
    try:
        from .models import Dossier
        
        logger.info(f"🔍 Début de l'analyse ML pour le dossier {dossier_id}")
        
        # Récupérer le dossier
        dossier = Dossier.objects.get(id=dossier_id)
        
        # Analyser avec ML
        analyse = prediction_service.analyse_complete(dossier)
        
        # Sauvegarder dans IAAnalyse
        ia_analyse = IAAnalyse.objects.create(
            dossier=dossier,
            type_analyse='ML',
            resultats=analyse,
            score_risque=analyse['predictions']['rejet']['probabilite_rejet'],
            classification=analyse['predictions']['rejet']['niveau_risque']
        )
        
        logger.info(f"✅ Analyse ML terminée pour {dossier.numero_dossier}")
        
        return {
            'status': 'success',
            'dossier': dossier.numero_dossier,
            'analyse_id': str(ia_analyse.id),
            'resultats': analyse
        }
        
    except Dossier.DoesNotExist:
        logger.error(f"❌ Dossier {dossier_id} non trouvé")
        return {'status': 'error', 'message': 'Dossier non trouvé'}
    except Exception as e:
        logger.error(f"❌ Erreur: {e}")
        if self.request.retries < self.max_retries:
            raise self.retry(exc=e, countdown=60)
        return {'status': 'error', 'message': str(e)}

@shared_task(queue='ml_tasks')
def train_models_task():
    """
    Tâche pour réentraîner les modèles ML
    """
    logger.info("🧠 Début de l'entraînement des modèles ML")
    
    try:
        success = prediction_service.train_models(force_retrain=True)
        
        if success:
            logger.info("✅ Modèles ML entraînés avec succès")
            return {'status': 'success', 'message': 'Modèles entraînés'}
        else:
            logger.warning("⚠️ Pas assez de données pour l'entraînement")
            return {'status': 'warning', 'message': 'Pas assez de données'}
            
    except Exception as e:
        logger.error(f"❌ Erreur entraînement: {e}")
        return {'status': 'error', 'message': str(e)}

@shared_task(queue='ml_tasks')
def analyze_all_dossiers_task():
    """
    Analyse tous les dossiers avec ML
    """
    logger.info("🔍 Début de l'analyse ML de tous les dossiers")
    
    dossiers = Dossier.objects.all()
    results = []
    
    for dossier in dossiers:
        try:
            # Lancer la tâche d'analyse de façon asynchrone
            analyze_dossier_task.delay(str(dossier.id))
            results.append({
                'dossier': dossier.numero_dossier,
                'status': 'planifié'
            })
        except Exception as e:
            results.append({
                'dossier': dossier.numero_dossier,
                'status': 'erreur',
                'error': str(e)
            })
    
    logger.info(f"✅ {len(results)} analyses planifiées")
    
    return {
        'status': 'success',
        'total': len(results),
        'results': results
    }