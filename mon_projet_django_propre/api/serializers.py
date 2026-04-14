# api/serializers.py
from rest_framework import serializers
from django.contrib.auth import authenticate
from core.models import User, Role, Notification
from dossiers.models import Fonctionnaire, Dossier, Document, HistoriqueAction, IAAnalyse, DossierData
from workflow.models import Workflow


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'code', 'name', 'description']


class UserSerializer(serializers.ModelSerializer):
    role_detail = RoleSerializer(source='role', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 
                  'role', 'role_detail', 'phone_number', 'is_active']
        read_only_fields = ['id']


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    
    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        user = authenticate(email=email, password=password)
        if user and user.is_active:
            data['user'] = user
        else:
            raise serializers.ValidationError("Email ou mot de passe incorrect")
        return data


class FonctionnaireSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fonctionnaire
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class WorkflowSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workflow
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class DocumentSerializer(serializers.ModelSerializer):
    upload_by_nom = serializers.CharField(source='upload_by.get_full_name', read_only=True)
    url = serializers.SerializerMethodField()
    taille = serializers.SerializerMethodField()
    
    class Meta:
        model = Document
        fields = ['id', 'dossier', 'nom', 'fichier', 'url', 'type_document', 'taille',
                  'upload_by', 'upload_by_nom', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_url(self, obj):
        """Retourne l'URL complète du fichier"""
        if obj.fichier:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.fichier.url)
            return obj.fichier.url
        return None
    
    def get_taille(self, obj):
        """Retourne la taille du fichier"""
        if obj.fichier and obj.fichier.size:
            return obj.fichier.size
        return 0


class HistoriqueActionSerializer(serializers.ModelSerializer):
    user_nom = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = HistoriqueAction
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class IAAnalyseSerializer(serializers.ModelSerializer):
    class Meta:
        model = IAAnalyse
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class DossierSerializer(serializers.ModelSerializer):
    fonctionnaire_nom = serializers.CharField(source='fonctionnaire.nom', read_only=True)
    fonctionnaire_prenom = serializers.CharField(source='fonctionnaire.prenom', read_only=True)
    fonctionnaire_matricule = serializers.CharField(source='fonctionnaire.matricule', read_only=True)
    workflow_nom = serializers.CharField(source='workflow.name', read_only=True)
    created_by_email = serializers.CharField(source='created_by.email', read_only=True)
    created_by_nom = serializers.SerializerMethodField()
    
    documents = DocumentSerializer(many=True, read_only=True)
    documents_count = serializers.IntegerField(source='documents.count', read_only=True)
    
    peut_valider = serializers.SerializerMethodField()
    prochaine_etape = serializers.SerializerMethodField()
    
    class Meta:
        model = Dossier
        fields = [
            'id', 'numero_dossier', 'titre', 'type_dossier', 'code_mouvement',
            'fonctionnaire', 'fonctionnaire_nom', 'fonctionnaire_prenom', 'fonctionnaire_matricule',
            'workflow', 'workflow_nom',
            'statut', 'etape_actuelle',
            'assigne_a', 'created_by', 'created_by_email', 'created_by_nom',
            'date_depot', 'date_limite', 'date_cloture',
            'created_at', 'updated_at', 'date_derniere_action',
            'etapes_validation', 'motif_rejet',
            'documents', 'documents_count',
            'peut_valider', 'prochaine_etape'
        ]
        read_only_fields = ['id', 'numero_dossier', 'created_at', 'updated_at', 'date_derniere_action']
    
    def get_created_by_nom(self, obj):
        if obj.created_by:
            return f"{obj.created_by.first_name} {obj.created_by.last_name}"
        return None
    
    def get_peut_valider(self, obj):
        request = self.context.get('request')
        if request and request.user:
            try:
                return obj.peut_valider(request.user)
            except:
                return False
        return False
    
    def get_prochaine_etape(self, obj):
        try:
            return obj.get_prochaine_etape()
        except:
            return None


class DossierDetailSerializer(serializers.ModelSerializer):
    fonctionnaire = FonctionnaireSerializer(read_only=True)
    workflow = WorkflowSerializer(read_only=True)
    assigne_a = UserSerializer(read_only=True)
    created_by = UserSerializer(read_only=True)
    
    fonctionnaire_nom = serializers.CharField(source='fonctionnaire.nom', read_only=True)
    fonctionnaire_prenom = serializers.CharField(source='fonctionnaire.prenom', read_only=True)
    fonctionnaire_matricule = serializers.CharField(source='fonctionnaire.matricule', read_only=True)
    workflow_nom = serializers.CharField(source='workflow.name', read_only=True)
    created_by_email = serializers.CharField(source='created_by.email', read_only=True)
    created_by_nom = serializers.SerializerMethodField()
    
    documents = DocumentSerializer(many=True, read_only=True)
    documents_count = serializers.IntegerField(source='documents.count', read_only=True)
    
    historique = serializers.SerializerMethodField()
    analyses_ia = IAAnalyseSerializer(many=True, read_only=True)
    derniere_analyse_ia = serializers.SerializerMethodField()
    
    peut_valider = serializers.SerializerMethodField()
    prochaine_etape = serializers.SerializerMethodField()
    etapes_validation_detail = serializers.SerializerMethodField()
    
    class Meta:
        model = Dossier
        fields = '__all__'
    
    def get_created_by_nom(self, obj):
        if obj.created_by:
            return f"{obj.created_by.first_name} {obj.created_by.last_name}"
        return None
    
    def get_historique(self, obj):
        try:
            historique = obj.historique.all()[:20]
            return HistoriqueActionSerializer(historique, many=True).data
        except Exception:
            return []
    
    def get_derniere_analyse_ia(self, obj):
        """Récupère la dernière analyse IA"""
        try:
            analyse = obj.analyses_ia.filter(type_analyse='RULE_BASED').first()
            if analyse:
                request = self.context.get('request')
                serializer = IAAnalyseSerializer(analyse, context={'request': request})
                return serializer.data
            return None
        except Exception as e:
            print(f"⚠️ Erreur récupération analyse IA: {e}")
            return None
    
    def get_peut_valider(self, obj):
        request = self.context.get('request')
        if request and request.user:
            try:
                return obj.peut_valider(request.user)
            except Exception:
                return False
        return False
    
    def get_prochaine_etape(self, obj):
        try:
            return obj.get_prochaine_etape()
        except Exception:
            return None
    
    def get_etapes_validation_detail(self, obj):
        try:
            return obj.etapes_validation if obj.etapes_validation else {}
        except Exception:
            return {}


class ValidationActionSerializer(serializers.Serializer):
    commentaire = serializers.CharField(required=False, allow_blank=True)


class RejetActionSerializer(serializers.Serializer):
    motif = serializers.CharField(required=True)


class NotificationSerializer(serializers.ModelSerializer):
    dossier_numero = serializers.CharField(source='dossier.numero_dossier', read_only=True)
    dossier_titre = serializers.CharField(source='dossier.titre', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_name = serializers.SerializerMethodField()
    time_ago = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 'user', 'user_email', 'user_name',
            'dossier', 'dossier_numero', 'dossier_titre',
            'type', 'titre', 'message', 'action_requise',
            'lu', 'created_at', 'time_ago'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_user_name(self, obj):
        if obj.user:
            return obj.user.get_full_name() or obj.user.email
        return None
    
    def get_time_ago(self, obj):
        from django.utils import timezone
        from datetime import timedelta
        
        now = timezone.now()
        diff = now - obj.created_at
        
        if diff < timedelta(minutes=1):
            return "À l'instant"
        elif diff < timedelta(hours=1):
            minutes = int(diff.total_seconds() / 60)
            return f"Il y a {minutes} minute{'s' if minutes > 1 else ''}"
        elif diff < timedelta(days=1):
            hours = int(diff.total_seconds() / 3600)
            return f"Il y a {hours} heure{'s' if hours > 1 else ''}"
        elif diff < timedelta(days=7):
            days = diff.days
            return f"Il y a {days} jour{'s' if days > 1 else ''}"
        else:
            return obj.created_at.strftime('%d/%m/%Y')