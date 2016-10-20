from dateutil.relativedelta import relativedelta
from datetime import date, datetime, timedelta
import hashlib
import os
import time

from app.settings import ROOT_DIR, STATIC_FOLDER


PAGE_SIZE = 200
# Suuuuper hacked-together cache. 100% not production-ready
QUERY_CACHE = {}
NGRAMS_CACHE = {}


def run_query(cursor, query):
    global QUERY_CACHE
    if (query not in QUERY_CACHE):
        with Timer("RAN QUERY:"):
            cursor.execute(query)
            QUERY_CACHE[query] = cursor.fetchall()
    else:
        print("\nCACHE HIT!\n")

    return QUERY_CACHE[query]


def get_chat_ids(cursor, handle_ids):
    query = ''' -- SQL
        SELECT
            c.ROWID AS chat,
            h.id AS handle
        FROM
            chat c
        INNER JOIN chat_handle_join ch
            ON ch.chat_id = c.ROWID
        INNER JOIN handle h
            ON ch.handle_id = h.ROWID
    '''

    rows = run_query(cursor, query)
    chat_handle_map = {}

    for chat_id, handle in rows:
        if chat_id not in chat_handle_map:
            chat_handle_map[chat_id] = set()
        chat_handle_map[chat_id].add(handle)

    chats = []
    for c, handles in chat_handle_map.items():
        if handles == handle_ids:
            chats.append(c)

    return chats


def get_all_texts(cursor, handles, page=None):
    where_clause = '''
        a.filename IS NOT NULL
        OR (m.text IS NOT NULL AND trim(m.text) != "")
    '''

    return get_texts_where(cursor, handles, where_clause, page)


def get_all_attachments(cursor, handles, page=None):
    where_clause = '''
        a.filename IS NOT NULL
    '''

    return get_texts_where(cursor, handles, where_clause, page)


def all_texts_over_time(cursor, handles):
    key = (tuple(handles), tuple())
    if key in NGRAMS_CACHE:
        return NGRAMS_CACHE[key]

    chat_ids = get_chat_ids(cursor, set(handles))
    chat_ids_str = '({})'.format(','.join(map(str, chat_ids)))

    query = ''' -- SQL
        SELECT
            DATE(DATETIME(m.date, 'unixepoch', 'localtime', '+31 years')) AS text_date,
            COUNT(*) AS messages
        FROM chat c
        INNER JOIN chat_message_join cm
            ON c.ROWID = cm.chat_id
        INNER JOIN message m
            ON m.ROWID = cm.message_id
        LEFT JOIN message_attachment_join ma
            ON m.ROWID = ma.message_id
        LEFT JOIN attachment a
            ON a.ROWID = ma.attachment_id
        WHERE
            c.ROWID in {chat_ids}
        GROUP BY text_date
        ORDER BY text_date
    '''.format(chat_ids=chat_ids_str)

    rows = run_query(cursor, query)

    min_date = None
    max_date = None
    intermediate = {}
    for text_date_str, count in rows:
        text_date = datetime.strptime(text_date_str, "%Y-%m-%d").date()
        intermediate[str(text_date)] = count
        if max_date is None or text_date > max_date:
            max_date = text_date
        if min_date is None:
            min_date = text_date

    to_ret = []
    for d in date_range(min_date, max_date):
        to_ret.append({
            '__date': str(d),
            '__total': 1,
            'all': intermediate.get(str(d), 0)
        })

    return to_ret


def get_word_counts(cursor, handles, words):
    """
    Returns a list of objects
    """

    key = (tuple(handles), tuple(words))
    if key in NGRAMS_CACHE:
        return NGRAMS_CACHE[key]

    texts = get_all_texts(cursor, handles)
    word_counts = {w: {} for w in words}
    total_texts = {}

    min_date = None
    max_date = None
    with Timer("Ran ngram search:"):
        for t in texts:
            stripped = ''.join([c.lower() for c in t['body'] if c.isalnum() or c.isspace()])
            text_date = date.fromtimestamp(t['timestamp'])

            if min_date is None:
                min_date = text_date

            if max_date is None or max_date < text_date:
                max_date = text_date

            date_str = str(text_date)
            total_texts[date_str] = total_texts.get(date_str, 0) + 1
            for w in words:
                occurrences = stripped.count(w.lower())
                word_counts[w][date_str] = word_counts[w].get(date_str, 0) + occurrences

    to_ret = []
    # Fill in empty dates
    for d in date_range(min_date, max_date):
        date_str = str(d)
        data_point = {w: word_counts[w].get(date_str, 0) for w in word_counts}
        data_point['__date'] = date_str
        data_point['__total'] = total_texts.get(date_str, 0)
        to_ret.append(data_point)

    NGRAMS_CACHE[key] = to_ret
    return to_ret


def date_range(start, end, delta=None):
    """
    Generator that produces all dates or datetimes between `start` and `end`
    (inclusive) in increments of `delta`.
    """
    if delta is None:
        delta = timedelta(days=1)

    d = start
    while d <= end:
        yield d
        d += delta


def get_texts_where(cursor, handles, where_clause, page=None):
    paginate_clause = ''
    if page is not None:
        start = (page - 1) * PAGE_SIZE
        paginate_clause = 'LIMIT {start}, {page_size}'.format(start=start,
                                                              page_size=PAGE_SIZE)

    chat_ids = get_chat_ids(cursor, set(handles))
    chat_ids_str = '({})'.format(','.join(map(str, chat_ids)))

    query = ''' -- SQL
        SELECT m.ROWID, m.date, m.is_from_me, m.text, a.filename
        FROM chat c
        INNER JOIN chat_message_join cm
            ON c.ROWID = cm.chat_id
        INNER JOIN message m
            ON m.ROWID = cm.message_id
        LEFT JOIN message_attachment_join ma
            ON m.ROWID = ma.message_id
        LEFT JOIN attachment a
            ON a.ROWID = ma.attachment_id
        WHERE
            c.ROWID in {chat_ids}
            AND (
                {where_clause}
            )
        ORDER BY m.date
        {paginate_clause}
    '''.format(chat_ids=chat_ids_str,
               paginate_clause=paginate_clause,
               where_clause=where_clause)

    rows = run_query(cursor, query)
    texts = []

    for rowid, seconds_since_epoch, sent, body, attachment in rows:
        time = datetime.fromtimestamp(seconds_since_epoch) + relativedelta(years=31)
        epoch = datetime.fromtimestamp(0)

        attachment_name = None
        if attachment is not None:
            attachment_name = os.path.join('attachments', get_filename(attachment))

        texts.append({
            'rowid': rowid,
            'timeStr': time.strftime('%-I:%M%p'),
            'dateStr': time.strftime('%A, %B %-d, %Y'),
            'timestamp': (time - epoch).total_seconds(),
            'sent': 'sent' if sent == 1 else 'received',
            'body': body,
            'attachment': attachment_name
        })

    return texts


def get_filename(filepath):
    hashed_name = hashlib.sha1(filepath.encode('utf-8')).hexdigest()

    if '.' in filepath:
        hashed_name += '.{}'.format(filepath.split('.')[-1])

    return hashed_name


def get_file_location(filepath):
    return os.path.join(ROOT_DIR,
                        STATIC_FOLDER,
                        'attachments',
                        get_filename(filepath))


class Timer(object):
    """
    Context manager to time a particular operation. Useful for binding
    bottlenecks in the code.
    """
    def __init__(self, message):
        """
        message: message to display beore displayig how many seconds elapsed
                 between calling `__enter__` and `__exit__`
        """
        self.message = message
        self.start = None

    def __enter__(self):
        self.start = time.time()
        return self

    def __exit__(self, *args):
        end = time.time()
        interval = end - self.start
        print('\n{}'.format(self.message), interval, '\n')
