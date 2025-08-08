# The document for auth-service

## What is auth-service?
The Auth Service is responsible for: <br>
| Responsibility                           | Description                                                                          |
| ---------------------------------------- | ------------------------------------------------------------------------------------ |
| **User registration**                    | Create new user accounts with hashed passwords                                       |
| **Login authentication**                 | Validate credentials, issue JWT tokens                                               |
| **Two-Factor Authentication (2FA)**      | Enable/verify TOTP-based and Emial-based OTP 2FA                         |
| **Remote authentication** (Google OAuth) | Let users log in using Google Sign-In                                                |
| **Token management**                     | Generate, sign, and validate JSON Web Tokens (JWTs)                                  |
| **Securing other services**              | Other services rely on this one to authenticate users and extract `userId` from JWTs |

it is the single source of truth for identity and authentication in your backend.

## What Features Must It Implement?
| Endpoint               | Purpose                                        |
| ---------------------- | ---------------------------------------------- |
| `POST /signup`         | Register new users securely                    |
| `POST /login`          | Authenticate user, check if 2FA is needed      |
| `POST /2fa/setup`      | Enable 2FA, return TOTP secret                 |
| `POST /2fa/verify`     | Validate user’s one-time code                  |
| `GET /whoami`          | Return info about the currently logged-in user |
| `POST /oauth/google`   | (Optional) Handle Google OAuth flow            |

## File Tree
```csharp
auth-service/
├── Dockerfile
├── package.json
├── .env
├── src/
│   ├── app.js    # The main entry point of auth-service. Fastify server setup + plugin registration
│   ├── routes/           # Split routes by feature
│   │   ├── google-auth.js  # Google OAuth endpoints
│   │   ├── auth.routes.js  # Core auth: register, login, logout, refresh token
│   │   ├── health.routes.js   # Service health check (useful in microservices)
│   │   ├── user.routes.js   # For profile management (view/update user info)
│   │   └── 2fa.routes.js   # Two-Factor Authentication endpoints
│   ├── services/         # Business logic
│   │   ├── auth.service.js # Core auth logic
│   │   ├── jwt.service.js  # JWT generation/validation
│   │   └── 2fa.service.js  # TOTP/email 2FA
│   ├── db/
│   │   ├── index.js      # DB connection
│   │   └── models/       # SQLite schemas
│   │       ├── refreshToken.js
│   │       └── user.js
│   └── utils/           # Reusable helpers
│       ├── crypto.js    # Password hashing
|       ├── validator.js # Validation functons
|       ├── jwt.js       # Generate token and verify token
│       └── errors.js    # Custom error classes
|── test/
|   ├──integration
│   │   ├── routes.test.js
│   │   ├── validators.test.js
|   ├──unit
│   │   ├── db.test.js
│   │   ├── 2fa.service.test.js
│   │   ├── jwt.service.test.js
|   ├──utils
│   │   ├── test-db.js
│   │   ├── test-server.js
```
## Step-by-Step: How to Build auth-service

### 1. Set up project
- Use Fastify, SQLite, JWT, bcrypt, and speakeasy<br>
- Use .env to store JWT_SECRET<br>

### 2. Database schema
Create a table:
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE,
  password TEXT,
  is_2fa_enabled INTEGER DEFAULT 0,
  totp_secret TEXT
);
```
### 3. Signup flow
- Hash password using bcrypt<br>
- Store in SQLite<br>
```js
await db.run(`INSERT INTO users (email, password) VALUES (?, ?)`, [email, hashedPw])
```
### 4. Login flow
- Compare password<br>
- If 2FA is enabled, don’t issue JWT yet<br>
- Otherwise, sign JWT and return it<br>
```js
const token = fastify.jwt.sign({ userId: user.id });
```
### 5. 2FA setup
- Use `speakeasy.generateSecret()`<br>
- Save secret in DB<br>
- Send `otpauth_url` to frontend to generate a QR code<br>

### 6. 2FA verify
- Use `speakeasy.totp.verify()` to check the one-time password (token)<br>
- If valid, return JWT<br>

### 7. Google/42 OAuth (optional module)
- Redirect to Google login<br>
- Use Google’s API to verify the returned code/token<br>
- Create user if not in DB<br>
- Issue JWT<br>

### 8. JWT Middleware
- Any internal service (e.g. `user-service`) will send the token in the header:<br>
  ```makefile
  Authorization: Bearer <token>
  ```
- auth-service should expose a utility to verify that token and extract userId;<br>

## payload
Payload for JWTs
```json
{
  "id": "UUID",          // Always required for identifying user
  "email": "user@email", // Useful for quick lookups
  "usename": "userA",    // Use for showing the username for frontend
  "role": "user",        // Default role now, can expand later (admin, mod, etc.)
  "is2FAEnabled": true   // Optional, useful for enforcing flows
}
```

## Integration with the Authentication Flow
Based on typical 2FA + OAuth + JWT services, here’s a forward-thinking integration plan:<br>
**1.Login (email/password)**<br>
  - Validate with `authenticateUser()`.<br>
  - If `user.is2FAEnabled` → don’t immediately issue access tokens; instead return **a temporary one-time 2FA token** (short TTL) so the client can call the 2FA confirmation endpoint.<br>
  - After successful TOTP or backup-code validation, issue **full access & refresh tokens**.<br>

**2. Google OAuth**<br>
  - Use your existing Google routes to fetch (or create) a user by `googleId`.<br>
  - If 2FA is enabled, same flow as above: require TOTP before issuing JWTs.<br>
  - Otherwise, issue JWTs immediately.<br>

**3. Token Refresh**<br>
  - Client sends refresh token to `/auth/refresh`.<br>
  - In handler:<br>
    - Verify and look up the stored `RefreshToken` record.<br>
    - If revoked or expired → reject.<br>
    - If valid → rotate: mark old token as revoked (set `revokedAt` and `replacedByToken`), create/store a new one, and return new tokens.<br>

**4. Logout**<br>
  - Client calls /auth/logout with refresh token.<br>
  - Handler finds the RefreshToken record and sets revokedAt.<br>
  - Client should also clear cookies/localStorage.<br>

**5. Protected Routes**<br>
  - Require a valid access token via middleware (see Q7).<br>
  - If token’s `is2FAEnabled` is `false` but route requires 2FA, you can reject with `ForbiddenError('2FA required')`.<br>

This flow covers standard email/password, 2FA gating, OAuth login, rotation, and secure logout.<br>

## AccessToken and RefreshToken
**Access Token:**
This is what the client needs to send with every request to the backend when accessing protected resources or APIs. The backend checks if this token is valid and not expired. If it’s valid, the backend processes the request.<br>

**Refresh Token:**
This token is not sent with every request. Instead, it’s used only when the Access Token expires. The client sends the Refresh Token to the backend to ask for a new Access Token. If the Refresh Token is valid (i.e., user is still “logged in”), the backend issues a fresh Access Token.<br>

- If the Access Token is valid → backend allows access to data.
- If the Access Token expired → client uses Refresh Token to get a new Access Token.
- If Refresh Token is valid → user is considered logged in, and a new Access Token is given.
- If Refresh Token expired or invalid → user needs to log in again.
