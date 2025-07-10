# Just a placeholder dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm install

# Copy app source
COPY . .

# Build frontend
RUN npm run build

# Serve with a simple static file server
RUN npm install -g serve
CMD ["serve", "-s", "dist", "-l", "3000"]
