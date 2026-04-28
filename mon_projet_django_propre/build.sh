#!/bin/bash
# build.sh

# Installer les dépendances
pip install -r requirements.txt

# Collecter les fichiers statiques
python manage.py collectstatic --noinput

# Appliquer les migrations
python manage.py migrate

# Créer les rôles et données de test
python scripts/setup_test_data.py