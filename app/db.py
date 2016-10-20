import os

import sqlite3
from flask import g

from app.settings import ROOT_DIR, SQLITEDB


def get_db():
    """
    Connects to the database (if there is not already a db connection)
    and returns the database connection
    """
    db = getattr(g, '_database', None)
    if db is None:
        g._database = sqlite3.connect(os.path.join(ROOT_DIR, SQLITEDB))
        g._database.text_factory = lambda s: s.decode('utf-8')
        db = g._database

    return db


def cursor():
    return get_db().cursor()
