#!/usr/bin/env bash
set -e  # Arrête le script en cas d'erreur

echo "🚀 Début du build..."

# Installer les dépendances
echo "📦 Installation des dépendances..."
pip install --upgrade pip
pip install -r requirements.txt

# Appliquer les migrations
echo "📊 Application des migrations..."
python manage.py migrate --noinput

# Collecter les fichiers statiques
echo "📁 Collecte des fichiers statiques..."
python manage.py collectstatic --noinput

echo "✅ Build terminé avec succès !"