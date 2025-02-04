from .base import *
from .api import *

DEBUG = True
CSRF_TRUSTED_ORIGINS = [
    'http://127.0.0.1:8000/',
    'http://localhost:8000/',
    'http://127.0.0.1:3000/',
    'http://localhost:3000/',
]
CORS_ALLOW_CREDENTIALS = True