# dossiers/models.py - VERSION COMPLÈTE CORRIGÉE
from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError
from core.models import User
from workflow.models import Workflow
import uuid

from core.notification_service import NotificationService


class Fonctionnaire(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    matricule = models.CharField(max_length=50, unique=True)
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    date_naissance = models.DateField()
    email = models.EmailField(blank=True)
    telephone = models.CharField(max_length=20, blank=True)
    adresse = models.TextField(blank=True)
    categorie = models.CharField(max_length=50)
    grade = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'dossiers_fonctionnaires'
    
    def __str__(self):
        return f"{self.matricule} - {self.nom} {self.prenom}"


class Dossier(models.Model):
    # ==================== STATUTS ====================
    STATUS_CHOICES = [
        ('BROUILLON', 'Brouillon'),
        ('EN_ATTENTE_DREN', 'En attente DREN'),
        ('EN_ATTENTE_MEN', 'En attente MEN'),
        ('EN_ATTENTE_FOP', 'En attente FOP'),
        ('EN_ATTENTE_FINANCE', 'En attente Finance'),
        ('EN_COURS', 'En cours'),
        ('BLOQUE', 'Bloqué'),
        ('TERMINE', 'Terminé'),
        ('REJETE', 'Rejeté'),
    ]
    
    # ==================== ÉTAPES ====================
    ETAPES_WORKFLOW = [
        ('INTERESSE', 'Intéressé'),
        ('DREN', 'Direction Régionale'),
        ('MEN', 'Ministère Éducation Nationale'),
        ('FOP', 'Formation Professionnelle'),
        ('FINANCE', 'Finance'),
        ('TERMINE', 'Terminé'),
        ('REJETE', 'Rejeté'),
    ]
    
    # ==================== MAPPINGS ====================
    ROLE_TO_ETAPE = {
        'UTILISATEUR': 'INTERESSE',
        'DREN': 'DREN',
        'MEN': 'MEN',
        'FOP': 'FOP',
        'FINANCE': 'FINANCE',
    }
    
    ETAPE_TO_STATUT = {
        'INTERESSE': 'BROUILLON',
        'DREN': 'EN_ATTENTE_DREN',
        'MEN': 'EN_ATTENTE_MEN',
        'FOP': 'EN_ATTENTE_FOP',
        'FINANCE': 'EN_ATTENTE_FINANCE',
    }
    
    VALIDATION_TO_NEXT_ETAPE = {
        'UTILISATEUR': 'DREN',
        'DREN': 'MEN',
        'MEN': 'FOP',
        'FOP': 'FINANCE',
        'FINANCE': 'TERMINE',
    }
    
    # ==================== CHAMPS ====================
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    numero_dossier = models.CharField(max_length=100, unique=True)
    titre = models.CharField(max_length=200)
    type_dossier = models.CharField(max_length=100)
    code_mouvement = models.CharField(max_length=10, blank=True, null=True)
    fonctionnaire = models.ForeignKey(Fonctionnaire, on_delete=models.CASCADE, related_name='dossiers')
    workflow = models.ForeignKey('workflow.Workflow', on_delete=models.PROTECT, null=True, blank=True)
    
    statut = models.CharField(max_length=20, choices=STATUS_CHOICES, default='BROUILLON')
    etape_actuelle = models.CharField(max_length=20, choices=ETAPES_WORKFLOW, default='INTERESSE')
    
    assigne_a = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='dossiers_assignes'
    )
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name='dossiers_crees'
    )
    
    date_depot = models.DateTimeField(auto_now_add=True)
    date_limite = models.DateField(null=True, blank=True)
    date_cloture = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    date_derniere_action = models.DateTimeField(auto_now=True)
    
    etapes_validation = models.JSONField(default=dict)
    motif_rejet = models.TextField(blank=True, null=True)
    
    class Meta:
        db_table = 'dossiers_dossiers'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['statut']),
            models.Index(fields=['etape_actuelle']),
            models.Index(fields=['numero_dossier']),
        ]
    
    def __str__(self):
        return f"{self.numero_dossier} - {self.titre}"
    
    # ==================== MÉTHODES UTILITAIRES ====================
    
    def get_etape_actuelle_display(self):
        return dict(self.ETAPES_WORKFLOW).get(self.etape_actuelle, self.etape_actuelle)
    
    # ==================== MÉTHODES DE VÉRIFICATION ====================
    
    def peut_valider(self, user):
        """Vérifie si l'utilisateur peut valider l'étape actuelle"""
        if self.statut == 'TERMINE':
            return False
        
        if not user or not user.role:
            return False
        
        role_code = user.role.code
        
        if self.ROLE_TO_ETAPE.get(role_code) != self.etape_actuelle:
            return False
        
        if self.etape_actuelle == 'INTERESSE':
            if self.statut == 'BROUILLON' or self.motif_rejet:
                return True
            return False
        
        statut_attendu = self.ETAPE_TO_STATUT.get(self.etape_actuelle)
        if self.statut != statut_attendu:
            return False
        
        return True
    
    def peut_voir(self, user):
        """Vérifie si l'utilisateur peut voir ce dossier"""
        if not user:
            return False
        if user.role and user.role.code == 'ADMIN':
            return True
        if self.created_by == user:
            return True
        if self.assigne_a == user:
            return True
        if user.role:
            role_attendu = [r for r, e in self.ROLE_TO_ETAPE.items() if e == self.etape_actuelle]
            if role_attendu and user.role.code in role_attendu:
                return True
        return False
    
    # ==================== MÉTHODES D'ACTION ====================
    
    def envoyer_a_dren(self, user):
        """Envoyer le dossier de l'intéressé vers la DREN"""
        if not user.role or user.role.code != 'UTILISATEUR':
            raise ValidationError("Seul l'intéressé (rôle UTILISATEUR) peut envoyer le dossier")
        
        if self.etape_actuelle != 'INTERESSE':
            raise ValidationError(f"Ce dossier n'est pas à l'étape Intéressé")
        
        if self.statut != 'BROUILLON' and not self.motif_rejet:
            raise ValidationError(f"Ce dossier ne peut pas être envoyé")
        
        ancien_statut = self.statut
        ancien_motif = self.motif_rejet
        
        print(f"\n📤 ENVOI du dossier {self.numero_dossier} à la DREN")
        print(f"   - Ancien statut: {ancien_statut}")
        print(f"   - Ancien motif: {ancien_motif}")
        
        self.statut = 'EN_ATTENTE_DREN'
        self.etape_actuelle = 'DREN'
        self.motif_rejet = None
        self.save()
        
        print(f"   ✅ Nouveau statut: {self.statut}")
        print(f"   ✅ Nouvelle étape: {self.etape_actuelle}")
        
        from .models import HistoriqueAction
        HistoriqueAction.objects.create(
            dossier=self,
            user=user,
            action='TRANSFERT',
            etape='DREN',
            commentaire='Dossier envoyé à la DREN',
            metadata={
                'ancien_statut': ancien_statut,
                'nouveau_statut': self.statut
            }
        )
        
        try:
            dren_user = User.objects.filter(role__code='DREN').first()
            if dren_user:
                NotificationService.notifier_transfert_dossier(self, user, dren_user)
                print(f"   ✅ Notification envoyée à DREN")
        except Exception as e:
            print(f"   ⚠️ Erreur notification DREN: {e}")
        
        return True
    
    # ========== MÉTHODE CORRIGÉE ==========
    def valider_etape(self, user, commentaire=""):
        """
        Valide l'étape actuelle et passe à la suivante
        Version corrigée avec logs détaillés et notification à l'intéressé
        """
        # Vérification des droits
        if not self.peut_valider(user):
            raise ValidationError("Vous n'avez pas le droit de valider cette étape")
        
        # Initialisation des étapes de validation
        if not self.etapes_validation:
            self.etapes_validation = {}
        
        # Enregistrer la validation actuelle
        self.etapes_validation[self.etape_actuelle] = {
            'valide_par': user.email,
            'nom_utilisateur': f"{user.first_name} {user.last_name}",
            'role': user.role.code if user.role else None,
            'date': timezone.now().isoformat(),
            'commentaire': commentaire
        }
        
        # Déterminer la prochaine étape
        role_code = user.role.code if user.role else None
        prochaine_etape = self.VALIDATION_TO_NEXT_ETAPE.get(role_code)
        
        if not prochaine_etape:
            raise ValidationError(f"Impossible de déterminer la prochaine étape")
        
        # Sauvegarder l'état avant modification
        ancien_statut = self.statut
        ancienne_etape = self.etape_actuelle
        
        # ===== LOGS DÉTAILLÉS POUR DÉBOGAGE =====
        print("\n" + "="*80)
        print("🔍 VALIDATION D'ÉTAPE - DÉTAILS")
        print("="*80)
        print(f"📁 Dossier: {self.numero_dossier}")
        print(f"   ID: {self.id}")
        print(f"   Titre: {self.titre}")
        print(f"👤 Validateur: {user.email}")
        print(f"   Rôle: {role_code}")
        print(f"   Nom: {user.first_name} {user.last_name}")
        print(f"📍 État avant validation:")
        print(f"   - Étape actuelle: {ancienne_etape}")
        print(f"   - Statut actuel: {ancien_statut}")
        print(f"   - Prochaine étape: {prochaine_etape}")
        
        # Gestion des différents cas
        if prochaine_etape == 'TERMINE':
            self.statut = 'TERMINE'
            self.etape_actuelle = 'TERMINE'
            self.date_cloture = timezone.now()
            print(f"\n✅ CAS: Dossier TERMINÉ avec succès !")
        else:
            self.etape_actuelle = prochaine_etape
            # Mettre à jour le statut en fonction de la nouvelle étape
            nouveau_statut = self.ETAPE_TO_STATUT.get(prochaine_etape)
            if nouveau_statut:
                self.statut = nouveau_statut
            else:
                self.statut = 'EN_COURS'
            print(f"\n✅ CAS: Passage à l'étape suivante")
        
        print(f"📍 État après validation:")
        print(f"   - Nouvelle étape: {self.etape_actuelle}")
        print(f"   - Nouveau statut: {self.statut}")
        
        # Sauvegarder les modifications
        self.save()
        print(f"✅ Dossier sauvegardé avec succès")
        
        # Créer l'historique
        from .models import HistoriqueAction
        historique = HistoriqueAction.objects.create(
            dossier=self,
            user=user,
            action='VALIDATION',
            etape=prochaine_etape,
            commentaire=commentaire,
            metadata={
                'ancien_statut': ancien_statut,
                'nouveau_statut': self.statut,
                'ancienne_etape': ancienne_etape,
                'nouvelle_etape': self.etape_actuelle,
                'role': role_code,
                'valide_par': user.email
            }
        )
        print(f"✅ Historique créé: {historique.id}")
        
        # ===== NOTIFICATION À L'INTÉRESSÉ =====
        if self.created_by and self.created_by != user:
            try:
                from core.notification_service import NotificationService
                NotificationService.notifier_validation_dossier(self, user)
                print(f"✅ Notification envoyée à l'intéressé: {self.created_by.email}")
            except Exception as e:
                print(f"⚠️ Erreur notification intéressé: {e}")
        
        # ===== NOTIFICATION AU PROCHAIN VALIDATEUR =====
        prochain_role = self.get_prochain_role()
        if prochain_role:
            try:
                prochain_user = User.objects.filter(role__code=prochain_role).first()
                if prochain_user:
                    from core.notification_service import NotificationService
                    NotificationService.notifier_transfert_dossier(self, user, prochain_user)
                    print(f"✅ Notification envoyée au prochain validateur: {prochain_role}")
            except Exception as e:
                print(f"⚠️ Erreur notification prochain validateur: {e}")
        
        print("="*80 + "\n")
        
        return True
    
    def rejeter(self, user, motif):
        """Rejette le dossier et le retourne à l'intéressé"""
        if self.statut in ['TERMINE']:
            raise ValidationError("Ce dossier est déjà terminé")
        
        if not self.peut_valider(user):
            raise ValidationError("Vous n'avez pas le droit de rejeter ce dossier")
        
        ancien_statut = self.statut
        ancienne_etape = self.etape_actuelle
        
        print(f"\n❌ REJET du dossier {self.numero_dossier}")
        print(f"   - Par: {user.email}")
        print(f"   - Ancien statut: {ancien_statut}")
        print(f"   - Ancienne étape: {ancienne_etape}")
        print(f"   - Motif: {motif}")
        
        self.statut = 'BROUILLON'
        self.etape_actuelle = 'INTERESSE'
        self.motif_rejet = motif
        self.save()
        
        print(f"   ✅ Nouveau statut: {self.statut}")
        print(f"   ✅ Nouvelle étape: {self.etape_actuelle}")
        print(f"   ✅ Motif enregistré: {self.motif_rejet}")
        
        from .models import HistoriqueAction
        HistoriqueAction.objects.create(
            dossier=self,
            user=user,
            action='REJET',
            etape=ancienne_etape,
            commentaire=motif,
            metadata={
                'ancien_statut': ancien_statut,
                'nouveau_statut': self.statut,
                'ancienne_etape': ancienne_etape,
                'nouvelle_etape': self.etape_actuelle,
                'motif': motif
            }
        )
        
        if self.created_by:
            try:
                NotificationService.notifier_rejet_dossier(self, user, motif)
                print(f"   ✅ Notification envoyée à l'intéressé")
            except Exception as e:
                print(f"   ⚠️ Erreur notification: {e}")
        
        return True
    
    # ==================== MÉTHODES DE WORKFLOW ====================
    
    def get_prochaine_etape(self):
        """Détermine la prochaine étape dans le workflow"""
        ordre_etapes = ['INTERESSE', 'DREN', 'MEN', 'FOP', 'FINANCE', 'TERMINE']
        try:
            index_actuel = ordre_etapes.index(self.etape_actuelle)
            if index_actuel + 1 < len(ordre_etapes):
                return ordre_etapes[index_actuel + 1]
        except ValueError:
            pass
        return None
    
    def get_prochain_role(self):
        """Détermine le prochain rôle dans le workflow"""
        mapping = {
            'DREN': 'MEN',
            'MEN': 'FOP',
            'FOP': 'FINANCE',
            'FINANCE': None,
        }
        return mapping.get(self.etape_actuelle)
    
    def get_statut_affichage(self):
        """Retourne le statut formaté pour l'affichage"""
        statuts_affichage = {
            'BROUILLON': 'Brouillon',
            'EN_ATTENTE_DREN': 'En attente DREN',
            'EN_ATTENTE_MEN': 'En attente MEN',
            'EN_ATTENTE_FOP': 'En attente FOP',
            'EN_ATTENTE_FINANCE': 'En attente Finance',
            'EN_COURS': 'En cours',
            'BLOQUE': 'Bloqué',
            'TERMINE': 'Terminé',
            'REJETE': 'Rejeté',
        }
        return statuts_affichage.get(self.statut, self.statut)
    
    def get_historique_complet(self):
        """Retourne tout l'historique du dossier"""
        from .models import HistoriqueAction
        return HistoriqueAction.objects.filter(dossier=self).order_by('-created_at')
    
    def a_ete_rejete(self):
        """Vérifie si le dossier a déjà été rejeté"""
        from .models import HistoriqueAction
        return HistoriqueAction.objects.filter(
            dossier=self,
            action='REJET'
        ).exists()


class DossierData(models.Model):
    """Données supplémentaires du dossier (champs dynamiques)"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    dossier = models.OneToOneField(Dossier, on_delete=models.CASCADE, related_name='data')
    data = models.JSONField(default=dict)
    
    class Meta:
        db_table = 'dossiers_data'


class Document(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    dossier = models.ForeignKey(Dossier, on_delete=models.CASCADE, related_name='documents')
    nom = models.CharField(max_length=255)
    fichier = models.FileField(upload_to='documents/%Y/%m/%d/')
    type_document = models.CharField(max_length=100)
    upload_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'dossiers_documents'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.nom
    
    @property
    def url(self):
        """Retourne l'URL complète du fichier"""
        if self.fichier:
            return self.fichier.url
        return None
    
    @property
    def taille(self):
        """Retourne la taille du fichier en bytes"""
        if self.fichier and self.fichier.size:
            return self.fichier.size
        return 0


class HistoriqueAction(models.Model):
    """Historique des actions sur un dossier"""
    ACTION_CHOICES = [
        ('CREATION', 'Création'),
        ('VALIDATION', 'Validation'),
        ('REJET', 'Rejet'),
        ('TRANSFERT', 'Transfert'),
        ('MODIFICATION', 'Modification'),
        ('BLOQUAGE', 'Bloquage'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    dossier = models.ForeignKey(Dossier, on_delete=models.CASCADE, related_name='historique')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    etape = models.CharField(max_length=20, blank=True)
    commentaire = models.TextField(blank=True)
    metadata = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'dossiers_historique'
        ordering = ['-created_at']


class IAAnalyse(models.Model):
    """Analyse IA d'un dossier"""
    TYPE_ANALYSE_CHOICES = [
        ('RULE_BASED', 'Basé sur règles'),
        ('ML', 'Machine Learning'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    dossier = models.ForeignKey(Dossier, on_delete=models.CASCADE, related_name='analyses_ia')
    type_analyse = models.CharField(max_length=20, choices=TYPE_ANALYSE_CHOICES)
    resultats = models.JSONField(default=dict)
    score_risque = models.IntegerField(null=True, blank=True)
    classification = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'dossiers_ia_analyses'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"IA Analysis for {self.dossier.numero_dossier} - {self.type_analyse}"