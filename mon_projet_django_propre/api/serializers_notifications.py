# api/serializers.py
from core.models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    dossier_numero = serializers.CharField(source='dossier.numero_dossier', read_only=True)
    dossier_titre = serializers.CharField(source='dossier.titre', read_only=True)
    
    class Meta:
        model = Notification
        fields = ['id', 'user', 'dossier', 'dossier_numero', 'dossier_titre', 
                  'type', 'titre', 'message', 'action_requise', 'lu', 'created_at']
        read_only_fields = ['id', 'created_at']

class NotificationSerializer(serializers.ModelSerializer):
    dossier_numero = serializers.CharField(source='dossier.numero_dossier', read_only=True)
    dossier_titre = serializers.CharField(source='dossier.titre', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = ['id', 'user', 'user_email', 'user_name', 'dossier', 'dossier_numero', 'dossier_titre', 
                  'type', 'titre', 'message', 'action_requise', 'lu', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_user_name(self, obj):
        if obj.user:
            return obj.user.get_full_name()
        return None