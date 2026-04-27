#!/bin/bash
echo "🚀 Début du build..."
pip install --upgrade pip
pip install -r requirements.txt
python manage.py migrate --noinput
python manage.py collectstatic --noinput
python bootstrap.py
echo "✅ Build terminé !"