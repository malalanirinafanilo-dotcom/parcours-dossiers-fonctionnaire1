# dossiers/ml_service.py
import os
import joblib
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from django.utils import timezone
from django.db.models import Count, Q
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, mean_absolute_error
from sklearn.preprocessing import LabelEncoder
from .models import Dossier, IAAnalyse, HistoriqueAction
import pickle
import logging

logger = logging.getLogger(__name__)

class PredictiveMLService:
    """
    Service de prédiction basé sur Machine Learning
    """
    
    def __init__(self):
        self.model_classifier = None
        self.model_regressor = None
        self.label_encoders = {}
        self.feature_columns = [
            'nb_anomalies',
            'score_risque',
            'etape_code',
            'type_dossier_code',
            'nb_blocages',
            'nb_documents_manquants',
            'duree_cours_jours',
            'nb_validations'
        ]
        
        # Chemins des modèles
        self.model_dir = 'ml_models'
        self.classifier_path = os.path.join(self.model_dir, 'statut_classifier.pkl')
        self.regressor_path = os.path.join(self.model_dir, 'delai_regressor.pkl')
        self.encoders_path = os.path.join(self.model_dir, 'label_encoders.pkl')
        
        # Créer le dossier si nécessaire
        os.makedirs(self.model_dir, exist_ok=True)
    
    def prepare_training_data(self):
        """
        Prépare les données d'entraînement à partir des dossiers existants
        """
        print("📊 Préparation des données d'entraînement...")
        
        # Récupérer tous les dossiers avec leurs analyses
        dossiers = Dossier.objects.all()
        
        data = []
        targets_statut = []
        targets_delai = []
        
        for dossier in dossiers:
            try:
                # Récupérer la dernière analyse IA
                derniere_analyse = dossier.analyses_ia.filter(
                    type_analyse='RULE_BASED'
                ).first()
                
                if not derniere_analyse:
                    continue  # Ignorer les dossiers sans analyse
                
                # Compter les blocages dans l'historique
                nb_blocages = HistoriqueAction.objects.filter(
                    dossier=dossier,
                    action='BLOQUE'
                ).count()
                
                # Compter les documents
                nb_documents = dossier.documents.count()
                
                # Calculer la durée de traitement
                if hasattr(dossier, 'date_cloture') and dossier.date_cloture:
                    duree = (dossier.date_cloture - dossier.date_depot).days
                else:
                    duree = (timezone.now() - dossier.date_depot).days
                
                # Compter les validations
                nb_validations = len(dossier.etapes_validation) if dossier.etapes_validation else 0
                
                # Extraire les anomalies
                anomalies = derniere_analyse.resultats.get('anomalies', []) if derniere_analyse.resultats else []
                
                # Features
                features = {
                    'nb_anomalies': len(anomalies),
                    'score_risque': derniere_analyse.score_risque or 0,
                    'etape_code': self._encode_etape(dossier.etape_actuelle),
                    'type_dossier_code': self._encode_type_dossier(dossier.type_dossier),
                    'nb_blocages': nb_blocages,
                    'nb_documents_manquants': max(0, 5 - nb_documents),
                    'duree_cours_jours': duree,
                    'nb_validations': nb_validations
                }
                
                data.append(features)
                
                # Target pour classification (statut final)
                statut_target = self._encode_statut_final(dossier.statut)
                targets_statut.append(statut_target)
                
                # Target pour régression (délai de traitement)
                if hasattr(dossier, 'date_cloture') and dossier.date_cloture:
                    delai = (dossier.date_cloture - dossier.date_depot).days
                    targets_delai.append(delai)
                    
            except Exception as e:
                print(f"⚠️ Erreur avec dossier {dossier.id}: {e}")
                continue
        
        # Créer le DataFrame
        if not data:
            print("❌ Aucune donnée valide trouvée")
            return pd.DataFrame(), [], pd.DataFrame(), []
        
        df = pd.DataFrame(data)
        
        # Filtrer les lignes avec des valeurs manquantes pour la régression
        valid_indices = [i for i, d in enumerate(targets_delai) if d is not None]
        
        df_classif = df
        df_reg = df.iloc[valid_indices] if valid_indices else pd.DataFrame()
        targets_delai_clean = [targets_delai[i] for i in valid_indices] if valid_indices else []
        
        print(f"✅ Données préparées: {len(df)} dossiers")
        print(f"   - Classification: {len(df_classif)} échantillons")
        print(f"   - Régression: {len(df_reg)} échantillons")
        
        return df_classif, targets_statut, df_reg, targets_delai_clean
    
    def _encode_etape(self, etape):
        """Encode l'étape en valeur numérique"""
        etapes = ['INTERESSE', 'DREN', 'MEN', 'FOP', 'FINANCE', 'TERMINE', 'REJETE']
        
        if etape not in etapes:
            etape = 'INTERESSE'
        
        if 'etape' not in self.label_encoders:
            encoder = LabelEncoder()
            encoder.fit(etapes)
            self.label_encoders['etape'] = encoder
        
        return self.label_encoders['etape'].transform([etape])[0]
    
    def _encode_type_dossier(self, type_dossier):
        """Encode le type de dossier"""
        types = ['PROMOTION', 'MUTATION', 'CONGE', 'RETRAITE', 'AUTRE']
        
        if type_dossier not in types:
            type_dossier = 'AUTRE'
        
        if 'type_dossier' not in self.label_encoders:
            encoder = LabelEncoder()
            encoder.fit(types)
            self.label_encoders['type_dossier'] = encoder
        
        return self.label_encoders['type_dossier'].transform([type_dossier])[0]
    
    def _encode_statut_final(self, statut):
        """Encode le statut final pour la classification"""
        statuts = ['TERMINE', 'REJETE', 'EN_COURS', 'BLOQUE']
        
        if statut not in statuts:
            statut = 'EN_COURS'
        
        if 'statut' not in self.label_encoders:
            encoder = LabelEncoder()
            encoder.fit(statuts)
            self.label_encoders['statut'] = encoder
        
        return self.label_encoders['statut'].transform([statut])[0]
    
    def train_models(self, force_retrain=False):
        """
        Entraîne les modèles de ML
        """
        if not force_retrain and os.path.exists(self.classifier_path) and os.path.exists(self.regressor_path):
            print("📦 Chargement des modèles existants...")
            self.load_models()
            return True
        
        print("🧠 Entraînement des modèles ML...")
        
        X_classif, y_classif, X_reg, y_reg = self.prepare_training_data()
        
        if len(X_classif) < 10:
            print(f"⚠️ Pas assez de données pour l'entraînement ({len(X_classif)} < 10)")
            return False
        
        # 1. Modèle de classification
        print("   - Entraînement du classificateur...")
        X_train, X_test, y_train, y_test = train_test_split(
            X_classif, y_classif, test_size=0.2, random_state=42
        )
        
        self.model_classifier = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        self.model_classifier.fit(X_train, y_train)
        
        y_pred = self.model_classifier.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        print(f"   ✅ Précision: {accuracy:.2%}")
        
        # 2. Modèle de régression
        if len(X_reg) > 5:
            print("   - Entraînement du régresseur...")
            X_train_r, X_test_r, y_train_r, y_test_r = train_test_split(
                X_reg, y_reg, test_size=0.2, random_state=42
            )
            
            self.model_regressor = RandomForestRegressor(
                n_estimators=100,
                max_depth=10,
                random_state=42
            )
            self.model_regressor.fit(X_train_r, y_train_r)
            
            y_pred_r = self.model_regressor.predict(X_test_r)
            mae = mean_absolute_error(y_test_r, y_pred_r)
            print(f"   ✅ Erreur moyenne: {mae:.2f} jours")
        
        self.save_models()
        self._show_feature_importance()
        
        return True
    
    def _show_feature_importance(self):
        """Affiche l'importance des features"""
        if self.model_classifier:
            importances = self.model_classifier.feature_importances_
            print("\n📊 Importance des features:")
            for name, importance in sorted(zip(self.feature_columns, importances), 
                                          key=lambda x: x[1], reverse=True):
                print(f"   - {name}: {importance:.2%}")
    
    def predict_statut(self, dossier):
        """Prédit le statut final d'un dossier"""
        if not self.model_classifier:
            self.load_models()
            if not self.model_classifier:
                return None
        
        features = self._extract_features(dossier)
        prediction = self.model_classifier.predict([features])[0]
        probabilities = self.model_classifier.predict_proba([features])[0]
        
        statut_pred = self.label_encoders['statut'].inverse_transform([prediction])[0]
        confiance = max(probabilities)
        
        return {
            'statut_pred': statut_pred,
            'confiance': confiance,
            'probabilites': {
                statut: prob 
                for statut, prob in zip(
                    self.label_encoders['statut'].classes_, 
                    probabilities
                )
            }
        }
    
    def predict_delai(self, dossier):
        """Prédit le délai de traitement restant (version corrigée sans négatifs)"""
        if not self.model_regressor:
            self.load_models()
            if not self.model_regressor:
                return None
        
        features = self._extract_features(dossier)
        delai_pred = self.model_regressor.predict([features])[0]
        duree_ecoulee = (timezone.now() - dossier.date_depot).days
        delai_restant = max(0, delai_pred - duree_ecoulee)  # Protection anti-négatif
        
        return {
            'delai_total_estime': round(max(1, delai_pred), 1),  # Protection (minimum 1 jour)
            'delai_ecoule': duree_ecoulee,
            'delai_restant_estime': round(delai_restant, 1),
            'unite': 'jours'
        }
    
    def _extract_features(self, dossier):
        """Extrait les features d'un dossier"""
        try:
            derniere_analyse = dossier.analyses_ia.filter(type_analyse='RULE_BASED').first()
            
            nb_blocages = HistoriqueAction.objects.filter(
                dossier=dossier,
                action='BLOQUE'
            ).count()
            
            nb_documents = dossier.documents.count()
            nb_validations = len(dossier.etapes_validation) if dossier.etapes_validation else 0
            duree_cours = (timezone.now() - dossier.date_depot).days
            anomalies = derniere_analyse.resultats.get('anomalies', []) if derniere_analyse and derniere_analyse.resultats else []
            
            features = [
                len(anomalies),
                derniere_analyse.score_risque if derniere_analyse else 0,
                self._encode_etape(dossier.etape_actuelle),
                self._encode_type_dossier(dossier.type_dossier),
                nb_blocages,
                max(0, 5 - nb_documents),
                duree_cours,
                nb_validations
            ]
            
            return features
            
        except Exception as e:
            logger.error(f"Erreur extraction features: {e}")
            return [0] * len(self.feature_columns)
    
    def save_models(self):
        """Sauvegarde les modèles"""
        try:
            with open(self.classifier_path, 'wb') as f:
                pickle.dump(self.model_classifier, f)
            with open(self.regressor_path, 'wb') as f:
                pickle.dump(self.model_regressor, f)
            with open(self.encoders_path, 'wb') as f:
                pickle.dump(self.label_encoders, f)
            print(f"💾 Modèles sauvegardés")
        except Exception as e:
            logger.error(f"Erreur sauvegarde: {e}")
    
    def load_models(self):
        """Charge les modèles"""
        try:
            if os.path.exists(self.classifier_path):
                with open(self.classifier_path, 'rb') as f:
                    self.model_classifier = pickle.load(f)
            if os.path.exists(self.regressor_path):
                with open(self.regressor_path, 'rb') as f:
                    self.model_regressor = pickle.load(f)
            if os.path.exists(self.encoders_path):
                with open(self.encoders_path, 'rb') as f:
                    self.label_encoders = pickle.load(f)
            print("📦 Modèles chargés")
            return True
        except Exception as e:
            logger.error(f"Erreur chargement: {e}")
            return False


# Instance singleton à exporter
ml_service = PredictiveMLService()