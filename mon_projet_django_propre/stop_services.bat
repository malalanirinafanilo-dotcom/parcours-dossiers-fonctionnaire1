@echo off
echo Arrêt des services...

:: Arrêter Celery et Redis
taskkill /F /IM python.exe >nul 2>&1
taskkill /F /IM redis-server.exe >nul 2>&1

echo ✅ Services arrêtés
pause