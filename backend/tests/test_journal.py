def test_create_and_list_journal(auth_client):
    client, headers, _ = auth_client
    resp = client.post("/api/journal", json={"text": "Today was stressful.", "tags": ["Work"]}, headers=headers)
    assert resp.status_code == 201
    entry = resp.get_json()["entry"]
    assert entry["text"] == "Today was stressful."
    assert entry["tags"] == ["Work"]
    assert entry["ai_analysis"] is None  # no consent given, no analyze flag

    resp = client.get("/api/journal", headers=headers)
    assert len(resp.get_json()["entries"]) == 1


def test_journal_empty_text_rejected(auth_client):
    client, headers, _ = auth_client
    resp = client.post("/api/journal", json={"text": "  "}, headers=headers)
    assert resp.status_code == 400


def test_journal_isolated_between_users(client):
    client.post("/api/auth/register", json={"name": "User A", "email": "a@example.com", "password": "wellness123"})
    resp_a = client.post("/api/auth/login", json={"email": "a@example.com", "password": "wellness123"})
    headers_a = {"Authorization": f"Bearer {resp_a.get_json()['access_token']}"}

    client.post("/api/auth/register", json={"name": "User B", "email": "b@example.com", "password": "wellness123"})
    resp_b = client.post("/api/auth/login", json={"email": "b@example.com", "password": "wellness123"})
    headers_b = {"Authorization": f"Bearer {resp_b.get_json()['access_token']}"}

    create = client.post("/api/journal", json={"text": "private thoughts"}, headers=headers_a)
    entry_id = create.get_json()["entry"]["id"]

    # User B cannot read User A's journal entry
    resp = client.get(f"/api/journal/{entry_id}", headers=headers_b)
    assert resp.status_code == 404


def test_journal_analysis_requires_consent(auth_client):
    client, headers, _ = auth_client
    resp = client.post(
        "/api/journal", json={"text": "I feel really stressed and overwhelmed.", "analyze": True}, headers=headers
    )
    entry = resp.get_json()["entry"]
    assert entry["ai_analysis"] is None  # consent not granted yet

    client.put("/api/user/profile", json={"privacy_settings": {"allow_ai_analysis": True}}, headers=headers)
    resp = client.post(
        "/api/journal", json={"text": "I feel really stressed and overwhelmed.", "analyze": True}, headers=headers
    )
    entry = resp.get_json()["entry"]
    assert entry["ai_analysis"] is not None
    assert entry["ai_analysis"]["sentiment"] in ("Positive", "Neutral", "Negative")
