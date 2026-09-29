"""
Email service for transactional emails (password reset, notifications).
Supports SMTP when configured, and falls back to logging/in-memory queue for dev/test.
"""

import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from flask import current_app

logger = logging.getLogger("mindmate.email")

# In-memory record of recent emails for testing/verification in local dev
_outbox: list[dict] = []


def get_outbox() -> list[dict]:
    """Returns sent emails recorded during testing or development."""
    return _outbox


def clear_outbox() -> None:
    """Clears the development outbox."""
    _outbox.clear()


def send_password_reset_email(to_email: str, reset_url: str) -> bool:
    """
    Sends a password reset email to the specified address.
    """
    subject = "Reset your MindMate AI password"
    body_text = (
        f"Hello,\n\n"
        f"You requested to reset your password for MindMate AI.\n"
        f"Please click the link below to set a new password:\n\n"
        f"{reset_url}\n\n"
        f"This link will expire in 30 minutes. If you did not request this, you can safely ignore this email.\n\n"
        f"Warmly,\nThe MindMate AI Team"
    )
    body_html = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f9fb; color: #1e293b; padding: 24px; }}
    .card {{ background: #ffffff; border-radius: 16px; max-width: 500px; margin: 0 auto; padding: 32px; border: 1px solid #e2e8f0; }}
    .btn {{ display: inline-block; background-color: #4f46e5; color: #ffffff !important; padding: 12px 24px; border-radius: 9999px; text-decoration: none; font-weight: 500; margin: 20px 0; }}
    .footer {{ font-size: 12px; color: #64748b; margin-top: 24px; line-height: 1.5; }}
  </style>
</head>
<body>
  <div class="card">
    <h2>Reset Your Password</h2>
    <p>We received a request to reset the password for your MindMate AI account.</p>
    <p><a href="{reset_url}" class="btn">Reset Password</a></p>
    <p>If the button doesn't work, copy and paste this link into your browser:</p>
    <p style="word-break: break-all; color: #4f46e5; font-size: 13px;">{reset_url}</p>
    <div class="footer">
      <p>This link is valid for 30 minutes. If you did not make this request, you can safely ignore this message.</p>
      <p>&copy; MindMate AI — Confidential & Secure</p>
    </div>
  </div>
</body>
</html>"""

    email_record = {
        "to": to_email,
        "subject": subject,
        "body_text": body_text,
        "reset_url": reset_url,
    }
    _outbox.append(email_record)

    mail_server = current_app.config.get("MAIL_SERVER")
    mail_username = current_app.config.get("MAIL_USERNAME")
    mail_password = current_app.config.get("MAIL_PASSWORD")
    mail_port = current_app.config.get("MAIL_PORT", 587)
    mail_from = current_app.config.get("MAIL_FROM", "support@mindmate.ai")

    if not mail_server or not mail_username:
        logger.info(
            "SMTP not configured. Mocking email delivery to %s. Reset link: %s",
            to_email,
            reset_url,
        )
        return True

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = mail_from
        msg["To"] = to_email
        msg.attach(MIMEText(body_text, "plain"))
        msg.attach(MIMEText(body_html, "html"))

        with smtplib.SMTP(mail_server, mail_port) as server:
            server.starttls()
            server.login(mail_username, mail_password)
            server.sendmail(mail_from, [to_email], msg.as_string())
        logger.info("Successfully dispatched password reset email to %s", to_email)
        return True
    except Exception as e:
        logger.error("Failed to send email to %s via SMTP: %s", to_email, e)
        return False
