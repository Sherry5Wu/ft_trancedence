# The document for auth-service

## What is auth-service?
The Auth Service is responsible for: <br>
| Responsibility                           | Description                                                                          |
| ---------------------------------------- | ------------------------------------------------------------------------------------ |
| **User registration**                    | Create new user accounts with hashed passwords                                       |
| **Login authentication**                 | Validate credentials, issue JWT tokens                                               |
| **Two-Factor Authentication (2FA)**      | Enable/verify TOTP-based 2FA (e.g., Google Authenticator)                            |
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
auth-service/
├── Dockerfile
├── package.json
├── .env
├── src/
│   ├── app.js            # Fastify server setup + plugin registration
│   ├── routes/           # Split routes by feature
│   │   ├── google-auth.js  # Google OAuth routes
│   │   ├── jwt.js         # Login/token routes
│   │   └── 2fa.js        # 2FA routes
│   ├── services/         # Business logic
│   │   ├── auth.service.js # Core auth logic
│   │   ├── jwt.service.js  # JWT generation/validation
│   │   └── 2fa.service.js  # TOTP/email 2FA
│   ├── db/
│   │   ├── index.js      # DB connection
│   │   └── models/       # SQLite schemas
│   │       └── user.js
│   └── utils/           # Reusable helpers
│       ├── crypto.js    # Password hashing
|       ├── validator.js # Validation functons
│       └── errors.js    # Custom error classes

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
