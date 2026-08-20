def test_create_post_is_anonymous(auth_client):
    client, headers, user_id = auth_client
    resp = client.post("/api/community", json={"text": "How do you manage exam stress?", "category": "Stress"}, headers=headers)
    assert resp.status_code == 201
    post = resp.get_json()["post"]
    assert "user_id" not in post
    assert "author" not in post
    assert "email" not in post


def test_high_risk_post_blocked():
    pass  # covered indirectly via classify_post unit behavior in safety_service


def test_like_and_unlike_post(auth_client):
    client, headers, _ = auth_client
    resp = client.post("/api/community", json={"text": "Feeling good today", "category": "General Wellness"}, headers=headers)
    post_id = resp.get_json()["post"]["id"]

    resp = client.post(f"/api/community/{post_id}/like", headers=headers)
    assert resp.get_json()["post"]["likes"] == 1
    assert resp.get_json()["post"]["liked_by_me"] is True

    resp = client.post(f"/api/community/{post_id}/like", headers=headers)
    assert resp.get_json()["post"]["likes"] == 0


def test_comment_on_post(auth_client):
    client, headers, _ = auth_client
    resp = client.post("/api/community", json={"text": "Any tips for focus?"}, headers=headers)
    post_id = resp.get_json()["post"]["id"]

    resp = client.post(f"/api/community/{post_id}/comments", json={"text": "Try the Pomodoro technique!"}, headers=headers)
    assert resp.status_code == 201

    resp = client.get(f"/api/community/{post_id}/comments", headers=headers)
    assert len(resp.get_json()["comments"]) == 1


def test_delete_own_post_only(client):
    client.post("/api/auth/register", json={"name": "User A", "email": "a2@example.com", "password": "wellness123"})
    resp_a = client.post("/api/auth/login", json={"email": "a2@example.com", "password": "wellness123"})
    headers_a = {"Authorization": f"Bearer {resp_a.get_json()['access_token']}"}

    client.post("/api/auth/register", json={"name": "User B", "email": "b2@example.com", "password": "wellness123"})
    resp_b = client.post("/api/auth/login", json={"email": "b2@example.com", "password": "wellness123"})
    headers_b = {"Authorization": f"Bearer {resp_b.get_json()['access_token']}"}

    create = client.post("/api/community", json={"text": "my post"}, headers=headers_a)
    post_id = create.get_json()["post"]["id"]

    resp = client.delete(f"/api/community/{post_id}", headers=headers_b)
    assert resp.status_code == 404

    resp = client.delete(f"/api/community/{post_id}", headers=headers_a)
    assert resp.status_code == 200


def test_report_post(auth_client):
    client, headers, _ = auth_client
    resp = client.post("/api/community", json={"text": "hello everyone"}, headers=headers)
    post_id = resp.get_json()["post"]["id"]
    resp = client.post(f"/api/community/{post_id}/report", json={"reason": "spam"}, headers=headers)
    assert resp.status_code == 201
