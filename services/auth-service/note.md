
1. graceFullyShutDown() ????

2. DB Bootstrap (src/db/index.js)
Using alter: true in prod can be risky; explicit migrations (e.g. with Umzug) are
safer for production.

3. consider the avatar image dimensions limitation function.

4. New API: getch user list : username and avatar


Build and run docker

1. Dockerize and run
docker build --target dev -t auth-service .
(-t === --tag)
docker run -p 3001:3001 auth-service

docker run --env-file ./path/to/your/.env -p 3001:3001 --name auth-service your-image-name


Auto-generate API docs
1.
npm install @fastify/swagger @fastify/swagger-ui

2. Now, after you start your container/app, you can open http://localhost:3001/docs to
see interactive API docs generated from your route schemas automatically.


1. checking the health:
curl http://localhost:3001/health

2. Send a regiter request
Can  you curl / Postman
```sh
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com", "username":"usernameA","password":"myPassword*123", "pinCode":"5632"}'
```

Force remove in one step:
docker rm -f $(docker ps -a -q)

Clean up unused images/volumes/network
docker system prune --all --volumes

// remove all the docker images
docker rmi -f $(docker images -q)

// list all the dockers (running + stopped)
docker ps -a

// remove all the containers
docker rm -f $(docker ps -aq)

Testing uploading a avatar
```sh
curl -X POST http://localhost:3000/user/avatar \
  -F "avatar=@/path/to/your/avatar.jpg"
```

```sh
docker exec -it <docker-name> sh
```
// Install sqlite3
```sh
apk add --no-cache sqlite
```
// Get into the database
```sh
sqlite3  <path/to>/auth.db
.table
.schema Users
SELECT * FROM Users;
```
Delete a table
```sh
DROP TABLE IF EXISTS Users_backup;
```

// Directly call a API if there is no authentication
```sh
curl -i http://localhost:3000/users/all
```
-i → Includes the HTTP response headers in the output, not just the body.

