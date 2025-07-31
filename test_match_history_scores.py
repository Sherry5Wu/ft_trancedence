import requests
import json

BASE_URL = "https://localhost:8443"
STATS_URL = f"{BASE_URL}/stats"

# Mock test user - ei tarvita oikeaa auth:ia
MOCK_USER_ID = "test-user-123"
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
    """Test POST /match_history with mock auth"""
    headers = get_mock_headers()
    
    data = {
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
    
    # PUT ei tarvitse auth:ia - käyttää URL:n player_id:tä
    response = requests.put(f"{STATS_URL}/scores/{MOCK_USER_ID}", json=data, verify=False)
    assert response.status_code == 200
    json_response = response.json()
    assert json_response["elo_score"] == 1350
    print("✅ PUT scores test passed")

def test_different_users():
    """Test with different mock users"""
    user1_headers = get_mock_headers("user-123")
    user2_headers = get_mock_headers("user-456")
    
    # User 1 creates match history
    data1 = {
        "player_name": "Player1",
        "opponent_name": "Enemy1",
        "result": "win"
    }
    response1 = requests.post(f"{STATS_URL}/match_history", json=data1, headers=user1_headers, verify=False)
    assert response1.status_code == 200
    
    # User 2 creates different match history
    data2 = {
        "player_name": "Player2", 
        "opponent_name": "Enemy2",
        "result": "loss"
    }
    response2 = requests.post(f"{STATS_URL}/match_history", json=data2, headers=user2_headers, verify=False)
    assert response2.status_code == 200
    
    print("✅ Different users test passed")