def test_analyze_requires_consent(auth_client):
    client, headers, _ = auth_client
    resp = client.post("/api/ai/analyze", json={"text": "I feel great today"}, headers=headers)
    assert resp.status_code == 403


def test_analyze_with_consent(auth_client):
    client, headers, _ = auth_client
    client.put("/api/user/profile", json={"privacy_settings": {"allow_ai_analysis": True}}, headers=headers)
    resp = client.post("/api/ai/analyze", json={"text": "I feel happy and grateful today"}, headers=headers)
    assert resp.status_code == 200
    analysis = resp.get_json()["analysis"]
    assert analysis["sentiment"] == "Positive"
    assert "diagnos" not in analysis["summary"].lower()


def test_chat_normal_message(auth_client):
    client, headers, _ = auth_client
    resp = client.post("/api/ai/chat", json={"message": "I'm feeling stressed about exams"}, headers=headers)
    assert resp.status_code == 200
    body = resp.get_json()
    assert body["safety_triggered"] is False
    assert "session_id" in body
    assert "disclaimer" in body


def test_chat_high_risk_message_triggers_safety(auth_client):
    client, headers, _ = auth_client
    resp = client.post("/api/ai/chat", json={"message": "I want to kill myself"}, headers=headers)
    assert resp.status_code == 200
    body = resp.get_json()
    assert body["safety_triggered"] is True
    assert "crisis_resources" in body
    assert len(body["crisis_resources"]) > 0


def test_chat_session_persists_history(auth_client):
    client, headers, _ = auth_client
    resp1 = client.post("/api/ai/chat", json={"message": "hello"}, headers=headers)
    session_id = resp1.get_json()["session_id"]
    client.post("/api/ai/chat", json={"message": "I am tired", "session_id": session_id}, headers=headers)

    resp = client.get(f"/api/ai/chat/sessions/{session_id}/messages", headers=headers)
    messages = resp.get_json()["messages"]
    assert len(messages) == 4  # 2 user + 2 assistant


def test_chat_answers_direct_question_helpfully(auth_client):
    client, headers, _ = auth_client
    resp = client.post(
        "/api/ai/chat",
        json={"message": "How can I calm down when I feel overwhelmed and keep overthinking everything?"},
        headers=headers,
    )
    assert resp.status_code == 200
    reply = resp.get_json()["reply"].lower()
    assert "breathe" in reply or "breath" in reply or "overthink" in reply or "step" in reply
    assert "i'm here" not in reply.lower() or "what's on your mind" not in reply.lower()
