# FT_TRANCEDENCE
**ft_transcendence** is a **full-stack web application** and multiplayer gaming platform built as part of the 42 curriculum.<br>
The project combines real-time gameplay, user management, and tournament features while following a microservices architecture with secure authentication.<br>
Players can compete in a classic Pong game against friends, or random opponents, and managing their profiles.<br>

## Key Features

🎮 Real-time Pong Gameplay – Play against humans or AI opponents.<br>
🧑‍🤝‍🧑 User Management – Registration, login, and profile customization.<br>
🔐 Secure Authentication – JWT-based login and Two-Factor Authentication (2FA).<br>
🏆 Tournaments – Organize and participate in competitive tournaments.<br>
🌐 Multi-language Support – Accessibility for diverse users.<br>
🐳 Containerized Deployment – Fully managed with Docker Compose.<br>

## Tech Stack
**Frontend**
- React – Component-based UI
- TypeScript – Type-safe development
- Tailwind CSS – Utility-first styling

**Backend & Architecture**
- Node.js + Fastify – High-performance backend services
- Microservices Architecture – Modular design for scalability
- SQLite – Lightweight database for persistence
- Sequelize – ORM for structured and maintainable database management
- WebSockets – Real-time communication
- Docker & Docker Compose – Simplified deployment and isolation

## How to run
1. Clone the project
```sh
git clone https://github.com/Sherry5Wu/ft_trancedence.git ft_trancedence && cd ft_trancedence
```

2. This project uses a .env file to store sensitive configuration values such as authentication secrets, API keys, and database paths.<br>
Here are steps for prepare your own .env files.<br>
**Copy .env.example to .env**
```bash
cp ./services/auth-service/.env.example ./services/auth-service/.env
```
**Fill in your own values**
Open the .env file and replace the placeholder values with your own credentials or secrets. For example:
```bash
#jwt_secret_key (32+)
JWT_SECRET=your-jwt-secret-here (32+ characters)
JWT_REFRESH_SECRET=your-refresh-secret-here

# 2fa encryption key
TWOFA_ENC_KEY=your-2fa-encryption-key-here

# Google sign in
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```
The backend automatically reads the variables from your .env file. Make sure the values are valid; otherwise, authentication and database connections may fail.<br>

3. Build the containers up
```sh
make
```
please be patient, this step may take around 2~3 minutes.<br>

4. After all the services(containers) are up, then you can access to the website: https://localhost:8443 <br>
Because the website uses a self-signed certificate, you will see the warning page shown below.<br>
Don’t worry — just click “Advanced”, then click “Proceed to localhost (unsafe)”.<br>
Note: I used Google Chrome, so if you are using a different browser, the wording may be slightly different.<br>

![alt text](./z-images/self-signed-1.png)

![alt text](./z-images/self-signed-2.png)

Now should see the frist page of our website:
![alt text](./z-images/First-page.png)

then you start to use our website to play some pinpang games.<br>

Below are some pages from website:

![alt text](./z-images/main-page.png)

![alt text](./z-images/game.png)
