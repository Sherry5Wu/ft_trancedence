## Content Table
- [Team Role Assignment Suggestion](#team-role-assignment-suggestion)
- [8-Week Phase Plan (with 5 Devs)](#8-week-phase-plan-with-5-devs)
- [A GitHub folder structure layout](#a-github-folder-structure-layout)

## Team Role Assignment Suggestion
| Role             | Focus Area                           | Suggested Tasks                             |
| ---------------- | ------------------------------------ | ------------------------------------------- |
| 🛡️ **Person A** | **Authentication & Security Lead**   | Auth Service, JWT, 2FA                      |
| 👤 **Person B**  | **User Management & I18n**           | User Service, I18n Service                  |
| 🎮 **Person C**  | **Game Development & Customization** | Game Service, game logic, customization API |
| 💬 **Person D**  | **Chat System & Realtime**           | Chat Service, WebSockets                    |
| 📊 **Person E**  | **Stats + DevOps + API Gateway**     | Stats Service, Docker, API Gateway, Testing |

Everyone also contributes to frontend and reviews each other’s service code for quality and integration.


##  8-Week Phase Plan (with 5 Devs)

### Phase 1: Week 1 — System Bootstrapping (all hands)
| Tasks                                                                       | Who                  |
| --------------------------------------------------------------------------- | -------------------- |
| Setup project structure, mono-repo or sub-repos                             | Person E             |
| Set up `docker-compose`, basic services with Fastify                        | All (split services) |
| Init GitHub + CI config                                                     | Person E             |
| Scaffold frontend (Vue/React + i18n + JWT support)                          | Person B + All       |
| Deliverable: All services skeleton + can run `make up` to start base system |                      |

Deliverable: All services skeleton + can run make up to start base system<br>

### Phase 2: Week 2-3 — Auth + User System + I18n

| Task                                                                                | Who          |
| ----------------------------------------------------------------------------------- | ------------ |
| Auth service: `/register`, `/login`, `/2fa/setup`                                   | Person A     |
| JWT middleware, API Gateway routing                                                 | Person A + E |
| User profile CRUD, friends/blocks API                                               | Person B     |
| I18n service (translation REST API)                                                 | Person B     |
| Frontend login/signup flow                                                          | Person A + B |
| Deliverable: Can register/login with JWT and 2FA, see/edit profile, switch language |              |

Deliverable: Can register/login with JWT and 2FA, see/edit profile, switch language<br>

### Phase 3: Week 3-4 — Game System + Customization
| Task                                                                              | Who          |
| --------------------------------------------------------------------------------- | ------------ |
| Game WebSocket handling, `/match/start`, `/game/:id`                              | Person C     |
| Game logic: ball, paddles, scores, winner                                         | Person C     |
| Customization settings (themes, speed)                                            | Person C     |
| Connect JWT-authenticated users to WebSocket games                                | Person A + C |
| Deliverable: 2 players can match & play game via WebSocket with selected settings |              |

Deliverable: 2 players can match & play game via WebSocket with selected settings<br>

###  Phase 4: Week 4-5 — Live Chat System
| Task                                                              | Who          |
| ----------------------------------------------------------------- | ------------ |
| WebSocket server for channels, DMs                                | Person D     |
| Message persistence in SQLite                                     | Person D     |
| Mute/ban logic, JWT validation                                    | Person D + A |
| Chat frontend UI                                                  | Person D + B |
| Deliverable: Can chat in public room, create/join DMs, mute users |              |

Deliverable: Can chat in public room, create/join DMs, mute users<br>


### Phase 5: Week 5-6 — Stats and Leaderboards
| Task                                                              | Who          |
| ----------------------------------------------------------------- | ------------ |
| Stats service REST API `/users/:id/stats`, `/leaderboard`         | Person E     |
| Game service reports match results to stats-service               | Person C + E |
| Dashboard frontend with charts/tables                             | Person E + B |
| Deliverable: See match history, win rate, top 10 players UI-ready |              |

Deliverable: See match history, win rate, top 10 players UI-ready<br>

### Phase 6: Week 6-7 — Integration & DevOps
| Task                                                                            | Who                |
| ------------------------------------------------------------------------------- | ------------------ |
| API Gateway routing refinement                                                  | Person E           |
| Add auth proxying, rate limit, logs                                             | Person E           |
| Write integration & unit tests                                                  | All (own services) |
| Data backup, Makefile improvements                                              | Person E           |
| Deliverable: Fully tested system, clean build/start process, service tests pass |                    |

Deliverable: Fully tested system, clean build/start process, service tests pass<br>

###  Final Phase: Week 8 — Polish, Accessibility & Deployment
| Task                                                                                     | Who          |
| ---------------------------------------------------------------------------------------- | ------------ |
| Final UI polish, language switching                                                      | Person B     |
| Accessibility: color contrast, keyboard nav, labels                                      | Person B + D |
| Frontend deploy (Vercel, Netlify...)                                                     | Person E     |
| Backend deploy (Docker Hub / VPS)                                                        | Person E + A |
| Deliverable: Production-ready full app with all modules implemented and running smoothly |              |

Deliverable: Production-ready full app with all modules implemented and running smoothly<br>


###  Final Deliverables Summary
| Component       | Status at End                         |
| --------------- | ------------------------------------- |
| Microservices   | 7 services, tested and containerized  |
| Frontend        | Fully connected with i18n + JWT       |
| Game engine     | WebSocket powered with customization  |
| Real-time chat  | Working with channels, mute, etc.     |
| User system     | Avatar, profile, friends              |
| Stats dashboard | Charts, leaderboards                  |
| DevOps          | CI/CD, Makefile, Docker               |
| Accessibility   | Language switch, ARIA / semantic HTML |
| Docs            | README + API documentation            |


## A GitHub folder structure layout
### Root Project Layout (Monorepo)
```csharp
ft_transcendence/
├── docker-compose.yml
├── Makefile
├── .env
├── README.md
├── frontend/                    # Frontend app (Vue, React, or Next.js)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/            # API fetchers
│   │   └── i18n/
│   ├── package.json
│   └── vite.config.js / next.config.js
├── gateway/                     # API Gateway
│   ├── src/
│   │   └── index.js             # Fastify entry
│   ├── Dockerfile
│   └── package.json
├── services/                    # Microservices live here
│   ├── auth-service/
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   ├── controllers/
│   │   │   ├── utils/
│   │   │   └── index.js
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── prisma/              # SQLite schema
│   ├── user-service/
│   ├── game-service/
│   ├── chat-service/
│   ├── stats-service/
│   └── i18n-service/
├── scripts/                     # CLI tools or dev scripts
│   └── init-db.sh
└── docs/                        # API docs, architecture diagrams
    ├── openapi.yaml
    └── service-map.md
```

###  Key Conventions
| Folder/File          | Purpose                                               |
| -------------------- | ----------------------------------------------------- |
| `services/`          | All microservices live here with consistent structure |
| `frontend/`          | The only exposed service to users                     |
| `gateway/`           | Reverse proxy to route frontend to services           |
| `.env`               | Central config like JWT\_SECRET, DB\_PATHS            |
| `Makefile`           | Build/run/test shorthand for all services             |
| `docker-compose.yml` | Spins up all services locally with volumes/ports      |
| `docs/`              | API specs, architecture diagrams, service map         |

### Inside Each Microservice Example (auth-service/)
```pgsql
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
```
### Collaboration Tips
- Each teammate owns 1–2 services/* folders.<br>
- Use consistent naming in all microservices (e.g., src/, routes/, Dockerfile, prisma/).<br>
- Shared helper functions (e.g., JWT utils) can go in a shared libs/ folder if you later want to extract common logic.<br>

