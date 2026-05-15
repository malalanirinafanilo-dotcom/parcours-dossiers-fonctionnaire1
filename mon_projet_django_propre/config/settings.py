
import os
from pathlib import Path
from decouple import config
from datetime import timedelta
import dj_database_url
from celery.schedules import crontab

# ==================== BASE DU PROJET ====================
BASE_DIR = Path(__file__).resolve().parent.parent

# ==================== SÉCURITÉ ====================
SECRET_KEY = config('DJANGO_SECRET_KEY', default='django-insecure-key-for-development')
DEBUG = config('DEBUG', default=True, cast=bool)

# ==================== ALLOWED HOSTS ====================
if DEBUG:
    ALLOWED_HOSTS = [
        'localhost',
        '127.0.0.1',
        '192.168.0.111',      # Votre IP serveur
        '192.168.0.*',         # Toute la plage réseau local
        '192.168.1.*',
        '172.*.*.*',
        '.local',
        '*',
    ]
else:
    ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1,.onrender.com').split(',')

# ==================== APPLICATIONS INSTALLÉES ====================
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'whitenoise.runserver_nostatic',
    'sslserver',
    
    'core',
    'workflow',
    'dossiers',
    'api',
]

# ==================== MIDDLEWARE ====================
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

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

# ==================== BASE DE DONNÉES ====================
if os.environ.get('DATABASE_URL'):
    DATABASES = {
        'default': dj_database_url.config(
            default=os.environ.get('DATABASE_URL'),
            conn_max_age=600,
            ssl_require=not DEBUG
        )
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.environ.get('DB_NAME', config('DB_NAME', default='gestion_dossiers')),
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

# ==================== FICHIERS STATIQUES ====================
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# ==================== CLÉ PRIMAIRE ====================
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ==================== REST FRAMEWORK AVEC THROTTLING ====================
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
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '5/minute',
        'user': '60/minute',
        'login': '5/minute',
    }
}

# ==================== JWT RENFORCÉ ====================
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=30),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
}

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

# ==================== CORS CONFIGURATION ====================
if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True
    CORS_ALLOW_CREDENTIALS = True
else:
    CORS_ALLOWED_ORIGINS = [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://parcours-dossiers-frontend.onrender.com",
    ]
    CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_METHODS = [
    'DELETE', 'GET', 'OPTIONS', 'PATCH', 'POST', 'PUT',
]

CORS_ALLOW_HEADERS = [
    'accept', 'accept-encoding', 'authorization', 'content-type',
    'dnt', 'origin', 'user-agent', 'x-csrftoken', 'x-requested-with',
]

# ==================== CSRF ====================
if DEBUG:
    CSRF_TRUSTED_ORIGINS = [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://192.168.0.111:3000',
        'http://192.168.0.111:8000',
        'http://localhost:8000',
    ]
else:
    CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS

# ==================== SÉCURITÉ ====================
if not DEBUG:
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    CSRF_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Strict'
    CSRF_COOKIE_SAMESITE = 'Strict'
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'SAMEORIGIN'
else:
    SESSION_COOKIE_SECURE = False
    CSRF_COOKIE_SECURE = False
    X_FRAME_OPTIONS = 'ALLOWALL'

# ==================== LOGGING ====================
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': True,
        },
        'dossiers': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': True,
        },
    },
}
# ==================== EN-TÊTES DE SÉCURITÉ SUPPLÉMENTAIRES ====================
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# Referrer Policy
SECURE_REFERRER_POLICY = 'strict-origin-when-cross-origin'

# Cross-Origin Policies (si vous utilisez des ressources externes)
CROSS_ORIGIN_OPENER_POLICY = 'same-origin'
CROSS_ORIGIN_EMBEDDER_POLICY = 'require-corp'

# HSTS - uniquement en production
if not DEBUG:
    SECURE_HSTS_SECONDS = 31536000  # 1 an
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_SSL_REDIRECT = True