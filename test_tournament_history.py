import requests

BASE_URL = "https://localhost:8443/tournament"

def test_create_tournament_match():
    payload = {
        "tournament_id": "turnaus123",
        "stage_number": 1,
        "match_number": 1,
        "player_name": "PlayerOne",
        "opponent_name": "PlayerTwo",
        "result": "win"
    }
    response = requests.post(f"{BASE_URL}/tournament_history", json=payload, verify=False)
    assert response.status_code == 200
    data = response.json()
    assert data["tournament_id"] == payload["tournament_id"]
    assert data["player_name"] == "PlayerOne"
    assert data["result"] == "win"

def test_get_all_tournament_matches():
    response = requests.get(f"{BASE_URL}/tournament_history", verify=False)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_specific_tournament():
    tournament_id = "turnaus123"
    response = requests.get(f"{BASE_URL}/tournament_history/{tournament_id}", verify=False)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert any(match["tournament_id"] == tournament_id for match in data)

def test_update_all_bulk_insert():
    # Esimerkkidata: kaksi riviä
    entries = [
        {
            "tournament_id": "test-tournament-1",
            "stage_number": 1,
            "match_number": 1,
            "player_name": "Alice",
            "opponent_name": "Bob",
            "result": "win"
        },
        {
            "tournament_id": "test-tournament-1",
            "stage_number": 1,
            "match_number": 2,
            "player_name": "Charlie",
            "opponent_name": "Dave",
            "result": "loss"
        }
    ]
    headers = {"Content-Type": "application/json"}
    url = f"{BASE_URL}/tournament_history/update_all"
    response = requests.post(url, json={"entries": entries}, headers=headers, verify=False)
    print("Status code:", response.status_code)
    try:
        print("Response:", response.json())
    except Exception:
        print("Response is not JSON:", response.text)
    assert response.status_code == 200
    assert "inserted" in response.json()
    assert response.json()["inserted"] == 2
