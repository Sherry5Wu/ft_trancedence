# Why the below code is better than copy all the files first than "npm install"
# Because Docker builds images in layers. If a layer doesn't change, it can reuse
# the cached version. So in the below version, if nothing changed in package.json,
# Docker will start from "COPY . .", skip re-running "npm install"

FROM node:20-alpine
WORKDIR /app
# Created a folder for auth.db file in container
RUN mkdir -p /app/db

COPY package.json .
# when install npm, the file "package.json" will be read
RUN npm install
COPY . .

EXPOSE 3001
CMD ["npm", "start"]
