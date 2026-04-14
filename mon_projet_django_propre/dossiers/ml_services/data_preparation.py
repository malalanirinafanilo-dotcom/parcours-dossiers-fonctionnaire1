# dossiers/ml_services/data_preparation.py
import pandas as pd
from django.utils import timezone
from ..models import Dossier, IAAnalyse
import logging

logger = logging.getLogger(__name__)

class DataPreparationService:
    """
    Service de préparation des données pour le ML
    Version utilisant uniquement Pandas (sans numpy explicite)
    """
    
    @staticmethod
    def prepare_dossier_features(dossier):
        """
        Prépare les features pour un dossier unique
        """
        features = {
            'dossier_id': str(dossier.id),
            'numero_dossier': dossier.numero_dossier,
            'type_dossier': dossier.type_dossier,
            'code_mouvement': dossier.code_mouvement or '00',
            'etape_actuelle': dossier.etape_actuelle,
            'statut': dossier.statut,
            
            # Features numériques
            'nb_documents': dossier.documents.count(),
            'nb_validations': len(dossier.etapes_validation) if dossier.etapes_validation else 0,
            'duree_ecoulee': (timezone.now() - dossier.date_depot).days,
            
            # Score IA existant
            'score_ia': dossier.analyses_ia.filter(type_analyse='RULE_BASED').first().score_risque if dossier.analyses_ia.exists() else 0,
            
            # Métadonnées
            'est_rejete': 1 if dossier.motif_rejet else 0,
            'est_termine': 1 if dossier.statut == 'TERMINE' else 0,
        }
        
        # Calculer la durée si le dossier est terminé
        if dossier.date_cloture:
            features['duree_totale'] = (dossier.date_cloture - dossier.date_depot).days
        else:
            features['duree_totale'] = None
        
        return features
    
    @staticmethod
    def prepare_batch_features(dossiers):
        """
        Prépare les features pour plusieurs dossiers
        Retourne un DataFrame pandas
        """
        features_list = []
        for dossier in dossiers:
            try:
                features = DataPreparationService.prepare_dossier_features(dossier)
                features_list.append(features)
            except Exception as e:
                logger.error(f"Erreur préparation dossier {dossier.id}: {e}")
                continue
        
        # Créer le DataFrame
        df = pd.DataFrame(features_list)
        
        # Encoder les variables catégorielles
        df = pd.get_dummies(df, columns=['type_dossier', 'etape_actuelle', 'code_mouvement'], 
                            prefix=['type', 'etape', 'code'])
        
        logger.info(f"✅ DataFrame préparé: {df.shape[0]} lignes, {df.shape[1]} colonnes")
        return df
    
    @staticmethod
    def get_training_data():
        """
        Récupère les données d'entraînement (dossiers terminés)
        """
        dossiers = Dossier.objects.filter(statut='TERMINE')
        df = DataPreparationService.prepare_batch_features(dossiers)
        
        # Supprimer les lignes avec duree_totale manquante
        df = df.dropna(subset=['duree_totale'])
        
        # Features (X) et target (y)
        feature_cols = [col for col in df.columns if col not in ['dossier_id', 'numero_dossier', 'statut', 'duree_totale', 'est_rejete', 'est_termine']]
        X = df[feature_cols]
        y_duree = df['duree_totale']
        y_rejet = df['est_rejete']
        
        return X, y_duree, y_rejet, feature_cols
    
    @staticmethod
    def get_summary_statistics():
        """
        Génère des statistiques récapitulatives
        """
        dossiers = Dossier.objects.all()
        df = DataPreparationService.prepare_batch_features(dossiers)
        
        stats = {
            'total_dossiers': len(df),
            'statuts': df['statut'].value_counts().to_dict(),
            'etapes': df.filter(like='etape_').sum().to_dict(),
            'types': df.filter(like='type_').sum().to_dict(),
            'moyenne_documents': float(df['nb_documents'].mean()),
            'moyenne_validations': float(df['nb_validations'].mean()),
            'moyenne_score_ia': float(df['score_ia'].mean()) if 'score_ia' in df.columns else 0,
        }
        
        return stats