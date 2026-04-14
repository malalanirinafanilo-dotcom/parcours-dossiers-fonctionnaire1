# dossiers/ml_services/prediction_service.py
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, accuracy_score, classification_report
from .data_preparation import DataPreparationService
import os
import logging

logger = logging.getLogger(__name__)

class PredictionService:
    """
    Service de prédiction utilisant scikit-learn
    Version sans numpy explicite (scikit-learn l'utilise en interne)
    """
    
    def __init__(self):
        self.model_duree = None
        self.model_rejet = None
        self.feature_cols = None
        self.models_dir = 'ml_models'
        
        # Créer le dossier pour les modèles
        os.makedirs(self.models_dir, exist_ok=True)
    
    def train_models(self, force_retrain=False):
        """
        Entraîne les modèles de prédiction
        """
        model_duree_path = os.path.join(self.models_dir, 'model_duree.pkl')
        model_rejet_path = os.path.join(self.models_dir, 'model_rejet.pkl')
        features_path = os.path.join(self.models_dir, 'feature_cols.pkl')
        
        # Charger les modèles existants si demandé
        if not force_retrain and os.path.exists(model_duree_path) and os.path.exists(model_rejet_path):
            self.load_models()
            logger.info("✅ Modèles chargés depuis le disque")
            return True
        
        logger.info("🧠 Entraînement des modèles ML...")
        
        # Récupérer les données d'entraînement
        X, y_duree, y_rejet, self.feature_cols = DataPreparationService.get_training_data()
        
        if len(X) < 10:
            logger.warning(f"⚠️ Pas assez de données pour l'entraînement ({len(X)} < 10)")
            return False
        
        # Division train/test
        X_train, X_test, y_train_duree, y_test_duree = train_test_split(
            X, y_duree, test_size=0.2, random_state=42
        )
        _, _, y_train_rejet, y_test_rejet = train_test_split(
            X, y_rejet, test_size=0.2, random_state=42
        )
        
        # Modèle pour prédire la durée
        logger.info("   - Entraînement du modèle de durée...")
        self.model_duree = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            n_jobs=-1
        )
        self.model_duree.fit(X_train, y_train_duree)
        
        # Évaluation durée
        y_pred_duree = self.model_duree.predict(X_test)
        mae = mean_absolute_error(y_test_duree, y_pred_duree)
        logger.info(f"   ✅ MAE durée: {mae:.2f} jours")
        
        # Modèle pour prédire le rejet
        logger.info("   - Entraînement du modèle de rejet...")
        self.model_rejet = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            n_jobs=-1
        )
        self.model_rejet.fit(X_train, y_train_rejet)
        
        # Évaluation rejet
        y_pred_rejet = self.model_rejet.predict(X_test)
        accuracy = accuracy_score(y_test_rejet, y_pred_rejet)
        logger.info(f"   ✅ Accuracy rejet: {accuracy:.2%}")
        
        # Rapport détaillé
        logger.info("\n" + classification_report(y_test_rejet, y_pred_rejet))
        
        # Importance des features (version pandas)
        self._log_feature_importance()
        
        # Sauvegarder les modèles
        self.save_models()
        
        return True
    
    def _log_feature_importance(self):
        """Log l'importance des features (sans numpy)"""
        if self.model_duree and self.feature_cols:
            importances = self.model_duree.feature_importances_
            
            # Créer un DataFrame pandas pour trier
            importance_df = pd.DataFrame({
                'feature': self.feature_cols,
                'importance': importances
            }).sort_values('importance', ascending=False)
            
            logger.info("\n📊 Importance des features (durée):")
            for i, row in importance_df.head(10).iterrows():
                logger.info(f"   - {row['feature']}: {row['importance']:.2%}")
    
    def predict_duree(self, dossier):
        """
        Prédit la durée de traitement pour un dossier
        """
        if not self.model_duree:
            self.load_models()
            if not self.model_duree:
                return {'duree_estimee': 0, 'duree_ecoulee': 0, 'unite': 'jours', 'erreur': 'Modèle non entraîné'}
        
        # Préparer les features
        from .data_preparation import DataPreparationService
        features_dict = DataPreparationService.prepare_dossier_features(dossier)
        
        # Créer un DataFrame avec les mêmes colonnes que l'entraînement
        df = pd.DataFrame([features_dict])
        df = pd.get_dummies(df, columns=['type_dossier', 'etape_actuelle', 'code_mouvement'],
                            prefix=['type', 'etape', 'code'])
        
        # S'assurer que toutes les colonnes d'entraînement sont présentes
        for col in self.feature_cols:
            if col not in df.columns:
                df[col] = 0
        
        # Garder seulement les colonnes d'entraînement dans le bon ordre
        X = df[self.feature_cols]
        
        # Prédire
        duree_pred = self.model_duree.predict(X)[0]
        
        from django.utils import timezone
        return {
            'duree_estimee': round(float(duree_pred), 1),
            'duree_ecoulee': (timezone.now() - dossier.date_depot).days,
            'unite': 'jours'
        }
    
    def predict_rejet(self, dossier):
        """
        Prédit la probabilité de rejet pour un dossier
        """
        if not self.model_rejet:
            self.load_models()
            if not self.model_rejet:
                return {'probabilite_rejet': 0, 'niveau_risque': 'Inconnu', 'est_rejete_pred': False}
        
        # Préparer les features
        from .data_preparation import DataPreparationService
        features_dict = DataPreparationService.prepare_dossier_features(dossier)
        
        # Créer un DataFrame
        df = pd.DataFrame([features_dict])
        df = pd.get_dummies(df, columns=['type_dossier', 'etape_actuelle', 'code_mouvement'],
                            prefix=['type', 'etape', 'code'])
        
        # Aligner les colonnes
        for col in self.feature_cols:
            if col not in df.columns:
                df[col] = 0
        X = df[self.feature_cols]
        
        # Prédire
        proba = self.model_rejet.predict_proba(X)[0]
        proba_rejet = proba[1] if len(proba) > 1 else 0
        
        niveau = 'Faible'
        if proba_rejet > 0.7:
            niveau = 'Élevé'
        elif proba_rejet > 0.3:
            niveau = 'Moyen'
        
        return {
            'probabilite_rejet': round(float(proba_rejet * 100), 1),
            'niveau_risque': niveau,
            'est_rejete_pred': bool(self.model_rejet.predict(X)[0] == 1)
        }
    
    def analyse_complete(self, dossier):
        """
        Analyse complète d'un dossier (durée + rejet)
        """
        pred_duree = self.predict_duree(dossier)
        pred_rejet = self.predict_rejet(dossier)
        
        return {
            'dossier_id': str(dossier.id),
            'numero_dossier': dossier.numero_dossier,
            'predictions': {
                'duree': pred_duree,
                'rejet': pred_rejet
            }
        }
    
    def save_models(self):
        """Sauvegarde les modèles sur le disque"""
        if self.model_duree:
            joblib.dump(self.model_duree, os.path.join(self.models_dir, 'model_duree.pkl'))
        if self.model_rejet:
            joblib.dump(self.model_rejet, os.path.join(self.models_dir, 'model_rejet.pkl'))
        if self.feature_cols:
            joblib.dump(self.feature_cols, os.path.join(self.models_dir, 'feature_cols.pkl'))
        logger.info(f"💾 Modèles sauvegardés dans {self.models_dir}/")
    
    def load_models(self):
        """Charge les modèles depuis le disque"""
        model_duree_path = os.path.join(self.models_dir, 'model_duree.pkl')
        model_rejet_path = os.path.join(self.models_dir, 'model_rejet.pkl')
        features_path = os.path.join(self.models_dir, 'feature_cols.pkl')
        
        if os.path.exists(model_duree_path):
            self.model_duree = joblib.load(model_duree_path)
        if os.path.exists(model_rejet_path):
            self.model_rejet = joblib.load(model_rejet_path)
        if os.path.exists(features_path):
            self.feature_cols = joblib.load(features_path)
        
        logger.info("📦 Modèles chargés")
        return self.model_duree is not None

# Instance singleton
prediction_service = PredictionService()