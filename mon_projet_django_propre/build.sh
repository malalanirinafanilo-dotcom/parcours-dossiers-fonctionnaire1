#!/bin/bash
echo "🚀 Installation des dépendances Python..."
pip install --upgrade pip
pip install -r requirements.txt

echo "🚀 Application des migrations..."
python manage.py migrate --noinput

echo "🚀 Collecte des fichiers statiques..."
python manage.py collectstatic --noinput

echo "✅ Build terminé avec succès !"