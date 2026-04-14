# test_installation.py
#!/usr/bin/env python
import os
import sys
import django

# Ajouter le chemin du projet
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Initialiser Django
django.setup()

def test_installation():
    print("=" * 60)
    print("🔍 TEST DE L'INSTALLATION")
    print("=" * 60)
    
    # 1. Tester Django
    from django.conf import settings
    print(f"✅ Django - OK")
    print(f"   INSTALLED_APPS: {len(settings.INSTALLED_APPS)} apps")
    
    # 2. Tester djangorestframework
    try:
        import rest_framework
        print(f"✅ Django REST Framework {rest_framework.VERSION} - OK")
    except ImportError as e:
        print(f"❌ Django REST Framework: {e}")
    
    # 3. Tester Pandas
    try:
        import pandas as pd
        print(f"✅ Pandas {pd.__version__} - OK")
    except ImportError as e:
        print(f"❌ Pandas: {e}")
    
    # 4. Vérifier que numpy n'est PAS installé
    try:
        import numpy as np
        print(f"⚠️ NumPy {np.__version__} est installé (mais vous vouliez sans numpy)")
    except ImportError:
        print(f"✅ NumPy n'est PAS installé (conforme à votre demande)")
    
    # 5. Tester scikit-learn
    try:
        import sklearn
        print(f"✅ scikit-learn {sklearn.__version__} - OK")
    except ImportError as e:
        print(f"❌ scikit-learn: {e}")
    
    # 6. Tester Celery
    try:
        from celery import current_app
        print(f"✅ Celery - OK")
    except ImportError as e:
        print(f"❌ Celery: {e}")
    
    # 7. Tester Redis (connexion)
    try:
        import redis
        r = redis.Redis(host='localhost', port=6379, db=0, socket_connect_timeout=2)
        r.ping()
        print(f"✅ Redis - Connecté")
    except Exception as e:
        print(f"❌ Redis: {e}")
    
    # 8. Tester django-workflow
    try:
        import django_workflow
        print(f"✅ django-workflow - OK")
    except ImportError:
        try:
            import viewflow
            print(f"✅ django-viewflow - OK")
        except ImportError:
            print(f"❌ Aucun moteur de workflow installé")
    
    print("=" * 60)

if __name__ == "__main__":
    test_installation()