from .base import *
from .api import *

DEBUG= False

CSRF_COOKIE_SAMESITE = 'Lax'  # Use 'None' for cross-site requests
SESSION_COOKIE_SAMESITE = 'Lax'  # Use 'None' for cross-site requests
CSRF_COOKIE_SECURE = True  # Set to False in development if not using HTTPS
SESSION_COOKIE_SECURE = True  # Set to False in development if not using HTTPS