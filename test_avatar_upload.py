import requests
import os

BASE_URL = "https://localhost:8443"
AUTH_URL = f"{BASE_URL}/as"

TEST_USER_EMAIL = "testuser@example.com"
TEST_USER_PASSWORD = "P*assword123"

# Helper functions from your main test file (copy if needed)
def login_user(email, password):
    data = {"identifier": email, "password": password}
    response = requests.post(f"{AUTH_URL}/auth/login", json=data, verify=False)
    if response.status_code == 200:
        return response.json()["accessToken"]
    return None

def get_auth_headers(token):
    return {"Authorization": f"Bearer {token}"}

def test_upload_avatar():
    """Test POST /users/me/upload-avatar"""
    ACCESS_TOKEN = login_user(TEST_USER_EMAIL, TEST_USER_PASSWORD)
    headers = get_auth_headers(ACCESS_TOKEN)
    # Oletetaan että testikuva.png löytyy samasta kansiosta
    with open("omartela-pieni.jpg", "rb") as f:
        files = {"avatar": ("omartela-pieni.jpg", f, "image/jpeg")}
        response = requests.post(f"{AUTH_URL}/users/me/upload-avatar", files=files, headers=headers, verify=False)
    print(response.json())
    assert response.status_code == 200
    json_response = response.json()
    assert "avatarUrl" in json_response
    print("✅ Avatar upload test passed", json_response["avatarUrl"])

def test_get_avatar():
    """Test GET avatar image (public)"""
    ACCESS_TOKEN = login_user(TEST_USER_EMAIL, TEST_USER_PASSWORD)
    headers = get_auth_headers(ACCESS_TOKEN)
    # Tarkistetaan että token on validi ja saadaan käyttäjän ID
    response1 = requests.post(f"{AUTH_URL}/auth/verify-token", headers=headers, verify=False)
    print(headers)
    print(response1)
    assert response1.status_code == 200
    username = response1.json()["username"]
    # Jos url on esim. /uploads/avatars/xxx.png, tee täysi url
    avatar_url = requests.get(f"{AUTH_URL}/users/avatar/{username}", verify=False)
    print(avatar_url)
    response = requests.get("https://localhost:8443/uploads/avatars/" + avatar_url)
    assert response.status_code == 200
    assert response.headers["Content-Type"].startswith("image/")