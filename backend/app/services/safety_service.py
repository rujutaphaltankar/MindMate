"""
Safety classifier (spec §11, §17).

Runs BEFORE any message reaches the AI companion, and over community posts,
to catch self-harm / suicidal intent / violence / immediate-danger content.
This is a conservative keyword-based classifier — good enough to route to a
safe response and crisis resources, but should be paired with a proper
moderation model/service in production.
"""

import re

_HIGH_RISK_PATTERNS = [
    r"\bkill myself\b", r"\bend my life\b", r"\bsuicid\w*\b", r"\bself[\s-]?harm\b",
    r"\bwant to die\b", r"\bdon'?t want to (live|be here)\b", r"\bcut myself\b",
    r"\bhurt myself\b", r"\bno reason to live\b", r"\bcan'?t go on\b",
]
_VIOLENCE_PATTERNS = [
    r"\bkill (him|her|them|you)\b", r"\bhurt (him|her|them|you)\b",
    r"\bgoing to attack\b", r"\bwant to hurt someone\b",
]
_HARASSMENT_PATTERNS = [
    r"\byou'?re (worthless|pathetic|disgusting)\b", r"\bkys\b",
]
_SPAM_PATTERNS = [r"http[s]?://\S+.*http[s]?://\S+", r"\bfree money\b", r"\bclick here\b"]

_high_risk_re = re.compile("|".join(_HIGH_RISK_PATTERNS), re.IGNORECASE)
_violence_re = re.compile("|".join(_VIOLENCE_PATTERNS), re.IGNORECASE)
_harassment_re = re.compile("|".join(_HARASSMENT_PATTERNS), re.IGNORECASE)
_spam_re = re.compile("|".join(_SPAM_PATTERNS), re.IGNORECASE)


def classify_message(text: str) -> dict:
    """For AI companion messages. Returns {'risk': 'normal'|'high_risk', 'reason': str|None}."""
    if _high_risk_re.search(text) or _violence_re.search(text):
        return {"risk": "high_risk", "reason": "self_harm_or_violence"}
    return {"risk": "normal", "reason": None}


def classify_post(text: str) -> dict:
    """For community posts/comments. Returns {'status': 'SAFE'|'REVIEW_REQUIRED'|'BLOCK'}."""
    if _high_risk_re.search(text):
        return {"status": "REVIEW_REQUIRED", "reason": "self_harm_related"}
    if _violence_re.search(text) or _harassment_re.search(text):
        return {"status": "BLOCK", "reason": "harassment_or_violence"}
    if _spam_re.search(text):
        return {"status": "BLOCK", "reason": "spam"}
    return {"status": "SAFE", "reason": None}


SAFETY_RESPONSE = (
    "It sounds like you might be going through something really difficult right now. "
    "I'm not able to help with this the way a trained professional or crisis service can, "
    "but you don't have to face this alone. Please consider reaching out to a trusted person "
    "in your life right now, or to one of the crisis resources below. If you're in immediate "
    "danger, please contact your local emergency services."
)
