# core/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Role, User

@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ['name', 'code']

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['email', 'username', 'role']
    fieldsets = UserAdmin.fieldsets + (
        ('Informations supplémentaires', {'fields': ('role', 'phone_number')}),
    )