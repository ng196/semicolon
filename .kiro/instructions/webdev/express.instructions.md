---

description: Updated Express.js conventions and backend best practices for Node.js development.

---

description: Updated Express.js conventions and backend best practices for Node.js development.

---

# Express.js Rules and Best Practices

## ⚙️ Core Architecture

* Maintain a **clear middleware order**: configuration → parsers → custom middleware → routes → error handling.
* Organize routes using **Express Router** for modularity and clarity.
* Group related routes (e.g., `/users`, `/events`, `/projects`) into dedicated route files.
* Use **controllers** to keep request-handling logic separate from route definitions.
* Keep **services** responsible for data and business logic (database queries, validations, etc.).
---

## 🧱 Project Structure Example

```
backend/
├── src/
│   ├── routes/          # Express routers (endpoints)
│   ├── controllers/     # Request handling and response shaping
│   ├── services/        # Core business logic
│   ├── models/          # Data models or ORM schemas
│   ├── middleware/      # Auth, validation, error handling
│   ├── database/        # DB connection and query helpers
│   ├── utils/           # Reusable helpers (logger, formatters)
│   └── server.ts        # Express app entry point
└── .env                 # Environment variables
```

---

## 🧩 Middleware & Request Flow

* Load global middleware early:

  ```js
  app.use(express.json()); // Body parsing
  app.use(cors());         // Cross-origin requests
  app.use(logger());       // Request logging
  ```

* Define routes after middleware, and error handler last:

  ```js
  app.use('/api/users', userRoutes);
  app.use(errorHandler);
  ```

* Use **authentication and authorization middleware** for protected routes.

* Centralize your **error handling** middleware:

  ```js
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ message: err.message });
  });
  ```

---

## ⚡ Async Handling & Validation

* Use **async/await** with `try/catch` in controllers or wrap routes with async error handlers.
* Implement **request validation** using:

  * `express-validator`
  * or a schema library like `zod` or `yup`.
* Always return proper **HTTP status codes**:

  * 200 (OK)
  * 201 (Created)
  * 400 (Bad Request)
  * 401 (Unauthorized)
  * 404 (Not Found)
  * 500 (Internal Server Error)

---

## 🧠 Environment & Configuration

* Store all configurable values in `.env`.

  ```env
  PORT=3000
  DATABASE_URL=./database/campushub.db
  JWT_SECRET=supersecretkey
  ```
* Load environment variables using `dotenv` at app startup.
* Create a simple `config.ts` to centralize them:

  ```ts
  export const config = {
    port: process.env.PORT || 3000,
    dbUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET,
  };
  ```

---

## 🪵 Debugging & Logging

* Use a logging middleware like `morgan` for development and a structured logger (e.g., `winston`, `pino`) for production.
* Create a `logger.ts` utility:

  ```ts
  import pino from 'pino';
  export const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
  ```
* Use scoped logs in each controller/service:

  ```ts
  logger.info({ route: '/events', action: 'fetch-all' }, 'Fetching all events');
  ```
* For debugging:

  * Use the `DEBUG` environment variable (`DEBUG=express:* node src/server.js`).
  * Use Chrome DevTools or VS Code debugger to set breakpoints in Node.

---

## 🔒 Security Practices

* Sanitize all incoming data to prevent injection attacks.
* Enable CORS only for trusted domains.
* Avoid storing plain-text passwords — always hash (e.g., `bcrypt`).
* Use Helmet middleware for secure HTTP headers:

  ```js
  import helmet from 'helmet';
  app.use(helmet());
  ```
* Validate JWT tokens or session cookies on protected routes.

---

## 🧪 Testing & Maintenance

* Write endpoint tests using Supertest or Jest.
* Test middleware and error flows explicitly.
* Version your API (`/api/v1/`) for future changes.
* Document available endpoints with tools like Swagger or Postman.

---

## 🧠 Philosophy

Keep your backend predictable, modular, and observable. Every route should:

1. Validate input.
2. Execute logic.
3. Handle errors gracefully.
4. Return consistent, structured responses.

Express doesn’t need to be heavy to be clean — structure, clarity, and observability win every time.
