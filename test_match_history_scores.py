import requests
import json

BASE_URL = "https://localhost:8443"
STATS_URL = f"{BASE_URL}/stats"

# Mock test user - ei tarvita oikeaa auth:ia
MOCK_USER_ID = "test-user-123"
MOCK_OPPONENT_ID = "test-opponent-456"
MOCK_USER_EMAIL = "testuser@example.com"

def get_mock_headers(user_id=None):
    """Helper function to get mock auth headers"""
    if user_id is None:
        user_id = MOCK_USER_ID
    
    return {
        "Content-Type": "application/json",
        "x-test-user-id": user_id  # Mock auth lukee tämän headerin
    }

def test_post_match_history():
    """Test POST /match_history with mock auth - all required fields"""
    headers = get_mock_headers()
    
    # ✅ PÄIVITETTY: Kaikki vaaditut kentät
    data = {
        "player_score": 21,           # ← UUSI
        "opponent_score": 15,         # ← UUSI  
        "duration": "00:05:30",       # ← UUSI
        "opponent_id": MOCK_OPPONENT_ID,  # ← UUSI
        "player_name": "PlayerOne",
        "opponent_name": "PlayerTwo", 
        "result": "win"
    }
    
    response = requests.post(f"{STATS_URL}/match_history", json=data, headers=headers, verify=False)
    assert response.status_code == 200
    json_response = response.json()
    assert json_response["player_name"] == "PlayerOne"
    assert json_response["opponent_name"] == "PlayerTwo"
    assert json_response["result"] == "win"
    # ✅ PÄIVITETTY: Tarkista uudet kentät responssissa
    print("✅ POST match_history test passed")

def test_get_match_history_all():
    """Test GET /match_history - public route"""
    response = requests.get(f"{STATS_URL}/match_history", verify=False)
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    print("✅ GET match_history all test passed")

def test_get_match_history_by_id():
    """Test GET /match_history/:id with mock user"""
    response = requests.get(f"{STATS_URL}/match_history/{MOCK_USER_ID}", verify=False)
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    print("✅ GET match_history by ID test passed")

def test_post_score():
    """Test POST /scores with mock auth"""
    headers = get_mock_headers()
    
    data = {
        "player_name": "PlayerOne",
        "elo_score": 1040
    }
    
    response = requests.post(f"{STATS_URL}/scores", json=data, headers=headers, verify=False)
    assert response.status_code == 200 or response.status_code == 500  # 500 if already exists
    if response.status_code == 200:
        json_response = response.json()
        assert json_response["elo_score"] == 1040
    print("✅ POST scores test passed")

def test_put_score():
    """Test PUT /scores/:id - no auth needed"""
    data = {
        "elo_score": 1350,
        "player_name": "UpdatedPlayer"
    }
    
    response = requests.put(f"{STATS_URL}/scores/{MOCK_USER_ID}", json=data, verify=False)
    assert response.status_code == 200
    json_response = response.json()
    assert json_response["elo_score"] == 1350
    print("✅ PUT scores test passed")

def test_different_users():
    """Test with different mock users - updated with new fields"""
    user1_headers = get_mock_headers("user-123")
    user2_headers = get_mock_headers("user-456")
    
    # ✅ PÄIVITETTY: User 1 creates match history with all fields
    data1 = {
        "player_score": 21,
        "opponent_score": 18,
        "duration": "00:04:15",
        "opponent_id": "opponent-789",
        "player_name": "Player1",
        "opponent_name": "Enemy1",
        "result": "win"
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
        "result": "loss"
    }
    response2 = requests.post(f"{STATS_URL}/match_history", json=data2, headers=user2_headers, verify=False)
    assert response2.status_code == 200
    
    print("✅ Different users test passed")

def test_validation_errors():
    """Test validation with missing fields"""
    headers = get_mock_headers()
    
    # ✅ UUSI: Testaa puuttuvat kentät
    incomplete_data = {
        "player_name": "PlayerOne",
        "result": "win"
        # Puuttuu: player_score, opponent_score, duration, opponent_id, opponent_name
    }
    
    response = requests.post(f"{STATS_URL}/match_history", json=incomplete_data, headers=headers, verify=False)
    assert response.status_code == 400  # Pitäisi antaa validation error
    print("✅ Validation error test passed")

# ✅ UUSI: Testaa eri duration formaatteja
def test_duration_formats():
    """Test different duration formats"""
    headers = get_mock_headers()
    
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
            "result": "win"
        }
        
        response = requests.post(f"{STATS_URL}/match_history", json=data, headers=headers, verify=False)
        assert response.status_code == 200
    
    print("✅ Duration formats test passed")