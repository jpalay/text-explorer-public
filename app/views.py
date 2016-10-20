from collections import Counter
import json

from flask import Response, request, render_template

from . import app, db, emoji_characters, helpers, stopwords


PAGE_SIZE = 200
USED_EMOJIS = None
USED_WORDS = None


@app.route('/api/handles/')
def get_handles():
    cursor = db.cursor()
    cursor.execute('SELECT ROWID, id FROM handle')
    handles = [{'key': str(i), 'handle_id': rid, 'name': name}
               for i, (rid, name) in enumerate(cursor.fetchall())]

    return Response(json.dumps(handles), mimetype='text/json')


@app.route('/api/search/')
def search_chat():
    handles = json.loads(request.args.get('handles', '[]'))
    search_strings = request.args.get('q', '').lower().split()
    page = int(request.args.get('page', '1'))

    cursor = db.cursor()
    like_clauses = ['(LOWER(m.text) LIKE "%{}%")'.format(s) for s in search_strings]
    like_clause = ' AND '.join(like_clauses)
    where_clause = '''
        m.text IS NOT NULL
        AND trim(m.text) != ""
        AND (
            {like_clause}
        )
    '''.format(like_clause=like_clause)

    texts = helpers.get_texts_where(cursor, handles, where_clause, page)
    return Response(json.dumps(texts), mimetype='text/json')


@app.route('/api/page_number/')
def page_number():
    handles = json.loads(request.args.get('handles', '[]'))
    message_id = int(request.args.get('message_id'))

    cursor = db.cursor()
    texts = helpers.get_all_texts(cursor, handles)

    row_number = None
    for i, text in enumerate(texts):
        if text['rowid'] == message_id:
            row_number = i
            break

    if row_number is None:
        raise Exception('Couldn\'t find matching row')

    page = (row_number // helpers.PAGE_SIZE) + 1

    return Response(json.dumps({'page': page}), mimetype='text/json')


@app.route('/api/chat/')
def get_chat():
    handles = json.loads(request.args.get('handles', '[]'))
    page = int(request.args.get('page', '1'))

    texts = helpers.get_all_texts(db.cursor(), handles, page)
    return Response(json.dumps(texts), mimetype='text/json')


@app.route('/api/attachments/')
def get_attachments():
    handles = json.loads(request.args.get('handles', '[]'))
    page = int(request.args.get('page', '1'))

    texts = helpers.get_all_attachments(db.cursor(), handles, page)
    return Response(json.dumps(texts), mimetype='text/json')


@app.route('/api/common-words/')
def common_words():
    handles = json.loads(request.args.get('handles', '[]'))
    n_most_common = int(request.args.get('n', '100'))

    global USED_WORDS
    if USED_WORDS is None:
        texts = helpers.get_all_texts(db.cursor(), handles)
        words = []
        for t in texts:
            alphas = ''.join([c.lower() for c in t['body'] if c.isalnum() or c.isspace()])
            if alphas.strip():
                words += [w for w in alphas.split() if w not in stopwords.STOPWORDS]
        USED_WORDS = words

    counter = Counter(USED_WORDS)
    most_common = [{'item': x, 'count': ct} for x, ct in counter.most_common(n_most_common)]

    data = {
        "mostFrequent": most_common,
        "total": len(USED_WORDS)
    }
    return Response(json.dumps(data), mimetype='text/json')


@app.route('/api/ngrams/')
def ngrams():
    handles = json.loads(request.args.get('handles', '[]'))
    words = json.loads(request.args.get('words', '[]'))

    ngram_data = None
    if not words:
        ngram_data = helpers.all_texts_over_time(db.cursor(), handles)

    else:
        ngram_data = helpers.get_word_counts(db.cursor(), handles, words)
    return Response(json.dumps(ngram_data), mimetype='text/json')


@app.route('/api/common-emojis/')
def common_emojis():
    handles = json.loads(request.args.get('handles', '[]'))
    n_most_common = int(request.args.get('n', '100'))

    global USED_EMOJIS
    if USED_EMOJIS is None:
        texts = helpers.get_all_texts(db.cursor(), handles)

        emoji_set = set(emoji_characters.EMOJIS)
        used_emojis = []
        for t in texts:
            for c in t['body']:
                if c in emoji_set:
                    used_emojis.append(c)

        USED_EMOJIS = used_emojis

    counter = Counter(USED_EMOJIS)
    most_common = [{'item': x, 'count': ct} for x, ct in counter.most_common(n_most_common)]

    data = {
        "mostFrequent": most_common,
        "total": len(USED_EMOJIS)
    }

    return Response(json.dumps(data), mimetype='text/json')


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def index(path=None):
    return render_template('index.html', title='Home')
