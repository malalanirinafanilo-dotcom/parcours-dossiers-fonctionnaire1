# config/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse

def home_view(request):
    """Page d'accueil de l'API"""
    return HttpResponse("""
    <!DOCTYPE html>
    <html>
    <head>
        <title>API Gestion Dossiers MEN</title>
        <meta charset="UTF-8">
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                text-align: center;
                margin-top: 50px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                min-height: 100vh;
            }
            .container {
                background: rgba(255,255,255,0.1);
                backdrop-filter: blur(10px);
                border-radius: 20px;
                padding: 30px;
                margin: 20px auto;
                max-width: 600px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            }
            h1 { margin-bottom: 10px; }
            a {
                color: #ffd700;
                text-decoration: none;
            }
            a:hover { text-decoration: underline; }
            ul { text-align: left; display: inline-block; }
            li { margin: 10px 0; }
            hr { margin: 20px 0; border-color: rgba(255,255,255,0.2); }
            .status {
                display: inline-block;
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: #4ade80;
                margin-right: 8px;
                animation: pulse 2s infinite;
            }
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>📁 API Gestion Dossiers MEN</h1>
            <p>Bienvenue sur l'API backend de la plateforme</p>
            <p>
                <span class="status"></span>
                <strong>Statut:</strong> En ligne
            </p>
            <hr>
            <h3>📌 Endpoints disponibles:</h3>
            <ul>
                <li><a href="/api/">🔗 /api/</a> - API Root</li>
                <li><a href="/api/auth/login/">🔐 /api/auth/login/</a> - Connexion</li>
                <li><a href="/api/dossiers/">📄 /api/dossiers/</a> - Dossiers</a></li>
                <li><a href="/api/users/me/">👤 /api/users/me/</a> - Mon profil</a></li>
                <li><a href="/admin/">⚙️ /admin/</a> - Administration</a></li>
            </ul>
            <hr>
            <p>
                🚀 <strong>Frontend React:</strong> 
                <a href="http://localhost:3000">http://localhost:3000</a>
            </p>
            <p style="font-size: 12px; opacity: 0.8;">
                Version 1.0.0 | © 2024 - Ministère de l'Éducation Nationale - Madagascar
            </p>
        </div>
    </body>
    </html>
    """)

urlpatterns = [
    path('', home_view, name='home'),
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]

# ⚠️ CES LIGNES SONT ESSENTIELLES POUR SERVIR LES FICHIERS MÉDIAS
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)