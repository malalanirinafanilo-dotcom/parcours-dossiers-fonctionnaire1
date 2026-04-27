# config/settings.py - VERSION COMPLÈTE CORRIGÉE POUR RENDER
import os
from pathlib import Path
from decouple import config
from datetime import timedelta
import dj_database_url

# ==================== BASE DU PROJET ====================
BASE_DIR = Path(__file__).resolve().parent.parent

# ==================== SÉCURITÉ ====================
SECRET_KEY = config('DJANGO_SECRET_KEY', default='django-insecure-key-for-docker')
DEBUG = config('DEBUG', default=False, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1').split(',')

# ==================== APPLICATIONS INSTALLÉES ====================
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'whitenoise.runserver_nostatic',
    
    # Local apps
    'core',
    'workflow',
    'dossiers',
    'api',
]

# ==================== MIDDLEWARE (AVEC WHITENOISE) ====================
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# ==================== ENCODAGES ====================
DEFAULT_CHARSET = 'utf-8'
FILE_CHARSET = 'utf-8'

# ==================== URLS ET TEMPLATES ====================
ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# ==================== BASE DE DONNÉES (Render + Local) ====================
if os.environ.get('DATABASE_URL'):
    # Mode Render (PostgreSQL managé)
    DATABASES = {
        'default': dj_database_url.config(
            default=os.environ.get('DATABASE_URL'),
            conn_max_age=600,
            ssl_require=not DEBUG
        )
    }
else:
    # Mode développement local
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.environ.get('DB_NAME', config('DB_NAME', default='dossiers_db')),
            'USER': os.environ.get('DB_USER', config('DB_USER', default='postgres')),
            'PASSWORD': os.environ.get('DB_PASSWORD', config('DB_PASSWORD', default='postgres')),
            'HOST': os.environ.get('DB_HOST', config('DB_HOST', default='localhost')),
            'PORT': os.environ.get('DB_PORT', config('DB_PORT', default='5432')),
            'OPTIONS': {'client_encoding': 'UTF8'},
        }
    }

# ==================== MODÈLE UTILISATEUR ====================
AUTH_USER_MODEL = 'core.User'

# ==================== VALIDATION MOTS DE PASSE ====================
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ==================== INTERNATIONALISATION ====================
LANGUAGE_CODE = 'fr-fr'
TIME_ZONE = 'Indian/Antananarivo'
USE_I18N = True
USE_TZ = True

# ==================== FICHIERS STATIQUES ET MÉDIAS ====================
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# ==================== SÉCURITÉ ====================
SECURE_CONTENT_TYPE_NOSNIFF = False
X_FRAME_OPTIONS = 'SAMEORIGIN' if not DEBUG else 'ALLOWALL'

# ==================== CLÉ PRIMAIRE ====================
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ==================== REST FRAMEWORK ====================
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
}

# ==================== JWT ====================
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

# ==================== CORS (Développement + Render) ====================
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
]

# Ajouter l'origine Render si configurée
render_frontend = os.environ.get('RENDER_FRONTEND_URL')
if render_frontend:
    CORS_ALLOWED_ORIGINS.append(render_frontend)

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = ['DELETE', 'GET', 'OPTIONS', 'PATCH', 'POST', 'PUT']
CORS_ALLOW_HEADERS = [
    'accept', 'accept-encoding', 'authorization', 'content-type',
    'dnt', 'origin', 'user-agent', 'x-csrftoken', 'x-requested-with',
]

# CSRF Trusted Origins (pour Render)
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
]

if render_frontend:
    CSRF_TRUSTED_ORIGINS.append(render_frontend)

# ==================== REDIS / CELERY ====================
REDIS_URL = os.environ.get('REDIS_URL', config('REDIS_URL', default='redis://localhost:6379/0'))

CELERY_BROKER_URL = REDIS_URL
CELERY_RESULT_BACKEND = REDIS_URL
CELERY_ACCEPT_CONTENT = ['application/json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 30 * 60
CELERY_RESULT_EXPIRES = 60 * 60 * 24

# Reconnexion automatique
CELERY_BROKER_CONNECTION_RETRY_ON_STARTUP = True
CELERY_BROKER_CONNECTION_RETRY = True
CELERY_BROKER_CONNECTION_MAX_RETRIES = 10

# ==================== FILES D'ATTENTE CELERY ====================
CELERY_TASK_QUEUES = {
    'default': {'exchange': 'default', 'routing_key': 'default'},
    'high_priority': {'exchange': 'high_priority', 'routing_key': 'high_priority'},
    'ml_tasks': {'exchange': 'ml_tasks', 'routing_key': 'ml_tasks'},
}
CELERY_TASK_DEFAULT_QUEUE = 'default'

# ==================== TÂCHES PLANIFIÉES ====================
from celery.schedules import crontab

CELERY_BEAT_SCHEDULE = {
    'train-models-daily': {
        'task': 'dossiers.tasks.train_models_task',
        'schedule': crontab(hour=2, minute=0),
        'options': {'queue': 'ml_tasks'},
    },
    'analyze-all-dossiers-weekly': {
        'task': 'dossiers.tasks.analyze_all_dossiers_task',
        'schedule': crontab(day_of_week=1, hour=3, minute=0),
        'options': {'queue': 'ml_tasks'},
    },
    'nettoyage-fichiers-temporaires': {
        'task': 'dossiers.tasks.nettoyer_fichiers_temporaires',
        'schedule': 60 * 60 * 12,
    },
}

# ==================== LOGGING CORRIGÉ POUR RENDER ====================
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': os.path.join(BASE_DIR, 'logs', 'django.log'),
            'formatter': 'verbose',
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],  # ← Utilise uniquement console sur Render
            'level': 'INFO',
            'propagate': True,
        },
        'dossiers': {
            'handlers': ['console'],  # ← Utilise uniquement console sur Render
            'level': 'DEBUG',
            'propagate': True,
        },
    },
}