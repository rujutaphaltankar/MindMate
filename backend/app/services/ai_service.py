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

    # ── Greetings ─────────────────────────────────────────────────────────────
    # Use word-set intersection for single-word greetings to avoid matching
    # substrings like "hi" inside "this", "think", "their", etc.
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
            "I hear you. When your mind is racing, the quickest reset is to slow your body down before you try to solve the whole problem. Put both feet on the floor, breathe in for 4, hold for 4, and breathe out for 6 for 3 rounds. Then ask: 'What is the next tiny step, not the whole future?' That helps interrupt the spiral and makes the problem feel smaller.",
            "That sounds like overwhelm and overthinking at the same time. Try this: pause for 60 seconds, take 3 slow breaths, and say to yourself, 'I do not need to solve everything right now.' Then write down only the next step you can take in the next 10 minutes. The goal is not to fix the whole day — just to calm the nervous system enough to think clearly.",
            "You're not failing; your brain is overloaded. A useful reset is to breathe slower than your thoughts, then reduce the problem to one concrete action. For example: 'I can tidy my desk for 5 minutes,' or 'I can reply to one email.' Small steps usually help more than trying to fix everything at once.",
            "When you feel overwhelmed, it helps to separate the feeling from the task. First, breathe slowly for a minute; then name the actual problem in one sentence; then choose one next action. If your mind keeps spiralling, gently bring it back to: 'What is the smallest possible next move?'",
        ])

    # ── Self-harm / Crisis (hard-coded safety, always same) ───────────────────
    # Check against both word-set (whole words like "suicide") and substrings
    # for multi-word phrases like "kill myself", "end my life", etc.
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
            "That sounds like a lot to carry right now. Stress has a way of making everything feel "
            "urgent at once. What's weighing on you the most at this moment?",
            "I hear you — feeling overwhelmed is genuinely exhausting. When things pile up, "
            "sometimes just naming one small thing you *can* control helps. Is there one thing "
            "you could set aside or simplify today?",
            "Burnout sneaks up on us, doesn't it? Your body and mind are telling you something "
            "important. When did you last take even 10 minutes just for yourself?",
            "That sounds really tough. Pressure from multiple directions at once is draining. "
            "Have you been able to talk to anyone about this lately?",
            "It makes sense you're feeling this way — you're dealing with a lot. "
            "One thing that often helps is breaking things into tiny next steps. "
            "What's the single smallest thing that would make tomorrow even slightly easier?",
            "Feeling stretched thin is hard. Even a few slow, deep breaths right now — "
            "inhale for 4, hold for 4, exhale for 8 — can help your nervous system settle a little. "
            "What feels most urgent to tackle first?",
        ])

    # ── Sadness / Loneliness ──────────────────────────────────────────────────
    sad_words = {"sad", "down", "low", "unhappy", "cry", "crying", "tears",
                 "lonely", "alone", "isolated", "hopeless", "empty", "numb", "lost"}
    if any(w in lower for w in sad_words) or any(w in words for w in sad_words):
        return pick([
            "I'm sorry you're feeling this way. That heaviness is real, and it makes sense "
            "that you'd want to talk about it. Do you have any sense of what's brought this on?",
            "Feeling low can be really isolating, even when there are people around. "
            "I'm here with you right now. Would you like to tell me more about what's going on?",
            "Sadness has its own rhythm — sometimes it just needs to be felt rather than fixed. "
            "Is there something specific weighing on your heart, or does it feel more like a general cloud?",
            "It's okay to not be okay. You don't have to put a brave face on here. "
            "What's been the hardest part of your day?",
            "Loneliness can feel so heavy, especially when you're surrounded by a busy world. "
            "Is there someone in your life you feel comfortable reaching out to, even just to say hi?",
            "I'm really glad you're talking about this instead of keeping it bottled up. "
            "When you feel this way, what has helped even a little bit in the past?",
        ])

    # ── Anxiety / Worry / Fear ────────────────────────────────────────────────
    anxiety_words = {"anxious", "anxiety", "worried", "worry", "nervous", "scared",
                     "afraid", "fear", "panic", "panic attack", "uneasy", "dread", "overthinking"}
    if any(w in lower for w in anxiety_words) or any(w in words for w in anxiety_words):
        return pick([
            "Anxiety can feel really overwhelming — like your mind won't quiet down. "
            "Is there something specific you're worried about, or is it more of a general unease?",
            "I hear you. That constant 'what if' loop is exhausting. "
            "Grounding yourself in the present can sometimes help — can you name 5 things "
            "you can see right now? It sounds simple, but it actually works for many people.",
            "Worry has a way of making future scenarios feel very real and immediate. "
            "What's the worst thing your mind is afraid of right now? Sometimes naming it helps defuse it.",
            "It's completely understandable to feel nervous about that. "
            "Are you getting enough rest? Anxiety often gets louder when we're tired.",
            "Panic can feel so physical — racing heart, tight chest. "
            "If you're in that space right now, try breathing in slowly for 4 counts, "
            "holding for 4, and breathing out for 6. I'm right here with you.",
            "Overthinking is like a browser with too many tabs open. "
            "One thing that can help is writing down the thoughts — it gets them out of the loop. "
            "Have you tried journaling here in MindMate?",
        ])

    # ── Anger / Frustration ───────────────────────────────────────────────────
    anger_words = {"angry", "anger", "furious", "frustrated", "frustrating",
                   "annoyed", "irritated", "mad", "hate", "rage", "resentment"}
    if any(w in lower for w in anger_words) or any(w in words for w in anger_words):
        return pick([
            "That frustration sounds really valid. When we feel unheard or blocked, "
            "anger is a natural response. What happened, if you'd like to share?",
            "Anger is often telling us something important — maybe a boundary was crossed, "
            "or something deeply matters to you. What's at the heart of it?",
            "It's okay to feel angry. Feeling it is very different from acting on it. "
            "Is there a way you can give yourself some space to process it — a walk, "
            "some music, or just writing it out?",
            "That sounds genuinely frustrating. Being stuck or dismissed is so draining. "
            "What do you think would help most right now — venting, problem-solving, or something else?",
            "I hear the frustration in that. Sometimes when we're this activated, "
            "even a minute of vigorous movement (shaking your hands, rolling your shoulders) "
            "can help release some of the tension. Then we can think more clearly. What do you think?",
        ])

    # ── Tiredness / Exhaustion ────────────────────────────────────────────────
    tired_words = {"tired", "exhausted", "fatigue", "fatigued", "drained", "sleep",
                   "can't sleep", "insomnia", "sleepy", "no energy", "low energy"}
    if any(w in lower for w in tired_words) or any(w in words for w in tired_words):
        return pick([
            "Rest is so important, and it sounds like your body is really asking for it. "
            "Is this more physical tiredness, or does it feel more emotional and mental?",
            "Running on empty is hard. Have you been sleeping alright, "
            "or is sleep itself part of what's difficult right now?",
            "Exhaustion makes everything harder — even small things feel heavy. "
            "Is there anything you could let go of today, even temporarily, to create more breathing room?",
            "It's okay to do less when you're this drained. Sometimes the most productive thing "
            "is genuine rest — not just sleep, but real downtime. What does rest look like for you?",
            "Sleep trouble can be really frustrating. A consistent wind-down routine "
            "— same time each night, dim lights, no screens 30 min before bed — "
            "can make a surprising difference over time. Has anything like that helped you before?",
        ])

    # ── Happiness / Positivity ────────────────────────────────────────────────
    happy_words = {"happy", "excited", "great", "wonderful", "amazing", "fantastic",
                   "joy", "joyful", "grateful", "thankful", "proud", "accomplished",
                   "good news", "celebrate", "thrilled", "love", "blessed"}
    if any(w in lower for w in happy_words) or any(w in words for w in happy_words):
        return pick([
            "That's really wonderful to hear! 😊 What's brought on this good feeling?",
            "It's so nice to hear some joy in your words! Tell me more — what happened?",
            "Moments like these are worth holding onto. What made today feel special?",
            "That's great! Celebrating wins — big or small — matters a lot for wellbeing. "
            "What are you most proud of right now?",
            "Love hearing that! Positive moments are worth savouring. "
            "Is there someone you'd like to share this with too?",
        ])

    # ── Relationships / Social ────────────────────────────────────────────────
    relationship_words = {"friend", "friends", "family", "partner", "boyfriend", "girlfriend",
                          "relationship", "breakup", "fight", "argument", "conflict"}
    if any(w in lower for w in relationship_words) or any(w in words for w in relationship_words):
        return pick([
            "Relationships can be such a source of support — and also of real pain. "
            "What's been going on with the people around you?",
            "It sounds like something happened with someone close to you. "
            "Do you want to talk through what happened?",
            "Our connections with others affect us so deeply. "
            "How are you feeling about the situation right now — hurt, confused, something else?",
            "Navigating relationships is genuinely hard sometimes. "
            "What feels most difficult about this right now?",
        ])

    # ── Work / Study pressure ─────────────────────────────────────────────────
    work_words = {"work", "job", "boss", "colleague", "coworker", "office", "career",
                  "study", "studying", "university", "college", "assignment", "exam",
                  "grade", "project", "meeting", "interview"}
    if any(w in lower for w in work_words) or any(w in words for w in work_words):
        return pick([
            "Work and study pressures are so real and can take up so much mental space. "
            "What's feeling the heaviest about it right now?",
            "It sounds like things at work/school have been a lot lately. "
            "Have you been able to draw any boundary between 'work time' and 'your time'?",
            "That kind of pressure can really wear on you. "
            "Is there someone at work or school you feel comfortable talking to about it?",
            "Dealing with that in a work or academic setting is tough — "
            "the stakes can feel so high. What would a good outcome look like for you?",
        ])

    # ── Wellness / Mindfulness ────────────────────────────────────────────────
    wellness_words = {"meditate", "meditation", "breathe", "breathing", "mindfulness",
                      "relax", "relaxation", "self-care", "self care", "journal", "journaling"}
    if any(w in lower for w in wellness_words) or any(w in words for w in wellness_words):
        return pick([
            "That's a great instinct — taking care of yourself is so important. "
            "What kind of self-care practice feels most helpful for you right now?",
            "Mindfulness can really help quiet the noise. "
            "Even 5 minutes of focused breathing can shift your whole mood. "
            "Have you tried the breathing tools in MindMate's Wellness Toolkit?",
            "Journaling is such a powerful way to process emotions. "
            "Sometimes just getting thoughts out of your head and onto the page brings relief. "
            "Have you been writing in your journal lately?",
            "That's lovely — prioritising calm and presence is a genuine act of self-love. "
            "What does your go-to way to unwind look like?",
        ])

    # ── Questions about MindMate ──────────────────────────────────────────────
    if any(w in lower for w in ("what can you do", "what do you do", "help me", "how does this work",
                                 "what is this", "who are you", "what are you")):
        return pick([
            "I'm MindMate — your personal wellness companion 💙 I'm here to listen without judgement, "
            "help you reflect on how you're feeling, and suggest healthy coping strategies. "
            "I'm not a therapist or doctor, but I care about how you're doing. "
            "What would you like to talk about?",
            "Great question! I'm here to be a supportive, non-judgemental space for you. "
            "You can share how you're feeling, track your mood, journal your thoughts, "
            "or explore breathing and meditation tools. What's on your mind today?",
        ])

    # ── Feeling better / Positive progress ────────────────────────────────────
    better_words = {"better", "improving", "getting there", "progress", "hopeful", "more positive"}
    if any(w in lower for w in better_words):
        return pick([
            "That's really encouraging to hear! 🌱 Even small steps forward matter. "
            "What do you think has been helping?",
            "I'm so glad things are looking up a little. "
            "What's something you can do today to keep that momentum going?",
            "Progress isn't always linear, but noticing improvement is really meaningful. "
            "Give yourself credit for that. What feels different now compared to before?",
        ])

    # ── Generic conversational fallbacks ─────────────────────────────────────
    # Try to ask something relevant based on the last thing the user said
    if history:
        return pick([
            "Thank you for sharing that with me. Tell me more — I'm really listening.",
            "I appreciate you opening up. How long have you been feeling this way?",
            "That's really helpful context. How has this been affecting your day-to-day?",
            "I hear you. What feels like the biggest thing you need right now — "
            "someone to listen, or maybe some ideas on what to try?",
            "Thanks for trusting me with that. What would feel most supportive for you right now?",
            "I'm with you. Is there something specific you'd like to explore or work through together?",
            "That makes a lot of sense. What's been helping you get through, even a little bit?",
        ])

    return pick([
        "I'm here to listen and support you. What's been on your mind lately?",
        "This is a safe space — feel free to share whatever you're comfortable with. What's going on?",
        "Tell me what's on your mind. There's no rush and no judgement here. 💙",
        "I'm glad you're here. How are you really doing today?",
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
