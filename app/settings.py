import os

ROOT_DIR = os.path.dirname(__file__)

STATIC_FOLDER = 'static'

SQLITEDB = 'db/3d0d7e5fb2ce288813306e4d4636395e047a3d28'

try:
    from local_settings import *  # noqa
except ImportError:
    pass
