# config/celery.py
import os
from celery import Celery
from celery.signals import worker_ready, worker_shutdown
import logging

logger = logging.getLogger(__name__)

# Définir le module de settings par défaut
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Créer l'application Celery
app = Celery('mon_projet_django')

# Charger la configuration depuis Django settings avec namespace CELERY
app.config_from_object('django.conf:settings', namespace='CELERY')

# Configuration de reconnexion automatique
app.conf.update(
    broker_connection_retry_on_startup=True,
    broker_connection_retry=True,
    broker_connection_max_retries=10,
)

# Auto-découverte des tâches
app.autodiscover_tasks()

@worker_ready.connect
def on_worker_ready(sender, **kwargs):
    logger.info("🚀 Worker Celery prêt et connecté à Redis")

@worker_shutdown.connect
def on_worker_shutdown(sender, **kwargs):
    logger.info("🛑 Worker Celery arrêté")

@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f'Requête: {self.request!r}')