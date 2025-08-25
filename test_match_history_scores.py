import requests
import json

BASE_URL = "https://localhost:8443"
STATS_URL = f"{BASE_URL}/stats"
AUTH_URL = f"{BASE_URL}/as"

# Test users for real authentication - unique emails per test run
import time
import datetime
TIMESTAMP = int(time.time())
DATETIME = datetime.datetime.now()
TEST_USER_EMAIL = f"testuser@example.com"
TEST_USER_PASSWORD = "P*assword123"
TEST_USER2_EMAIL = f"testuser2@example.com"
TEST_USER2_PASSWORD = "P*assword123"
RIVAL = f"rival2{TIMESTAMP}"

# Global variables to store tokens
ACCESS_TOKEN = None
ACCESS_TOKEN_USER2 = None

def login_user(email, password):
    """Login and get JWT token"""
    data = {
        "identifier": email,
        "password": password,
    }
    
    # ✅ KORJATTU: Oikea reitti auth-servicelle
    response = requests.post(f"{AUTH_URL}/auth/login", json=data, verify=False)
    if response.status_code == 200:
        return response.json()["accessToken"]
    else:
        print(f"❌ Login failed for {email}: {response.status_code}")
        print(f"Response: {response.text}")
        return None

def get_auth_headers(token=None):
    """Helper function to get real JWT auth headers"""
    if token is None:
        token = ACCESS_TOKEN
    
    if token is None:
        raise Exception("No token available! Please login first.")
    
    return {
        "Authorization": f"Bearer {token}"
    }

def setup_test_users():
    """Setup test users and get tokens"""
    global ACCESS_TOKEN, ACCESS_TOKEN_USER2
    
    print("🔐 Setting up test users...")
    
    # Try to login first, if that fails, register
    ACCESS_TOKEN = login_user(TEST_USER_EMAIL, TEST_USER_PASSWORD)
    if ACCESS_TOKEN is None:
        # Register first user - ✅ KORJATTU: Vain email ja password
        register_data = {
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD,
            "pinCode" : "1231",
            "username" : "testuser123"
        }
        print(f"🔧 Registering user: {TEST_USER_EMAIL}")
        register_response = requests.post(f"{AUTH_URL}/auth/register", json=register_data, verify=False)
        print(register_response.headers)
        print(f"Register response: {register_response.status_code} - {register_response.text}")
        ACCESS_TOKEN = login_user(TEST_USER_EMAIL, TEST_USER_PASSWORD)
    assert ACCESS_TOKEN != None
    ACCESS_TOKEN_USER2 = login_user(TEST_USER2_EMAIL, TEST_USER2_PASSWORD)
    if ACCESS_TOKEN_USER2 is None:
        # Register second user - ✅ KORJATTU: Vain email ja password
        register_data = {
            "email": TEST_USER2_EMAIL,
            "password": TEST_USER2_PASSWORD,
            "pinCode" : "1234",
            "username" : "testuser2"
        }
        print(f"🔧 Registering user: {TEST_USER2_EMAIL}")
        register_response = requests.post(f"{AUTH_URL}/auth/register", json=register_data, verify=False)
        print(f"Register response: {register_response.status_code} - {register_response.text}")
        ACCESS_TOKEN_USER2 = login_user(TEST_USER2_EMAIL, TEST_USER2_PASSWORD)

def test_setup_users():
    setup_test_users()
    assert ACCESS_TOKEN != None
    assert ACCESS_TOKEN_USER2 != None
    print("✅ Test users setup complete")

def test_login_user():
    ACCESS_TOKEN = login_user(TEST_USER_EMAIL, TEST_USER_PASSWORD)
    assert ACCESS_TOKEN != None

def test_get_score_history():
    """Test GET /score_history - public route"""
    response = requests.get(f"{STATS_URL}/score_history", verify=False)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_score_history_id():
    ACCESS_TOKEN = login_user(TEST_USER_EMAIL, TEST_USER_PASSWORD)
    headers = get_auth_headers(ACCESS_TOKEN)

    # Tarkistetaan että token on validi ja saadaan käyttäjän ID
    response1 = requests.post(f"{AUTH_URL}/auth/verify-token", headers=headers, verify=False)
    assert response1.status_code == 200
    user_id = response1.json()["id"]
    print(f"{STATS_URL}/user_match_data/{user_id}")
    response = requests.get(f"{STATS_URL}/score_history/{user_id}", verify=False)
    print(response.json())
    assert response.status_code == 200

def test_get_score_history_by_username():
    ACCESS_TOKEN = login_user(TEST_USER_EMAIL, TEST_USER_PASSWORD)
    headers = get_auth_headers(ACCESS_TOKEN)

    # Tarkistetaan että token on validi ja saadaan käyttäjän ID
    response1 = requests.post(f"{AUTH_URL}/auth/verify-token", headers=headers, verify=False)
    assert response1.status_code == 200
    username = response1.json()["username"]
    print(f"{STATS_URL}/user_match_data/{username}")
    response = requests.get(f"{STATS_URL}/score_history/username/{username}", verify=False)
    print(response.json())
    assert response.status_code == 200

def test_add_rival():
    ACCESS_TOKEN = login_user(TEST_USER_EMAIL, TEST_USER_PASSWORD)
    headers = get_auth_headers(ACCESS_TOKEN)

    # Tarkistetaan että token on validi ja saadaan käyttäjän ID
    response1 = requests.post(f"{AUTH_URL}/auth/verify-token", headers=headers, verify=False)
    assert response1.status_code == 200
    user_id = response1.json()["id"]

    # Lisätään kilpailija
    data = {
        "rival_username": f"rivalname{TIMESTAMP}"
    }
    response = requests.post(f"{STATS_URL}/rivals/", json=data, headers=headers, verify=False)
    json_response = response.json()
    print(json_response)
    assert response.status_code == 200
    assert json_response["message"] == 'Rival added successfully'

    # Haetaan lisätty rival ja tarkistetaan kentät
    get_response = requests.get(f"{STATS_URL}/rivals/{user_id}", headers=headers, verify=False)
    assert get_response.status_code == 200
    rivals = get_response.json()
    assert isinstance(rivals, list)

def test_get_rival_by_id():
    ACCESS_TOKEN = login_user(TEST_USER_EMAIL, TEST_USER_PASSWORD)
    headers = get_auth_headers(ACCESS_TOKEN)

    # Tarkistetaan että token on validi ja saadaan käyttäjän ID
    response1 = requests.post(f"{AUTH_URL}/auth/verify-token", headers=headers, verify=False)
    assert response1.status_code == 200
    user_id = response1.json()["id"]
    response = requests.get(f"{STATS_URL}/rivals/{user_id}", verify=False)
    rivals = response.json()
    print(rivals)
    assert isinstance(rivals, list)
    for rival in rivals:
        assert "avatarUrl" in rival
        assert isinstance(rival["avatarUrl"], str) or rival["avatarUrl"] is None

def test_get_rival_by_username():
    ACCESS_TOKEN = login_user(TEST_USER_EMAIL, TEST_USER_PASSWORD)
    headers = get_auth_headers(ACCESS_TOKEN)

    # Tarkistetaan että token on validi ja saadaan käyttäjän ID
    response1 = requests.post(f"{AUTH_URL}/auth/verify-token", headers=headers, verify=False)
    assert response1.status_code == 200
    username = response1.json()["username"]
    response = requests.get(f"{STATS_URL}/rivals/username/{username}", verify=False)
    rivals = response.json()
    print(rivals)
    assert isinstance(rivals, list)
    for rival in rivals:
        assert "avatarUrl" in rival
        assert isinstance(rival["avatarUrl"], str) or rival["avatarUrl"] is None

def test_delete_rival_by_id():
    ACCESS_TOKEN = login_user(TEST_USER_EMAIL, TEST_USER_PASSWORD)
    headers = get_auth_headers(ACCESS_TOKEN)

    # Tarkistetaan että token on validi ja saadaan käyttäjän ID
    response1 = requests.post(f"{AUTH_URL}/auth/verify-token", headers=headers, verify=False)
    print(headers)
    print(response1)
    assert response1.status_code == 200
    user_id = response1.json()["id"]

    # Lisätään kilpailija
    rival_id = f"rival100{TIMESTAMP}"
    data = {
        "rival_id": rival_id,
        "rival_username" : f"rivalname100{TIMESTAMP}"
    }
    print(f"{STATS_URL}/rivals/")
    response = requests.post(f"{STATS_URL}/rivals/", json=data, headers=headers, verify=False)
    assert response.status_code == 200
    json_response = response.json()
    assert json_response["message"] == 'Rival added successfully'

    response = requests.delete(f"{STATS_URL}/rivals/{rival_id}",headers=headers, verify=False)
    print(response.json())
    assert response.status_code == 200
    json_response = response.json()
    assert json_response["message"] == 'Rival removed successfully'

def test_delete_rival_by_username():
    ACCESS_TOKEN = login_user(TEST_USER_EMAIL, TEST_USER_PASSWORD)
    headers = get_auth_headers(ACCESS_TOKEN)

    # Tarkistetaan että token on validi ja saadaan käyttäjänimi
    response1 = requests.post(f"{AUTH_URL}/auth/verify-token", headers=headers, verify=False)
    assert response1.status_code == 200
    username = response1.json()["username"]

    # Lisätään ensin rival, jotta voidaan poistaa
    data = {
        "rival_username": f"deleteme_rival_{username}"
    }
    add_response = requests.post(f"{STATS_URL}/rivals/", json=data, headers=headers, verify=False)
    assert add_response.status_code == 200 or add_response.status_code == 409  # 409 jos jo olemassa

    # Poistetaan rival käyttäjänimellä
    del_response = requests.delete(f"{STATS_URL}/rivals/username/deleteme_rival_{username}", headers=headers, verify=False)
    print(del_response.json())
    assert del_response.status_code == 200
    assert del_response.json().get("message", "").startswith("Rival removed successfully")

def test_post_match_history():
    """Test POST /match_history with JWT auth - all required fields"""
    test_setup_users()
    headers = get_auth_headers(ACCESS_TOKEN)
    print(headers)
    
    # ✅ PÄIVITETTY: Kaikki vaaditut kentät
    data = {
        "player_score": 21,           # ← UUSI
        "opponent_score": 15,         # ← UUSI  
        "duration": "00:05:30",       # ← UUSI
        "opponent_id": "test-opponent-456",  # ← Static opponent ID
        "player_name": "PlayerOne",
        "opponent_name": "PlayerTwo", 
        "result": "win",
        "opponent_username" : "opponentusername",
        "played_at": f"{DATETIME}"
    }
    
    response = requests.post(f"{STATS_URL}/match_history", json=data, headers=headers, verify=False)
    print(response.json)
    assert response.status_code == 200
    json_response = response.json()
    assert "message" in json_response
    assert json_response["message"] == "Match added to history successfully"
    print("✅ POST match_history test passed")

def test_post_match_history_guest_opponent():
    """Test POST /match_history with is_guest_opponent = 1"""
    test_setup_users()
    headers = get_auth_headers(ACCESS_TOKEN)
    data = {
        "player_score": 21,
        "opponent_score": 0,
        "duration": "00:03:00",
        "opponent_id": "guest-opponent-001",
        "player_name": "PlayerOne",
        "opponent_name": "GuestPlayer",
        "result": "win",
        "opponent_username": "guest",
        "played_at": f"{DATETIME}",
        "is_guest_opponent": 1
    }
    response = requests.post(f"{STATS_URL}/match_history", json=data, headers=headers, verify=False)
    print(response.json())
    assert response.status_code == 200
    json_response = response.json()
    assert "message" in json_response
    assert json_response["message"] == "Match added to history successfully"
    print("✅ POST match_history with guest opponent test passed")

def test_get_match_history_all():
    """Test GET /match_history - public route"""
    response = requests.get(f"{STATS_URL}/match_history", verify=False)
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    print("✅ GET match_history all test passed")

def test_get_match_history_by_id():
    """Test GET /match_history/:id - uses auth token to get user ID"""
    # Decode token to get user ID, or use a known test user ID
    response = requests.get(f"{STATS_URL}/match_history/test-user-id", verify=False)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_match_history_by_username():
    ACCESS_TOKEN = login_user(TEST_USER_EMAIL, TEST_USER_PASSWORD)
    headers = get_auth_headers(ACCESS_TOKEN)

    # Tarkistetaan että token on validi ja saadaan käyttäjän ID
    response1 = requests.post(f"{AUTH_URL}/auth/verify-token", headers=headers, verify=False)
    print(headers)
    print(response1)
    assert response1.status_code == 200
    username = response1.json()["username"]
    response = requests.get(f"{STATS_URL}/match_history/username/{username}", verify=False)
    print(response.json())
    assert isinstance(response.json(), list)


def test_different_users():
    """Test with different JWT tokens - updated with new fields"""
    user1_headers = get_auth_headers(ACCESS_TOKEN)
    user2_headers = get_auth_headers(ACCESS_TOKEN_USER2)
    
    # ✅ PÄIVITETTY: User 1 creates match history with all fields
    data1 = {
        "player_score": 21,
        "opponent_score": 18,
        "duration": "00:04:15",
        "opponent_id": "opponent-789",
        "player_name": "Player1",
        "opponent_name": "Enemy1",
        "result": "win",
        "opponent_username" : "opponentusername",
        "played_at": f"{DATETIME}"
    }
    response1 = requests.post(f"{STATS_URL}/match_history", json=data1, headers=user1_headers, verify=False)
    assert response1.status_code == 200
    
    # ✅ PÄIVITETTY: User 2 creates different match history with all fields
    data2 = {
        "player_score": 15,
        "opponent_score": 21,
        "duration": "00:06:45",
        "opponent_id": "opponent-999",
        "player_name": "Player2", 
        "opponent_name": "Enemy2",
        "result": "loss",
        "opponent_username" : "opponentusername",
        "played_at": f"{DATETIME}"
    }
    response2 = requests.post(f"{STATS_URL}/match_history", json=data2, headers=user2_headers, verify=False)
    assert response2.status_code == 200
    
    print("✅ Different users test passed")

def test_validation_errors():
    """Test validation with missing fields"""
    headers = get_auth_headers()
    
    # ✅ UUSI: Testaa puuttuvat kentät
    incomplete_data = {
        "player_name": "PlayerOne",
        "result": "win"
        # Puuttuu: player_score, opponent_score, duration, opponent_id, opponent_name
    }
    
    response = requests.post(f"{STATS_URL}/match_history", json=incomplete_data, headers=headers, verify=False)
    assert response.status_code == 400  # Pitäisi antaa validation error
    print("✅ Validation error test passed")

def test_fetch_users_route():
    ACCESS_TOKEN = login_user(TEST_USER_EMAIL, TEST_USER_PASSWORD)
    url = "https://localhost:8443/as/users/all"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {ACCESS_TOKEN}",
    }
    response = requests.get(url, headers=headers, verify=False)  # verify=False vain testikäyttöön!
    assert response.status_code == 200
    data = response.json()
    print(data)

def test_unauthorized_access():
    """Test accessing protected endpoints without token"""
    headers = {"Content-Type": "application/json"}  # No Authorization header
    
    data = {
        "player_score": 21,
        "opponent_score": 15,
        "duration": "00:05:30",
        "opponent_id": "test-opponent",
        "player_name": "PlayerOne",
        "opponent_name": "PlayerTwo",
        "result": "win",
        "played_at": f"{DATETIME}"
    }
    
    response = requests.post(f"{STATS_URL}/match_history", json=data, headers=headers, verify=False)
    assert response.status_code == 401  # Should be unauthorized
    print("✅ Unauthorized access test passed")

# ✅ UUSI: Testaa eri duration formaatteja
def test_duration_formats():
    """Test different duration formats"""
    headers = get_auth_headers()
    
    test_cases = [
        "00:05:30",    # MM:SS format
        "00:10:15",    # MM:SS format
        "01:23:45",    # HH:MM:SS format
    ]
    
    for duration in test_cases:
        data = {
            "player_score": 21,
            "opponent_score": 19,
            "duration": duration,
            "opponent_id": "test-opponent",
            "player_name": "TestPlayer",
            "opponent_name": "TestOpponent",
            "result": "win",
            "opponent_username" : "opponentusername",
            "played_at": f"{DATETIME}"
        }
        
        response = requests.post(f"{STATS_URL}/match_history", json=data, headers=headers, verify=False)
        assert response.status_code == 200
    
    print("✅ Duration formats test passed")

def test_get_user_match_data():
    """Test GET /user_match_data - public route"""
    response = requests.get(f"{STATS_URL}/user_match_data", verify=False)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if data:
        assert 'rank' in data[0]
        assert isinstance(data[0]['rank'], int)

def test_get_user_match_data_by_id():
    ACCESS_TOKEN = login_user(TEST_USER_EMAIL, TEST_USER_PASSWORD)
    headers = get_auth_headers(ACCESS_TOKEN)

    # Tarkistetaan että token on validi ja saadaan käyttäjän ID
    response1 = requests.post(f"{AUTH_URL}/auth/verify-token", headers=headers, verify=False)
    assert response1.status_code == 200
    user_id = response1.json()["id"]
    print(f"{STATS_URL}/user_match_data/{user_id}")
    response = requests.get(f"{STATS_URL}/user_match_data/{user_id}", verify=False)
    user_data = response.json()
    print(user_data)
    assert response.status_code == 200
    assert 'rank' in user_data
    assert isinstance(user_data['rank'], int)

def test_get_user_match_data_by_username():
    ACCESS_TOKEN = login_user(TEST_USER_EMAIL, TEST_USER_PASSWORD)
    headers = get_auth_headers(ACCESS_TOKEN)

    # Tarkistetaan että token on validi ja saadaan käyttäjän ID
    response1 = requests.post(f"{AUTH_URL}/auth/verify-token", headers=headers, verify=False)
    assert response1.status_code == 200
    username = response1.json()["username"]
    print(f"{STATS_URL}/user_match_data/{username}")
    response = requests.get(f"{STATS_URL}/user_match_data/username/{username}", verify=False)
    user_data = response.json()
    print(user_data)
    assert response.status_code == 200
    assert 'rank' in user_data
    assert isinstance(user_data['rank'], int)
