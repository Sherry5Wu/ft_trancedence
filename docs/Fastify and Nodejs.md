# Table
- [Node.js](#node-js)
	- [What is Node.js?](#what-is-node-js)
	- [Why Node.js?](#why-node-js)
	- [ESModules: Export and Import Syntax](#esmodules-export-and-import-syntax)
	- [Sequelize](#sequelize)
- [What is Fastify?](#what-is-fastify)
	- [Request Lifecycle for a API](#request-lifecycle-for-a-api)

# Node.js
## What is Node.js?
Node.js is a runtime environment that allows you to run JavaScript on the server side. Traditionally, JavaScript only ran in web browsers, but Node.js enables it to run outside the browser — perfect for building backend servers, APIs, scripts, and more. It's fast, scalable, and event-driven, which makes it a popular choice for modern web applications. <br>

## Why Node.js?
Node.js excels at handling many simultaneous connections with minimal overhead, making it perfect for:<br>
- `Real-time applications` (chats, gaming, collaboration tools)<br>
- APIs and microservices<br>
- Data streaming applications<br>
- Command-line tools<br>
- Server-side web applications<br>
Its non-blocking, event-driven architecture makes it highly efficient for I/O-heavy workloads.<br>

## ESModules: Export and Import Syntax

### Export
The different export styles in JavaScript — **default export, named export, and mixed export**.<br>
#### 1. Default Export( export default)
✅**Use when:**<br>
You want to export only one main value (function, class, object, etc.) from a module.
**Syntax**
```js
// person.js
export default function greet(){
	console.log("Hello!");
}
```
or
```js
function greet() {
  console.log("Hello!");
}

export default greet;
```
**Import**
```js
// app.js
import greet from './person.js'; // no {} needed
```
✅ Pros:<br>
- Simpler to import (you choose the name).<br>
- Clear entry point for the module.<br>

❌ Cons:<br>
- You can only have one default export per file.<br>
- Less clear when importing multiple things — harder to know what’s inside.<br>

#### 2. Named exports (export {})
✅**Use when:**<br>
You want to export multiple values from a module.<br>

**Syntax**
```js
// math.js
export const add = (a, b) => a + b;
export const multiply = (a, b) => a * b;
```
or
```js
const subtract = (a, b) => a - b;
export { subtract };
```
**Import**
```js
// app.js
import { add, multiply } from './math.js';
```
✅ Pros:<br>
- Can export many things from a file.<br>
- Explicit: you know exactly what you’re importing.<br>

❌ Cons:<br>
- You must use the exact names (or alias them).<br>
- Import syntax is longer.<br>

#### 3. Mixed Export (default + named)
You can combine both:<br>
**Example**<br>
```js
// logger.js
export default function log(msg) {
  console.log(msg);
}

export const LEVEL = 'debug';
```
**Import**<br>
```js
import log, { LEVEL } from './logger.js';
```
#### 4. Best Practices
- Use default export when your module is centered around one thing (like a class, function, or config object).<br>
- Use named exports when your module provides a collection of utilities or related items.<br>
- Avoid mixing both unless necessary — it can confuse module usage.<br>

### Import

| Export in module       | Import syntax                |
| ---------------------- | ---------------------------- |
| `export default ...`   | `import X from '...'`        |
| `export const A = ...` | `import { A } from '...'`    |
| `export class B {}`    | `import { B } from '...'`    |
| Both default + named   | `import X, { A } from '...'` |

## Sequelize

### What is Sequelize
Sequelize is a promise-based Node.js ORM (Object-Relational Mapper) for SQL databases. It supports:<br>
- PostgreSQL<br>
- MySQL<br>
- MariaDB<br>
- SQLite<br>
- Microsoft SQL Server<br>

ORMs let you interact with your database using JavaScript/TypeScript objects instead of writing raw SQL queries.<br>
For example, assuming there is users table in a database, before you need to select data like this:<br>
```sql
SELECT * FROM users WHERE username = 'sherry';
```
Using Sequelize, you can code like this:<br>
```js
const user = await User.findOne({ where: { username: 'sherry' } });
```
The purpose of an ORM is to let you use familiar code instead of writing SQL.

### Common Us Cases
- Building backends with Express.js or Fastify<br>
- Managing models and migrations in microservices<br>
- Interfacing with databases without writing raw SQL for everything<br>


# What is Fastify?
Fastify is a web framework built on top of Node.js. It's like Express.js, but faster and more efficient. Fastify is designed to be:<br>
- Lightweight
- High-performance (very fast HTTP server)
- Developer-friendly
- Plugin-based, so it's easy to extend and scale.

Developers use Fastify to create REST APIs, microservices, and backend applications that are robust and easy to maintain.<br>

Example Use Case:<br>
With Node.js, you get the engine to run server-side code.<br>
With Fastify, you get a toolkit to build web APIs faster and with better structure.<br>

## Request Lifecycle for a API
Work flow of registerUser:
1. Client calls API → POST /register<br>
2. Fastify Route Handler (in routes/auth.js):<br>
	- Applies JSON schema validation automatically<br>
	- If invalid → Fastify returns 400 error (never reaches your service)<br>
3. If valid:<br>
	- The route handler calls your service function (registerUser() in auth.service.js)<br>
4. Service Layer:<br>
	- Handles business logic: DB queries, password hashing, etc.<br>
	- Returns sanitized user object<br>
5. Route handler sends response to the client<br>

**Why this is good:**
- Validation happens early → Service layer assumes input is valid.
- Cleaner services → No need to repeat validation logic.
- Security → Prevents bad data from ever touching your DB logic.

**Visual Flow:**
```less
[ HTTP Request ]
      |
      v
[ Fastify Route + Schema Validation ]
      |
      v
[ auth.service.js -> registerUser() ]
      |
      v
[ DB -> User created ]
      |
      v
[ Response to Client ]
```
