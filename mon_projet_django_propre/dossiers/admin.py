# dossiers/admin.py
from django.contrib import admin
from .models import Dossier

@admin.register(Dossier)
class DossierAdmin(admin.ModelAdmin):
    list_display = ['titre', 'statut']