from bson import ObjectId


def _make_admin(user_id):
    from app.extensions import db  # imported here since db is set at app-creation time

    db.users.update_one({"_id": ObjectId(user_id)}, {"$set": {"role": "admin"}})


def test_non_admin_blocked_from_stats(auth_client):
    client, headers, _ = auth_client
    resp = client.get("/api/admin/stats", headers=headers)
    assert resp.status_code == 403


def test_admin_can_view_stats(auth_client):
    client, headers, user_id = auth_client
    _make_admin(user_id)
    resp = client.get("/api/admin/stats", headers=headers)
    assert resp.status_code == 200
    body = resp.get_json()
    assert "total_users" in body


def test_admin_reports_workflow(auth_client):
    client, headers, user_id = auth_client
    resp = client.post("/api/community", json={"text": "a post to report"}, headers=headers)
    post_id = resp.get_json()["post"]["id"]
    client.post(f"/api/community/{post_id}/report", json={"reason": "spam"}, headers=headers)

    _make_admin(user_id)
    resp = client.get("/api/admin/reports", headers=headers)
    assert resp.status_code == 200
    reports = resp.get_json()["reports"]
    assert len(reports) == 1

    report_id = reports[0]["id"]
    resp = client.put(f"/api/admin/reports/{report_id}", json={"action": "remove_post"}, headers=headers)
    assert resp.status_code == 200


def test_resources_endpoint_is_public(client):
    resp = client.get("/api/resources")
    assert resp.status_code == 200
    assert len(resp.get_json()["resources"]) > 0


def test_safety_classifier_flags_self_harm():
    from app.services.safety_service import classify_message

    result = classify_message("I want to kill myself")
    assert result["risk"] == "high_risk"

    result = classify_message("I had a great day at work")
    assert result["risk"] == "normal"


def test_privacy_delete_journal_data(auth_client):
    client, headers, _ = auth_client
    client.post("/api/journal", json={"text": "entry"}, headers=headers)
    client.post("/api/mood", json={"mood": 5, "stress": 5, "energy": 5}, headers=headers)

    resp = client.delete("/api/privacy/journal", headers=headers)
    assert resp.status_code == 200

    resp = client.get("/api/journal", headers=headers)
    assert len(resp.get_json()["entries"]) == 0
