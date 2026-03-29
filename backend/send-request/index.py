"""Отправка заявки с сайта разборки автомобилей на email менеджера и сохранение в БД"""
import json
import os
import smtplib
import psycopg2
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p8332130_modern_auto_dispute')

def get_user_by_session(session_id):
    if not session_id:
        return None
    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'], options=f'-c search_path={SCHEMA}')
        with conn.cursor() as cur:
            cur.execute("""
                SELECT u.id FROM sessions s JOIN users u ON s.user_id = u.id
                WHERE s.id = %s AND s.expires_at > NOW()
            """, (session_id,))
            row = cur.fetchone()
        conn.close()
        return row[0] if row else None
    except Exception:
        return None

def save_request(user_id, name, phone, make, model, generation, part_desc, comment):
    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'], options=f'-c search_path={SCHEMA}')
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO requests (user_id, name, phone, make, model, generation, part, comment)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (user_id, name, phone, make, model, generation, part_desc, comment))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"DB save error: {e}")

def handler(event: dict, context) -> dict:
    cors_headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Session-Id",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers, "body": ""}

    try:
        body = json.loads(event.get("body") or "{}")
    except Exception:
        return {"statusCode": 400, "headers": cors_headers, "body": json.dumps({"error": "Invalid JSON"})}

    headers = event.get("headers") or {}
    session_id = headers.get("x-session-id") or headers.get("X-Session-Id", "")
    user_id = get_user_by_session(session_id)

    name = body.get("name", "").strip()
    phone = body.get("phone", "").strip()
    make = body.get("make", "").strip()
    model = body.get("model", "").strip()
    generation = body.get("generation", "").strip()
    part_desc = body.get("part_desc", "").strip()
    comment = body.get("comment", "").strip()

    if not name or not phone:
        return {"statusCode": 400, "headers": cors_headers, "body": json.dumps({"error": "Имя и телефон обязательны"})}

    to_email = os.environ.get("CONTACT_EMAIL", "")
    if not to_email:
        return {"statusCode": 500, "headers": cors_headers, "body": json.dumps({"error": "Email не настроен"})}

    car_info = f"{make} {model} {generation}".strip()

    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; background: #1a1a1a; color: #e0e0e0; padding: 30px; border-top: 4px solid #c0392b;">
      <h2 style="color: #c0392b; font-size: 22px; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 2px;">
        🔧 Новая заявка — МеталлЧасть
      </h2>

      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #333; color: #888; width: 160px;">Имя клиента</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #333; color: #fff; font-weight: bold;">{name}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #333; color: #888;">Телефон</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #333; color: #e67e22; font-weight: bold; font-size: 16px;">{phone}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #333; color: #888;">Марка авто</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #333; color: #fff;">{make or '—'}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #333; color: #888;">Модель</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #333; color: #fff;">{model or '—'}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #333; color: #888;">Поколение</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #333; color: #fff;">{generation or '—'}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #333; color: #888;">Нужная запчасть</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #333; color: #fff;">{part_desc or '—'}</td>
        </tr>
        {"<tr><td style='padding: 10px 0; color: #888;'>Комментарий</td><td style='padding: 10px 0; color: #fff;'>" + comment + "</td></tr>" if comment else ""}
      </table>

      <div style="margin-top: 24px; padding: 14px; background: #c0392b22; border-left: 3px solid #c0392b;">
        <strong style="color: #c0392b;">Требуется перезвонить клиенту</strong><br/>
        <span style="color: #bbb; font-size: 13px;">Уточнить наличие и детали по запчасти для {car_info or 'автомобиль не указан'}</span>
      </div>
    </div>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Заявка с сайта — {name} — {car_info or 'авто не указано'}"
    msg["From"] = "noreply@poehali.dev"
    msg["To"] = to_email
    msg.attach(MIMEText(html_body, "html", "utf-8"))

    save_request(user_id, name, phone, make, model, generation, part_desc, comment)

    try:
        with smtplib.SMTP("smtp.poehali.dev", 587, timeout=15) as smtp:
            smtp.starttls()
            smtp.login("noreply@poehali.dev", os.environ.get("SMTP_PASSWORD", "poehali"))
            smtp.sendmail("noreply@poehali.dev", to_email, msg.as_string())
    except Exception as e:
        print(f"SMTP error: {e}")

    return {
        "statusCode": 200,
        "headers": cors_headers,
        "body": json.dumps({"ok": True, "message": "Заявка отправлена"}),
    }