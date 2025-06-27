## Phase 1: Foundation Setup (Infrastructure + Boilerplate)
Goal: Set up a working full-stack dev environment using Docker with Fastify + SQLite + TypeScript SPA.

1. Set up Docker environment:<br>
	- Use Docker Compose to spin up:<br>
		- Fastify backend<br>
		- Frontend (Vite + TS)<br>
		- SQLite in a volume<br>
	- Ensure HTTPS using self-signed certs or Traefik/nginx as reverse proxy.<br>
	- Ensure .env setup and .gitignore it.

2. Frontend base:
	- Basic SPA with routing (e.g., React + React Router or similar).
	- TypeScript setup.
	- Add i18n support (for multi-language support).

3. Backend base:
	- Set up Fastify.
	- Define initial structure (routes, services, DB access).
	- Connect to SQLite using Prisma or a lightweight ORM (if allowed).

## Phase 2: User Management
Goal: Implement account creation, login, profile, and JWT + 2FA.
1. User registration & login:
	- Email/password + hashed storage (bcrypt or Argon2).
	- JWT-based authentication system (access + refresh tokens).
	- Add 2FA (e.g., with Google Authenticator, OTP over TOTP protocol).
2. User profile:
	- Avatar upload
	- Username uniqueness
	- View profile, friends, status (online/offline)
	- Match history

## Phase 3: Pong Game Core
Goal: Build basic local Pong game, then move toward matchmaking and customization.

1. Build Pong game in frontend:
	- Keyboard control
	- Game loop + rendering (use HTML5 Canvas or Babylon.js lite if needed)
	- Game customization: power-ups, map variety, speed toggles

2. Add tournament logic:
	- Create tournament
	- Register users with alias
	- Matchmaking system (queue-based or round-robin)
	- Store scores in SQLite

## Phase 4: Live Chat
Goal: Implement chat + game invites + profile access.
1. WebSocket setup in Fastify.
2. Chat features:
	- 1:1 private messaging
	- Block users
	- Invite to match via chat
	- Notifications for upcoming matches
	- Click-through to user profiles

## Phase 5: User/Game Dashboards
Goal: Visualize gameplay history and user stats.

1. Game stats collection:
	- Wins/losses, longest win streak, average paddle speed, etc.

2. Dashboards:
	- Use charting libraries (e.g., Chart.js or D3.js)
	- Filter by time, tournament, opponent

## Phase 6: Internationalization
Goal: Add multilingual support to improve accessibility.

1. Frontend i18n system:
	- Use i18next or equivalent
	- Add support for at least 3 languages
	- Language switcher UI

2. Ensure translated strings for key components and feedback messages

## Final Phase: Polish, Secure, Test
1. Security review:
	- HTTPS + WSS enforced
	- SQL Injection / XSS checks
	- CSRF prevention if needed
	- JWT blacklisting/refresh handling

2. UX & UI testing:
	- Responsiveness
	- Browser compatibility (focus on Firefox)

3. Final Docker build & run script
	- Single-command launch
	- No bind-mounts if rootless mode limits apply

4. Documentation:
	- Architecture overview
	- CLI instructions (if any), DB schema
	- Justify any 3rd-party library use

## Suggested Timeline (Example 6–8 Weeks)
Week 1: Setup & infra <br>
Week 2–3: User Management <br>
Week 3–4: Pong Game + Tournaments<br>
Week 4–5: Live Chat + Matchmaking<br>
Week 5–6: Dashboard + Stats<br>
Week 6–7: Accessibility + Polish<br>
Week 8: Full testing, evaluation prep<br>
