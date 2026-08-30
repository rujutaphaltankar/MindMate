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
    "You are MindMate — a warm, deeply empathetic, and responsive AI companion. "
    "Your primary goals are to make the user feel genuinely heard, validated, and supported, and to enthusiastically fulfill their direct requests.\n\n"
    "Core Guidelines:\n"
    "1. Make the User Feel Heard: Always validate their feelings first ('That sounds so heavy', 'I completely understand why you feel that way', 'Thank you for sharing that with me'). Echo key details of what they told you.\n"
    "2. Do What the User Asks: If the user asks you to do something (e.g. 'tell me something nice', 'give me a breathing prompt', 'cheer me up', 'suggest a quote', 'help me list 3 good things'), say something genuinely warm and do it immediately!\n"
    "3. Conversational Human Tone: Speak in short, warm, chat-style paragraphs (1-3 sentences). Never sound robotic, preachy, or like a medical manual.\n"
    "4. Safety First: Never diagnose conditions or prescribe medications. If self-harm/crisis is expressed, provide warm emergency resources immediately."
)


def _rule_based_chat(message: str, history: list[dict]) -> str:
    import random

    lower = message.lower()
    words = set(re.findall(r"[a-z']+", lower))

    # ── Recent assistant messages (avoid repeating yourself) ──────────────────
    recent_replies = {
        m["content"] for m in history[-6:]
        if m.get("role") == "assistant"
    }

    def pick(pool: list[str]) -> str:
        available = [r for r in pool if r not in recent_replies]
        return random.choice(available if available else pool)

    # ── Direct User Requests: "Say something nice", "Cheer me up", "Tell me something sweet" ─
    nice_request_patterns = [
        "say something nice", "tell me something nice", "cheer me up",
        "say something sweet", "tell me something sweet", "encourage me",
        "make me feel better", "say something good", "something positive"
    ]
    if any(pattern in lower for pattern in nice_request_patterns):
        return pick([
            "I would love to! You are doing so much better than you give yourself credit for. Taking time to care for your mind shows real self-compassion, and I'm genuinely proud of you for showing up today. You matter, and I'm really glad we're chatting. 🌿✨",
            "Here is something I genuinely mean: your presence matters, and you are far more resilient than you realize. Even on heavy days, you keep taking steps forward. Give yourself grace today — you deserve kindness and peace. 💙",
            "You asked for something nice, so here is a true thought: you are worthy of peace, happiness, and rest just as you are right now. You don't have to earn your worth. I'm really happy to be here supporting you today!",
            "I hear you! Here's a gentle reminder: you have survived 100% of your hardest days so far, and you are growing stronger every single day. Take a deep breath and give yourself a warm smile — you are doing great.",
        ])

    # ── Direct User Requests: Breathing exercise / Calm down request ─────────
    breathing_request_patterns = [
        "give me a breathing exercise", "breathing exercise", "help me breathe",
        "1-minute reset", "quick reset", "guide my breathing", "breathe with me"
    ]
    if any(pattern in lower for pattern in breathing_request_patterns):
        return pick([
            "I'd love to guide you through a quick reset right now! 🌿 Put your feet on the floor, relax your shoulders, and follow this: Inhale slowly for 4 seconds... Hold gently for 4 seconds... Exhale smoothly for 6 seconds. Do this 3 times with me. How is your body feeling now?",
            "Let's do a 1-minute calm reset together! Take a deep breath in through your nose for 4 counts, hold it for 4, and let it all out through your mouth for 7. Repeat once more with me. You're doing great — let me know how you feel!",
        ])

    # ── Direct User Requests: Journal prompt ─────────────────────────────────
    journal_request_patterns = [
        "journal prompt", "give me a journal prompt", "what should i write",
        "suggest a journal prompt", "prompt to write"
    ]
    if any(pattern in lower for pattern in journal_request_patterns):
        return pick([
            "Here is a soothing journal prompt for you today: 'What is one small thing that brought me comfort or relief today, and what is one heavy thought I am ready to let go of tonight?' Take your time writing whatever comes to mind! 📓",
            "I have a great prompt for you: 'If a close friend were feeling the way I feel right now, what gentle words would I say to them?' Try writing your answer in your journal — it's a powerful way to practice self-kindness.",
        ])

    # ── Direct User Requests: Positive Quote ─────────────────────────────────
    quote_request_patterns = [
        "tell me a quote", "positive quote", "give me a quote", "inspiring quote", "quote"
    ]
    if any(pattern in lower for pattern in quote_request_patterns) and len(lower.split()) <= 6:
        return pick([
            "Here is a lovely quote for you: 'You don't have to see the whole staircase, just take the first step.' — Martin Luther King Jr. 🌱 Take it one tiny step at a time.",
            "Here is a comforting thought: 'Almost everything will work again if you unplug it for a few minutes, including you.' — Anne Lamott. Remember to give yourself permission to pause.",
            "Here is a favorite of mine: 'Peace comes from within. Do not seek it without.' — Buddha 🌿 You have the strength inside you.",
        ])

    # ── Greetings ─────────────────────────────────────────────────────────────
    single_word_greetings = {"hi", "hey", "hello", "howdy"}
    multi_word_greetings = {"good morning", "good evening", "good afternoon"}
    is_greeting = (
        bool(words & single_word_greetings) or
        any(g in lower for g in multi_word_greetings)
    )
    if is_greeting and len(lower.split()) <= 5:
        return pick([
            "Hey! It's really nice to have you here. How are you feeling today? 😊",
            "Hello! I'm glad you stopped by. What's on your mind right now?",
            "Hi there! How's your day going so far?",
            "Hey, good to hear from you! How are things feeling for you today?",
            "Hello! I'm here and ready to listen. What's been going on with you?",
        ])

    direct_question_patterns = [
        "how can i calm down",
        "how can i stop",
        "what should i do when",
        "what can i do when",
        "how do i calm",
        "how do i stop",
        "overthinking",
        "feeling overwhelmed",
        "overwhelmed and",
    ]
    if any(pattern in lower for pattern in direct_question_patterns):
        return pick([
            "I hear you completely. When your mind is racing, the quickest reset is to slow your body down before trying to solve everything. Put both feet on the floor, breathe in for 4, hold for 4, and breathe out for 6. Then ask: 'What is the single smallest step I can take right now?' That helps interrupt the spiral.",
            "That sounds like overwhelm and overthinking hitting all at once. Try this: pause for 60 seconds, take 3 slow breaths, and tell yourself: 'I do not need to solve the whole day right now.' Focus only on the next 10 minutes.",
            "You're not failing; your brain is just overloaded. A useful reset is to breathe slower than your thoughts, then reduce the problem to one tiny action. You're doing fine — let's take it step by step.",
        ])

    # ── Self-harm / Crisis (hard-coded safety, always same) ───────────────────
    crisis_single = {"suicide"}
    crisis_phrases = {"kill myself", "end my life", "self-harm", "cut myself",
                      "hurt myself", "don't want to live", "not want to be here",
                      "want to die", "thinking of suicide", "thinking about suicide"}
    if (words & crisis_single) or any(c in lower for c in crisis_phrases):
        return (
            "I'm really glad you shared that with me, and I want you to know you're not alone. "
            "What you're feeling matters deeply. Please reach out to a crisis helpline or someone "
            "you trust right now — they can provide real support in this moment. "
            "In India, you can call iCall at 9152987821. In the US, dial 988 (Suicide & Crisis Lifeline). "
            "I care about your wellbeing. 💙"
        )

    # ── Stress / Overwhelm ────────────────────────────────────────────────────
    stress_words = {"stressed", "stress", "overwhelmed", "pressure", "deadline", "exam",
                    "too much", "can't cope", "falling apart", "burned out", "burnout"}
    if any(w in lower for w in stress_words) or any(w in words for w in stress_words):
        return pick([
            "That sounds like so much to carry right now, and I completely understand why you feel stressed. Stress makes everything feel urgent at once. What's weighing on you the most right now?",
            "I hear you — feeling overwhelmed is genuinely exhausting. When things pile up, just naming one small thing you can control helps. What is one tiny thing we can simplify today?",
            "Burnout is your mind telling you it needs a break. That pressure is real. When did you last give yourself even 10 minutes of complete downtime?",
        ])

    # ── Sadness / Loneliness ──────────────────────────────────────────────────
    sad_words = {"sad", "down", "low", "unhappy", "cry", "crying", "tears",
                 "lonely", "alone", "isolated", "hopeless", "empty", "numb", "lost"}
    if any(w in lower for w in sad_words) or any(w in words for w in sad_words):
        return pick([
            "I'm so sorry you're feeling low. That heaviness is real, and I'm really glad you shared it with me instead of keeping it in. Do you know what brought this on today?",
            "Feeling low can be really isolating. Please know I'm right here with you listening. Would you like to tell me a bit more about what's going on?",
            "It's completely okay not to be okay. You don't have to put on a brave face here with me. What's been the hardest part of your day?",
        ])

    # ── Anxiety / Worry / Fear ────────────────────────────────────────────────
    anxiety_words = {"anxious", "anxiety", "worried", "worry", "nervous", "scared",
                     "afraid", "fear", "panic", "panic attack", "uneasy", "dread", "overthinking"}
    if any(w in lower for w in anxiety_words) or any(w in words for w in anxiety_words):
        return pick([
            "Anxiety can feel so intense — like your mind won't quiet down. I hear you. Is there something specific on your mind, or is it a general sense of unease?",
            "I hear you. That constant 'what if' loop is so exhausting. Try naming 5 things you can see around you right now — grounding your senses really helps ease the noise.",
            "Worry has a way of making future scenarios feel scary right now. What's the main thought your mind is stuck on? Naming it out loud with me can help defuse it.",
        ])

    # ── Anger / Frustration ───────────────────────────────────────────────────
    anger_words = {"angry", "anger", "furious", "frustrated", "frustrating",
                   "annoyed", "irritated", "mad", "hate", "rage", "resentment"}
    if any(w in lower for w in anger_words) or any(w in words for w in anger_words):
        return pick([
            "That frustration sounds so valid. Feeling blocked or unheard naturally triggers anger. What happened, if you feel comfortable sharing?",
            "I completely hear your frustration. Anger often tells us a boundary was crossed or something deeply matters. What feels like the core issue?",
        ])

    # ── Gratitude / Thanks ───────────────────────────────────────────────────
    thanks_words = {"thank", "thanks", "thank you", "helpful", "appreciate"}
    if any(w in lower for w in thanks_words):
        return pick([
            "You are so very welcome! 💙 I'm always right here whenever you want to talk or unwind.",
            "I'm so glad I could help! Take good care of yourself today, and drop by anytime. 🌿",
            "Anytime at all! Thank you for sharing your thoughts with me.",
        ])

    # ── Bedtime / Sleep Wish ─────────────────────────────────────────────────
    sleep_words = {"goodnight", "good night", "going to sleep", "heading to bed", "sleep well"}
    if any(w in lower for w in sleep_words):
        return pick([
            "Good night! 🌙 Rest well, let go of today's thoughts, and sleep peacefully. I'll be here tomorrow!",
            "Wishing you a peaceful night's sleep! Rest your body and mind — you did great today. ✨",
        ])

    # ── Happiness / Positivity ────────────────────────────────────────────────
    happy_words = {"happy", "excited", "great", "wonderful", "amazing", "fantastic",
                   "joy", "joyful", "grateful", "thankful", "proud", "accomplished",
                   "good news", "celebrate", "thrilled", "love", "blessed"}
    if any(w in lower for w in happy_words) or any(w in words for w in happy_words):
        return pick([
            "That's so wonderful to hear! 😊 What brought on this great feeling today?",
            "Love hearing that! Celebrating wins — big or small — is so important. What are you most proud of?",
            "It's so nice to feel joy in your words! Tell me more about what happened!",
        ])

    # ── Generic conversational fallbacks ─────────────────────────────────────
    if history:
        return pick([
            "Thank you for sharing that with me — I'm really listening. Tell me more about how that feels for you.",
            "I hear you completely. How has this been affecting you today?",
            "Thanks for trusting me with that. What would feel most helpful for you right now — just venting, or exploring a quick reset together?",
        ])

    return pick([
        "I'm here to listen and support you. What's on your mind today?",
        "This is a safe space — feel free to share whatever you're comfortable with. I'm right here with you. 💙",
    ])


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

