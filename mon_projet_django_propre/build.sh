#!/bin/bash

echo "🚀 Début du build..."

# Mettre à jour pip
pip install --upgrade pip

# Installer les dépendances
echo "📦 Installation des dépendances..."
pip install -r requirements.txt

# Appliquer les migrations
echo "📊 Application des migrations..."
python manage.py migrate --noinput

# Collecter les fichiers statiques
echo "📁 Collecte des fichiers statiques..."
python manage.py collectstatic --noinput

# ⚠️ CRÉER LES UTILISATEURS AUTOMATIQUEMENT
echo "👤 Création des utilisateurs..."
python bootstrap.py

echo "✅ Build terminé avec succès !"