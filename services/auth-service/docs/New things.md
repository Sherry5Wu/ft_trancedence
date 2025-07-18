# Table
- [CORS](#cors)
- [What is Route?](#what-is-route)
- [2FA](#2fa)
- [Sequelize](#sequelize)
- [package.json](#pakcage-jason)
# CORS
## What is CORS?
CORS (Cross-Origin Resource Sharing) is a security mechanism implemented by web browsers to control how web pages from one origin (domain, protocol, or port) can request resources from a different origin. It relies on HTTP headers to allow or block cross-origin requests.<br>

## Why is CORS Needed?
Browsers enforce the Same-Origin Policy (SOP), which restricts web pages from making requests to a different origin unless explicitly allowed. CORS provides a way for servers to relax this restriction securely. <br>

## Real-World Example
Suppose your frontend is hosted at:
```arduino
https://my-frontend.com
```
And it tries to make a request to:
```arduino
https://api.other-backend.com/data
```
Using JavaScript:
```js
fetch('https://api.other-backend.com/data');
```
The browser sees that the origin is different, so it checks if the server at `api.other-backend.com` allows this request.

If not, the browser blocks the request — this is a CORS error.

## How to fix CORS errors?
The backend must explicitly allow cross-origin requests by including specific headers in the response.<br>
Common example:
```http
Access-Control-Allow-Origin: https://my-frontend.com
```
## Other Important Headers
| Header                             | Purpose                                |
| ---------------------------------- | -------------------------------------- |
| `Access-Control-Allow-Origin`      | Specifies which origin(s) are allowed  |
| `Access-Control-Allow-Methods`     | Allowed HTTP methods (GET, POST, etc.) |
| `Access-Control-Allow-Headers`     | Allowed custom headers in requests     |
| `Access-Control-Allow-Credentials` | Allows cookies/auth to be sent         |

# What is Route?
In the context of a web backend like auth-service in the ft_transcendence project, the word "route" refers to a definition of how the server responds to different HTTP requests (like GET, POST, etc.) on specific URLs. <br>

In backend development (especially with frameworks like Fastify, Express, etc.), a route is:<br>

	A way to map a URL path and an HTTP method (like GET, POST) to a specific function (called a handler) that tells the server what to do when that URL is accessed.

So your `routes/` folder contains different files like:<br>
- `2fa.js`: defines the API endpoints (routes) for two-factor authentication.<br>
- `google-auth.js`: defines routes for Google OAuth login.<br>
- `jwt.js`: defines routes related to JWT-based login/authentication.<br>
Each file registers different endpoints that users or other services can call. For example, `POST /login`, `GET /verify`, etc.<br>

# 2FA

## What is 2FA?
Two-Factor Authentication (2FA) is a security process that requires two different types of verification to prove your identity when logging in to an account.<br>

## How it works?
Instead of just entering a password (which is one factor, something you know), 2FA adds a second factor, such as:<br>
1. Something you have – like a phone app (e.g., Google Authenticator, Authy) that generates a 6-digit code.<br>
2. Something you are – like a fingerprint or face recognition (used in more advanced systems).<br>

So when you log in:<br>
- Step 1: You enter your password.<br>
- Step 2: You're asked to enter a verification code from your app or device.<br>

## Why it’s important:
Even if someone steals your password, they can’t log in unless they also have access to your second factor (like your phone).<br>

# Sequelize
Sequelize is a Node.js ORM (Object-Relational Mapping) for SQL databases like PostgreSQL, MySQL, MariaDB, SQLite, and MSSQL. It lets you interact with your database using JavaScript instead of writing raw SQL queries.<br>

```js
const { DataTypes } = require('sequelize');
```
is using destructuring assignment to import the DataTypes object from the sequelize library. <br>

## DataTypes
`DataTypes` is an object provided by Sequelize that defines the types of data you can use for your model fields, such as:<br>
- `DataTypes.STRING` – for text<br>
- `DataTypes.INTEGER` – for integers<br>
- `DataTypes.BOOLEAN` – for true/false<br>
- `DataTypes.DATE` – for dates/timestamps<br>
- `DataTypes.FLOAT`, DataTypes.TEXT, etc.<br>

# package.json
`package.json` is the metadata file that lives at the root of a Node.js project. It defines:<br>
- Project name, version, and description<br>
- Your dependencies<br>
- Scripts to build, test, or run your app<br>
- Entry point for the app (`main`)<br>
- Author info, license, and more<br>
It’s essential for npm (Node Package Manager) to install, run, and maintain your project and its dependencies.<br>

Example: <br>
```json
{
  "name": "my-app",
  "version": "1.0.0",
  "description": "My first Node.js app",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "test": "echo \"No test specified\" && exit 0"
  },
  "keywords": ["node", "example"],
  "author": "Sherry",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.0"
  }
}
```
## Dependencies vs DevDependencies
- dependencies: Needed in production.<br>
- devDependencies: Needed only for development (e.g., linters, test frameworks).<br>
`dependencies` are always installed in development, unless you specifically tell npm to skip them (e.g., `--production`). <br>

##  Versioning (Semantic Versioning)
In dependencies:<br>
- "^1.2.3" = any minor or patch updates (1.x.x)<br>
- "~1.2.3" = only patch updates (1.2.x)<br>
- "1.2.3" = exact version<br>
