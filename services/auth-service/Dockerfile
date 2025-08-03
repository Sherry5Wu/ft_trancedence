# Why the below code is better than copy all the files first then "npm install"
# Because Docker builds images in layers. If a layer doesn't change, it can reuse
# the cached version. So in the below version, if nothing changed in package.json,
# Docker will start from "COPY . .", skip re-running "npm install"

# Stage 1: Development (includes devDependencies, nodemon, etc.)
FROM node:20-alpine AS dev

WORKDIR /app

# Create folder for auth.db or any data persistence needs
RUN mkdir -p /app/db

# Install all dependencies (prod + dev) package-lock.json
COPY package.json ./

RUN npm install

# Copy source code
COPY . .

# Expose port for dev server
EXPOSE 3001

# Default command: run with nodemon for hot reload
CMD ["npx", "nodemon", "src/app.js"]


# Stage 2: Production (only prod dependencies)
FROM node:20-alpine AS prod

WORKDIR /app

# Create folder for auth.db or any data persistence needs
RUN mkdir -p /app/db

# Copy package files and install prod dependencies only
COPY package.json package-lock.json ./

RUN npm install --production

# Copy only the built source code
COPY src/ ./src

# Expose port for prod server
EXPOSE 3001

# Default command: run the app normally
CMD ["node", "src/app.js"]
