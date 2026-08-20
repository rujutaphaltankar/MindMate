from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.models.chat import (
    add_message,
    create_session,
    get_session,
    list_messages,
    list_sessions,
    message_to_public,
)
from app.models.user import find_user_by_id
from app.services.ai_service import AIServiceError, analyze_text, generate_chat_reply
from app.services.safety_service import SAFETY_RESPONSE, classify_message
from app.services.resource_service import list_resources

ai_bp = Blueprint("ai", __name__, url_prefix="/api/ai")

DISCLAIMER = (
    "MindMate AI provides general wellness support and is not a substitute for "
    "professional mental health care."
)


@ai_bp.post("/analyze")
@jwt_required()
def analyze():
    data = request.get_json(silent=True) or {}
    text = (data.get("text") or "").strip()
    if not text:
        return jsonify({"error": "Text is required."}), 400

    user = find_user_by_id(get_jwt_identity())
    if not user or not user.get("privacy_settings", {}).get("allow_ai_analysis"):
        return (
            jsonify(
                {
                    "error": "AI analysis is disabled. Enable it in Privacy Settings to use "
                    "this feature."
                }
            ),
            403,
        )

    try:
        result = analyze_text(text)
    except AIServiceError as e:
        return jsonify({"error": str(e)}), 400
    return jsonify({"analysis": result})


@ai_bp.post("/chat")
@jwt_required()
def chat():
    data = request.get_json(silent=True) or {}
    message = (data.get("message") or "").strip()
    session_id = data.get("session_id")
    if not message:
        return jsonify({"error": "Message cannot be empty."}), 400

    user_id = get_jwt_identity()

    if session_id:
        session = get_session(user_id, session_id)
        if not session:
            return jsonify({"error": "Chat session not found."}), 404
    else:
        session = create_session(user_id)
        session_id = str(session["_id"])

    safety = classify_message(message)
    add_message(session_id, "user", message, flagged=(safety["risk"] == "high_risk"))

    if safety["risk"] == "high_risk":
        reply_text = SAFETY_RESPONSE
        add_message(session_id, "assistant", reply_text)
        return jsonify(
            {
                "session_id": session_id,
                "reply": reply_text,
                "disclaimer": DISCLAIMER,
                "safety_triggered": True,
                "crisis_resources": [r for r in list_resources()][:5],
            }
        )

    history = [
        {"role": m["role"], "content": m["content"]}
        for m in list_messages(session_id, limit=20)
        if m["role"] in ("user", "assistant")
    ]
    result = generate_chat_reply(message, history)
    add_message(session_id, "assistant", result["reply"])

    return jsonify(
        {
            "session_id": session_id,
            "reply": result["reply"],
            "disclaimer": DISCLAIMER,
            "safety_triggered": False,
        }
    )


@ai_bp.get("/chat/sessions")
@jwt_required()
def sessions():
    user_id = get_jwt_identity()
    docs = list_sessions(user_id)
    return jsonify(
        {
            "sessions": [
                {"id": str(d["_id"]), "updated_at": d["updated_at"].isoformat()} for d in docs
            ]
        }
    )


@ai_bp.get("/chat/sessions/<session_id>/messages")
@jwt_required()
def session_messages(session_id):
    user_id = get_jwt_identity()
    if not get_session(user_id, session_id):
        return jsonify({"error": "Chat session not found."}), 404
    msgs = list_messages(session_id)
    return jsonify({"messages": [message_to_public(m) for m in msgs]})
