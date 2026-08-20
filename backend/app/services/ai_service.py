"""
Pluggable AI service.

Two backends are supported:
  - "anthropic": calls the Claude API (requires ANTHROPIC_API_KEY)
  - "rule_based": a lightweight local fallback with zero external dependency

The rule-based fallback exists so the app is fully functional out of the box
(spec §26, AI Failure Handling) and for local development/testing without an
API key. Swap AI_PROVIDER=anthropic in .env once you have a key.

Every function here enforces the same content rules regardless of backend:
  - never diagnose a clinical condition
  - never claim certainty about the user's mental state
  - never prescribe medication or give self-harm instructions
"""

import json
import os
import re

AI_PROVIDER = os.getenv("AI_PROVIDER", "rule_based")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
ANTHROPIC_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-6")

_POSITIVE_WORDS = {
    "happy", "great", "good", "excited", "grateful", "calm", "relaxed", "proud",
    "hopeful", "content", "joy", "peaceful", "confident", "motivated", "love",
}
_NEGATIVE_WORDS = {
    "sad", "angry", "anxious", "stressed", "tired", "overwhelmed", "worried",
    "frustrated", "lonely", "scared", "afraid", "hopeless", "exhausted", "upset",
    "angry", "hate", "cry", "crying", "hurt", "numb",
}
_EMOTION_KEYWORDS = {
    "stress": {"stressed", "pressure", "overwhelmed", "deadline", "exam"},
    "frustration": {"frustrated", "annoyed", "irritated", "angry"},
    "calm": {"calm", "relaxed", "peaceful", "at ease"},
    "happiness": {"happy", "excited", "joy", "grateful", "glad"},
    "sadness": {"sad", "down", "cry", "crying", "lonely", "hopeless"},
    "anger": {"angry", "furious", "mad", "hate"},
    "fear": {"scared", "afraid", "anxious", "worried", "nervous"},
    "excitement": {"excited", "thrilled", "can't wait", "pumped"},
}


class AIServiceError(Exception):
    pass


def _rule_based_analyze(text: str) -> dict:
    lower = text.lower()
    words = set(re.findall(r"[a-z']+", lower))

    pos_hits = len(words & _POSITIVE_WORDS)
    neg_hits = len(words & _NEGATIVE_WORDS)

    if pos_hits > neg_hits:
        sentiment = "Positive"
    elif neg_hits > pos_hits:
        sentiment = "Negative"
    else:
        sentiment = "Neutral"

    emotions = [
        emotion
        for emotion, keywords in _EMOTION_KEYWORDS.items()
        if any(k in lower for k in keywords)
    ]
    if not emotions:
        emotions = ["calm"] if sentiment != "Negative" else ["stress"]

    total_hits = pos_hits + neg_hits
    if total_hits >= 4:
        intensity = "High"
    elif total_hits >= 2:
        intensity = "Moderate"
    else:
        intensity = "Low"

    return {
        "sentiment": sentiment,
        "emotions": emotions[:3],
        "intensity": intensity,
        "summary": f"The text appears to express signs of {emotions[0]}.",
        "provider": "rule_based",
    }


def _anthropic_analyze(text: str) -> dict:
    import anthropic

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    system = (
        "You analyze journal text for a wellness app. Respond ONLY with JSON: "
        '{"sentiment": "Positive|Neutral|Negative", "emotions": ["..."], '
        '"intensity": "Low|Moderate|High", "summary": "one careful sentence"}. '
        "Never diagnose a clinical condition. Use careful, non-clinical wording "
        "such as 'appears to express signs of stress', never 'you have anxiety'."
    )
    response = client.messages.create(
        model=ANTHROPIC_MODEL,
        max_tokens=300,
        system=system,
        messages=[{"role": "user", "content": text[:4000]}],
    )
    raw = "".join(block.text for block in response.content if block.type == "text")
    data = json.loads(raw.strip().removeprefix("```json").removesuffix("```"))
    data["provider"] = "anthropic"
    return data


def analyze_text(text: str) -> dict:
    """Returns non-clinical sentiment/emotion analysis, or raises AIServiceError."""
    if not text or not text.strip():
        raise AIServiceError("No text provided for analysis.")

    if AI_PROVIDER == "anthropic" and ANTHROPIC_API_KEY:
        try:
            return _anthropic_analyze(text)
        except Exception:
            # Fall through to rule-based so a flaky/misconfigured API never
            # breaks the app (spec §26).
            return _rule_based_analyze(text)

    return _rule_based_analyze(text)


_CHAT_SYSTEM_PROMPT = (
    "You are MindMate, an empathetic wellness companion inside a self-help app. "
    "You are NOT a therapist, doctor, or crisis service. Rules you must always follow: "
    "never diagnose a mental health condition; never prescribe or suggest medication; "
    "never claim certainty about the user's mental state; be warm, non-judgmental, and "
    "concise; ask at most one gentle follow-up question; suggest healthy coping strategies "
    "(breathing, journaling, short walks, breaking tasks down, talking to someone they trust); "
    "encourage professional help when the user describes ongoing or serious distress; "
    "if the user expresses self-harm, suicidal intent, or immediate danger, do not continue "
    "normal conversation — respond with care, encourage them to reach out to a trusted person "
    "or local emergency/crisis services right now, and do not provide any harmful information."
)


def _rule_based_chat(message: str, history: list[dict]) -> str:
    lower = message.lower()
    if any(w in lower for w in ("stressed", "stress", "overwhelmed", "pressure")):
        return (
            "That sounds like a lot to carry right now. Sometimes breaking things into one "
            "small next step helps more than trying to solve everything at once. What's one "
            "small thing that might ease the pressure today?"
        )
    if any(w in lower for w in ("sad", "down", "lonely", "hopeless")):
        return (
            "I'm sorry you're feeling this way. You don't have to carry it alone — is there "
            "someone you trust you could talk to today, even briefly? I'm also here if you "
            "want to keep talking."
        )
    if any(w in lower for w in ("tired", "exhausted", "sleep")):
        return (
            "Rest matters more than we usually give it credit for. Has your sleep routine "
            "changed recently, or does it feel more like mental tiredness?"
        )
    return (
        "Thanks for sharing that with me. Tell me a bit more about what's on your mind — "
        "I'm here to listen."
    )


def _anthropic_chat(message: str, history: list[dict]) -> str:
    import anthropic

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    messages = [
        {"role": h["role"], "content": h["content"]} for h in history[-10:]
    ] + [{"role": "user", "content": message}]
    response = client.messages.create(
        model=ANTHROPIC_MODEL,
        max_tokens=400,
        system=_CHAT_SYSTEM_PROMPT,
        messages=messages,
    )
    return "".join(block.text for block in response.content if block.type == "text")


def generate_chat_reply(message: str, history: list[dict]) -> dict:
    if AI_PROVIDER == "anthropic" and ANTHROPIC_API_KEY:
        try:
            reply = _anthropic_chat(message, history)
            return {"reply": reply, "provider": "anthropic"}
        except Exception:
            return {"reply": _rule_based_chat(message, history), "provider": "rule_based"}

    return {"reply": _rule_based_chat(message, history), "provider": "rule_based"}
