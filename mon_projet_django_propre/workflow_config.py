# workflow_config.py
from django_workflow.models import Workflow, State, Transition

def create_default_workflow():
    """
    Crée le workflow par défaut pour les dossiers
    """
    # Créer le workflow
    workflow, created = Workflow.objects.get_or_create(
        name="Parcours Fonctionnaire",
        code="PARCOURS_STANDARD",
        defaults={
            'description': "Circuit de validation standard: Intéressé → DREN → MEN → FOP → FINANCE",
            'is_active': True
        }
    )
    
    if not created:
        return workflow
    
    # Créer les états
    states = {}
    for etape_code, etape_nom in [
        ('INTERESSE', 'Intéressé'),
        ('DREN', 'Direction Régionale'),
        ('MEN', 'Ministère Éducation'),
        ('FOP', 'Formation Professionnelle'),
        ('FINANCE', 'Finance'),
        ('TERMINE', 'Terminé'),
        ('REJETE', 'Rejeté')
    ]:
        state, _ = State.objects.get_or_create(
            workflow=workflow,
            code=etape_code,
            defaults={'name': etape_nom}
        )
        states[etape_code] = state
    
    # Créer les transitions
    transitions = [
        ('INTERESSE', 'DREN', 'documents_complets'),
        ('DREN', 'MEN', 'validation_dren'),
        ('MEN', 'FOP', 'validation_men'),
        ('FOP', 'FINANCE', 'validation_fop'),
        ('FINANCE', 'TERMINE', 'validation_finance'),
        ('INTERESSE', 'REJETE', 'rejet_interesse'),
        ('DREN', 'REJETE', 'rejet_dren'),
        ('MEN', 'REJETE', 'rejet_men'),
        ('FOP', 'REJETE', 'rejet_fop'),
        ('FINANCE', 'REJETE', 'rejet_finance'),
    ]
    
    for from_code, to_code, name in transitions:
        Transition.objects.get_or_create(
            workflow=workflow,
            from_state=states[from_code],
            to_state=states[to_code],
            defaults={'name': name}
        )
    
    print(f"✅ Workflow créé: {workflow.name}")
    return workflow