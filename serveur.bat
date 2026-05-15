@echo off
title SERVEUR - Gestion Dossiers
color 0A
echo ========================================
echo   LANCEMENT DU SERVEUR
echo ========================================
echo.

:: Lancer PowerShell avec le script
powershell -ExecutionPolicy Bypass -File "E:\mon-projet-final\start_server.ps1"

pause