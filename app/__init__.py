import os

from flask import Flask, g

from app.settings import STATIC_FOLDER, ROOT_DIR

app = Flask(__name__, static_folder=STATIC_FOLDER)


@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

# Migrate attachments over if necessary
if not os.path.exists(os.path.join(ROOT_DIR, STATIC_FOLDER, 'attachments')):
    import app.migrations
    app.migrations.migrate_attachments()

from app import views  # noqa
