## Recommended Service Development Order

| Priority                | Service                                                                                                      | Why First? |
| ----------------------- | ------------------------------------------------------------------------------------------------------------ | ---------- |
| 🥇 1. **Auth Service**  | Core to everything — login, JWT, 2FA, remote auth. Other services depend on user identity.                   |            |
| 🥈 2. **User Service**  | Builds on auth. Manages user profiles, friends, blocks. Needed for match history and personalization.        |            |
| 🥉 3. **Gateway**       | Needed to route requests and enforce JWT validation. It connects everything once other services are working. |            |
| 🟨 4. **Stats Service** | Can be stubbed or mocked initially. Depends on completed game results and user IDs.                          |            |
| 🟩 5. **i18n Service**  | Lowest priority — can be built last. Your app works fine in one language during dev.                         |            |

##  Suggested Flow

### 1. Start with auth-service
✅ Set up Fastify<br>
✅ Create /login, /signup, /2fa, /oauth/google<br>
✅ Issue and validate JWTs<br>
✅ Save users in SQLite<br>

### 2. Build user-service
✅ Connect via JWT (from Auth)<br>
✅ Expose /profile, /friends, /block<br>
✅ Handle avatars, status, match history<br>

### 3. Wire up gateway
✅ Implement JWT middleware<br>
✅ Route /auth, /user, etc. to services<br>
✅ Add WebSocket passthrough for game-service later<br>

### 4. Create stats-service
✅ Define endpoints like /user/:id/stats<br>
✅ Accept match result submissions from game-service<br>
✅ Use SQLite for now<br>

### 5. Finish with i18n-service
✅ Add endpoint like /translate?key=welcome&lang=fr<br>
✅ Use static JSON files per language<br>
✅ Plug into frontend last<br>
