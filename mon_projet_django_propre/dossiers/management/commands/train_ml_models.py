# dossiers/management/commands/train_ml_models.py
from django.core.management.base import BaseCommand
from dossiers.ml_services.model_training import ModelTrainingService

class Command(BaseCommand):
    help = 'Entraîne les modèles de Machine Learning'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force le réentraînement même si les modèles existent',
        )
    
    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🧠 Début de l\'entraînement des modèles ML...'))
        
        service = ModelTrainingService()
        force = options['force']
        
        success = service.train_all(force_retrain=force)
        
        if success:
            self.stdout.write(self.style.SUCCESS('✅ Entraînement terminé avec succès!'))
        else:
            self.stdout.write(self.style.WARNING('⚠️ Entraînement partiel ou échoué'))