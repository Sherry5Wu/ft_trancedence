# FROM node:20-alpine

# WORKDIR /app

# COPY package*.json ./
# RUN npm install

# RUN npm install fastify-cors

# COPY . .

# EXPOSE 3000

# CMD ["node", "src/index.js"]

FROM node:20-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
