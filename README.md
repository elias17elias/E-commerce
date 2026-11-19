# E-commerce API

A REST API for an e-commerce application, built with Node.js, Express, and PostgreSQL. It provides account and session management, product catalog operations, order processing, and administrative user and balance management.

## Features

- Account registration, login, current-user lookup, logout, and refresh-token rotation.
- Forgot-password and reset-password flows delivered through SMTP email.
- Product catalog with filtering and cursor-based pagination.
- Order creation with stock and balance checks, plus order cancellation and deletion.
- User profile management and admin-only user listing and balance top-ups.
- Role-based access for `user` and `admin` accounts.
- PostgreSQL migrations managed with `node-pg-migrate`.

## Tech stack

- Node.js (18 or newer)
- Express 5
- PostgreSQL
- `pg` connection pool
- Argon2 password hashing
- JWT access tokens and rotating refresh tokens

## Getting started

### Prerequisites

- Node.js 18+
- PostgreSQL
- SMTP credentials for password-reset email delivery

### Install

```bash
cd backend
npm install
```

### Configure environment

Create `backend/.env` from the example:

```bash
cp .env.example .env
```

Set the following required values in `.env`:

| Variable | Description |
| --- | --- |
| `DB_HOST` | PostgreSQL server host |
| `DB_PORT` | PostgreSQL server port (defaults to `5432`) |
| `DB_USER` | PostgreSQL username |
| `DB_PASSWORD` | PostgreSQL password |
| `DB_NAME` | Database name |
| `JWT_SECRET` | Secret used to sign access tokens |
| `JWT_EXPIRES_IN` | Access-token lifetime, for example `15m` |
| `SMTP_HOST` | SMTP server host |
| `SMTP_PORT` | SMTP server port |
| `SMTP_USER` | SMTP username |
| `SMTP_PASSWORD` | SMTP password |
| `EMAIL_FROM` | Sender address used for reset emails |
| `FRONTEND_URL` | Allowed browser origin for credentialed CORS |

`PORT` is optional and defaults to `3000`. `NODE_ENV` defaults to `development`; use `production` when deploying so refresh cookies are marked `Secure`.

### Run database migrations

From `backend/`:

```bash
npm run migrate
```

### Start the API

From `backend/`:

```bash
npm run dev
```

The API listens on `http://localhost:3000` unless `PORT` is configured.

## API overview

All routes are mounted at the root path shown below. Protected routes require:

```http
Authorization: Bearer <access-token>
```

The refresh-token endpoints use the `refreshToken` HTTP-only cookie issued at login.

### Authentication — `/auth`

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | Public | Create an account |
| `POST` | `/auth/login` | Public | Sign in; returns an access token and sets the refresh cookie |
| `GET` | `/auth/me` | Authenticated | Get the current account |
| `POST` | `/auth/refresh` | Refresh cookie | Rotate the refresh token and issue a new access token |
| `POST` | `/auth/logout` | Refresh cookie | Revoke the current refresh-token family |
| `POST` | `/auth/logout-all` | Authenticated | Revoke the user's refresh tokens |
| `POST` | `/auth/forgot-password` | Public | Request a password-reset email |
| `POST` | `/auth/reset-password` | Public | Reset a password using its emailed token |

### Products — `/products`

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/products` | Public | List products; supports `q`, `minPrice`, `maxPrice`, `minStock`, `maxStock`, `inStock`, `cursor`, and `limit` |
| `GET` | `/products/:id` | Public | Get one product |
| `POST` | `/products` | Admin | Create a product |
| `PUT` | `/products/:id` | Admin | Update a product |
| `DELETE` | `/products/:id` | Admin | Delete a product |

### Orders — `/orders`

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/orders` | Admin | List orders; supports `status`, `userId`, `cursor`, and `limit` |
| `GET` | `/orders/:id` | Owner or admin | Get an order, including its items |
| `POST` | `/orders` | Authenticated user or admin | Create an order |
| `PUT` | `/orders/:id` | Admin | Change an order's status |
| `DELETE` | `/orders/:id` | Admin | Delete an order |

Create an order with a non-empty `data` array of product IDs and quantities:

```json
{
  "data": [
    { "product_id": 12, "quantity": 2 },
    { "product_id": 27, "quantity": 1 }
  ]
}
```

Order statuses are `pending`, `completed`, and `cancelled`. Only pending orders can be changed to another status. Cancelling a pending order restores its stock and refunds the customer's balance.

### Users — `/users`

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/users` | Admin | List users |
| `GET` | `/users/:id` | Owner or admin | Get a user |
| `PUT` | `/users/:id` | Owner or admin | Update a user's name |
| `DELETE` | `/users/:id` | Owner or admin | Delete a user |
| `POST` | `/users/:id/balance` | Admin | Increase a user's balance |

Product and order list endpoints use cursor-based pagination with a default `limit` of 20 and a maximum of 100.

## Security

- Passwords are hashed with Argon2; plaintext passwords are not stored.
- JWT access tokens are signed using HS256. Their lifetime is configured with `JWT_EXPIRES_IN`.
- Refresh tokens are returned only in an HTTP-only cookie, stored as hashes in the database, and rotated on refresh. Logout and logout-all revoke refresh-token records.
- Refresh cookies use `SameSite=Lax`, are scoped to `/auth`, and are marked `Secure` in production.
- Password-reset tokens are stored as hashes, expire after 30 minutes, and are single-use.
- Authentication and role/ownership checks protect account, order, and administrative operations.
- Login, registration, password-reset, and refresh endpoints have rate limits.
- Request validators restrict accepted properties and check IDs, quantities, names, prices, and pagination parameters.
- Database queries use parameterized values. Order creation, cancellation, and deletion use transactions and lock relevant rows while changing stock or balances.
- CORS is configured for the single origin in `FRONTEND_URL`, with credentials enabled for the refresh cookie.
- The error handler does not return internal server errors or database details to clients.

### Production guidance

- Use HTTPS and set `NODE_ENV=production`.
- Use unique, high-entropy values for `JWT_SECRET`, database credentials, and SMTP credentials. Keep `.env` private and never commit it.
- Restrict database access to trusted hosts and use a least-privilege database account.
- Configure `FRONTEND_URL` to the exact trusted application origin.
- The rate limiter uses its default in-process store; deployments with multiple API instances should configure a shared rate-limit store.

## Project layout

```text
backend/
  config/        Environment and cookie configuration
  controllers/   HTTP handlers
  db/            PostgreSQL connection pool
  middleware/    Authentication, authorization, validation, and error handling
  migrations/    Database schema migrations
  repositories/  Database queries
  routes/        API route definitions
  services/      Business logic
  utils/         Tokens, cursors, and application errors
```

This repository currently contains the backend API; no frontend application is included.
