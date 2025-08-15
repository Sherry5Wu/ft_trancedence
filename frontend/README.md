# ft_trancedence
A full-stack multiplayer pong platform built using a microservice architecture.

## 📦 Services

| Name             | Port | Description                       |
|------------------|------|-----------------------------------|
| Gateway          | 8080 | API Gateway                       |
| Frontend         | 3000 | Web UI (React/Vue)                |
| Auth Service     | auto | Handles login, 2FA, JWT           |
| User Service     | auto | User profile, friends             |
| Game Service     | auto | Real-time pong matches            |
| Chat Service     | auto | Chatrooms, DMs (WebSocket)        |
| Stats Service    | auto | Match history, leaderboard        |
| I18n Service     | auto | Translations for multilingual UI  |

## 🚀 Quick Start

```bash
# Start all services
make up

# Stop all services
make down

# Rebuild everything
make rebuild
```

## Tech Stack
- Fastify (backend)
- SQLite (per-service)
- React/Vue (frontend)
- Docker Compose
- GitHub Actions (CI)
