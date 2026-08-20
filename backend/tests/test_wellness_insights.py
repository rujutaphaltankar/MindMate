def test_wellness_catalog_and_completion(auth_client):
    client, headers, _ = auth_client
    resp = client.get("/api/wellness", headers=headers)
    assert resp.status_code == 200
    activities = resp.get_json()["activities"]
    assert len(activities) > 0

    activity_id = activities[0]["id"]
    resp = client.post(f"/api/wellness/{activity_id}/complete", headers=headers)
    assert resp.status_code == 201

    resp = client.get("/api/wellness/history", headers=headers)
    assert len(resp.get_json()["history"]) == 1


def test_insights_returns_summary(auth_client):
    client, headers, _ = auth_client
    client.post("/api/mood", json={"mood": 8, "stress": 3, "energy": 7}, headers=headers)
    resp = client.get("/api/insights", headers=headers)
    assert resp.status_code == 200
    body = resp.get_json()
    assert "summary" in body
    assert "trend" in body
    assert body["summary"]["avg_mood_week"] == 8


def test_recommendations_returns_list(auth_client):
    client, headers, _ = auth_client
    client.post("/api/mood", json={"mood": 4, "stress": 8, "energy": 3}, headers=headers)
    resp = client.get("/api/insights/recommendations", headers=headers)
    assert resp.status_code == 200
    recs = resp.get_json()["recommendations"]
    assert len(recs) > 0
