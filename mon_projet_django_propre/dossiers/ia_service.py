# dossiers/ia_service.py
import json
from datetime import datetime
from django.utils import timezone
from .models import Dossier, IAAnalyse, Document
from django.apps import AppConfig

class RuleBasedIA:
    """
    Service d'analyse IA basé sur des règles métier
    """
    
    # Grille indiciaire simplifiée
    GRILLE_INDICIAIRE = {
        'A1': {'min': 150000, 'max': 300000},
        'A2': {'min': 250000, 'max': 450000},
        'B1': {'min': 100000, 'max': 200000},
        'B2': {'min': 180000, 'max': 350000},
        'C1': {'min': 80000, 'max': 150000},
    }
    
    # Documents obligatoires par type de dossier
    DOCUMENTS_OBLIGATOIRES = {
        'PROMOTION': ['diplome.pdf', 'cv.pdf', 'lettre_motivation.pdf'],
        'MUTATION': ['demande_mutation.pdf', 'attestation_service.pdf'],
        'CONGE': ['demande_conge.pdf', 'certificat_medical.pdf'],
        'RETRAITE': ['demande_retraite.pdf', 'releve_carriere.pdf'],
        'DEFAULT': ['piece_identite.pdf', 'formulaire.pdf']
    }
    
    # Signatures obligatoires par étape
    SIGNATURES_OBLIGATOIRES = {
        'INTERESSE': ['signature_interesse'],
        'DREN': ['signature_dren', 'cachet_dren'],
        'MEN': ['signature_men', 'cachet_men'],
        'FOP': ['signature_fop', 'cachet_fop'],
        'FINANCE': ['signature_finance', 'cachet_finance'],
    }
    
    # Champs obligatoires par type de dossier
    CHAMPS_OBLIGATOIRES = {
        'PROMOTION': [
            'nom', 'prenom', 'matricule',
            'grade_actuel', 'grade_demande', 'date_prise_fonction',
            'salaire_base', 'indice'
        ],
        'MUTATION': [
            'nom', 'prenom', 'matricule', 'etablissement_actuel',
            'etablissement_demande', 'motif', 'date_souhaitée'
        ],
        'CONGE': [
            'nom', 'prenom', 'matricule', 'date_debut', 'date_fin',
            'type_conge', 'motif'
        ],
        'RETRAITE': [
            'nom', 'prenom', 'matricule', 'date_naissance',
            'date_entree_fonction', 'date_demande'
        ],
        'DEFAULT': [
            'nom', 'prenom', 'matricule'
        ]
    }

    def __init__(self, dossier):
        self.dossier = dossier
        self.anomalies = []
        self.score = 0
        self.classification = "Conforme"
        self.resultats = {}

    def analyser(self):
        """Point d'entrée principal pour l'analyse"""
        
        # 1. Vérifier les champs obligatoires
        self.verifier_champs_obligatoires()
        
        # 2. Vérifier les cohérences de dates
        self.verifier_coherence_dates()
        
        # 3. Vérifier la cohérence salaire/indice
        self.verifier_coherence_salaire()
        
        # 4. Vérifier les documents obligatoires
        self.verifier_documents()
        
        # 5. Vérifier les signatures obligatoires
        self.verifier_signatures()
        
        # 6. Calculer le score de risque
        self.calculer_score_risque()
        
        # 7. Déterminer la classification
        self.determiner_classification()
        
        # 8. Préparer les résultats
        self.preparer_resultats()
        
        return self.resultats

    def verifier_champs_obligatoires(self):
        """Vérifie que tous les champs obligatoires sont présents"""
        try:
            data = self.dossier.data.data if hasattr(self.dossier, 'data') else {}
            
            # Déterminer le type de dossier
            type_dossier = self.dossier.type_dossier or 'DEFAULT'
            champs_requis = self.CHAMPS_OBLIGATOIRES.get(type_dossier, self.CHAMPS_OBLIGATOIRES['DEFAULT'])
            
            champs_manquants = []
            for champ in champs_requis:
                if champ not in data or not data.get(champ):
                    champs_manquants.append(champ)
            
            if champs_manquants:
                self.anomalies.append({
                    'type': 'champs_manquants',
                    'message': f"Champs obligatoires manquants: {', '.join(champs_manquants)}",
                    'champs': champs_manquants
                })
                
        except Exception as e:
            self.anomalies.append({
                'type': 'erreur_analyse',
                'message': f"Erreur lors de la vérification des champs: {str(e)}"
            })

    def verifier_coherence_dates(self):
        """Vérifie la cohérence des dates"""
        try:
            data = self.dossier.data.data if hasattr(self.dossier, 'data') else {}
            
            # Vérifier date_fin > date_debut
            if 'date_debut' in data and 'date_fin' in data:
                try:
                    date_debut = datetime.fromisoformat(data['date_debut'].replace('Z', '+00:00'))
                    date_fin = datetime.fromisoformat(data['date_fin'].replace('Z', '+00:00'))
                    
                    if date_fin < date_debut:
                        self.anomalies.append({
                            'type': 'incoherence_dates',
                            'message': "La date de fin est antérieure à la date de début",
                            'date_debut': data['date_debut'],
                            'date_fin': data['date_fin']
                        })
                except:
                    pass
                    
        except Exception as e:
            self.anomalies.append({
                'type': 'erreur_analyse',
                'message': f"Erreur lors de la vérification des dates: {str(e)}"
            })

    def verifier_coherence_salaire(self):
        """Vérifie la cohérence entre salaire_base et indice"""
        try:
            data = self.dossier.data.data if hasattr(self.dossier, 'data') else {}
            
            if 'salaire_base' in data and 'indice' in data:
                salaire = float(data['salaire_base'])
                indice = data['indice']
                
                # Vérifier si l'indice existe dans la grille
                if indice in self.GRILLE_INDICIAIRE:
                    min_salaire = self.GRILLE_INDICIAIRE[indice]['min']
                    max_salaire = self.GRILLE_INDICIAIRE[indice]['max']
                    
                    if salaire < min_salaire:
                        self.anomalies.append({
                            'type': 'salaire_trop_bas',
                            'message': f"Salaire ({salaire}) inférieur au minimum pour l'indice {indice} ({min_salaire})",
                            'salaire': salaire,
                            'indice': indice,
                            'min_attendu': min_salaire
                        })
                    elif salaire > max_salaire:
                        self.anomalies.append({
                            'type': 'salaire_trop_haut',
                            'message': f"Salaire ({salaire}) supérieur au maximum pour l'indice {indice} ({max_salaire})",
                            'salaire': salaire,
                            'indice': indice,
                            'max_attendu': max_salaire
                        })
                else:
                    self.anomalies.append({
                        'type': 'indice_inconnu',
                        'message': f"Indice '{indice}' non reconnu dans la grille",
                        'indice': indice
                    })
                    
        except Exception as e:
            self.anomalies.append({
                'type': 'erreur_analyse',
                'message': f"Erreur lors de la vérification salaire/indice: {str(e)}"
            })

    def verifier_documents(self):
        """Vérifie la présence des documents obligatoires"""
        try:
            # Récupérer les documents du dossier
            documents = Document.objects.filter(dossier=self.dossier)
            noms_documents = [doc.nom.lower() for doc in documents]
            
            # Déterminer le type de dossier
            type_dossier = self.dossier.type_dossier or 'DEFAULT'
            docs_requis = self.DOCUMENTS_OBLIGATOIRES.get(type_dossier, self.DOCUMENTS_OBLIGATOIRES['DEFAULT'])
            
            docs_manquants = []
            for doc_requis in docs_requis:
                if not any(doc_requis.lower() in nom_doc for nom_doc in noms_documents):
                    docs_manquants.append(doc_requis)
            
            if docs_manquants:
                self.anomalies.append({
                    'type': 'documents_manquants',
                    'message': f"Documents obligatoires manquants: {', '.join(docs_manquants)}",
                    'documents_manquants': docs_manquants
                })
                
        except Exception as e:
            self.anomalies.append({
                'type': 'erreur_analyse',
                'message': f"Erreur lors de la vérification des documents: {str(e)}"
            })

    def verifier_signatures(self):
        """Vérifie les signatures obligatoires selon l'étape actuelle"""
        try:
            etape = self.dossier.etape_actuelle
            signatures_requises = self.SIGNATURES_OBLIGATOIRES.get(etape, [])
            
            # Récupérer les signatures depuis les métadonnées du dossier
            signatures_presentes = self.dossier.etapes_validation.get(etape, {}).get('signatures', [])
            
            signatures_manquantes = []
            for signature in signatures_requises:
                if signature not in signatures_presentes:
                    signatures_manquantes.append(signature)
            
            if signatures_manquantes:
                self.anomalies.append({
                    'type': 'signatures_manquantes',
                    'message': f"Signatures obligatoires manquantes pour l'étape {etape}: {', '.join(signatures_manquantes)}",
                    'etape': etape,
                    'signatures_manquantes': signatures_manquantes
                })
                
        except Exception as e:
            self.anomalies.append({
                'type': 'erreur_analyse',
                'message': f"Erreur lors de la vérification des signatures: {str(e)}"
            })

    def calculer_score_risque(self):
        """Calcule le score de risque basé sur les anomalies"""
        score = 0
        
        for anomalie in self.anomalies:
            type_anomalie = anomalie['type']
            
            if type_anomalie == 'champs_manquants':
                score += 15 * len(anomalie.get('champs', []))
            elif type_anomalie == 'incoherence_dates':
                score += 30
            elif type_anomalie == 'salaire_trop_bas':
                score += 20
            elif type_anomalie == 'salaire_trop_haut':
                score += 15
            elif type_anomalie == 'indice_inconnu':
                score += 25
            elif type_anomalie == 'documents_manquants':
                score += 10 * len(anomalie.get('documents_manquants', []))
            elif type_anomalie == 'signatures_manquantes':
                score += 5 * len(anomalie.get('signatures_manquantes', []))
        
        self.score = min(score, 100)

    def determiner_classification(self):
        """Détermine la classification du dossier"""
        if self.score == 0:
            self.classification = "Conforme"
        elif self.score < 30:
            self.classification = "A risque faible"
        elif self.score < 60:
            self.classification = "A risque modéré"
        elif self.score < 80:
            self.classification = "A risque élevé"
        else:
            self.classification = "Bloqué"

    def preparer_resultats(self):
        """Prépare les résultats structurés"""
        self.resultats = {
            'score_risque': self.score,
            'classification': self.classification,
            'anomalies': self.anomalies,
            'resume': {
                'total_anomalies': len(self.anomalies),
                'statut': self.classification,
                'niveau_risque': self._get_niveau_risque()
            }
        }
    
    def _get_niveau_risque(self):
        """Retourne le niveau de risque textuel"""
        if self.score < 20:
            return "FAIBLE"
        elif self.score < 50:
            return "MOYEN"
        elif self.score < 80:
            return "ÉLEVÉ"
        else:
            return "CRITIQUE"


def analyse_dossier(dossier_id):
    """
    Fonction principale pour analyser un dossier
    """
    try:
        dossier = Dossier.objects.get(id=dossier_id)
        
        # Créer le service et analyser
        service = RuleBasedIA(dossier)
        resultats = service.analyser()
        
        # Enregistrer dans IAAnalyse avec les nouveaux champs
        ia_analyse, created = IAAnalyse.objects.update_or_create(
            dossier=dossier,
            type_analyse='RULE_BASED',
            defaults={
                'resultats': resultats,
                'score_risque': resultats['score_risque'],
                'classification': resultats['classification']
            }
        )
        
        return {
            'success': True,
            'analyse_id': str(ia_analyse.id),
            'resultats': resultats
        }
        
    except Dossier.DoesNotExist:
        return {
            'success': False,
            'error': f"Dossier {dossier_id} non trouvé"
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }