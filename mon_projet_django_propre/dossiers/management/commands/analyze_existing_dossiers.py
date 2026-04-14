# dossiers/management/commands/analyze_existing_dossiers.py
from django.core.management.base import BaseCommand
from dossiers.models import Dossier
from dossiers.ia_service import analyse_dossier

class Command(BaseCommand):
    help = 'Analyse tous les dossiers existants avec l\'IA'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force la réanalyse même si une analyse existe déjà',
        )
    
    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🔍 Début de l\'analyse des dossiers...'))
        
        dossiers = Dossier.objects.all()
        total = dossiers.count()
        force = options['force']
        
        self.stdout.write(f"📊 {total} dossiers trouvés")
        
        analyses_creees = 0
        erreurs = 0
        deja_analyse = 0
        
        for i, dossier in enumerate(dossiers, 1):
            self.stdout.write(f"\n[{i}/{total}] Analyse du dossier {dossier.numero_dossier}...")
            
            # Vérifier si une analyse existe déjà
            if not force and dossier.analyses_ia.filter(type_analyse='RULE_BASED').exists():
                self.stdout.write(self.style.WARNING(f"  ⏭️ Analyse déjà existante"))
                deja_analyse += 1
                continue
            
            try:
                resultat = analyse_dossier(str(dossier.id))
                
                if resultat['success']:
                    analyses_creees += 1
                    score = resultat['resultats']['score_risque']
                    classification = resultat['resultats']['classification']
                    self.stdout.write(self.style.SUCCESS(f"  ✅ Analyse créée - Score: {score} - {classification}"))
                else:
                    erreurs += 1
                    self.stdout.write(self.style.ERROR(f"  ❌ Erreur: {resultat['error']}"))
                    
            except Exception as e:
                erreurs += 1
                self.stdout.write(self.style.ERROR(f"  ❌ Exception: {e}"))
        
        self.stdout.write("\n" + "=" * 60)
        self.stdout.write(self.style.SUCCESS(f"✅ RÉSULTAT:"))
        self.stdout.write(f"   - Nouvelles analyses: {analyses_creees}")
        self.stdout.write(f"   - Déjà analysés: {deja_analyse}")
        self.stdout.write(f"   - Erreurs: {erreurs}")
        self.stdout.write(f"   - Total: {total}")
        self.stdout.write("=" * 60)