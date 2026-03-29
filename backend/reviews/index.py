import json
import os
import base64
import uuid
import psycopg2
import boto3

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p8332130_modern_auto_dispute')
CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Id',
}

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'], options=f'-c search_path={SCHEMA}')

def get_user_by_session(conn, sid):
    if not sid:
        return None
    with conn.cursor() as cur:
        cur.execute("""
            SELECT u.id, u.email, u.name, u.is_admin
            FROM sessions s JOIN users u ON s.user_id = u.id
            WHERE s.id = %s AND s.expires_at > NOW()
        """, (sid,))
        row = cur.fetchone()
    if not row:
        return None
    return {'id': row[0], 'email': row[1], 'name': row[2], 'is_admin': row[3]}

def upload_photo(b64data, content_type='image/jpeg'):
    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
    )
    key = f'reviews/{uuid.uuid4().hex}.jpg'
    data = base64.b64decode(b64data)
    s3.put_object(Bucket='files', Key=key, Body=data, ContentType=content_type)
    return f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"

def handler(event: dict, context) -> dict:
    """Получение, создание отзывов и их модерация администратором"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    path = event.get('path', '/')
    method = event.get('httpMethod', 'GET')
    body = json.loads(event.get('body') or '{}')
    headers = event.get('headers') or {}
    session_id = headers.get('x-session-id') or headers.get('X-Session-Id', '')

    conn = get_conn()

    try:
        # GET / — список одобренных отзывов
        if method == 'GET' and (path.endswith('/reviews') or path == '/'):
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT r.id, r.author_name, r.rating, r.text, r.photo_url, r.created_at
                    FROM reviews r
                    WHERE r.status = 'approved'
                    ORDER BY r.created_at DESC
                """)
                rows = cur.fetchall()
            result = [{'id': r[0], 'author_name': r[1], 'rating': r[2], 'text': r[3],
                       'photo_url': r[4], 'created_at': str(r[5])} for r in rows]
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(result)}

        # POST / — создать отзыв (нужна авторизация)
        if method == 'POST' and (path.endswith('/reviews') or path == '/'):
            user = get_user_by_session(conn, session_id)
            if not user:
                return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Необходима авторизация'})}
            rating = body.get('rating')
            text = (body.get('text') or '').strip()
            photo_b64 = body.get('photo_b64')
            if not rating or not text:
                return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Укажите оценку и текст'})}
            if int(rating) < 1 or int(rating) > 5:
                return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Оценка от 1 до 5'})}
            photo_url = None
            if photo_b64:
                photo_url = upload_photo(photo_b64)
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO reviews (user_id, author_name, rating, text, photo_url, status)
                    VALUES (%s, %s, %s, %s, %s, 'pending') RETURNING id
                """, (user['id'], user['name'], int(rating), text, photo_url))
                review_id = cur.fetchone()[0]
            conn.commit()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({
                'ok': True, 'id': review_id,
                'message': 'Отзыв отправлен на модерацию'
            })}

        # GET /admin — все отзывы для модерации (только админ)
        if method == 'GET' and path.endswith('/admin'):
            user = get_user_by_session(conn, session_id)
            if not user or not user['is_admin']:
                return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'Доступ запрещён'})}
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT id, author_name, rating, text, photo_url, status, created_at
                    FROM reviews ORDER BY created_at DESC
                """)
                rows = cur.fetchall()
            result = [{'id': r[0], 'author_name': r[1], 'rating': r[2], 'text': r[3],
                       'photo_url': r[4], 'status': r[5], 'created_at': str(r[6])} for r in rows]
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(result)}

        # POST /moderate — одобрить или отклонить отзыв (только админ)
        if method == 'POST' and path.endswith('/moderate'):
            user = get_user_by_session(conn, session_id)
            if not user or not user['is_admin']:
                return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'Доступ запрещён'})}
            review_id = body.get('id')
            status = body.get('status')
            if status not in ('approved', 'rejected'):
                return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Статус: approved или rejected'})}
            with conn.cursor() as cur:
                cur.execute("UPDATE reviews SET status = %s WHERE id = %s", (status, review_id))
            conn.commit()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

        # GET /my — мои отзывы
        if method == 'GET' and path.endswith('/my'):
            user = get_user_by_session(conn, session_id)
            if not user:
                return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Необходима авторизация'})}
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT id, rating, text, photo_url, status, created_at
                    FROM reviews WHERE user_id = %s ORDER BY created_at DESC
                """, (user['id'],))
                rows = cur.fetchall()
            result = [{'id': r[0], 'rating': r[1], 'text': r[2], 'photo_url': r[3],
                       'status': r[4], 'created_at': str(r[5])} for r in rows]
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(result)}

        return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Not found'})}

    finally:
        conn.close()
