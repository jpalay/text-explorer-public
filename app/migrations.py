import hashlib
import os
import shutil

from app import app, db, helpers
from app.settings import STATIC_FOLDER, ROOT_DIR


def migrate_attachments():
    attachments_dir = os.path.join(ROOT_DIR, STATIC_FOLDER, 'attachments')
    if not os.path.exists(attachments_dir):
        os.makedirs(attachments_dir)

    with app.app_context():
        c = db.cursor()
        c.execute('SELECT filename FROM attachment')
        rows = c.fetchall()

        for (f,) in rows:
            if f is None:
                continue
            hash_filename = ''
            try:
                hash_filename = get_hash_filename(f)
            except ValueError:
                print('Failed to hash filename {}'.format(f))
                continue

            src_file = os.path.join(ROOT_DIR, 'db', hash_filename)
            dst_file = helpers.get_file_location(f)

            if not os.path.exists(src_file):
                print('Failed to find file {}'.format(f))
                continue

            shutil.move(src_file, dst_file)


def get_hash_filename(path):
    head = path
    split_path = []

    while head not in ('', '/'):
        head, tail = os.path.split(head)
        split_path = [tail] + split_path

    suffix = []
    if split_path[:2] == ['~', 'Library']:
        suffix = split_path[2:]
    elif split_path[:3] == ['var', 'mobile', 'Library']:
        suffix = split_path[3:]
    else:
        raise ValueError('Don\'t know what to do with filepath {}'.format(path))

    prefix = ['MediaDomain-Library']
    return hashlib.sha1(os.path.join(*(prefix + suffix)).encode('utf-8')).hexdigest()
