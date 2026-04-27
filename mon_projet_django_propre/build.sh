#!/bin/bash

echo "🚀 Début du build..."

# Mettre à jour pip
pip install --upgrade pip

# Installer les dépendances
pip install -r requirements.txt

# Appliquer les migrations
python manage.py migrate --noinput

# Collecter les fichiers statiques
python manage.py collectstatic --noinput

# ⚠️ CRÉER LES COMPTES UTILISATEURS
python bootstrap.py

echo "✅ Build terminé !"