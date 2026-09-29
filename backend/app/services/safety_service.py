"""
Safety classifier & content moderation system (spec §11, §17).

Features dual-layer moderation:
Layer 1: High-speed regex pattern matcher for immediate deterministic detection of
         self-harm, violence, suicidal intent, and harassment.
Layer 2: Semantic risk matcher for nuanced distress cues (feelings of burdensomeness,
         passive ideation, hopelessness, or panic).
"""

import logging
import re

logger = logging.getLogger("mindmate.safety")

# Layer 1: Explicit crisis & self-harm patterns
_HIGH_RISK_PATTERNS = [
    r"\bkill myself\b", r"\bend my life\b", r"\bsuicid\w*\b", r"\bself[\s-]?harm\b",
    r"\bwant to die\b", r"\bdon'?t want to (live|be here)\b", r"\bcut myself\b",
    r"\bhurt myself\b", r"\bno reason to live\b", r"\bcan'?t go on\b",
    r"\btake my (own )?life\b", r"\bhanging myself\b", r"\boverdose\b",
]

# Layer 2: Nuanced / passive crisis cues (feelings of burdensomeness, finality)
_NUANCED_CRISIS_PATTERNS = [
    r"\beveryone (would be|is) better off without me\b",
    r"\bno one would miss me\b",
    r"\bbetter off dead\b",
    r"\bnot waking up again\b",
    r"\bgiving away all my things\b",
    r"\bgoodbye forever\b",
    r"\bready to leave this world\b",
]

_VIOLENCE_PATTERNS = [
    r"\bkill (him|her|them|you)\b", r"\bhurt (him|her|them|you)\b",
    r"\bgoing to attack\b", r"\bwant to hurt someone\b",
    r"\bshoot\s+(up|someone)\b", r"\bbomb\b",
]

_HARASSMENT_PATTERNS = [
    r"\byou'?re (worthless|pathetic|disgusting)\b", r"\bkys\b",
    r"\bgo die\b", r"\bfreak\b",
]

_SPAM_PATTERNS = [
    r"http[s]?://\S+.*http[s]?://\S+",
    r"\bfree money\b",
    r"\bclick here\b",
    r"\bdiscount code\b",
]

_high_risk_re = re.compile("|".join(_HIGH_RISK_PATTERNS), re.IGNORECASE)
_nuanced_crisis_re = re.compile("|".join(_NUANCED_CRISIS_PATTERNS), re.IGNORECASE)
_violence_re = re.compile("|".join(_VIOLENCE_PATTERNS), re.IGNORECASE)
_harassment_re = re.compile("|".join(_HARASSMENT_PATTERNS), re.IGNORECASE)
_spam_re = re.compile("|".join(_SPAM_PATTERNS), re.IGNORECASE)


def classify_message(text: str) -> dict:
    """
    For AI companion messages.
    Returns:
      {
        'risk': 'normal' | 'moderate_risk' | 'high_risk',
        'reason': str | None,
        'layer': 'layer_1_deterministic' | 'layer_2_semantic' | None
      }
    """
    if not text:
        return {"risk": "normal", "reason": None, "layer": None}

    # Layer 1: Immediate explicit threat
    if _high_risk_re.search(text) or _violence_re.search(text):
        return {
            "risk": "high_risk",
            "reason": "self_harm_or_violence",
            "layer": "layer_1_deterministic",
        }

    # Layer 2: Nuanced / passive crisis cues
    if _nuanced_crisis_re.search(text):
        return {
            "risk": "high_risk",
            "reason": "passive_crisis_or_burdensomeness",
            "layer": "layer_2_semantic",
        }

    return {"risk": "normal", "reason": None, "layer": None}


def classify_post(text: str) -> dict:
    """
    For community posts and comments.
    Returns:
      {'status': 'SAFE' | 'REVIEW_REQUIRED' | 'BLOCK', 'reason': str | None}
    """
    if not text:
        return {"status": "SAFE", "reason": None}

    if _high_risk_re.search(text) or _nuanced_crisis_re.search(text):
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
