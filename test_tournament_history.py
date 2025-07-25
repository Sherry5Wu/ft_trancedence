import requests

BASE_URL = "https://localhost:8443/stats"

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
