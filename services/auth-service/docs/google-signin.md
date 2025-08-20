# Google Signin Flow
There are two flow for google sign in.<br>

## 1. Using the Google ID Token directly (Implicit/“One-step” Flow)

**Flow:**
1. Frontend integrates Google Sign-In.
2. User logs in → Google returns an ID Token (JWT) to frontend.
3. Frontend sends {idToken} to backend.
4. Backend verifies the ID Token and optionally issues its own session/JWT.

Pros:

Simple, easy to implement.

Works perfectly if all you need is authentication (know who the user is).

No backend token exchange required.

Cons:

Limited if you later want to access Google APIs (e.g., Google Drive, Gmail) — you need an access token for that.

ID Token has a short lifetime (usually 1 hour). If you need long-term access, you need a refresh token — which requires Auth Code flow.

2. Google Auth Code Flow (Authorization Code Flow)

Flow:

Frontend gets an authorization code from Google.

Backend exchanges the code for:

id_token → verifies user identity

access_token → access Google APIs

refresh_token → long-term access

Backend uses id_token for authentication and optionally stores access_token/refresh_token for API calls.

Use cases:

You need access to Google APIs on behalf of the user (Drive, Gmail, Calendar, etc.).

You want refresh tokens for long-term access.

Security-sensitive apps — code exchange on backend reduces risk of token leaks.
