Creating a Dockerfile that works for both development and production:

### 📁 Project Structure Example:
```
my-app/
├── Dockerfile
├── docker-compose.yml
├── docker-compose.override.yml     # (for development)
├── .dockerignore
├── package.json
└── src/
```

## Dockerfile (Multi-stage: Development + Production):
```
# Stage 1: Base (shared setup)
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./

# Stage 2: Development
FROM base AS development
ENV NODE_ENV=development
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]

# Stage 3: Production
FROM base AS production
ENV NODE_ENV=production
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## .dockerignore
```
node_modules
dist
.git
Dockerfile
docker-compose*
*.log
```

## `docker-compose.yml` (for production)
```
version: '3.9'
services:
  app:
    build:
      context: .
      target: production
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
```

## `docker-compose.override.yml` (for development)
```
version: '3.9'
services:
  app:
    build:
      context: .
      target: development
    volumes:
      - .:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
```

# Usage
### Development
```
docker-compose up
```
### Production
```
docker-compose -f docker-compose.yml up --build
```
