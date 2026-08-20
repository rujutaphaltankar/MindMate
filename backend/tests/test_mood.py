def test_create_and_list_mood(auth_client):
    client, headers, _ = auth_client
    resp = client.post(
        "/api/mood", json={"mood": 7, "stress": 4, "energy": 6, "sleep_hours": 7.5}, headers=headers
    )
    assert resp.status_code == 201
    record = resp.get_json()["record"]
    assert record["mood"] == 7

    resp = client.get("/api/mood", headers=headers)
    assert resp.status_code == 200
    assert len(resp.get_json()["records"]) == 1


def test_mood_validation(auth_client):
    client, headers, _ = auth_client
    resp = client.post("/api/mood", json={"mood": 20, "stress": 4, "energy": 6}, headers=headers)
    assert resp.status_code == 400


def test_mood_update_and_delete(auth_client):
    client, headers, _ = auth_client
    resp = client.post("/api/mood", json={"mood": 5, "stress": 5, "energy": 5}, headers=headers)
    record_id = resp.get_json()["record"]["id"]

    resp = client.put(f"/api/mood/{record_id}", json={"mood": 9}, headers=headers)
    assert resp.status_code == 200
    assert resp.get_json()["record"]["mood"] == 9

    resp = client.delete(f"/api/mood/{record_id}", headers=headers)
    assert resp.status_code == 200

    resp = client.get("/api/mood", headers=headers)
    assert len(resp.get_json()["records"]) == 0


def test_mood_requires_auth(client):
    resp = client.get("/api/mood")
    assert resp.status_code == 401
