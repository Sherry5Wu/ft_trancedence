import requests
import json
import datetime

BASE_URL = "https://localhost:8443"
STATS_URL = f"{BASE_URL}/stats"
AUTH_URL = f"{BASE_URL}/as"

default_data = [
    {
        "email": "bob@gmail.com",
        "password": "Bob123!A",
        "pinCode" : "1234",
        "username" : "Bobuser"
    }, 
    {
        "email": "alice@gmail.com",
        "password": "Alice123!A",
        "pinCode": "1234",
        "username": "Aliceuser"
    },
    {
        "email": "Oskari@gmail.com",
        "password": "Oskari123!A",
        "pinCode": "1234",
        "username": "Oskariuser"
    },
    {
        "email": "Jukka@gmail.com",
        "password": "Jukka123!A",
        "pinCode": "1234",
        "username": "Jukkauser"
    }
]

def login_user(email, password):
    """Login and get JWT token"""
    data = {
        "identifier": email,
        "password": password,
    }
    response = requests.post(f"{AUTH_URL}/auth/login", json=data, verify=False)
    if response.status_code == 200:
        return response.json()["accessToken"]
    else:
        print(f"❌ Login failed for {email}: {response.status_code}")
        print(f"Response: {response.text}")
        return None

def get_auth_headers(token):
    """Helper function to get real JWT auth headers"""

    
    if token is None:
        raise Exception("No token available! Please login first.")
    
    return {
        "Authorization": f"Bearer {token}"
    }

def setup_default_data_users():
    """Rekisteröi ja kirjaa sisään kaikki default_data-listan käyttäjät"""
    user_tokens = {}
    user_ids = {}

    for user in default_data:
        # Yritä kirjautua ensin
        token = login_user(user["email"], user["password"])
        if token is None:
            # Rekisteröi jos ei vielä olemassa
            print(f"🔧 Registering user: {user['email']}")
            register_response = requests.post(f"{AUTH_URL}/auth/register", json=user, verify=False)
            print(f"Register response: {register_response.status_code} - {register_response.text}")
            token = login_user(user["email"], user["password"])
        assert token is not None, f"Login failed for {user['email']}"
        user_tokens[user["username"]] = token

        # Hae käyttäjän id
        resp = requests.post(f"{AUTH_URL}/auth/verify-token", headers={"Authorization": f"Bearer {token}"}, verify=False)
        if resp.status_code == 200:
            user_ids[user["username"]] = resp.json().get("id")
        else:
            print(f"❌ Failed to get id for {user['username']}: {resp.status_code} {resp.text}")
            user_ids[user["username"]] = None

    print("✅ Default users ready:", user_tokens.keys())
    return user_tokens, user_ids

def post_tournament_history_bulk(matches, token):
    url = f"{BASE_URL}/tournament_history/update_all"
    headers = get_auth_headers(token)
    headers["Content-Type"] = "application/json"
    data = {"matches": matches}
    resp = requests.post(url, json=data, headers=headers, verify=False)
    if resp.status_code == 200:
        print("✅ Tournament history bulk insert ok")
        return resp.json()
    else:
        print(f"❌ Tournament history bulk insert failed: {resp.status_code} {resp.text}")
        return None

def simulate_tournament_history_bulk(user_tokens):
    # Käytetään neljää käyttäjää
    usernames = list(user_tokens.keys())
    # Esimerkkidata: kaksi ottelua ja finaali
    matches = [
        {
            "tournament_id": "demo-tournament-1",
            "stage_number": 1,
            "match_number": 1,
            "player_name": usernames[0],
            "opponent_name": usernames[1],
            "result": "win"
        },
        {
            "tournament_id": "demo-tournament-1",
            "stage_number": 1,
            "match_number": 2,
            "player_name": usernames[2],
            "opponent_name": usernames[3],
            "result": "loss"
        },
        {
            "tournament_id": "demo-tournament-1",
            "stage_number": 2,
            "match_number": 1,
            "player_name": usernames[0],
            "opponent_name": usernames[2],
            "result": "win"
        },
    ]
    # Käytetään ensimmäisen käyttäjän tokenia
    token = user_tokens[usernames[0]]
    post_tournament_history_bulk(matches, token)

def post_match_history_bulk(matches, token):
    url = f"{STATS_URL}/match_history/update_all"
    headers = get_auth_headers(token)
    headers["Content-Type"] = "application/json"
    data = {"matches": matches}
    resp = requests.post(url, json=data, headers=headers, verify=False)
    if resp.status_code == 200:
        print("✅ Match history bulk insert ok")
        return resp.json()
    else:
        print(f"❌ Match history bulk insert failed: {resp.status_code} {resp.text}")
        return None

def simulate_match_history_bulk(user_tokens, user_ids):
    usernames = list(user_tokens.keys())
    # Esimerkkidata: kaksi ottelua
    matches = [
        {
            "player_username": usernames[0],
            "opponent_username": usernames[1],
            "played_at": "2025-08-26T12:00:00Z",
            "duration": "00:05:00",
            "player_score": 3,
            "opponent_score": 2,
            "opponent_id": user_ids[usernames[1]],
            "player_id": user_ids[usernames[0]],
            "player_name": usernames[0],
            "opponent_name": usernames[1],
            "result": "win",
            "is_guest_opponent": 0
        },
        {
            "player_username": usernames[2],
            "opponent_username": usernames[3],
            "played_at": "2025-08-26T12:10:00Z",
            "duration": "00:04:10",
            "player_score": 1,
            "opponent_score": 3,
            "opponent_id": user_ids[usernames[3]],
            "player_id": user_ids[usernames[2]],
            "player_name": usernames[2],
            "opponent_name": usernames[3],
            "result": "loss",
            "is_guest_opponent": 0
        },
        {
            "player_username": usernames[0],
            "opponent_username": usernames[2],
            "played_at": "2025-08-26T12:20:00Z",
            "duration": "00:06:00",
            "player_score": 4,
            "opponent_score": 2,
            "opponent_id": user_ids[usernames[2]],
            "player_id": user_ids[usernames[0]],
            "player_name": usernames[0],
            "opponent_name": usernames[2],
            "result": "win",
            "is_guest_opponent": 0
        }
    ]
    # Käytetään ensimmäisen käyttäjän tokenia
    token = user_tokens[usernames[0]]
    post_match_history_bulk(matches, token)

def add_all_users_as_rivals(user_tokens, user_ids):
    usernames = list(user_tokens.keys())
    for username, token in user_tokens.items():
        headers = get_auth_headers(token)
        my_id = user_ids[username]
        # Jokainen lisää kaikki muut kilpailijakseen
        for rival_username in usernames:
            if rival_username == username:
                continue  # Ei lisätä itseään
            data = {"rival_username": rival_username}
            response = requests.post(f"{STATS_URL}/rivals/", json=data, headers=headers, verify=False)
            if response.status_code == 200:
                print(f"✅ {username} added {rival_username} as rival")
            else:
                print(f"❌ {username} failed to add {rival_username} as rival: {response.status_code} {response.text}")

# Lisää tämä if __name__ == "__main__": -lohkoon
if __name__ == "__main__":
    user_tokens, user_ids = setup_default_data_users()
    simulate_tournament_history_bulk(user_tokens)
    simulate_match_history_bulk(user_tokens, user_ids)
    add_all_users_as_rivals(user_tokens, user_ids)