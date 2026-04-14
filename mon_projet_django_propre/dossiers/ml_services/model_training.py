# dossiers/ml_services/model_training.py
import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, accuracy_score, mean_absolute_error, r2_score
import os
from pathlib import Path

from .data_preparation import DataPreparationService
from .feature_engineering import FeatureEngineeringService

class ModelTrainingService:
    """
    Service pour entraîner les modèles de ML
    """
    
    def __init__(self):
        self.BASE_DIR = Path(__file__).resolve().parent.parent
        self.MODELS_DIR = self.BASE_DIR / 'ml_models'
        self.MODELS_DIR.mkdir(exist_ok=True)
        
        self.classifier = None
        self.regressor = None
        self.feature_service = FeatureEngineeringService()
        
        # Configuration des modèles
        self.classifier_config = {
            'n_estimators': 100,
            'max_depth': 10,
            'min_samples_split': 5,
            'min_samples_leaf': 2,
            'random_state': 42,
            'n_jobs': -1
        }
        
        self.regressor_config = {
            'n_estimators': 100,
            'max_depth': 8,
            'min_samples_split': 5,
            'min_samples_leaf': 2,
            'random_state': 42,
            'n_jobs': -1
        }
        
        # Chemins des modèles
        self.classifier_path = self.MODELS_DIR / 'statut_classifier.pkl'
        self.regressor_path = self.MODELS_DIR / 'delai_regressor.pkl'
        self.encoders_path = self.MODELS_DIR / 'encoders.pkl'
    
    def train_classifier(self, force_retrain=False):
        """
        Entraîne le classificateur de statut
        """
        if not force_retrain and self.classifier_path.exists():
            print("📦 Chargement du classificateur existant...")
            self.classifier = joblib.load(self.classifier_path)
            return True
        
        print("🧠 Entraînement du classificateur de statut...")
        
        # 1. Préparer les données
        from dossiers.models import Dossier
        dossiers = Dossier.objects.all()
        
        if dossiers.count() < 30:
            print(f"⚠️ Pas assez de données ({dossiers.count()} < 30)")
            return False
        
        X = []
        y = []
        
        for dossier in dossiers:
            try:
                features = self.feature_service.create_features(dossier)
                X.append(features)
                
                # Cible: statut simplifié
                if dossier.statut == 'TERMINE':
                    y.append(2)  # Terminé
                elif dossier.motif_rejet:
                    y.append(0)  # Rejeté
                else:
                    y.append(1)  # En cours
            except Exception as e:
                print(f"⚠️ Erreur: {e}")
                continue
        
        if len(X) < 30:
            print(f"⚠️ Pas assez d'échantillons valides ({len(X)} < 30)")
            return False
        
        X = np.array(X)
        y = np.array(y)
        
        # 3. Normaliser
        X_normalized = self.feature_service.normalize_features(X, fit=True)
        
        # 4. Split entraînement/test
        X_train, X_test, y_train, y_test = train_test_split(
            X_normalized, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # 5. Entraîner
        self.classifier = RandomForestClassifier(**self.classifier_config)
        self.classifier.fit(X_train, y_train)
        
        # 6. Évaluer
        y_pred = self.classifier.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        
        print(f"✅ Précision du modèle: {accuracy:.2%}")
        
        # 7. Importance des features
        feature_importance = pd.DataFrame({
            'feature': self.feature_service.feature_names[:X.shape[1]],
            'importance': self.classifier.feature_importances_[:X.shape[1]]
        }).sort_values('importance', ascending=False)
        
        print("\n🔍 Top 5 features importantes:")
        print(feature_importance.head(5).to_string(index=False))
        
        # 8. Sauvegarder
        joblib.dump(self.classifier, self.classifier_path)
        self.feature_service.save_encoders(self.encoders_path)
        
        print(f"💾 Modèle sauvegardé dans {self.classifier_path}")
        
        return True
    
    def train_regressor(self, force_retrain=False):
        """
        Entraîne le régresseur de délai
        """
        if not force_retrain and self.regressor_path.exists():
            print("📦 Chargement du régresseur existant...")
            self.regressor = joblib.load(self.regressor_path)
            return True
        
        print("🧠 Entraînement du régresseur de délai...")
        
        # 1. Préparer les données
        from dossiers.models import Dossier
        dossiers = Dossier.objects.filter(date_cloture__isnull=False)
        
        if dossiers.count() < 20:
            print(f"⚠️ Pas assez de dossiers terminés ({dossiers.count()} < 20)")
            return False
        
        X = []
        y = []
        
        for dossier in dossiers:
            try:
                features = self.feature_service.create_features(dossier)
                X.append(features)
                
                # Cible: durée de traitement en jours
                duree = (dossier.date_cloture - dossier.date_depot).days
                y.append(max(1, duree))  # Éviter les durées nulles
            except Exception as e:
                print(f"⚠️ Erreur: {e}")
                continue
        
        if len(X) < 20:
            print(f"⚠️ Pas assez d'échantillons valides ({len(X)} < 20)")
            return False
        
        X = np.array(X)
        y = np.array(y)
        
        # 2. Normaliser
        X_normalized = self.feature_service.normalize_features(X, fit=not self.feature_service.fitted)
        
        # 3. Split
        X_train, X_test, y_train, y_test = train_test_split(
            X_normalized, y, test_size=0.2, random_state=42
        )
        
        # 4. Entraîner
        self.regressor = RandomForestRegressor(**self.regressor_config)
        self.regressor.fit(X_train, y_train)
        
        # 5. Évaluer
        y_pred = self.regressor.predict(X_test)
        mae = mean_absolute_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        
        print(f"✅ Erreur moyenne absolue: {mae:.2f} jours")
        print(f"✅ R² score: {r2:.3f}")
        
        # 6. Sauvegarder
        joblib.dump(self.regressor, self.regressor_path)
        
        return True
    
    def train_all(self, force_retrain=False):
        """
        Entraîne tous les modèles
        """
        print("=" * 50)
        print("🧠 ENTRAÎNEMENT DE TOUS LES MODÈLES ML")
        print("=" * 50)
        
        # Charger les encodeurs existants si disponibles
        if self.encoders_path.exists():
            self.feature_service.load_encoders(self.encoders_path)
        
        classifier_ok = self.train_classifier(force_retrain)
        regressor_ok = self.train_regressor(force_retrain)
        
        print("\n" + "=" * 50)
        if classifier_ok and regressor_ok:
            print("✅ TOUS LES MODÈLES ONT ÉTÉ ENTRAÎNÉS AVEC SUCCÈS")
        elif classifier_ok:
            print("⚠️ Seul le classificateur a été entraîné")
        elif regressor_ok:
            print("⚠️ Seul le régresseur a été entraîné")
        else:
            print("❌ AUCUN MODÈLE N'A PU ÊTRE ENTRAÎNÉ")
        print("=" * 50)
        
        return classifier_ok or regressor_ok