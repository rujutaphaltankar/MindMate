"""
Email service for transactional emails (password reset, welcome, notifications).

Provider priority (tried in order):
  1. Resend  -- set RESEND_API_KEY  (recommended, 3 000 emails/month free)
  2. SMTP    -- set MAIL_SERVER + MAIL_USERNAME  (Gmail, SendGrid, Outlook, etc.)
  3. Console -- no provider configured; body is logged for local dev / testing

Sign up at https://resend.com and grab your API key from the dashboard.
Verify a sending domain (or use the free @resend.dev address for initial testing).
"""

from __future__ import annotations

import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional

from flask import current_app

logger = logging.getLogger("mindmate.email")

_outbox: list[dict] = []


def get_outbox() -> list[dict]:
    """Returns sent emails recorded during testing or development."""
    return _outbox


def clear_outbox() -> None:
    """Clears the development outbox."""
    _outbox.clear()


def _html_wrapper(title: str, content_html: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>{title}</title>
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f0f4ff; color: #1e293b; margin: 0; padding: 24px; }}
    .card {{ background: #ffffff; border-radius: 16px; max-width: 520px; margin: 0 auto; padding: 36px 40px; border: 1px solid #e2e8f0; box-shadow: 0 4px 24px rgba(79,70,229,0.06); }}
    .logo {{ font-size: 22px; font-weight: 700; color: #4f46e5; margin-bottom: 24px; }}
    h2 {{ margin: 0 0 12px; font-size: 20px; color: #0f172a; }}
    p  {{ margin: 0 0 16px; line-height: 1.6; color: #334155; }}
    .btn {{ display: inline-block; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #ffffff !important; padding: 13px 28px; border-radius: 9999px; text-decoration: none; font-weight: 600; font-size: 15px; margin: 8px 0 20px; }}
    .link-fallback {{ word-break: break-all; color: #4f46e5; font-size: 13px; }}
    .divider {{ border: none; border-top: 1px solid #e2e8f0; margin: 24px 0; }}
    .footer {{ font-size: 12px; color: #94a3b8; line-height: 1.6; }}
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">MindMate AI</div>
    {content_html}
    <hr class="divider">
    <div class="footer">
      <p>&copy; MindMate AI - Confidential &amp; Secure</p>
      <p>This is an automated message. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>"""


def _send_via_resend(to_email, subject, body_html, body_text, api_key, from_address):
    try:
        import resend  # type: ignore
        resend.api_key = api_key
        resend.Emails.send({"from": from_address, "to": [to_email], "subject": subject, "html": body_html, "text": body_text})
        logger.info("Resend: dispatched '%s' to %s", subject, to_email)
        return True
    except ImportError:
        logger.warning("resend package not installed. Run: pip install resend")
        return False
    except Exception as exc:
        logger.error("Resend delivery failed for %s: %s", to_email, exc)
        return False


def _send_via_smtp(to_email, subject, body_html, body_text, server, port, username, password, from_address):
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = from_address
        msg["To"] = to_email
        msg.attach(MIMEText(body_text, "plain"))
        msg.attach(MIMEText(body_html, "html"))
        with smtplib.SMTP(server, port) as conn:
            conn.ehlo()
            conn.starttls()
            conn.login(username, password)
            conn.sendmail(from_address, [to_email], msg.as_string())
        logger.info("SMTP: dispatched '%s' to %s", subject, to_email)
        return True
    except Exception as exc:
        logger.error("SMTP delivery failed for %s: %s", to_email, exc)
        return False


def _dispatch(to_email, subject, body_html, body_text):
    cfg = current_app.config

    resend_key: Optional[str] = cfg.get("RESEND_API_KEY") or ""
    if resend_key:
        return _send_via_resend(to_email, subject, body_html, body_text, resend_key, cfg.get("MAIL_FROM", "noreply@resend.dev"))

    mail_server: str = cfg.get("MAIL_SERVER") or ""
    mail_username: str = cfg.get("MAIL_USERNAME") or ""
    if mail_server and mail_username:
        return _send_via_smtp(to_email, subject, body_html, body_text, mail_server, int(cfg.get("MAIL_PORT", 587)), mail_username, cfg.get("MAIL_PASSWORD", ""), cfg.get("MAIL_FROM", "support@mindmate.ai"))

    logger.info("Email provider not configured -- console fallback.\n  To: %s\n  Subject: %s\n  Body (preview): %.300s", to_email, subject, body_text)
    return True


def send_password_reset_email(to_email: str, reset_url: str) -> bool:
    """Sends a password reset email with a signed, time-limited link."""
    subject = "Reset your MindMate AI password"
    body_text = (
        "Hello,\n\nYou requested a password reset for your MindMate AI account.\n"
        f"Click the link below to set a new password (valid for 30 minutes):\n\n{reset_url}\n\n"
        "If you did not request this, you can safely ignore this email.\n\nWarmly,\nThe MindMate AI Team"
    )
    body_html = _html_wrapper(
        title="Reset Your Password",
        content_html=f"""
        <h2>Reset Your Password</h2>
        <p>We received a request to reset the password for your <strong>MindMate AI</strong> account.</p>
        <p><a href="{reset_url}" class="btn">Reset Password</a></p>
        <p>If the button does not work, copy and paste this link into your browser:</p>
        <p class="link-fallback">{reset_url}</p>
        <p>This link expires in <strong>30 minutes</strong>. If you did not request this, you can safely ignore this email.</p>
        """,
    )
    _outbox.append({"type": "password_reset", "to": to_email, "subject": subject, "reset_url": reset_url})
    return _dispatch(to_email, subject, body_html, body_text)


def send_welcome_email(to_email: str, name: str) -> bool:
    """Sends a welcome email to a newly registered user."""
    subject = "Welcome to MindMate AI"
    first_name = (name or "").split()[0] if name else "there"
    body_text = (
        f"Hi {first_name},\n\nWelcome to MindMate AI! We are glad you are here.\n\n"
        "Here is what you can do right now:\n"
        "  - Mood Tracker: log mood, energy and sleep each day\n"
        "  - Journal: write private entries with AI-assisted reflection\n"
        "  - AI Companion: empathetic chat support, anytime\n"
        "  - Wellness Toolkit: breathing and meditation exercises\n"
        "  - Insights: personalised weekly wellness patterns\n"
        "  - Community: anonymous peer support space\n\n"
        "MindMate AI is a supportive tool, not a substitute for professional mental health care.\n\n"
        "Warmly,\nThe MindMate AI Team"
    )
    body_html = _html_wrapper(
        title="Welcome to MindMate AI",
        content_html=f"""
        <h2>Welcome, {first_name}!</h2>
        <p>We are so glad you joined <strong>MindMate AI</strong> - your private space for mental wellness.</p>
        <ul style="padding-left:20px; color:#334155; line-height:2.2;">
          <li><strong>Mood Tracker</strong> - log mood, energy and sleep daily</li>
          <li><strong>Journal</strong> - private entries with AI-assisted reflection</li>
          <li><strong>AI Companion</strong> - empathetic chat support, anytime</li>
          <li><strong>Wellness Toolkit</strong> - breathing and meditation exercises</li>
          <li><strong>Insights</strong> - personalised weekly wellness patterns</li>
          <li><strong>Community</strong> - anonymous peer support space</li>
        </ul>
        <p style="font-size:13px; color:#64748b; margin-top:20px; line-height:1.6;">
          MindMate AI is a supportive tool, not a substitute for professional mental health care.
          If you are in crisis, please contact emergency services or a local crisis line immediately.
        </p>
        """,
    )
    _outbox.append({"type": "welcome", "to": to_email, "subject": subject, "name": name})
    return _dispatch(to_email, subject, body_html, body_text)
