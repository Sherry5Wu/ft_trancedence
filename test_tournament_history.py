import requests
import random
import time

BASE_URL = "https://localhost:8443/tournament"
AUTH_URL = "https://localhost:8443/as/auth"
VERIFY = False  # self-signed cert

# Test users for real authentication - unique emails per test run
TIMESTAMP = int(time.time())
TEST_USER_EMAIL = f"testuser_{TIMESTAMP}@example.com"
TEST_USER_PASSWORD = "P*assword123"

ACCESS_TOKEN = None

def login_user(email, password):
    data = {
        "identifier": email,
        "password": password,
    }
    response = requests.post(f"{AUTH_URL}/login", json=data, verify=VERIFY)
    if response.status_code == 200:
        return response.json()["accessToken"]
    else:
        print(f"❌ Login failed for {email}: {response.status_code}")
        print(f"Response: {response.text}")
        return None

def get_auth_headers(token=None):
    if token is None:
        token = ACCESS_TOKEN
    if token is None:
        raise Exception("No token available! Please login first.")
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

def setup_test_user():
    global ACCESS_TOKEN
    ACCESS_TOKEN = login_user(TEST_USER_EMAIL, TEST_USER_PASSWORD)
    if ACCESS_TOKEN is None:
        register_data = {
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD,
            "pinCode": "1231",
            "username": f"testuser_{TIMESTAMP}"
        }
        reg = requests.post(f"{AUTH_URL}/register", json=register_data, verify=VERIFY)
        print(f"Register response: {reg.status_code} - {reg.text}")
        ACCESS_TOKEN = login_user(TEST_USER_EMAIL, TEST_USER_PASSWORD)
    assert ACCESS_TOKEN is not None

def test_create_tournament_match():
    setup_test_user()
    payload = {
        "tournament_id": "turnaus123",
        "stage_number": 1,
        "match_number": 1,
        "player_name": "PlayerOne",
        "opponent_name": "PlayerTwo",
        "result": "win"
    }
    headers = get_auth_headers()
    response = requests.post(f"{BASE_URL}/tournament_history", json=payload, headers=headers, verify=VERIFY)
    assert response.status_code == 200
    data = response.json()
    assert data["tournament_id"] == payload["tournament_id"]
    assert data["player_name"] == "PlayerOne"
    assert data["result"] == "win"

def test_get_all_tournament_matches():
    response = requests.get(f"{BASE_URL}/tournament_history", verify=VERIFY)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_specific_tournament():
    tournament_id = "turnaus123"
    response = requests.get(f"{BASE_URL}/tournament_history/{tournament_id}", verify=VERIFY)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert any(match["tournament_id"] == tournament_id for match in data)

def test_update_all_bulk_insert():
    setup_test_user()
    matches = [
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
    headers = get_auth_headers()
    url = f"{BASE_URL}/tournament_history/update_all"
    response = requests.post(url, json={"matches": matches}, headers=headers, verify=VERIFY)
    print("Status code:", response.status_code)
    try:
        print("Response:", response.json())
    except Exception:
        print("Response is not JSON:", response.text)
    assert response.status_code == 200
    assert "inserted" in response.json()
    assert response.json()["inserted"] == 2

def test_match_history_update_all_bulk_insert():
    setup_test_user()
    # Huom: käytä samoja kenttiä kuin matchHistory.js vaatii!
    matches = [
        {
            "player_username": "Alice",
            "opponent_username": "Bob",
            "played_at": "2025-08-26T12:00:00Z",
            "duration": "00:05:00",
            "player_score": 3,
            "opponent_score": 2,
            "opponent_id": "uuid-bob",
            "player_id": "uuid-alice",
            "player_name": "Alice",
            "opponent_name": "Bob",
            "result": "win",
            "is_guest_opponent": 0
        },
        {
            "player_username": "Charlie",
            "opponent_username": "Dave",
            "played_at": "2025-08-26T12:10:00Z",
            "duration": "00:04:10",
            "player_score": 1,
            "opponent_score": 3,
            "opponent_id": "uuid-dave",
            "player_id": "uuid-charlie",
            "player_name": "Charlie",
            "opponent_name": "Dave",
            "result": "loss",
            "is_guest_opponent": 0
        }
    ]
    headers = get_auth_headers()
    url = "https://localhost:8443/stats/match_history/update_all"
    response = requests.post(url, json={"matches": matches}, headers=headers, verify=VERIFY)
    print("Status code:", response.status_code)
    try:
        print("Response:", response.json())
    except Exception:
        print("Response is not JSON:", response.text)
    assert response.status_code == 200
    assert "inserted" in response.json()
    assert response.json()["inserted"] == 2
