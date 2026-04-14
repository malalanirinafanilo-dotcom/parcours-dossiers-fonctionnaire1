# dossiers/ml_services/feature_engineering.py
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler, LabelEncoder
from django.utils import timezone
import joblib
from pathlib import Path

class FeatureEngineeringService:
    """
    Service pour créer et normaliser les caractéristiques
    """
    
    def __init__(self):
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.fitted = False
        self.feature_names = [
            'nb_documents',
            'nb_anomalies',
            'score_risque',
            'duree_ecoulee',
            'nb_validations',
            'type_dossier_code',
            'etape_code',
            'mois_depot',
            'jour_semaine'
        ]
    
    def create_features(self, dossier):
        """
        Crée un vecteur de caractéristiques pour un dossier
        """
        features = []
        
        # 1. Caractéristiques numériques
        features.append(dossier.documents.count())  # nb_documents
        features.append(self._get_anomalies_count(dossier))  # nb_anomalies
        features.append(self._get_score_risque(dossier))  # score_risque
        features.append(self._get_duree_ecoulee(dossier))  # duree_ecoulee
        features.append(self._get_nb_validations(dossier))  # nb_validations
        
        # 2. Caractéristiques catégorielles encodées
        type_code = self._encode_type_dossier(dossier.type_dossier)
        etape_code = self._encode_etape(dossier.etape_actuelle)
        
        features.extend([type_code, etape_code])
        
        # 3. Caractéristiques temporelles
        if dossier.date_depot:
            features.append(dossier.date_depot.month)  # mois
            features.append(dossier.date_depot.weekday())  # jour semaine
        else:
            features.append(0)
            features.append(0)
        
        return np.array(features, dtype=np.float32)
    
    def create_features_batch(self, dossiers):
        """
        Crée une matrice de caractéristiques pour plusieurs dossiers
        """
        features_list = []
        
        for dossier in dossiers:
            try:
                features = self.create_features(dossier)
                features_list.append(features)
            except Exception as e:
                print(f"⚠️ Erreur sur dossier {dossier.id}: {e}")
                continue
        
        return np.array(features_list)
    
    def normalize_features(self, features, fit=False):
        """
        Normalise les caractéristiques
        """
        # S'assurer que features est 2D
        if len(features.shape) == 1:
            features = features.reshape(1, -1)
        
        if fit:
            normalized = self.scaler.fit_transform(features)
            self.fitted = True
        else:
            if not self.fitted:
                # Si pas encore entraîné, on retourne les features brutes
                return features
            normalized = self.scaler.transform(features)
        
        return normalized
    
    def _get_anomalies_count(self, dossier):
        """Compte le nombre d'anomalies"""
        analyse = dossier.analyses_ia.order_by('-created_at').first()
        if analyse and analyse.resultats:
            return len(analyse.resultats.get('anomalies', []))
        return 0
    
    def _get_score_risque(self, dossier):
        """Récupère le score de risque"""
        analyse = dossier.analyses_ia.order_by('-created_at').first()
        return analyse.score_risque if analyse else 0
    
    def _get_duree_ecoulee(self, dossier):
        """Calcule la durée écoulée en jours"""
        if dossier.date_cloture:
            return (dossier.date_cloture - dossier.date_depot).days
        return (timezone.now() - dossier.date_depot).days
    
    def _get_nb_validations(self, dossier):
        """Compte le nombre de validations"""
        from dossiers.models import HistoriqueAction
        return HistoriqueAction.objects.filter(
            dossier=dossier,
            action='VALIDATION'
        ).count()
    
    def _encode_type_dossier(self, type_dossier):
        """Encode le type de dossier"""
        types = ['PROMOTION', 'MUTATION', 'CONGE', 'RETRAITE', 'REGULARISATION', 'AUTRE']
        if type_dossier not in types:
            type_dossier = 'AUTRE'
        
        if 'type_dossier' not in self.label_encoders:
            encoder = LabelEncoder()
            encoder.fit(types)
            self.label_encoders['type_dossier'] = encoder
        
        try:
            return self.label_encoders['type_dossier'].transform([type_dossier])[0]
        except:
            return 0
    
    def _encode_etape(self, etape):
        """Encode l'étape"""
        etapes = ['INTERESSE', 'DREN', 'MEN', 'FOP', 'FINANCE', 'TERMINE', 'REJETE']
        if etape not in etapes:
            etape = 'INTERESSE'
        
        if 'etape' not in self.label_encoders:
            encoder = LabelEncoder()
            encoder.fit(etapes)
            self.label_encoders['etape'] = encoder
        
        try:
            return self.label_encoders['etape'].transform([etape])[0]
        except:
            return 0
    
    def save_encoders(self, path):
        """Sauvegarde les encodeurs"""
        import joblib
        joblib.dump({
            'scaler': self.scaler,
            'label_encoders': self.label_encoders,
            'feature_names': self.feature_names
        }, path)
    
    def load_encoders(self, path):
        """Charge les encodeurs"""
        import joblib
        if Path(path).exists():
            data = joblib.load(path)
            self.scaler = data['scaler']
            self.label_encoders = data['label_encoders']
            self.feature_names = data.get('feature_names', self.feature_names)
            self.fitted = True
            return True
        return False