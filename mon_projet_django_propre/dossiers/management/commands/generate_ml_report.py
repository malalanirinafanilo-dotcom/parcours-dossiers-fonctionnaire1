# dossiers/management/commands/generate_ml_report.py
from django.core.management.base import BaseCommand
from dossiers.ml_services.data_preparation import DataPreparationService
import json
from pathlib import Path

class Command(BaseCommand):
    help = 'Génère un rapport statistique sur les données'
    
    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('📊 Génération du rapport...'))
        
        stats = DataPreparationService.get_summary_statistics()
        
        # Sauvegarder le rapport
        report_dir = Path('ml_reports')
        report_dir.mkdir(exist_ok=True)
        report_path = report_dir / 'statistics_report.json'
        
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(stats, f, indent=2, default=str, ensure_ascii=False)
        
        self.stdout.write(self.style.SUCCESS(f'✅ Rapport sauvegardé dans {report_path}'))
        
        # Afficher un résumé
        self.stdout.write(f"\n📈 RÉSUMÉ:")
        self.stdout.write(f"   Total dossiers: {stats['total_dossiers']}")
        self.stdout.write(f"   Délai moyen: {stats['delai_moyen_jours']} jours")
        self.stdout.write(f"   Taux de réussite: {stats['taux_reussite']}%")
        self.stdout.write(f"   Taux de rejet: {stats['taux_rejet']}%")
        self.stdout.write(f"\n   Par statut:")
        for item in stats['par_statut']:
            self.stdout.write(f"     - {item['statut']}: {item['count']}")