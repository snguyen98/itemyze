import os

from .base import *
from .api import *

if os.getenv('DEV') == 'true':
    from .dev import *
else:
    from .prod import *