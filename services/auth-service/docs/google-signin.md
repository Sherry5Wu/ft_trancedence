# Google Signin Flow
There are two flow for google sign in.<br>

## 1. Using the Google ID Token directly (Implicit/“One-step” Flow)

**Flow:**<br>
1. Frontend integrates Google Sign-In.<br>
2. User logs in → Google returns an ID Token (JWT) to frontend.<br>
3. Frontend sends {idToken} to backend.<br>
4. Backend verifies the ID Token and optionally issues its own session/JWT.<br>

**Flow:**
- Simple, easy to implement.
- Works perfectly if all you need is authentication (know who the user is).
- No backend token exchange required.

**Cons:**
- Limited if you later want to access Google APIs (e.g., Google Drive, Gmail) — you need an - access token for that.
- ID Token has a short lifetime (usually 1 hour). If you need long-term access, you need a refresh token — which requires Auth Code flow.

## 2. Google Auth Code Flow (Authorization Code Flow)

**Flow:**
1. Frontend gets an authorization code from Google.
2. Backend exchanges the code for:
  - id_token → verifies user identity
  - access_token → access Google APIs
  - refresh_token → long-term access
3. Backend uses id_token for authentication and optionally stores access_token/refresh_token for API calls.

**Use cases:**
- You need access to Google APIs on behalf of the user (Drive, Gmail, Calendar, etc.).
- You want refresh tokens for long-term access.
- Security-sensitive apps — code exchange on backend reduces risk of token leaks.


## 3. The differences between googleId and google idToke

### **`googleId` (a.k.a. `sub` in the token payload)**
- This is a stable, unique identifier for a Google user.
- It’s a string like `"123456789012345678901"`.
- It never changes for the same Google account (unless the user deletes their account and creates a new one).
- You store this in your **database** to recognize a returning Google user.
👉 **Think of it as the user’s "primary key" from Google.**

### **`google idToken`**
- This is a **JWT (JSON Web Token)** issued by Google after the user authenticates.
- It contains user information (email, name, picture, and most importantly `sub = googleId`).
- It’s **short-lived** (usually expires in 1 hour).
- You must **verify it** using Google’s public keys to ensure:
  - It’s really issued by Google (not forged).
  - It hasn’t expired.
  - It was meant for your app (`aud` matches your client_id).
👉 **Think of it as a passport stamp that proves the user just signed in with Google.**
**Example from a decoded Google ID token:**<br>
```js
 {
  "sub": "103948230498230498",
  "name": "Jane Doe",
  "given_name": "Jane",
  "family_name": "Doe",
  "picture": "https://lh3.googleusercontent.com/a/AAcHTte...s96-c",
  "email": "janedoe@gmail.com",
  "email_verified": true,
  ...
  }
```
### How they work together
- The idToken is the temporary credential you receive each login attempt.
- From that idToken, you extract the googleId (sub).
- You check if this googleId already exists in your database:
  - If yes → user already registered → issue your own access/refresh tokens.
  - If no → first-time login → ask them to complete profile (username, pin), then save the googleId.
