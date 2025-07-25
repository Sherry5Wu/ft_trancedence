import requests

BASE_URL = "https://localhost:8443/user"

def test_post_match_history():
    data = {
        "player_id": "123abc",
        "player_name": "PlayerOne",
        "opponent_name": "PlayerTwo",
        "result": "win"
    }
    response = requests.post(f"{BASE_URL}/match_history", json=data, verify=False)
    assert response.status_code == 200
    json = response.json()
    assert json["player_name"] == "PlayerOne"
    assert json["opponent_name"] == "PlayerTwo"
    assert json["result"] == "win"

def test_get_match_history_all():
    response = requests.get(f"{BASE_URL}/match_history", verify=False)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_match_history_by_id():
    response = requests.get(f"{BASE_URL}/match_history/123abc", verify=False)
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert all(row["player_id"] == "123abc" for row in response.json())

def test_post_score():
    data = {
        "player_id": "123abc",
        "player_name": "PlayerOne",
        "elo_score": 1040
    }
    response = requests.post(f"{BASE_URL}/scores", json=data, verify=False)
    assert response.status_code == 200 or response.status_code == 500  # 500 if already inserted
    if response.status_code == 200:
        json = response.json()
        assert json["elo_score"] == 1040

def test_put_score():
    data = {
        "elo_score": 1350
    }
    response = requests.put(f"{BASE_URL}/scores/123abc", json=data, verify=False)
    assert response.status_code == 200
    json = response.json()
    assert json["player_id"] == "123abc"
    assert json["elo_score"] == 1350

