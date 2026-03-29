import json
import os
import hashlib
import secrets
import psycopg2
from datetime import datetime

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p8332130_modern_auto_dispute')
CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Id',
}

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'], options=f'-c search_path={SCHEMA}')

def hash_password(pwd):
    return hashlib.sha256(pwd.encode()).hexdigest()

def make_session(conn, user_id):
    sid = secrets.token_hex(32)
    with conn.cursor() as cur:
        cur.execute("INSERT INTO sessions (id, user_id) VALUES (%s, %s)", (sid, user_id))
    conn.commit()
    return sid

def get_user_by_session(conn, sid):
    if not sid:
        return None
    with conn.cursor() as cur:
        cur.execute("""
            SELECT u.id, u.email, u.name, u.phone, u.is_admin
            FROM sessions s JOIN users u ON s.user_id = u.id
            WHERE s.id = %s AND s.expires_at > NOW()
        """, (sid,))
        row = cur.fetchone()
    if not row:
        return None
    return {'id': row[0], 'email': row[1], 'name': row[2], 'phone': row[3], 'is_admin': row[4]}

def handler(event: dict, context) -> dict:
    """Регистрация, вход, выход, получение профиля пользователя. Единый endpoint с полем action."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    body = json.loads(event.get('body') or '{}')
    headers = event.get('headers') or {}
    session_id = headers.get('x-session-id') or headers.get('X-Session-Id', '')
    action = body.get('action', '')

    conn = get_conn()

    try:
        # register
        if method == 'POST' and action == 'register':
            email = (body.get('email') or '').strip().lower()
            password = body.get('password') or ''
            name = (body.get('name') or '').strip()
            if not email or not password or not name:
                return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Заполните все поля'})}
            if len(password) < 6:
                return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Пароль минимум 6 символов'})}
            with conn.cursor() as cur:
                cur.execute("SELECT id FROM users WHERE email = %s", (email,))
                if cur.fetchone():
                    return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Email уже зарегистрирован'})}
                cur.execute(
                    "INSERT INTO users (email, password_hash, name) VALUES (%s, %s, %s) RETURNING id",
                    (email, hash_password(password), name)
                )
                user_id = cur.fetchone()[0]
            conn.commit()
            sid = make_session(conn, user_id)
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({
                'session_id': sid,
                'user': {'id': user_id, 'email': email, 'name': name, 'phone': None, 'is_admin': False}
            })}

        # login
        if method == 'POST' and action == 'login':
            email = (body.get('email') or '').strip().lower()
            password = body.get('password') or ''
            with conn.cursor() as cur:
                cur.execute("SELECT id, email, name, phone, is_admin FROM users WHERE email = %s AND password_hash = %s",
                            (email, hash_password(password)))
                row = cur.fetchone()
            if not row:
                return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Неверный email или пароль'})}
            sid = make_session(conn, row[0])
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({
                'session_id': sid,
                'user': {'id': row[0], 'email': row[1], 'name': row[2], 'phone': row[3], 'is_admin': row[4]}
            })}

        # logout
        if method == 'POST' and action == 'logout':
            if session_id:
                with conn.cursor() as cur:
                    cur.execute("UPDATE sessions SET expires_at = NOW() WHERE id = %s", (session_id,))
                conn.commit()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

        # me
        if method == 'POST' and action == 'me':
            user = get_user_by_session(conn, session_id)
            if not user:
                return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Не авторизован'})}
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'user': user})}

        # profile update
        if method == 'POST' and action == 'profile':
            user = get_user_by_session(conn, session_id)
            if not user:
                return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Не авторизован'})}
            name = (body.get('name') or '').strip()
            phone = (body.get('phone') or '').strip()
            with conn.cursor() as cur:
                cur.execute("UPDATE users SET name = %s, phone = %s WHERE id = %s", (name, phone, user['id']))
            conn.commit()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

        # requests history
        if method == 'POST' and action == 'requests':
            user = get_user_by_session(conn, session_id)
            if not user:
                return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Не авторизован'})}
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT id, name, phone, make, model, generation, part, comment, created_at
                    FROM requests WHERE user_id = %s ORDER BY created_at DESC
                """, (user['id'],))
                rows = cur.fetchall()
            result = [{'id': r[0], 'name': r[1], 'phone': r[2], 'make': r[3],
                       'model': r[4], 'generation': r[5], 'part': r[6],
                       'comment': r[7], 'created_at': str(r[8])} for r in rows]
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(result)}

        return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Not found'})}

    finally:
        conn.close()
