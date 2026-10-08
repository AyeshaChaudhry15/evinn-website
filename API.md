# Evinn Server — Complete Documentation

Backend for **Evinn**, an electric bike shop. One REST API serves two clients:

- **The public website**: browse brands, bikes, accessories and spare parts; search and filter bikes; send a contact message; request a test ride; place a cash-on-delivery order.
- **The admin panel**: log in, manage the catalogue (with image uploads to Cloudinary), and handle contact messages, test ride requests and orders. Admins get an email for every new contact message, test ride request and order.

This document covers how the app is built, the rules every endpoint follows, and every module and endpoint with request and response examples.

---

## Table of contents

1. [Overview](#1-overview)
2. [Architecture](#2-architecture)
3. [Conventions](#3-conventions)
4. [Authentication](#4-authentication)
5. [Errors](#5-errors)
6. [Pagination](#6-pagination)
7. [Image uploads](#7-image-uploads)
8. [Rate limits](#8-rate-limits)
9. [Email notifications](#9-email-notifications)
10. [Endpoint overview](#10-endpoint-overview)
11. [Modules and endpoints](#11-modules-and-endpoints)
    - [11.1 Health](#111-health)
    - [11.2 Admin auth](#112-admin-auth)
    - [11.3 Brands](#113-brands)
    - [11.4 Bikes](#114-bikes)
    - [11.5 Accessories](#115-accessories)
    - [11.6 Spare parts](#116-spare-parts)
    - [11.7 Contact submissions](#117-contact-submissions)
    - [11.8 Test ride requests](#118-test-ride-requests)
    - [11.9 Orders](#119-orders)
12. [TypeScript types](#12-typescript-types)
13. [Frontend integration examples](#13-frontend-integration-examples)
14. [Running and deploying](#14-running-and-deploying)

---

## 1. Overview

### Modules

| Module | Base path | Public website can | Admin can |
|---|---|---|---|
| Health | `/api/health` | Check the API and database are up | — |
| Admin auth | `/api/admin/auth` | Log in, request and use a password reset code | See the current admin, log out, change password |
| Brands | `/api/brands` | List all brands, view one | Create, update, delete (with logo) |
| Bikes | `/api/bikes` | List with search and filters, view one | Create, update, delete (with image) |
| Accessories | `/api/accessories` | List, view one | Create, update, delete (with image) |
| Spare parts | `/api/spare-parts` | List, view one | Create, update, delete (with image) |
| Contact submissions | `/api/contact-submissions` | Send a contact message | List, change status, delete |
| Test ride requests | `/api/test-ride-requests` | Request a test ride | List, accept, reject |
| Orders | `/api/orders` | Place a cash-on-delivery order | List, move through statuses |

### Tech stack

| Concern | Technology |
|---|---|
| Runtime | Node.js 22+ (ES modules) |
| HTTP framework | Express 5 |
| Database | MongoDB with Mongoose 9 |
| Images | Cloudinary (uploaded with multer, kept in memory, max 5 MB) |
| Email | Nodemailer through a Gmail account (App Password) |
| Admin auth | JWT in an httpOnly cookie, passwords hashed with bcrypt |
| Abuse protection | express-rate-limit on public forms |
| Deployment | Docker / Docker Compose |

---

## 2. Architecture

### Project structure

```
src/
  main.js                  Entry point: connects to MongoDB, checks Cloudinary and Gmail, starts the server
  app.js                   Express app: CORS, body parsing, cookies, route mounting, 404 and error handlers
  config/
    env.js                 Reads environment variables; exits if a required one is missing
    db.js                  MongoDB connection; optional custom DNS servers
    cloudinary.js          Cloudinary SDK setup and startup check
    mailer.js              Gmail transport (Nodemailer) and startup check
  middlewares/
    auth.js                requireAdmin: verifies the accessToken cookie
    upload.js              Single image upload: in memory, image types only, max 5 MB
    rateLimit.js           Rate limiters for public forms and password reset
    error.js               404 handler and central error handler
  models/
    admin.model.js         Admin accounts, password hashing, JWT, reset codes
    brand.model.js         Brands
    bike.model.js          Bikes, specs, derived topSpeedKmh / rangeKm
    accessory.model.js     Accessories (with priceText)
    sparePart.model.js     Spare parts (same shape as accessories)
    contactSubmission.model.js
    testRideRequest.model.js
    order.model.js         Orders, shipping address, status transitions
  controllers/             One file per module: request handling and business rules
  routes/                  One file per module: paths and middleware chains
  emails/
    layout.js              Shared HTML email layout and helpers
    passwordResetOtp.js    "Your Evinn password reset code"
    passwordChanged.js     "Your Evinn password was changed"
    newContactSubmission.js
    newTestRideRequest.js
    newOrder.js
  utils/
    authCookie.js          Sets and clears the accessToken cookie
    cloudinary.js          Upload and delete helpers; saveWithImage
    email.js               sendEmail, sendEmailInBackground, sendEmailToAdmins
    escapeRegex.js         Makes search text safe to use in a regular expression
    features.js            Parses the accessory / spare part features list
    httpError.js           Creates an error with an HTTP status
    otp.js                 Generates, hashes and normalises reset codes
    pagination.js          page / limit parsing and the paginate() helper
    phone.js               Phone number normalising and pattern
    price.js               formatPKR (195000 -> "PKR 195,000")
    rangeFilter.js         Builds min / max filters from query parameters
    slugify.js             Slug generation and pattern
scripts/
  seed-admin.js            Creates the first admin account
  backfill-bike-specs.js   Fills topSpeedKmh / rangeKm for bikes saved before those fields existed
```

### How the layers fit together

| Layer | Responsibility | Example |
|---|---|---|
| Routes | Map a method and path to a chain of middleware and a controller | `router.post("/", orderLimiter, createOrder)` |
| Middlewares | Cross-cutting checks that run before controllers | Rate limit, `requireAdmin`, image upload |
| Controllers | Pick allowed fields from the request, apply business rules, respond | Order price is looked up from the bike, never taken from the request |
| Models | Schema, validation messages, defaults, derived fields, JSON shape | `Range is required`, `nextStatuses`, `priceText` |
| Emails | HTML and plain-text templates | New order email to admins |
| Utils | Small shared helpers | Pagination, regex escaping, phone normalising |

### Request lifecycle

Every request goes through these steps in order:

1. **CORS**: browsers may only call the API from origins listed in `CLIENT_URL`, with cookies allowed.
2. **Body and cookie parsing**: JSON bodies up to 1 MB, URL-encoded forms, and cookies. Malformed JSON is rejected here with `400`.
3. **Route middleware**, depending on the endpoint:
   - a **rate limiter** on public forms and password reset,
   - **`requireAdmin`** on admin endpoints,
   - **image upload** on catalogue create/update endpoints.
4. **Controller**: copies only the fields that endpoint allows from the body, validates through the model, does the work and sends the response.
5. **Background work** after the response, such as notification emails. Failures are logged and never change the response.
6. **Errors** thrown anywhere are turned into `{ "message": "..." }` with the right status by the central error handler (see [Errors](#5-errors)). Unknown routes return `404`.

Express 5 forwards errors from `async` handlers automatically, so controllers simply `throw httpError(status, message)`.

### Startup and shutdown

On start (`src/main.js`) the server:

1. Connects to MongoDB. If this fails, it logs `Failed to start server: ...` and exits.
2. Checks the Cloudinary and Gmail credentials. Failures are only logged as warnings (`Cloudinary check failed: ...`, `Mailer check failed: ...`); the server still starts.
3. Listens on `PORT` and logs `Server running on http://localhost:5000 (development)`.

On `SIGINT` or `SIGTERM` (Ctrl+C, `docker compose down`) it stops accepting connections, closes the database connection and exits.

`GET /` returns the plain text `Hello this is evinn server`.

### Security measures

| Area | Measure |
|---|---|
| Mass assignment | Each controller copies only a fixed list of fields from the body. Server-managed fields (status, prices on orders, image URLs, derived numbers, timestamps) can't be set by clients. |
| Query injection | Query filters only accept plain strings, and search text is escaped before being used in a regular expression. |
| Admin sessions | JWT in an `HttpOnly` cookie (JavaScript can't read it), 1-hour lifetime, `Secure` in production. Changing or resetting a password signs out older sessions. |
| Passwords | bcrypt with 12 rounds; 8 to 72 characters. |
| Password reset codes | 6 digits, stored only as an HMAC hash, valid 10 minutes, single use, blocked after 5 wrong guesses. The forgot-password response never reveals whether an email belongs to an admin. |
| Abuse | Rate limits on every public form (see [Rate limits](#8-rate-limits)). |
| Browser access | CORS only allows the origins in `CLIENT_URL`. |
| Orders | The price is always read from the database. Status changes are atomic, so two admins can't apply conflicting changes. |
| Error details | In production, unexpected errors return `Internal server error` without internal details. |

---

## 3. Conventions

| Topic | Rule |
|---|---|
| Base URL | `http://localhost:5000` locally; your deployed API origin in production. Every endpoint starts with `/api`. |
| Format | Requests and responses are JSON (`Content-Type: application/json`), except image uploads, which are `multipart/form-data`. |
| IDs | Every record has a MongoDB `_id` (24-character hex string, e.g. `"6abe28b41464448322d89e0e"`). There is **no** `id` field; always use `_id`. |
| Dates | `createdAt` and `updatedAt` are ISO 8601 UTC strings, e.g. `"2026-10-01T09:32:36.522Z"`. |
| Money | Prices are plain numbers in **PKR** (`195000`). Accessories and spare parts also return a ready-made `priceText` (`"PKR 1,200"`); format bike and order amounts on the frontend. |
| Slugs | Lowercase letters, numbers and single hyphens (`crown-electric-spark`). Stored **without** a leading slash. Slug lookups are case-insensitive. |
| Lookup keys | Public detail pages for bikes, accessories and spare parts use the **slug** (`/api/bikes/crown-electric-spark`). Update and delete use the **`_id`** (`/api/bikes/6abe28b41464448322d89e0e`). Brands use `_id` everywhere. |
| Response envelope | Single records are wrapped by name (`{ "bike": {...} }`), lists by plural name (`{ "bikes": [...] }`). Errors are always `{ "message": "..." }`. |
| Unknown fields | Ignored, in both the body and the query string. Check parameter names carefully: a misspelled filter is silently ignored and returns the unfiltered list. |
| Server-managed fields | `_id`, timestamps, image URLs and Cloudinary ids, `priceText`, `topSpeedKmh`, `rangeKm`, statuses on public forms, and order prices can't be set through the body. |
| Strings | Leading and trailing whitespace is trimmed. Optional text fields default to `""` (never `null`). |
| Size limits | JSON bodies up to 1 MB; image files up to 5 MB. |
| CORS | Only the origins in the server's `CLIENT_URL` (comma-separated, default `http://localhost:5173`) may call the API from a browser, with credentials. |
| Credentials | Always send cookies: `credentials: "include"` (fetch) or `withCredentials: true` (axios). Public endpoints work without them, but admin endpoints need them. |

---

## 4. Authentication

Admin endpoints are protected by a **JWT access token stored in an httpOnly cookie**.

### How it works

1. The admin logs in with `POST /api/admin/auth/login`.
2. The server responds with a `Set-Cookie` header:
   ```
   Set-Cookie: accessToken=<jwt>; Max-Age=3600; Path=/; HttpOnly; SameSite=Lax
   ```
   In production (`NODE_ENV=production`) the cookie is also `Secure` (HTTPS only).
3. The browser sends the cookie automatically on later requests, **as long as the request includes credentials**.
4. Admin endpoints read the token from the cookie only. The `Authorization` header is **not** used; `Authorization: Bearer ...` will not authenticate you.

### Key facts

| Item | Value |
|---|---|
| Cookie name | `accessToken` |
| Lifetime | **1 hour** (token and cookie expire together) |
| Refresh token | None. When the token expires, the admin logs in again. |
| JavaScript access | None. `HttpOnly` means `document.cookie` can't read it, which protects it from XSS. |
| Logout | `POST /api/admin/auth/logout` clears the cookie. JavaScript can't delete an httpOnly cookie itself. |
| Password change | Changing the password keeps the current browser logged in (a fresh cookie is set) and signs out every other session. Resetting it with a code signs out everywhere. |

### Checking whether the admin is logged in

Call `GET /api/admin/auth/me` when the admin panel loads:

- `200`: logged in; the response contains the admin.
- `401`: not logged in or the session expired; show the login page.

### Handling session expiry

Any admin endpoint can return `401` once the hour is up. Handle it globally (an axios interceptor or a fetch wrapper) by sending the admin to the login page. See [Frontend integration examples](#13-frontend-integration-examples).

### Possible `401` messages from admin endpoints

| Message | Meaning |
|---|---|
| `Access token is missing` | No cookie sent: not logged in, or the request was made without credentials. |
| `Access token has expired` | Logged in more than an hour ago. |
| `Access token is invalid` | The cookie was tampered with or signed with a different secret. |
| `Admin no longer exists` | The admin account was deleted after login. |
| `Password was changed, please log in again` | The password was changed or reset after this session started, e.g. from another device. |

### Cross-domain deployment

The cookie uses `SameSite=Lax`. This works when the frontend and API share a site, for example:

- `localhost:5173` → `localhost:5000` (local development)
- `evinn.pk` → `api.evinn.pk`

If the frontend and API are on **different domains** (e.g. `evinn.pk` and `evinn-api.onrender.com`), the browser won't send the cookie and login will appear to do nothing. Serve both under the same site (e.g. a reverse proxy routing `/api` to the server), or change the cookie settings.

---

## 5. Errors

### Error response format

Every error has the same shape:

```json
{ "message": "Human-readable description of the problem" }
```

When several fields fail validation at once, their messages are joined with `", "`:

```json
{ "message": "Type must be one of: bike, scooter, Price cannot be negative" }
```

### Status codes

| Status | When | Example message |
|---|---|---|
| `200 OK` | Successful read, update, delete, login, logout | — |
| `201 Created` | Record created | — |
| `400 Bad Request` | Missing or invalid field, malformed id, missing or invalid image, malformed JSON | `Name is required`, `Invalid price`, `Invalid _id`, `Image is required` |
| `401 Unauthorized` | Not logged in, session expired, wrong login details | `Access token has expired`, `Invalid email or password` |
| `404 Not Found` | Record or route doesn't exist | `Bike not found`, `Not found: GET /api/bikez` |
| `409 Conflict` | Duplicate unique value, delete blocked, or a status change that isn't allowed | `slug already exists`, `Cannot delete brand: 2 bike(s) still belong to it`, `Cannot change order status from delivered to cancelled` |
| `429 Too Many Requests` | Rate limit hit | `Too many requests, please try again later.` |
| `500 Internal Server Error` | Unexpected server problem (e.g. Cloudinary unreachable) | In production always `Internal server error` |

### How errors are produced

The central error handler (`src/middlewares/error.js`) converts errors like this:

| Source | Status | Message |
|---|---|---|
| Model validation failed | `400` | Each field's message, joined with `", "` |
| A value has the wrong type (e.g. `price: "abc"`, malformed id) | `400` | `Invalid <field>`, e.g. `Invalid price`, `Invalid _id` |
| Duplicate unique value (`slug`, `displayName`, admin `email`) | `409` | `<field> already exists` |
| Upload problem (file too large, wrong field name) | `400` | multer's message, e.g. `File too large` |
| Malformed JSON body | `400` | The JSON parser's message, e.g. `Expected property name or '}' in JSON at position 1 (line 1 column 2)` |
| A controller rule (`httpError`) | As thrown | e.g. `409 Order is already processing` |
| Anything else | `500` | The real message in development; `Internal server error` in production. The full error is logged on the server. |

### Common validation messages

| Message | Cause |
|---|---|
| `<Field> is required` | Required field missing or empty (e.g. `Name is required`, `Range is required`). |
| `Invalid <field>` | Wrong type: non-numeric `price`, malformed id for `brand`, non-boolean `inStock`, malformed `_id` in the URL. |
| `Path \`name\` (...) is longer than the maximum allowed length (150).` | Text exceeds its maximum length (limits are listed with each model). |
| `<field> already exists` | Unique field taken (`slug`, `displayName`). Status `409`. |
| `<Field> must be one of: ...` | Value not in the allowed list (`type`, `reason`, `status`, `paymentMethod`). |
| `specs must be valid JSON` / `features must be a valid JSON array` | A JSON-string field couldn't be parsed. |
| `Only JPEG, PNG, WebP, GIF and AVIF images are allowed` | Wrong file type. |
| `File too large` | Image larger than 5 MB. |
| `Unexpected file field` | File sent under the wrong form field name (e.g. `file` instead of `image`). |

---

## 6. Pagination

These list endpoints are paginated:

- `GET /api/bikes`
- `GET /api/accessories`
- `GET /api/spare-parts`
- `GET /api/contact-submissions` (admin)
- `GET /api/test-ride-requests` (admin)
- `GET /api/orders` (admin)

`GET /api/brands` is **not** paginated; it returns every brand.

### Query parameters

| Param | Type | Default | Rules |
|---|---|---|---|
| `page` | integer | `1` | Must be a positive integer. |
| `limit` | integer | `10` | Positive integer, **max 100** (larger values are capped to 100). |

Invalid values (`page=abc`, `limit=0`, `limit=-5`, `page=1.5`) silently fall back to the defaults instead of returning an error.

### Response

The list stays under its usual key, and a `pagination` object is added next to it:

```json
{
  "bikes": [ /* up to `limit` items */ ],
  "pagination": {
    "page": 2,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": true
  }
}
```

| Field | Meaning |
|---|---|
| `page` | The page returned (after defaults are applied). |
| `limit` | Items per page (after defaults and the 100 cap). |
| `total` | Number of items matching the filters (not the whole collection). |
| `totalPages` | `ceil(total / limit)`. `0` when nothing matches. |
| `hasNextPage` / `hasPrevPage` | Use these to enable or disable Next / Previous buttons. |

Lists are sorted newest first. The order is stable, so no item appears on two pages or is skipped. Requesting a page past the end returns an empty list with the correct `total`.

---

## 7. Image uploads

Brands, bikes, accessories and spare parts each have one image, stored on Cloudinary under the `evinn/` folder.

| Resource | Form field name | Required on create | Required on update | Cloudinary folder |
|---|---|---|---|---|
| Brand | `logo` | Yes | No (send to replace) | `evinn/brands` |
| Bike | `image` | Yes | No (send to replace) | `evinn/bikes` |
| Accessory | `image` | Yes | No (send to replace) | `evinn/accessories` |
| Spare part | `image` | Yes | No (send to replace) | `evinn/spare-parts` |

**Rules**

- Send as `multipart/form-data` with a `FormData` object. **Don't set the `Content-Type` header yourself**; the browser adds it with the correct boundary.
- Allowed types: JPEG, PNG, WebP, GIF, AVIF. Maximum size: **5 MB**. Only one file per request.
- Text fields go in the same `FormData`. Numbers and booleans are sent as strings (`"195000"`, `"true"`) and converted by the server.
- The response contains the final Cloudinary URL in `imageUrl` / `logoUrl` (an `https://res.cloudinary.com/...` link). Use it directly in `<img src>`.
- `imagePublicId` / `logoPublicId` are internal Cloudinary ids. The frontend can ignore them.

**Behaviour you can rely on**

- Invalid input is rejected **before** uploading, so a failed create doesn't leave stray files.
- If saving fails after the upload (e.g. duplicate slug), the new image is deleted and the record keeps its current image.
- When an image is replaced, the old one is deleted only after the new one is saved, so a record is never left without an image.
- Deleting a record deletes its image.

**Update without changing the image:** `PATCH` endpoints also accept a plain JSON body when no new image is sent.

---

## 8. Rate limits

Public forms and the password reset endpoints are limited **per client IP**.

| Endpoint | Limit | Window | What counts |
|---|---|---|---|
| `POST /api/admin/auth/forgot-password` | 5 requests | 15 minutes | Every request |
| `POST /api/admin/auth/reset-password` | 10 requests | 15 minutes | Failed attempts only |
| `POST /api/contact-submissions` | 5 requests | 15 minutes | Successful submissions only |
| `POST /api/test-ride-requests` | 5 requests | 15 minutes | Successful requests only |
| `POST /api/orders` | 3 requests | 1 hour | Successful orders only |

"Successful only" means a visitor fixing validation errors (`400`) isn't blocked.

Over the limit, the server returns:

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 900
RateLimit: "5-in-15min"; r=0; t=900

{ "message": "Too many requests, please try again later." }
```

Every limited response also includes `RateLimit` (remaining requests `r` and seconds until reset `t`) and `RateLimit-Policy` headers. `Retry-After` (seconds) is added on `429`.

> **Behind a reverse proxy, set `TRUST_PROXY`.** Without it every visitor appears to have the proxy's IP, so the limits are shared by all customers (e.g. only 3 orders per hour for the whole shop). See [Environment variables](#environment-variables).

Limits are kept in memory, so they reset when the server restarts.

---

## 9. Email notifications

All emails are sent from the Gmail account in `GMAIL_USER`, in the background after the response. A failed email is logged on the server and never affects the API response.

| Trigger | Recipient | Subject | Reply-To |
|---|---|---|---|
| `POST /api/admin/auth/forgot-password` (known admin email) | That admin | `Your Evinn password reset code` | — |
| Password changed or reset | That admin | `Your Evinn password was changed` | — |
| New contact submission | **All admins** | `New contact form message from Ahmed Khan (Product Inquiry)` | The visitor's email |
| New test ride request | **All admins** | `New test ride request from Ahmed Khan (Crown Electric Spark)` | The requester's email |
| New order | **All admins** | `New order from Ahmed Khan: 1 × Crown Electric Spark (PKR 195,000)` | — (orders don't collect an email) |

"All admins" means every account in the admins collection. Each email has an HTML version (branded layout) and a plain-text version. Dates in emails are shown in Pakistan time (PKT).

---

## 10. Endpoint overview

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | Public | Server and database status |
| POST | `/api/admin/auth/login` | Public | Log in, sets the auth cookie |
| POST | `/api/admin/auth/logout` | Public | Log out, clears the auth cookie |
| GET | `/api/admin/auth/me` | Admin | Current admin |
| PATCH | `/api/admin/auth/change-password` | Admin | Change password while logged in |
| POST | `/api/admin/auth/forgot-password` | Public | Email a 6-digit reset code |
| POST | `/api/admin/auth/reset-password` | Public | Set a new password with the code |
| GET | `/api/brands` | Public | List all brands |
| GET | `/api/brands/:id` | Public | Get a brand by `_id` |
| POST | `/api/brands` | Admin | Create a brand (with logo) |
| PATCH | `/api/brands/:id` | Admin | Update a brand (logo optional) |
| DELETE | `/api/brands/:id` | Admin | Delete a brand |
| GET | `/api/bikes` | Public | List bikes (paginated, search and filters) |
| GET | `/api/bikes/:slug` | Public | Get a bike by slug |
| POST | `/api/bikes` | Admin | Create a bike (with image) |
| PATCH | `/api/bikes/:id` | Admin | Update a bike (image optional) |
| DELETE | `/api/bikes/:id` | Admin | Delete a bike |
| GET | `/api/accessories` | Public | List accessories (paginated, filterable) |
| GET | `/api/accessories/:slug` | Public | Get an accessory by slug |
| POST | `/api/accessories` | Admin | Create an accessory (with image) |
| PATCH | `/api/accessories/:id` | Admin | Update an accessory (image optional) |
| DELETE | `/api/accessories/:id` | Admin | Delete an accessory |
| GET | `/api/spare-parts` | Public | List spare parts (paginated, filterable) |
| GET | `/api/spare-parts/:slug` | Public | Get a spare part by slug |
| POST | `/api/spare-parts` | Admin | Create a spare part (with image) |
| PATCH | `/api/spare-parts/:id` | Admin | Update a spare part (image optional) |
| DELETE | `/api/spare-parts/:id` | Admin | Delete a spare part |
| POST | `/api/contact-submissions` | Public | Send the contact form |
| GET | `/api/contact-submissions` | Admin | List submissions (paginated, filterable) |
| PATCH | `/api/contact-submissions/:id/status` | Admin | Change a submission's status |
| DELETE | `/api/contact-submissions/:id` | Admin | Delete a submission |
| POST | `/api/test-ride-requests` | Public | Request a test ride |
| GET | `/api/test-ride-requests` | Admin | List requests (paginated, filterable) |
| PATCH | `/api/test-ride-requests/:id/accept` | Admin | Accept a pending request |
| PATCH | `/api/test-ride-requests/:id/reject` | Admin | Reject a pending request with a reason |
| POST | `/api/orders` | Public | Place a cash-on-delivery order |
| GET | `/api/orders` | Admin | List orders (paginated, filterable) |
| PATCH | `/api/orders/:id/status` | Admin | Move an order to its next status |

---

## 11. Modules and endpoints

Each module below starts with its purpose, rules and data model, then documents every endpoint with a request example, a response example and its errors.

In the examples, "**Admin**" means the request must carry the `accessToken` cookie (see [Authentication](#4-authentication)). Requests are shown as raw HTTP; for multipart requests the equivalent `FormData` code is shown instead.

---

### 11.1 Health

Lets you (or a load balancer or Docker health check) confirm the API is running and connected to MongoDB.

#### `GET /api/health`

**Auth:** Public.

**Request**

```http
GET /api/health
```

**Response `200`**

```json
{ "status": "ok", "db": "connected" }
```

`db` is `"connected"` or `"disconnected"`. The endpoint answers `200` even when the database is down, so check `db` as well.

---

### 11.2 Admin auth

Admin accounts log in to the admin panel. There is no sign-up endpoint; admins are created with the seed script (`npm run seed:admin`, see [Scripts](#scripts)).

#### Admin data model

| Field | Type | Notes |
|---|---|---|
| `_id` | string | *server* |
| `fullName` | string | Required, max 100. |
| `email` | string | Required, unique, stored lowercase. |
| `createdAt` / `updatedAt` | string (ISO date) | *server* |

The password (bcrypt hash) and password-reset data are stored but **never returned** by the API.

#### `POST /api/admin/auth/login`

Log in. Sets the `accessToken` cookie.

**Auth:** Public.

**Request body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `email` | string | Yes | Case-insensitive, surrounding spaces ignored. |
| `password` | string | Yes | |

```http
POST /api/admin/auth/login
Content-Type: application/json

{ "email": "admin@evinn.com", "password": "Str0ngPass!" }
```

**Response `200`** (with the `Set-Cookie` header described in [Authentication](#4-authentication))

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "_id": "6abe274e496798850e0962d3",
    "fullName": "Super Admin",
    "email": "admin@evinn.com",
    "createdAt": "2026-10-01T09:26:38.371Z",
    "updatedAt": "2026-10-01T09:26:38.371Z"
  }
}
```

> **Don't store `accessToken`.** It's returned for convenience, but the cookie already handles authentication. Saving it to `localStorage` would expose it to XSS. Use only the `admin` object.

**Errors**

| Status | Message |
|---|---|
| `400` | `Email and password are required` |
| `401` | `Invalid email or password` (same message for an unknown email and a wrong password) |

---

#### `POST /api/admin/auth/logout`

Log out by clearing the cookie. Works even if the session already expired.

**Auth:** Public.

**Request**

```http
POST /api/admin/auth/logout
```

**Response `200`**

```json
{ "message": "Logged out" }
```

---

#### `GET /api/admin/auth/me`

Get the logged-in admin. Call it when the admin panel loads to restore the session.

**Auth:** Admin.

**Request**

```http
GET /api/admin/auth/me
Cookie: accessToken=<jwt>
```

**Response `200`**

```json
{
  "admin": {
    "_id": "6abe274e496798850e0962d3",
    "fullName": "Super Admin",
    "email": "admin@evinn.com",
    "createdAt": "2026-10-01T09:26:38.371Z",
    "updatedAt": "2026-10-01T09:26:38.371Z"
  }
}
```

**Errors:** `401` (see [messages](#possible-401-messages-from-admin-endpoints)).

---

#### `PATCH /api/admin/auth/change-password`

Change the logged-in admin's password.

**Auth:** Admin.

**Request body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `currentPassword` | string | Yes | The current password. |
| `newPassword` | string | Yes | 8 to 72 characters (72 bytes; some non-English characters count as more than one). Must differ from the current password. |

```http
PATCH /api/admin/auth/change-password
Content-Type: application/json
Cookie: accessToken=<jwt>

{ "currentPassword": "Str0ngPass!", "newPassword": "EvenStr0nger!" }
```

**Response `200`** (with a fresh `Set-Cookie: accessToken=...`, so this browser stays logged in)

```json
{ "message": "Password changed successfully" }
```

**What happens**

- Every **other** session (other browsers or devices) is signed out; its next admin request gets `401 Password was changed, please log in again`.
- Any pending reset code is cancelled.
- A "Your Evinn password was changed" email is sent to the admin.

**Errors**

| Status | Message |
|---|---|
| `400` | `Current password is required` |
| `400` | `New password is required`, `New password must be at least 8 characters`, `New password must be at most 72 characters` |
| `400` | `Current password is incorrect` |
| `400` | `New password must be different from the current password` |
| `401` | Not logged in (see [messages](#possible-401-messages-from-admin-endpoints)) |

> A wrong current password returns **`400`, not `401`**, so a global "401 → login page" handler won't log the admin out over a typo.

---

#### Password reset flow (forgot password)

For an admin who can't log in:

```
1. POST /api/admin/auth/forgot-password  { email }              → server emails a 6-digit code (valid 10 minutes)
2. POST /api/admin/auth/reset-password   { otp, newPassword }   → server checks the code and sets the new password
3. The admin logs in with the new password
```

| Rule | Value |
|---|---|
| Code format | 6 digits, e.g. `048213` |
| Code lifetime | 10 minutes |
| Use | Single use. Requesting a new code replaces the previous one. |
| Wrong guesses | After **5 wrong codes**, pending codes stop working; request a new one. |
| Resend cooldown | One new code per minute per account. Requests within the minute still return `200` but don't send another email. |
| Rate limits | See [Rate limits](#8-rate-limits). |
| Delivery | Email subject **"Your Evinn password reset code"**. Ask admins to check spam if it doesn't arrive within a minute. |

---

#### `POST /api/admin/auth/forgot-password`

Request a password reset code by email.

**Auth:** Public. **Rate limited.**

**Request body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `email` | string | Yes | Case-insensitive, surrounding spaces ignored. |

```http
POST /api/admin/auth/forgot-password
Content-Type: application/json

{ "email": "admin@evinn.com" }
```

**Response `200`** (always the same, whether or not the email belongs to an admin)

```json
{ "message": "If an admin account exists for this email, a password reset code has been sent." }
```

> The response deliberately doesn't reveal whether the email exists, so this form can't be used to discover admin emails. Show the message as-is and move to the "enter code" screen.

**Errors**

| Status | Message |
|---|---|
| `400` | `Email is required` |
| `429` | `Too many requests, please try again later.` |

---

#### `POST /api/admin/auth/reset-password`

Set a new password using the emailed code.

**Auth:** Public. **Rate limited.**

**Request body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `otp` | string | Yes | The 6-digit code. **Send it as a string** (`"048213"`). Numbers are accepted and zero-padded, but strings keep leading zeros safely. |
| `newPassword` | string | Yes | 8 to 72 characters. |

```http
POST /api/admin/auth/reset-password
Content-Type: application/json

{ "otp": "048213", "newPassword": "EvenStr0nger!" }
```

**Response `200`** (also clears the `accessToken` cookie)

```json
{ "message": "Password has been reset. Please log in with your new password." }
```

**What happens**

- The code is used up.
- **All** sessions are signed out. The admin logs in with the new password.
- A "Your Evinn password was changed" email is sent to the admin.

**Errors**

| Status | Message |
|---|---|
| `400` | `OTP must be a 6-digit code` |
| `400` | `New password is required`, `New password must be at least 8 characters`, `New password must be at most 72 characters` |
| `400` | `Invalid or expired OTP` (wrong, expired or used code, or too many wrong guesses; request a new code) |
| `429` | `Too many requests, please try again later.` |

> If the new password is rejected for its length, the code is **not** used up; fix the password and submit the same code again.

---

### 11.3 Brands

Bike brands (e.g. Crown CMC, Okla). Every bike belongs to one brand. The public site uses brands for brand pages and filters; the admin manages them with a logo.

#### Brand data model

| Field | Type | Required | Default | Limits |
|---|---|---|---|---|
| `_id` | string | *server* | | |
| `displayName` | string | Yes | | Max 100, unique |
| `logoUrl` | string | *server* (from upload) | | |
| `logoPublicId` | string | *server* | `""` | |
| `origin` | string | No | `""` | e.g. `Pakistani` |
| `established` | string | No | `""` | Free text, e.g. `2021` |
| `headquarters` | string | No | `""` | |
| `about` | string | No | `""` | Max 2000 |
| `websiteUrl` | string | No | `""` | Not validated as a URL |
| `instagramUrl` | string | No | `""` | |
| `twitterUrl` | string | No | `""` | |
| `facebookUrl` | string | No | `""` | |
| `createdAt` / `updatedAt` | string (ISO date) | *server* | | |

**Rules**

- A brand can't be deleted while bikes still belong to it.
- Brand responses are not paginated; `GET /api/brands` returns every brand sorted by name.

---

#### `GET /api/brands`

List **all** brands, sorted alphabetically by `displayName`. Not paginated; takes no query parameters.

**Auth:** Public.

**Request**

```http
GET /api/brands
```

**Response `200`**

```json
{
  "brands": [
    {
      "_id": "6abe2a10c3f1a2b4d5e6f701",
      "displayName": "Crown CMC",
      "logoUrl": "https://res.cloudinary.com/<cloud>/image/upload/v1790846844/evinn/brands/xyz789.png",
      "logoPublicId": "evinn/brands/xyz789",
      "origin": "Pakistani",
      "established": "2005",
      "headquarters": "Lahore, Pakistan",
      "about": "Crown CMC builds electric bikes and scooters for everyday city riding.",
      "websiteUrl": "https://crown.pk",
      "instagramUrl": "",
      "twitterUrl": "",
      "facebookUrl": "https://facebook.com/crown",
      "createdAt": "2026-10-01T10:00:00.000Z",
      "updatedAt": "2026-10-01T10:00:00.000Z"
    },
    {
      "_id": "6abe2a10c3f1a2b4d5e6f702",
      "displayName": "Okla",
      "logoUrl": "https://res.cloudinary.com/<cloud>/image/upload/v1790846900/evinn/brands/abc123.png",
      "logoPublicId": "evinn/brands/abc123",
      "origin": "Pakistani",
      "established": "",
      "headquarters": "Lahore, Pakistan",
      "about": "Okla Electric is a Pakistani EV manufacturer building affordable electric bikes and scooters.",
      "websiteUrl": "",
      "instagramUrl": "",
      "twitterUrl": "",
      "facebookUrl": "",
      "createdAt": "2026-10-01T10:02:00.000Z",
      "updatedAt": "2026-10-01T10:02:00.000Z"
    }
  ]
}
```

---

#### `GET /api/brands/:id`

Get one brand by `_id`.

**Auth:** Public.

**Request**

```http
GET /api/brands/6abe2a10c3f1a2b4d5e6f701
```

**Response `200`**

```json
{
  "brand": {
    "_id": "6abe2a10c3f1a2b4d5e6f701",
    "displayName": "Crown CMC",
    "logoUrl": "https://res.cloudinary.com/<cloud>/image/upload/v1790846844/evinn/brands/xyz789.png",
    "logoPublicId": "evinn/brands/xyz789",
    "origin": "Pakistani",
    "established": "2005",
    "headquarters": "Lahore, Pakistan",
    "about": "Crown CMC builds electric bikes and scooters for everyday city riding.",
    "websiteUrl": "https://crown.pk",
    "instagramUrl": "",
    "twitterUrl": "",
    "facebookUrl": "https://facebook.com/crown",
    "createdAt": "2026-10-01T10:00:00.000Z",
    "updatedAt": "2026-10-01T10:00:00.000Z"
  }
}
```

**Errors:** `400 Invalid _id` (malformed id), `404 Brand not found`.

---

#### `POST /api/brands`

Create a brand with its logo.

**Auth:** Admin. `multipart/form-data`.

**Form fields**

| Field | Type | Required | Notes |
|---|---|---|---|
| `logo` | file | **Yes** | Image, max 5 MB. The field is `logo`, not `image`. |
| `displayName` | string | **Yes** | Max 100 chars, must be unique. |
| `origin` | string | No | |
| `established` | string | No | |
| `headquarters` | string | No | |
| `about` | string | No | Max 2000 chars. |
| `websiteUrl` | string | No | |
| `instagramUrl` | string | No | |
| `twitterUrl` | string | No | |
| `facebookUrl` | string | No | |

**Request**

```js
const fd = new FormData();
fd.append("logo", logoFile);
fd.append("displayName", "Okla");
fd.append("origin", "Pakistani");
fd.append("headquarters", "Lahore, Pakistan");
fd.append("about", "Okla Electric is a Pakistani EV manufacturer building affordable electric bikes and scooters.");

await fetch("/api/brands", { method: "POST", body: fd, credentials: "include" });
```

**Response `201`**

```json
{
  "brand": {
    "_id": "6abe2a10c3f1a2b4d5e6f702",
    "displayName": "Okla",
    "logoUrl": "https://res.cloudinary.com/<cloud>/image/upload/v1790846900/evinn/brands/abc123.png",
    "logoPublicId": "evinn/brands/abc123",
    "origin": "Pakistani",
    "established": "",
    "headquarters": "Lahore, Pakistan",
    "about": "Okla Electric is a Pakistani EV manufacturer building affordable electric bikes and scooters.",
    "websiteUrl": "",
    "instagramUrl": "",
    "twitterUrl": "",
    "facebookUrl": "",
    "createdAt": "2026-10-01T10:02:00.000Z",
    "updatedAt": "2026-10-01T10:02:00.000Z"
  }
}
```

**Errors**

| Status | Message |
|---|---|
| `400` | `Logo image is required` (checked first) |
| `400` | `Display name is required`, text too long, file type or size errors |
| `401` | Not logged in |
| `409` | `displayName already exists` |

---

#### `PATCH /api/brands/:id`

Update a brand. Send only the fields you want to change.

**Auth:** Admin.

- To replace the logo: `multipart/form-data` with a `logo` file (plus any other fields).
- Without a new logo: `multipart/form-data` **or** `application/json`.
- An empty string clears an optional field (`"twitterUrl": ""`). An empty `displayName` is rejected.

**Request (JSON, no new logo)**

```http
PATCH /api/brands/6abe2a10c3f1a2b4d5e6f702
Content-Type: application/json
Cookie: accessToken=<jwt>

{ "headquarters": "Karachi, Pakistan", "websiteUrl": "https://okla.pk" }
```

**Request (new logo)**

```js
const fd = new FormData();
fd.append("logo", newLogoFile);
await fetch(`/api/brands/${brandId}`, { method: "PATCH", body: fd, credentials: "include" });
```

**Response `200`**

```json
{
  "brand": {
    "_id": "6abe2a10c3f1a2b4d5e6f702",
    "displayName": "Okla",
    "logoUrl": "https://res.cloudinary.com/<cloud>/image/upload/v1790846900/evinn/brands/abc123.png",
    "logoPublicId": "evinn/brands/abc123",
    "origin": "Pakistani",
    "established": "",
    "headquarters": "Karachi, Pakistan",
    "about": "Okla Electric is a Pakistani EV manufacturer building affordable electric bikes and scooters.",
    "websiteUrl": "https://okla.pk",
    "instagramUrl": "",
    "twitterUrl": "",
    "facebookUrl": "",
    "createdAt": "2026-10-01T10:02:00.000Z",
    "updatedAt": "2026-10-03T14:20:00.000Z"
  }
}
```

**Errors**

| Status | Message |
|---|---|
| `400` | `Invalid _id`, `Display name is required`, text too long, file type or size errors |
| `401` | Not logged in |
| `404` | `Brand not found` |
| `409` | `displayName already exists` |

---

#### `DELETE /api/brands/:id`

Delete a brand and its logo.

**Auth:** Admin.

A brand **can't be deleted while bikes still belong to it**. Delete those bikes or move them to another brand first.

**Request**

```http
DELETE /api/brands/6abe2a10c3f1a2b4d5e6f702
Cookie: accessToken=<jwt>
```

**Response `200`**

```json
{ "message": "Brand deleted" }
```

**Errors**

| Status | Message |
|---|---|
| `400` | `Invalid brand` (malformed id) |
| `401` | Not logged in |
| `404` | `Brand not found` |
| `409` | `Cannot delete brand: 3 bike(s) still belong to it` |

Test ride requests that referenced a deleted brand keep working; their `brand` field shows `null`.

---

### 11.4 Bikes

The main catalogue: electric bikes and scooters. The public site lists them with search and filters and shows a detail page per bike; the admin creates and edits them with an image.

#### Bike data model

| Field | Type | Required | Default | Limits |
|---|---|---|---|---|
| `_id` | string | *server* | | |
| `name` | string | Yes | | Max 150 |
| `slug` | string | No (auto) | from `name` | Unique, `a-z 0-9 -` |
| `brand` | string (send) / object (receive) | Yes | | `_id` of an existing brand |
| `type` | string | Yes | | `bike` \| `scooter` |
| `price` | number | Yes | | `>= 0`, PKR |
| `rating` | number | No | `0` | `0`–`5` |
| `imageUrl` | string | *server* (from upload) | | |
| `imagePublicId` | string | *server* | `""` | |
| `specs` | object | Yes, all 7 keys on create | | See below |
| `topSpeedKmh` | number \| null | *server* (from `specs.topSpeed`) | | |
| `rangeKm` | number \| null | *server* (from `specs.range`) | | |
| `createdAt` / `updatedAt` | string (ISO date) | *server* | | |

**Specs** are free text, displayed as-is, so include units:

| Key | Label in errors | Example |
|---|---|---|
| `range` | Range | `70 km` |
| `topSpeed` | Top speed | `65 km/h` |
| `battery` | Battery | `72V 30Ah` |
| `chargingTime` | Charging time | `4.5 hrs` |
| `motorPower` | Motor power | `3000W` |
| `weight` | Weight | `115 kg` |
| `warranty` | Warranty | `2 Years` |

**Rules**

- **All seven specs are required when creating a bike.** Blank or spaces-only values are rejected.
- **On edit, a spec that has a value can't be cleared.** Bikes saved before specs became required may still have empty specs; they can be edited normally (e.g. a price change) and their specs filled in one at a time.
- **`topSpeedKmh` and `rangeKm`** are set by the server every time a bike is saved, from the first number in `specs.topSpeed` and `specs.range`: `"65 km/h"` → `65`, `"Up to 45 km/h"` → `45`, `"60-70 km/h"` → `60`, `"1,200 km"` → `1200`. If the text has no number (`"N/A"`), the field is `null`. Units are assumed to be km/h and km. These fields power the top speed and range filters and can't be set directly.
- **Slugs**: generated from the name on create if you don't send one. Renaming a bike does **not** change its slug, so existing links keep working.
- **Brand** in responses is always populated with a short summary: `{ "_id", "displayName", "logoUrl" }`. When sending, `brand` is just the brand's `_id`.
- Deleting a bike is allowed even if it has orders or test ride requests. Orders keep the bike's name and price; in admin lists their `bike` field becomes `null`.

---

#### `GET /api/bikes`

List bikes, newest first, with optional search and filters. [Paginated](#6-pagination).

**Auth:** Public.

**Query parameters** (all optional; combine any of them)

| Param | Type | Notes |
|---|---|---|
| `page` | integer | Default `1`. |
| `limit` | integer | Default `10`, max `100`. |
| `search` | string | Case-insensitive match anywhere in the bike **name**: `spark` finds "Crown Electric Spark" and "Sparkle". Extra spaces are ignored and special characters are treated as plain text. Blank is ignored. |
| `brand` | string | One brand `_id`, or several separated by commas (`brand=id1,id2`) to match any of them. |
| `type` | string | `bike` or `scooter`. Any other value returns an empty list. |
| `minPrice` / `maxPrice` | number | PKR, inclusive. |
| `minTopSpeed` / `maxTopSpeed` | number | km/h, inclusive. Uses `topSpeedKmh`. |
| `minRange` / `maxRange` | number | km per charge, inclusive. Uses `rangeKm`. |

How filters combine:

- Different filters are combined with **AND**: `?brand=X&minPrice=100000` means "brand X **and** at least PKR 100,000".
- Several brands are combined with **OR**: `?brand=X,Y` means "brand X **or** Y".
- Number filters must be non-negative numbers, and a minimum can't exceed its maximum. Empty values (`?minPrice=`) are ignored.
- Bikes whose top speed or range has no number (`null`) don't match a top speed or range filter, but still appear when that filter isn't used.
- `pagination.total` counts only the bikes that match.

**Request**

```http
GET /api/bikes?search=spark&brand=6abe2a10c3f1a2b4d5e6f701,6abe2a10c3f1a2b4d5e6f702&type=bike&minPrice=100000&maxPrice=250000&minTopSpeed=60&minRange=50&page=1&limit=12
```

**Response `200`**

```json
{
  "bikes": [
    {
      "_id": "6abe28b41464448322d89e0e",
      "name": "Crown Electric Spark",
      "slug": "crown-electric-spark",
      "brand": {
        "_id": "6abe2a10c3f1a2b4d5e6f701",
        "displayName": "Crown CMC",
        "logoUrl": "https://res.cloudinary.com/<cloud>/image/upload/v1790846844/evinn/brands/xyz789.png"
      },
      "type": "bike",
      "price": 195000,
      "rating": 4.5,
      "imageUrl": "https://res.cloudinary.com/<cloud>/image/upload/v1790846900/evinn/bikes/def456.webp",
      "imagePublicId": "evinn/bikes/def456",
      "specs": {
        "range": "70 km",
        "topSpeed": "65 km/h",
        "battery": "72V 30Ah",
        "chargingTime": "4.5 hrs",
        "motorPower": "3000W",
        "weight": "115 kg",
        "warranty": "2 Years"
      },
      "topSpeedKmh": 65,
      "rangeKm": 70,
      "createdAt": "2026-10-01T10:05:00.000Z",
      "updatedAt": "2026-10-01T10:05:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 1,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

**More examples**

| Goal | Request |
|---|---|
| Search only | `GET /api/bikes?search=crown` |
| All scooters of one brand | `GET /api/bikes?brand=6abe2a10c3f1a2b4d5e6f701&type=scooter` |
| Under PKR 200,000 | `GET /api/bikes?maxPrice=200000` |
| Top speed 60–80 km/h | `GET /api/bikes?minTopSpeed=60&maxTopSpeed=80` |
| At least 100 km range | `GET /api/bikes?minRange=100` |

**Errors**

| Status | Message |
|---|---|
| `400` | `minPrice must be a non-negative number` (same pattern for every number filter: `-5`, `abc`, or the parameter repeated) |
| `400` | `minPrice cannot be greater than maxPrice` (same for top speed and range) |
| `400` | `Invalid brand` (a malformed id anywhere in `brand`) |

---

#### `GET /api/bikes/:slug`

Get one bike by slug (case-insensitive). Use it for the bike detail page.

**Auth:** Public.

**Request**

```http
GET /api/bikes/crown-electric-spark
```

**Response `200`**

```json
{
  "bike": {
    "_id": "6abe28b41464448322d89e0e",
    "name": "Crown Electric Spark",
    "slug": "crown-electric-spark",
    "brand": {
      "_id": "6abe2a10c3f1a2b4d5e6f701",
      "displayName": "Crown CMC",
      "logoUrl": "https://res.cloudinary.com/<cloud>/image/upload/v1790846844/evinn/brands/xyz789.png"
    },
    "type": "bike",
    "price": 195000,
    "rating": 4.5,
    "imageUrl": "https://res.cloudinary.com/<cloud>/image/upload/v1790846900/evinn/bikes/def456.webp",
    "imagePublicId": "evinn/bikes/def456",
    "specs": {
      "range": "70 km",
      "topSpeed": "65 km/h",
      "battery": "72V 30Ah",
      "chargingTime": "4.5 hrs",
      "motorPower": "3000W",
      "weight": "115 kg",
      "warranty": "2 Years"
    },
    "topSpeedKmh": 65,
    "rangeKm": 70,
    "createdAt": "2026-10-01T10:05:00.000Z",
    "updatedAt": "2026-10-01T10:05:00.000Z"
  }
}
```

**Errors:** `404 Bike not found`.

---

#### `POST /api/bikes`

Create a bike with its image.

**Auth:** Admin. `multipart/form-data`.

**Form fields**

| Field | Type | Required | Notes |
|---|---|---|---|
| `image` | file | **Yes** | Image, max 5 MB. |
| `name` | string | **Yes** | Max 150 chars. |
| `brand` | string | **Yes** | `_id` of an existing brand. |
| `type` | string | **Yes** | `bike` or `scooter`. |
| `price` | number | **Yes** | PKR, `>= 0`. |
| `specs` | object | **Yes** | All seven keys, non-empty. See [specs](#bike-data-model). |
| `rating` | number | No | `0`–`5`, default `0`. |
| `slug` | string | No | Generated from `name` if omitted (`"Crown Electric Spark"` → `crown-electric-spark`). Must be unique. |

Send `specs` in `FormData` either way:

```js
// Option A: a JSON string (simplest)
fd.append("specs", JSON.stringify({ range: "70 km", topSpeed: "65 km/h", /* ... */ }));

// Option B: one field per spec
fd.append("specs[range]", "70 km");
fd.append("specs[topSpeed]", "65 km/h");
```

Unknown spec keys are ignored.

**Request**

```js
const fd = new FormData();
fd.append("image", imageFile);
fd.append("name", "Crown Electric Spark");
fd.append("brand", "6abe2a10c3f1a2b4d5e6f701");
fd.append("type", "bike");
fd.append("price", "195000");
fd.append("rating", "4.5");
fd.append("specs", JSON.stringify({
  range: "70 km",
  topSpeed: "65 km/h",
  battery: "72V 30Ah",
  chargingTime: "4.5 hrs",
  motorPower: "3000W",
  weight: "115 kg",
  warranty: "2 Years",
}));

await fetch("/api/bikes", { method: "POST", body: fd, credentials: "include" });
```

**Response `201`**

```json
{
  "bike": {
    "_id": "6abe28b41464448322d89e0e",
    "name": "Crown Electric Spark",
    "slug": "crown-electric-spark",
    "brand": {
      "_id": "6abe2a10c3f1a2b4d5e6f701",
      "displayName": "Crown CMC",
      "logoUrl": "https://res.cloudinary.com/<cloud>/image/upload/v1790846844/evinn/brands/xyz789.png"
    },
    "type": "bike",
    "price": 195000,
    "rating": 4.5,
    "imageUrl": "https://res.cloudinary.com/<cloud>/image/upload/v1790846900/evinn/bikes/def456.webp",
    "imagePublicId": "evinn/bikes/def456",
    "specs": {
      "range": "70 km",
      "topSpeed": "65 km/h",
      "battery": "72V 30Ah",
      "chargingTime": "4.5 hrs",
      "motorPower": "3000W",
      "weight": "115 kg",
      "warranty": "2 Years"
    },
    "topSpeedKmh": 65,
    "rangeKm": 70,
    "createdAt": "2026-10-01T10:05:00.000Z",
    "updatedAt": "2026-10-01T10:05:00.000Z"
  }
}
```

**Example error: missing specs**

```json
{ "message": "Range is required, Top speed is required, Battery is required, Charging time is required, Motor power is required, Weight is required, Warranty is required" }
```

**Errors**

| Status | Message |
|---|---|
| `400` | `Image is required` (checked first) |
| `400` | `Name is required`, `Brand is required`, `Type is required`, `Price is required` |
| `400` | `Range is required`, `Top speed is required`, `Battery is required`, `Charging time is required`, `Motor power is required`, `Weight is required`, `Warranty is required` |
| `400` | `Invalid brand`, `Invalid price`, `Invalid rating` |
| `400` | `Type must be one of: bike, scooter`, `Price cannot be negative`, `Rating must be between 0 and 5` |
| `400` | `Slug may only contain lowercase letters, numbers and hyphens`, `specs must be valid JSON` |
| `400` | `Brand does not exist` (a well-formed id with no matching brand) |
| `400` | File type or size errors |
| `401` | Not logged in |
| `409` | `slug already exists` (another bike has the same name or slug; send a different `slug`) |

---

#### `PATCH /api/bikes/:id`

Update a bike by `_id`. Send only the fields you want to change.

**Auth:** Admin.

- To replace the image: `multipart/form-data` with an `image` file.
- Without a new image: `multipart/form-data` **or** `application/json`.
- **Specs are merged**, not replaced: `{ "specs": { "weight": "120 kg" } }` changes only `weight`.
- A spec that has a value can't be set to empty (`Weight is required`).
- `topSpeedKmh` and `rangeKm` are recalculated automatically when `topSpeed` or `range` changes.
- Renaming doesn't change the slug. To change it, send `slug`. Sending `slug: ""` regenerates it from the current name.

**Request (JSON)**

```http
PATCH /api/bikes/6abe28b41464448322d89e0e
Content-Type: application/json
Cookie: accessToken=<jwt>

{
  "price": 199000,
  "rating": 4.8,
  "specs": { "topSpeed": "70 km/h", "weight": "120 kg" }
}
```

**Request (new image)**

```js
const fd = new FormData();
fd.append("image", newImageFile);
fd.append("price", "199000");
await fetch(`/api/bikes/${bikeId}`, { method: "PATCH", body: fd, credentials: "include" });
```

**Response `200`**

```json
{
  "bike": {
    "_id": "6abe28b41464448322d89e0e",
    "name": "Crown Electric Spark",
    "slug": "crown-electric-spark",
    "brand": {
      "_id": "6abe2a10c3f1a2b4d5e6f701",
      "displayName": "Crown CMC",
      "logoUrl": "https://res.cloudinary.com/<cloud>/image/upload/v1790846844/evinn/brands/xyz789.png"
    },
    "type": "bike",
    "price": 199000,
    "rating": 4.8,
    "imageUrl": "https://res.cloudinary.com/<cloud>/image/upload/v1790846900/evinn/bikes/def456.webp",
    "imagePublicId": "evinn/bikes/def456",
    "specs": {
      "range": "70 km",
      "topSpeed": "70 km/h",
      "battery": "72V 30Ah",
      "chargingTime": "4.5 hrs",
      "motorPower": "3000W",
      "weight": "120 kg",
      "warranty": "2 Years"
    },
    "topSpeedKmh": 70,
    "rangeKm": 70,
    "createdAt": "2026-10-01T10:05:00.000Z",
    "updatedAt": "2026-10-04T08:30:00.000Z"
  }
}
```

**Errors:** the same as [create](#post-apibikes) (except `Image is required`), plus:

| Status | Message |
|---|---|
| `400` | `Invalid _id` |
| `404` | `Bike not found` |

---

#### `DELETE /api/bikes/:id`

Delete a bike and its image.

**Auth:** Admin.

**Request**

```http
DELETE /api/bikes/6abe28b41464448322d89e0e
Cookie: accessToken=<jwt>
```

**Response `200`**

```json
{ "message": "Bike deleted" }
```

**Errors:** `400 Invalid _id`, `401`, `404 Bike not found`.

---

### 11.5 Accessories

Add-ons sold in the shop (chargers, helmets, locks…). The public site lists them; the admin manages them with an image.

#### Accessory data model

| Field | Type | Required | Default | Limits |
|---|---|---|---|---|
| `_id` | string | *server* | | |
| `name` | string | Yes | | Max 150 |
| `slug` | string | No (auto) | from `name` | Unique, `a-z 0-9 -` |
| `price` | number | Yes | | `>= 0`, PKR |
| `priceText` | string | *server* (computed) | | e.g. `"PKR 1,200"`, always matches `price` |
| `imageUrl` | string | *server* (from upload) | | |
| `imagePublicId` | string | *server* | `""` | |
| `description` | string | No | `""` | Max 2000 |
| `features` | string[] | No | `[]` | Max 20 items, each max 200 chars; blank items removed |
| `inStock` | boolean | No | `true` | |
| `createdAt` / `updatedAt` | string (ISO date) | *server* | | |

**Rules**

- Slugs work like bikes: generated from the name on create, unchanged on rename unless you send `slug`.
- `features` can be sent in three ways in `FormData`:

  ```js
  // Option A: repeat the field once per feature (recommended)
  fd.append("features", "Fast charging support");
  fd.append("features", "Overcharge protection");

  // Option B: a JSON array string
  fd.append("features", JSON.stringify(["Fast charging support", "Overcharge protection"]));

  // A single plain string becomes a one-item list
  fd.append("features", "Durable cable");
  ```

  In a JSON body, send a normal array.

---

#### `GET /api/accessories`

List accessories, newest first. [Paginated](#6-pagination).

**Auth:** Public.

**Query parameters**

| Param | Type | Notes |
|---|---|---|
| `page` | integer | Default `1`. |
| `limit` | integer | Default `10`, max `100`. |
| `inStock` | `true` \| `false` | Optional. Any other value is ignored (returns all). |

**Request**

```http
GET /api/accessories?inStock=true&page=1&limit=8
```

**Response `200`**

```json
{
  "accessories": [
    {
      "_id": "6abe2fb578eb288f5753a167",
      "name": "Charger",
      "slug": "charger",
      "price": 1200,
      "imageUrl": "https://res.cloudinary.com/<cloud>/image/upload/v1790847000/evinn/accessories/ghi012.png",
      "imagePublicId": "evinn/accessories/ghi012",
      "description": "High-speed authentic charger designed for optimal battery health and fast charging cycles.",
      "features": ["Fast charging support", "Overcharge protection", "Durable cable"],
      "inStock": true,
      "createdAt": "2026-10-01T10:10:00.000Z",
      "updatedAt": "2026-10-01T10:10:00.000Z",
      "priceText": "PKR 1,200"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 8,
    "total": 1,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

---

#### `GET /api/accessories/:slug`

Get one accessory by slug (case-insensitive).

**Auth:** Public.

**Request**

```http
GET /api/accessories/charger
```

**Response `200`**

```json
{
  "accessory": {
    "_id": "6abe2fb578eb288f5753a167",
    "name": "Charger",
    "slug": "charger",
    "price": 1200,
    "imageUrl": "https://res.cloudinary.com/<cloud>/image/upload/v1790847000/evinn/accessories/ghi012.png",
    "imagePublicId": "evinn/accessories/ghi012",
    "description": "High-speed authentic charger designed for optimal battery health and fast charging cycles.",
    "features": ["Fast charging support", "Overcharge protection", "Durable cable"],
    "inStock": true,
    "createdAt": "2026-10-01T10:10:00.000Z",
    "updatedAt": "2026-10-01T10:10:00.000Z",
    "priceText": "PKR 1,200"
  }
}
```

**Errors:** `404 Accessory not found`.

---

#### `POST /api/accessories`

Create an accessory with its image.

**Auth:** Admin. `multipart/form-data`.

**Form fields**

| Field | Type | Required | Notes |
|---|---|---|---|
| `image` | file | **Yes** | Image, max 5 MB. |
| `name` | string | **Yes** | Max 150 chars. |
| `price` | number | **Yes** | PKR, `>= 0`. |
| `slug` | string | No | Generated from `name` if omitted. Must be unique. |
| `description` | string | No | Max 2000 chars. |
| `features` | string[] | No | See [the ways to send features](#accessory-data-model). |
| `inStock` | boolean | No | `"true"` / `"false"`, default `true`. |

**Request**

```js
const fd = new FormData();
fd.append("image", imageFile);
fd.append("name", "Charger");
fd.append("price", "1200");
fd.append("description", "High-speed authentic charger designed for optimal battery health and fast charging cycles.");
["Fast charging support", "Overcharge protection", "Durable cable"].forEach((f) => fd.append("features", f));
fd.append("inStock", "true");

await fetch("/api/accessories", { method: "POST", body: fd, credentials: "include" });
```

**Response `201`**

```json
{
  "accessory": {
    "_id": "6abe2fb578eb288f5753a167",
    "name": "Charger",
    "slug": "charger",
    "price": 1200,
    "imageUrl": "https://res.cloudinary.com/<cloud>/image/upload/v1790847000/evinn/accessories/ghi012.png",
    "imagePublicId": "evinn/accessories/ghi012",
    "description": "High-speed authentic charger designed for optimal battery health and fast charging cycles.",
    "features": ["Fast charging support", "Overcharge protection", "Durable cable"],
    "inStock": true,
    "createdAt": "2026-10-01T10:10:00.000Z",
    "updatedAt": "2026-10-01T10:10:00.000Z",
    "priceText": "PKR 1,200"
  }
}
```

**Errors**

| Status | Message |
|---|---|
| `400` | `Image is required` (checked first) |
| `400` | `Name is required`, `Price is required`, `Invalid price`, `Price cannot be negative`, `Invalid inStock` |
| `400` | `At most 20 features are allowed`, `features must be a valid JSON array`, text too long |
| `400` | `Slug may only contain lowercase letters, numbers and hyphens`, file type or size errors |
| `401` | Not logged in |
| `409` | `slug already exists` |

---

#### `PATCH /api/accessories/:id`

Update an accessory by `_id`. Send only the fields you want to change.

**Auth:** Admin.

- To replace the image: `multipart/form-data` with an `image` file.
- Without a new image: `multipart/form-data` **or** `application/json`.
- `features` **replaces** the whole list. Send `[]` (JSON) to clear it.

**Request**

```http
PATCH /api/accessories/6abe2fb578eb288f5753a167
Content-Type: application/json
Cookie: accessToken=<jwt>

{ "price": 1500, "inStock": false, "features": ["Fast charging support", "Overcharge protection"] }
```

**Response `200`**

```json
{
  "accessory": {
    "_id": "6abe2fb578eb288f5753a167",
    "name": "Charger",
    "slug": "charger",
    "price": 1500,
    "imageUrl": "https://res.cloudinary.com/<cloud>/image/upload/v1790847000/evinn/accessories/ghi012.png",
    "imagePublicId": "evinn/accessories/ghi012",
    "description": "High-speed authentic charger designed for optimal battery health and fast charging cycles.",
    "features": ["Fast charging support", "Overcharge protection"],
    "inStock": false,
    "createdAt": "2026-10-01T10:10:00.000Z",
    "updatedAt": "2026-10-04T11:00:00.000Z",
    "priceText": "PKR 1,500"
  }
}
```

**Errors:** the same as [create](#post-apiaccessories) (except `Image is required`), plus `400 Invalid _id` and `404 Accessory not found`.

---

#### `DELETE /api/accessories/:id`

Delete an accessory and its image.

**Auth:** Admin.

**Request**

```http
DELETE /api/accessories/6abe2fb578eb288f5753a167
Cookie: accessToken=<jwt>
```

**Response `200`**

```json
{ "message": "Accessory deleted" }
```

**Errors:** `400 Invalid _id`, `401`, `404 Accessory not found`.

---

### 11.6 Spare parts

Replacement parts (batteries, tyres, brake pads…). Spare parts work **exactly like accessories**: same fields, rules, `priceText`, `features` formats and errors. Only these differ:

| | Accessories | Spare parts |
|---|---|---|
| Base path | `/api/accessories` | `/api/spare-parts` |
| List response key | `accessories` | `spareParts` |
| Single response key | `accessory` | `sparePart` |
| Not found message | `Accessory not found` | `Spare part not found` |
| Delete message | `Accessory deleted` | `Spare part deleted` |
| Cloudinary folder | `evinn/accessories` | `evinn/spare-parts` |

#### Spare part data model

Same as the [accessory data model](#accessory-data-model).

---

#### `GET /api/spare-parts`

List spare parts, newest first. [Paginated](#6-pagination).

**Auth:** Public.

**Query parameters:** `page`, `limit`, `inStock` (`true` \| `false`), as for [accessories](#get-apiaccessories).

**Request**

```http
GET /api/spare-parts?inStock=true&page=1&limit=8
```

**Response `200`**

```json
{
  "spareParts": [
    {
      "_id": "6abf41c2d8e9f0a1b2c3d4e5",
      "name": "Battery",
      "slug": "battery",
      "price": 40000,
      "imageUrl": "https://res.cloudinary.com/<cloud>/image/upload/v1790930000/evinn/spare-parts/jkl345.png",
      "imagePublicId": "evinn/spare-parts/jkl345",
      "description": "Long-lasting lithium-ion replacement battery for extended range.",
      "features": ["High capacity", "Weather sealed", "2-year warranty"],
      "inStock": true,
      "createdAt": "2026-10-02T08:00:00.000Z",
      "updatedAt": "2026-10-02T08:00:00.000Z",
      "priceText": "PKR 40,000"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 8,
    "total": 1,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

---

#### `GET /api/spare-parts/:slug`

Get one spare part by slug (case-insensitive).

**Auth:** Public.

**Request**

```http
GET /api/spare-parts/battery
```

**Response `200`**

```json
{
  "sparePart": {
    "_id": "6abf41c2d8e9f0a1b2c3d4e5",
    "name": "Battery",
    "slug": "battery",
    "price": 40000,
    "imageUrl": "https://res.cloudinary.com/<cloud>/image/upload/v1790930000/evinn/spare-parts/jkl345.png",
    "imagePublicId": "evinn/spare-parts/jkl345",
    "description": "Long-lasting lithium-ion replacement battery for extended range.",
    "features": ["High capacity", "Weather sealed", "2-year warranty"],
    "inStock": true,
    "createdAt": "2026-10-02T08:00:00.000Z",
    "updatedAt": "2026-10-02T08:00:00.000Z",
    "priceText": "PKR 40,000"
  }
}
```

**Errors:** `404 Spare part not found`.

---

#### `POST /api/spare-parts`

Create a spare part with its image.

**Auth:** Admin. `multipart/form-data`.

**Form fields:** the same as [creating an accessory](#post-apiaccessories): `image` (required), `name` (required), `price` (required), `slug`, `description`, `features`, `inStock`.

**Request**

```js
const fd = new FormData();
fd.append("image", imageFile);
fd.append("name", "Battery");
fd.append("price", "40000");
fd.append("description", "Long-lasting lithium-ion replacement battery for extended range.");
["High capacity", "Weather sealed", "2-year warranty"].forEach((f) => fd.append("features", f));

await fetch("/api/spare-parts", { method: "POST", body: fd, credentials: "include" });
```

**Response `201`**

```json
{
  "sparePart": {
    "_id": "6abf41c2d8e9f0a1b2c3d4e5",
    "name": "Battery",
    "slug": "battery",
    "price": 40000,
    "imageUrl": "https://res.cloudinary.com/<cloud>/image/upload/v1790930000/evinn/spare-parts/jkl345.png",
    "imagePublicId": "evinn/spare-parts/jkl345",
    "description": "Long-lasting lithium-ion replacement battery for extended range.",
    "features": ["High capacity", "Weather sealed", "2-year warranty"],
    "inStock": true,
    "createdAt": "2026-10-02T08:00:00.000Z",
    "updatedAt": "2026-10-02T08:00:00.000Z",
    "priceText": "PKR 40,000"
  }
}
```

**Errors:** the same as [creating an accessory](#post-apiaccessories).

---

#### `PATCH /api/spare-parts/:id`

Update a spare part by `_id`. Same rules as [updating an accessory](#patch-apiaccessoriesid).

**Auth:** Admin.

**Request**

```http
PATCH /api/spare-parts/6abf41c2d8e9f0a1b2c3d4e5
Content-Type: application/json
Cookie: accessToken=<jwt>

{ "price": 45500, "inStock": false }
```

**Response `200`**

```json
{
  "sparePart": {
    "_id": "6abf41c2d8e9f0a1b2c3d4e5",
    "name": "Battery",
    "slug": "battery",
    "price": 45500,
    "imageUrl": "https://res.cloudinary.com/<cloud>/image/upload/v1790930000/evinn/spare-parts/jkl345.png",
    "imagePublicId": "evinn/spare-parts/jkl345",
    "description": "Long-lasting lithium-ion replacement battery for extended range.",
    "features": ["High capacity", "Weather sealed", "2-year warranty"],
    "inStock": false,
    "createdAt": "2026-10-02T08:00:00.000Z",
    "updatedAt": "2026-10-05T09:45:00.000Z",
    "priceText": "PKR 45,500"
  }
}
```

**Errors:** the same as [creating an accessory](#post-apiaccessories) (except `Image is required`), plus `400 Invalid _id` and `404 Spare part not found`.

---

#### `DELETE /api/spare-parts/:id`

Delete a spare part and its image.

**Auth:** Admin.

**Request**

```http
DELETE /api/spare-parts/6abf41c2d8e9f0a1b2c3d4e5
Cookie: accessToken=<jwt>
```

**Response `200`**

```json
{ "message": "Spare part deleted" }
```

**Errors:** `400 Invalid _id`, `401`, `404 Spare part not found`.

---

### 11.7 Contact submissions

Visitors send the public contact form; the admin reads submissions in an inbox and tracks them with a status. Every new submission emails all admins.

#### Contact submission data model

| Field | Type | Required | Default | Limits |
|---|---|---|---|---|
| `_id` | string | *server* | | |
| `fullName` | string | Yes | | Max 100 |
| `email` | string | Yes | | Valid email, stored lowercase, max 254 |
| `reason` | string | Yes | | `Product Inquiry` \| `Business Inquiry` \| `Support` \| `General Inquiry` |
| `message` | string | No | `""` | Max 5000 |
| `status` | string | *admin only* | `pending` | `pending` \| `in process` \| `answered` |
| `createdAt` / `updatedAt` | string (ISO date) | *server* | | |

**Rules**

- `reason` and `status` must match exactly, including case (`support` is rejected; `Support` is accepted). Surrounding spaces are ignored.
- Visitors can't set `status`; every new submission starts as `pending`.
- The admin can move a submission to any status at any time (there's no fixed order).
- Replying happens outside the app: reply to the notification email (its Reply-To is the visitor) or email `submission.email` directly, then mark it `answered`.

---

#### `POST /api/contact-submissions`

Send the contact form.

**Auth:** Public. **Rate limited** (5 successful submissions per 15 minutes per IP).

**Request body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `fullName` | string | Yes | Max 100 chars. |
| `email` | string | Yes | Valid email. |
| `reason` | string | Yes | One of the reasons above. |
| `message` | string | No | Max 5000 chars. |

```http
POST /api/contact-submissions
Content-Type: application/json

{
  "fullName": "Ahmed Khan",
  "email": "Ahmed@Example.com",
  "reason": "Product Inquiry",
  "message": "Is the Crown Electric Spark available in red?"
}
```

**Response `201`**

```json
{
  "message": "Thanks for reaching out! We'll get back to you soon.",
  "submission": {
    "_id": "6abf5a01e2f3a4b5c6d7e8f9",
    "fullName": "Ahmed Khan",
    "email": "ahmed@example.com",
    "reason": "Product Inquiry",
    "message": "Is the Crown Electric Spark available in red?",
    "status": "pending",
    "createdAt": "2026-10-02T09:15:00.000Z",
    "updatedAt": "2026-10-02T09:15:00.000Z"
  }
}
```

Show `message` as the success toast.

**Admin notification:** all admins get "New contact form message from Ahmed Khan (Product Inquiry)" with the visitor's details and message. Its Reply-To is the visitor's email, so admins can answer by replying.

**Errors**

| Status | Message |
|---|---|
| `400` | `Full name is required`, `Email is required`, `Reason is required` |
| `400` | `Email is invalid` |
| `400` | `Reason must be one of: Product Inquiry, Business Inquiry, Support, General Inquiry` |
| `400` | Text too long (`fullName` > 100 or `message` > 5000 chars) |
| `429` | `Too many requests, please try again later.` |

---

#### `GET /api/contact-submissions`

List submissions, newest first. [Paginated](#6-pagination).

**Auth:** Admin.

**Query parameters**

| Param | Type | Notes |
|---|---|---|
| `page` | integer | Default `1`. |
| `limit` | integer | Default `10`, max `100`. |
| `status` | string | `pending`, `in process` or `answered`. URL-encode the space: `?status=in%20process` (axios `params` and `URLSearchParams` do this for you). |
| `reason` | string | One of the reasons, URL-encoded (`?reason=Product%20Inquiry`). |

Unknown `status` or `reason` values return an empty list.

**Request**

```http
GET /api/contact-submissions?status=pending&page=1&limit=10
Cookie: accessToken=<jwt>
```

**Response `200`**

```json
{
  "submissions": [
    {
      "_id": "6abf5a01e2f3a4b5c6d7e8f9",
      "fullName": "Ahmed Khan",
      "email": "ahmed@example.com",
      "reason": "Product Inquiry",
      "message": "Is the Crown Electric Spark available in red?",
      "status": "pending",
      "createdAt": "2026-10-02T09:15:00.000Z",
      "updatedAt": "2026-10-02T09:15:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

Tip: `pagination.total` from `?status=pending&limit=1` gives a cheap "unread" badge count.

**Errors:** `401`.

---

#### `PATCH /api/contact-submissions/:id/status`

Change a submission's status. Only `status` can be changed; other fields in the body are ignored.

**Auth:** Admin.

**Request**

```http
PATCH /api/contact-submissions/6abf5a01e2f3a4b5c6d7e8f9/status
Content-Type: application/json
Cookie: accessToken=<jwt>

{ "status": "answered" }
```

**Response `200`**

```json
{
  "submission": {
    "_id": "6abf5a01e2f3a4b5c6d7e8f9",
    "fullName": "Ahmed Khan",
    "email": "ahmed@example.com",
    "reason": "Product Inquiry",
    "message": "Is the Crown Electric Spark available in red?",
    "status": "answered",
    "createdAt": "2026-10-02T09:15:00.000Z",
    "updatedAt": "2026-10-02T11:40:00.000Z"
  }
}
```

**Errors**

| Status | Message |
|---|---|
| `400` | `Status is required` |
| `400` | `Status must be one of: pending, in process, answered` |
| `400` | `Invalid _id` |
| `401` | Not logged in |
| `404` | `Contact submission not found` |

---

#### `DELETE /api/contact-submissions/:id`

Delete a submission permanently.

**Auth:** Admin.

**Request**

```http
DELETE /api/contact-submissions/6abf5a01e2f3a4b5c6d7e8f9
Cookie: accessToken=<jwt>
```

**Response `200`**

```json
{ "message": "Contact submission deleted" }
```

**Errors:** `400 Invalid _id`, `401`, `404 Contact submission not found`.

---

### 11.8 Test ride requests

Visitors request a test ride of a specific bike; the admin accepts or rejects each request. Every new request emails all admins.

#### Test ride request data model

| Field | Type | Required | Default | Limits |
|---|---|---|---|---|
| `_id` | string | *server* | | |
| `requesterName` | string | Yes | | Max 100 |
| `requesterEmail` | string | Yes | | Valid email, stored lowercase, max 254 |
| `requesterWhatsApp` | string | Yes | | Optional `+`, then 8–15 digits. Spaces, dashes and brackets are removed before saving. |
| `brand` | string (send) / object (receive) | Yes | | `_id` of an existing brand |
| `bike` | string (send) / object (receive) | Yes | | `_id` of an existing bike **of that brand** |
| `preferredCity` | string | Yes | | Max 100 |
| `preferredDate` | string (send `YYYY-MM-DD`) / ISO date (receive) | Yes | | Today or later (compared in UTC) |
| `preferredTime` | string | Yes | | 24-hour `HH:mm`, e.g. `"14:30"` |
| `status` | string | *admin only* | `pending` | `pending` \| `accepted` \| `rejected` |
| `rejectionReason` | string | *admin only* | `""` | Max 1000; required when rejecting |
| `createdAt` / `updatedAt` | string (ISO date) | *server* | | |

**Rules**

- Every request starts as `pending`. Once it's `accepted` or `rejected`, its status is **final**.
- Accepting and rejecting are atomic: if two admins act at the same time, only the first succeeds; the other gets `409`.
- `preferredDate` is stored as midnight UTC (`"2026-10-10T00:00:00.000Z"`). Show it with `preferredDate.slice(0, 10)` to avoid a timezone shift.
- The requester is **not** emailed when a request is accepted or rejected; contact them on WhatsApp or by email.
- In admin responses `brand` and `bike` are populated. If the brand or bike was deleted later, the field is `null`.

---

#### `POST /api/test-ride-requests`

Request a test ride.

**Auth:** Public. **Rate limited** (5 successful requests per 15 minutes per IP).

**Request body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `requesterName` | string | Yes | Max 100 chars. |
| `requesterEmail` | string | Yes | Valid email. |
| `requesterWhatsApp` | string | Yes | Ask for the country code (`+92 300 1234567`) so the admin can open a WhatsApp chat directly. |
| `brand` | string | Yes | Brand `_id`. |
| `bike` | string | Yes | Bike `_id`; must belong to `brand`. |
| `preferredCity` | string | Yes | Max 100 chars. |
| `preferredDate` | string | Yes | `YYYY-MM-DD`, today or later. |
| `preferredTime` | string | Yes | `HH:mm`, 24-hour. This is what `<input type="time">` gives you. |

```http
POST /api/test-ride-requests
Content-Type: application/json

{
  "requesterName": "Ahmed Khan",
  "requesterEmail": "ahmed@example.com",
  "requesterWhatsApp": "+92 300 1234567",
  "brand": "6abe2a10c3f1a2b4d5e6f701",
  "bike": "6abe28b41464448322d89e0e",
  "preferredCity": "Lahore",
  "preferredDate": "2026-10-10",
  "preferredTime": "14:30"
}
```

**Response `201`** (`brand` and `bike` are plain ids here)

```json
{
  "message": "Your test ride request has been received! We'll contact you soon.",
  "testRideRequest": {
    "_id": "6ac0b1c2d3e4f5a6b7c8d9e0",
    "requesterName": "Ahmed Khan",
    "requesterEmail": "ahmed@example.com",
    "requesterWhatsApp": "+923001234567",
    "brand": "6abe2a10c3f1a2b4d5e6f701",
    "bike": "6abe28b41464448322d89e0e",
    "preferredCity": "Lahore",
    "preferredDate": "2026-10-10T00:00:00.000Z",
    "preferredTime": "14:30",
    "status": "pending",
    "rejectionReason": "",
    "createdAt": "2026-10-06T09:15:00.000Z",
    "updatedAt": "2026-10-06T09:15:00.000Z"
  }
}
```

**Admin notification:** all admins get "New test ride request from Ahmed Khan (Crown Electric Spark)" with the requester's details, the bike, and the ride date and time. Its Reply-To is the requester's email, and the WhatsApp number links to a chat when it includes the country code.

**Errors**

| Status | Message |
|---|---|
| `400` | `Name is required`, `Email is required`, `WhatsApp number is required`, `Brand is required`, `Bike is required`, `Preferred city is required`, `Preferred date is required`, `Preferred time is required` |
| `400` | `Email is invalid`, `WhatsApp number is invalid` |
| `400` | `Preferred date cannot be in the past`, `Preferred time must be in HH:mm format` |
| `400` | `Invalid brand`, `Invalid bike`, `Invalid preferredDate` (not a valid id or date) |
| `400` | `Brand does not exist`, `Bike does not exist for the selected brand` |
| `400` | Text too long |
| `429` | `Too many requests, please try again later.` |

---

#### `GET /api/test-ride-requests`

List requests, newest first. [Paginated](#6-pagination).

**Auth:** Admin.

**Query parameters**

| Param | Type | Notes |
|---|---|---|
| `page` | integer | Default `1`. |
| `limit` | integer | Default `10`, max `100`. |
| `status` | string | `pending`, `accepted` or `rejected`. Unknown values return an empty list. |
| `brand` | string | Brand `_id`. |
| `bike` | string | Bike `_id`. |

**Request**

```http
GET /api/test-ride-requests?status=pending&page=1
Cookie: accessToken=<jwt>
```

**Response `200`**

```json
{
  "testRideRequests": [
    {
      "_id": "6ac0b1c2d3e4f5a6b7c8d9e0",
      "requesterName": "Ahmed Khan",
      "requesterEmail": "ahmed@example.com",
      "requesterWhatsApp": "+923001234567",
      "brand": {
        "_id": "6abe2a10c3f1a2b4d5e6f701",
        "displayName": "Crown CMC",
        "logoUrl": "https://res.cloudinary.com/<cloud>/image/upload/v1790846844/evinn/brands/xyz789.png"
      },
      "bike": {
        "_id": "6abe28b41464448322d89e0e",
        "name": "Crown Electric Spark",
        "slug": "crown-electric-spark",
        "imageUrl": "https://res.cloudinary.com/<cloud>/image/upload/v1790846900/evinn/bikes/def456.webp"
      },
      "preferredCity": "Lahore",
      "preferredDate": "2026-10-10T00:00:00.000Z",
      "preferredTime": "14:30",
      "status": "pending",
      "rejectionReason": "",
      "createdAt": "2026-10-06T09:15:00.000Z",
      "updatedAt": "2026-10-06T09:15:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

**Errors:** `400 Invalid brand` / `Invalid bike`, `401`.

---

#### `PATCH /api/test-ride-requests/:id/accept`

Accept a pending request. No body.

**Auth:** Admin.

**Request**

```http
PATCH /api/test-ride-requests/6ac0b1c2d3e4f5a6b7c8d9e0/accept
Cookie: accessToken=<jwt>
```

**Response `200`**

```json
{
  "testRideRequest": {
    "_id": "6ac0b1c2d3e4f5a6b7c8d9e0",
    "requesterName": "Ahmed Khan",
    "requesterEmail": "ahmed@example.com",
    "requesterWhatsApp": "+923001234567",
    "brand": {
      "_id": "6abe2a10c3f1a2b4d5e6f701",
      "displayName": "Crown CMC",
      "logoUrl": "https://res.cloudinary.com/<cloud>/image/upload/v1790846844/evinn/brands/xyz789.png"
    },
    "bike": {
      "_id": "6abe28b41464448322d89e0e",
      "name": "Crown Electric Spark",
      "slug": "crown-electric-spark",
      "imageUrl": "https://res.cloudinary.com/<cloud>/image/upload/v1790846900/evinn/bikes/def456.webp"
    },
    "preferredCity": "Lahore",
    "preferredDate": "2026-10-10T00:00:00.000Z",
    "preferredTime": "14:30",
    "status": "accepted",
    "rejectionReason": "",
    "createdAt": "2026-10-06T09:15:00.000Z",
    "updatedAt": "2026-10-06T12:00:00.000Z"
  }
}
```

**Errors**

| Status | Message |
|---|---|
| `400` | `Invalid _id` |
| `401` | Not logged in |
| `404` | `Test ride request not found` |
| `409` | `Test ride request has already been accepted` / `Test ride request has already been rejected` |

---

#### `PATCH /api/test-ride-requests/:id/reject`

Reject a pending request with a reason.

**Auth:** Admin.

**Request body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `rejectionReason` | string | Yes | Max 1000 chars. |

```http
PATCH /api/test-ride-requests/6ac0b1c2d3e4f5a6b7c8d9e0/reject
Content-Type: application/json
Cookie: accessToken=<jwt>

{ "rejectionReason": "This bike is not available for test rides in Lahore yet." }
```

**Response `200`**

```json
{
  "testRideRequest": {
    "_id": "6ac0b1c2d3e4f5a6b7c8d9e0",
    "requesterName": "Ahmed Khan",
    "requesterEmail": "ahmed@example.com",
    "requesterWhatsApp": "+923001234567",
    "brand": {
      "_id": "6abe2a10c3f1a2b4d5e6f701",
      "displayName": "Crown CMC",
      "logoUrl": "https://res.cloudinary.com/<cloud>/image/upload/v1790846844/evinn/brands/xyz789.png"
    },
    "bike": {
      "_id": "6abe28b41464448322d89e0e",
      "name": "Crown Electric Spark",
      "slug": "crown-electric-spark",
      "imageUrl": "https://res.cloudinary.com/<cloud>/image/upload/v1790846900/evinn/bikes/def456.webp"
    },
    "preferredCity": "Lahore",
    "preferredDate": "2026-10-10T00:00:00.000Z",
    "preferredTime": "14:30",
    "status": "rejected",
    "rejectionReason": "This bike is not available for test rides in Lahore yet.",
    "createdAt": "2026-10-06T09:15:00.000Z",
    "updatedAt": "2026-10-06T12:00:00.000Z"
  }
}
```

**Errors**

| Status | Message |
|---|---|
| `400` | `Rejection reason is required` |
| `400` | Text too long (`rejectionReason` > 1000 chars) |
| `400` | `Invalid _id` |
| `401` | Not logged in |
| `404` | `Test ride request not found` |
| `409` | `Test ride request has already been accepted` / `Test ride request has already been rejected` |

---

### 11.9 Orders

Customers order a bike from the website and pay **cash on delivery**. Every new order emails all admins, and the admin moves it through its statuses.

#### Order data model

| Field | Type | Required | Default | Limits |
|---|---|---|---|---|
| `_id` | string | *server* | | Also shown as "Order ID" in the admin email |
| `bike` | string (send) / object (receive) | Yes | | `_id` of an existing bike |
| `bikeName` | string | *server* (copied from the bike) | | |
| `unitPrice` | number | *server* (copied from the bike) | | PKR |
| `quantity` | integer | Yes | | `1`–`10` |
| `totalAmount` | number | *server* | | `unitPrice × quantity`, PKR |
| `shippingAddress.fullName` | string | Yes | | Max 100 |
| `shippingAddress.phoneNumber` | string | Yes | | Optional `+`, then 8–15 digits; spaces, dashes and brackets removed |
| `shippingAddress.address` | string | Yes | | Max 500; line breaks kept |
| `shippingAddress.postalCode` | string | Yes | | Exactly 5 digits |
| `shippingAddress.city` | string | Yes | | Max 100 |
| `paymentMethod` | string | No | `cash on delivery` | Only `cash on delivery` |
| `status` | string | *admin only* | `pending` | See below |
| `nextStatuses` | string[] | *server* (computed) | | Statuses the order can move to next |
| `createdAt` / `updatedAt` | string (ISO date) | *server* | | |

**Statuses and allowed changes**

| Current status | Can change to | Meaning |
|---|---|---|
| `pending` (default) | `processing`, `rejected`, `cancelled` | New order, not yet confirmed. |
| `processing` | `delivered`, `cancelled` | Confirmed with the customer and being prepared or shipped. |
| `delivered` | `completed` | Handed over to the customer. |
| `completed` | — | Final. Cash collected, order closed. |
| `cancelled` | — | Final. Cancelled by the customer or the shop. |
| `rejected` | — | Final. The shop declined the order. |

```
pending ──► processing ──► delivered ──► completed
   │             │
   ├──► rejected └──► cancelled
   └──► cancelled
```

**Rules**

- **The price never comes from the request.** The server looks up the bike and saves its name and current price on the order. The order keeps that price even if the bike's price changes or the bike is deleted later.
- `nextStatuses` lists the allowed changes from the current status. Use it to decide which buttons to show; it's `[]` once the order is final.
- Status changes are atomic: if two admins change the same order at once, only one succeeds and the other gets `409`.
- One order is for one bike (in any quantity from 1 to 10).
- Customers are not emailed; the admin calls them to confirm.

---

#### `POST /api/orders`

Place an order.

**Auth:** Public. **Rate limited** (3 successful orders per hour per IP).

**Request body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `bike` | string | Yes | Bike `_id`. |
| `quantity` | integer | Yes | `1`–`10`. |
| `shippingAddress` | object | Yes | `fullName`, `phoneNumber`, `address`, `postalCode`, `city`, all required. |
| `paymentMethod` | string | No | Only `"cash on delivery"` (the default) is accepted. |

```http
POST /api/orders
Content-Type: application/json

{
  "bike": "6abe28b41464448322d89e0e",
  "quantity": 1,
  "shippingAddress": {
    "fullName": "Ahmed Khan",
    "phoneNumber": "+92 300 1234567",
    "address": "House 12, Street 4, DHA Phase 5",
    "postalCode": "54000",
    "city": "Lahore"
  }
}
```

**Response `201`** (`bike` is a plain id here)

```json
{
  "message": "Your order has been placed! We'll call you soon to confirm it.",
  "order": {
    "_id": "6ac4fa6825dbb5aec494ad44",
    "bike": "6abe28b41464448322d89e0e",
    "bikeName": "Crown Electric Spark",
    "unitPrice": 195000,
    "quantity": 1,
    "totalAmount": 195000,
    "shippingAddress": {
      "fullName": "Ahmed Khan",
      "phoneNumber": "+923001234567",
      "address": "House 12, Street 4, DHA Phase 5",
      "postalCode": "54000",
      "city": "Lahore"
    },
    "paymentMethod": "cash on delivery",
    "status": "pending",
    "createdAt": "2026-10-06T09:15:00.000Z",
    "updatedAt": "2026-10-06T09:15:00.000Z",
    "nextStatuses": ["processing", "rejected", "cancelled"]
  }
}
```

Show `message` on the confirmation screen and treat `order.totalAmount` as the final amount.

**Admin notification:** all admins get "New order from Ahmed Khan: 1 × Crown Electric Spark (PKR 195,000)" with the customer, phone (tap to call, plus a WhatsApp link when the number has a country code), address, bike, quantity, prices and order ID.

**Errors**

| Status | Message |
|---|---|
| `400` | `Bike is required`, `Quantity is required`, `Shipping address is required` |
| `400` | `Full name is required`, `Phone number is required`, `Address is required`, `Postal code is required`, `City is required` |
| `400` | `Quantity must be at least 1`, `Quantity cannot be more than 10`, `Quantity must be a whole number`, `Invalid quantity` |
| `400` | `Phone number is invalid`, `Postal code must be 5 digits` |
| `400` | `Payment method must be one of: cash on delivery` |
| `400` | `Invalid bike` (malformed id), `Bike does not exist`, `Invalid shippingAddress` (not an object) |
| `400` | Text too long |
| `429` | `Too many requests, please try again later.` |

---

#### `GET /api/orders`

List orders, newest first. [Paginated](#6-pagination).

**Auth:** Admin.

**Query parameters**

| Param | Type | Notes |
|---|---|---|
| `page` | integer | Default `1`. |
| `limit` | integer | Default `10`, max `100`. |
| `status` | string | One of the statuses above. Unknown values return an empty list. |
| `bike` | string | Bike `_id`. |

**Request**

```http
GET /api/orders?status=pending&page=1
Cookie: accessToken=<jwt>
```

**Response `200`**

```json
{
  "orders": [
    {
      "_id": "6ac4fa6825dbb5aec494ad44",
      "bike": {
        "_id": "6abe28b41464448322d89e0e",
        "name": "Crown Electric Spark",
        "slug": "crown-electric-spark",
        "imageUrl": "https://res.cloudinary.com/<cloud>/image/upload/v1790846900/evinn/bikes/def456.webp"
      },
      "bikeName": "Crown Electric Spark",
      "unitPrice": 195000,
      "quantity": 1,
      "totalAmount": 195000,
      "shippingAddress": {
        "fullName": "Ahmed Khan",
        "phoneNumber": "+923001234567",
        "address": "House 12, Street 4, DHA Phase 5",
        "postalCode": "54000",
        "city": "Lahore"
      },
      "paymentMethod": "cash on delivery",
      "status": "pending",
      "createdAt": "2026-10-06T09:15:00.000Z",
      "updatedAt": "2026-10-06T09:15:00.000Z",
      "nextStatuses": ["processing", "rejected", "cancelled"]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

If the bike was deleted after the order was placed, `bike` is `null`; `bikeName` and `unitPrice` are always available.

Tip: `pagination.total` from `?status=pending&limit=1` gives a cheap "new orders" badge count.

**Errors:** `400 Invalid bike`, `401`.

---

#### `PATCH /api/orders/:id/status`

Move an order to another status. Only `status` can be changed, and only along the [allowed changes](#order-data-model).

**Auth:** Admin.

**Request**

```http
PATCH /api/orders/6ac4fa6825dbb5aec494ad44/status
Content-Type: application/json
Cookie: accessToken=<jwt>

{ "status": "processing" }
```

**Response `200`**

```json
{
  "order": {
    "_id": "6ac4fa6825dbb5aec494ad44",
    "bike": {
      "_id": "6abe28b41464448322d89e0e",
      "name": "Crown Electric Spark",
      "slug": "crown-electric-spark",
      "imageUrl": "https://res.cloudinary.com/<cloud>/image/upload/v1790846900/evinn/bikes/def456.webp"
    },
    "bikeName": "Crown Electric Spark",
    "unitPrice": 195000,
    "quantity": 1,
    "totalAmount": 195000,
    "shippingAddress": {
      "fullName": "Ahmed Khan",
      "phoneNumber": "+923001234567",
      "address": "House 12, Street 4, DHA Phase 5",
      "postalCode": "54000",
      "city": "Lahore"
    },
    "paymentMethod": "cash on delivery",
    "status": "processing",
    "createdAt": "2026-10-06T09:15:00.000Z",
    "updatedAt": "2026-10-06T10:30:00.000Z",
    "nextStatuses": ["delivered", "cancelled"]
  }
}
```

**Errors**

| Status | Message |
|---|---|
| `400` | `Status is required` |
| `400` | `Status must be one of: pending, processing, delivered, completed, cancelled, rejected` |
| `400` | `Invalid _id` |
| `401` | Not logged in |
| `404` | `Order not found` |
| `409` | `Order is already processing` (the same status sent again) |
| `409` | `Cannot change order status from delivered to cancelled` (change not allowed, or another admin changed the order first; refresh the list) |

---

## 12. TypeScript types

Copy into your frontend (e.g. `src/types/api.ts`).

```ts
export type ObjectId = string;
export type ISODate = string;

export interface ApiError {
  message: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ---------- Admin ----------
export interface Admin {
  _id: ObjectId;
  fullName: string;
  email: string;
  createdAt: ISODate;
  updatedAt: ISODate;
}

// ---------- Brands ----------
export interface Brand {
  _id: ObjectId;
  displayName: string;
  logoUrl: string;
  logoPublicId: string;
  origin: string;
  established: string;
  headquarters: string;
  about: string;
  websiteUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  facebookUrl: string;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export type BrandSummary = Pick<Brand, "_id" | "displayName" | "logoUrl">;

// ---------- Bikes ----------
export type BikeType = "bike" | "scooter";

export interface BikeSpecs {
  range: string;
  topSpeed: string;
  battery: string;
  chargingTime: string;
  motorPower: string;
  weight: string;
  warranty: string;
}

export interface Bike {
  _id: ObjectId;
  name: string;
  slug: string;
  brand: BrandSummary;
  type: BikeType;
  price: number;
  rating: number;
  imageUrl: string;
  imagePublicId: string;
  specs: BikeSpecs;
  topSpeedKmh: number | null;
  rangeKm: number | null;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export type BikeSummary = Pick<Bike, "_id" | "name" | "slug" | "imageUrl">;

// ---------- Accessories and spare parts ----------
export interface Accessory {
  _id: ObjectId;
  name: string;
  slug: string;
  price: number;
  priceText: string;
  imageUrl: string;
  imagePublicId: string;
  description: string;
  features: string[];
  inStock: boolean;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export type SparePart = Accessory;

// ---------- Contact submissions ----------
export type ContactReason = "Product Inquiry" | "Business Inquiry" | "Support" | "General Inquiry";
export type ContactStatus = "pending" | "in process" | "answered";

export interface ContactSubmission {
  _id: ObjectId;
  fullName: string;
  email: string;
  reason: ContactReason;
  message: string;
  status: ContactStatus;
  createdAt: ISODate;
  updatedAt: ISODate;
}

// ---------- Test ride requests ----------
export type TestRideStatus = "pending" | "accepted" | "rejected";

export interface TestRideRequest {
  _id: ObjectId;
  requesterName: string;
  requesterEmail: string;
  requesterWhatsApp: string;
  brand: BrandSummary | null;
  bike: BikeSummary | null;
  preferredCity: string;
  preferredDate: ISODate;
  preferredTime: string;
  status: TestRideStatus;
  rejectionReason: string;
  createdAt: ISODate;
  updatedAt: ISODate;
}

// ---------- Orders ----------
export type OrderStatus = "pending" | "processing" | "delivered" | "completed" | "cancelled" | "rejected";
export type PaymentMethod = "cash on delivery";

export interface ShippingAddress {
  fullName: string;
  phoneNumber: string;
  address: string;
  postalCode: string;
  city: string;
}

export interface Order {
  _id: ObjectId;
  bike: BikeSummary | null;
  bikeName: string;
  unitPrice: number;
  quantity: number;
  totalAmount: number;
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  nextStatuses: OrderStatus[];
  createdAt: ISODate;
  updatedAt: ISODate;
}

// ---------- Responses ----------
export interface MessageResponse { message: string }
export interface HealthResponse { status: "ok"; db: "connected" | "disconnected" }
export interface LoginResponse { accessToken: string; admin: Admin }
export interface MeResponse { admin: Admin }

export interface BrandListResponse { brands: Brand[] }
export interface BrandResponse { brand: Brand }

export interface BikeListResponse { bikes: Bike[]; pagination: Pagination }
export interface BikeResponse { bike: Bike }

export interface AccessoryListResponse { accessories: Accessory[]; pagination: Pagination }
export interface AccessoryResponse { accessory: Accessory }

export interface SparePartListResponse { spareParts: SparePart[]; pagination: Pagination }
export interface SparePartResponse { sparePart: SparePart }

export interface ContactSubmitResponse { message: string; submission: ContactSubmission }
export interface ContactSubmissionListResponse { submissions: ContactSubmission[]; pagination: Pagination }
export interface ContactSubmissionResponse { submission: ContactSubmission }

export interface TestRideSubmitResponse {
  message: string;
  testRideRequest: Omit<TestRideRequest, "brand" | "bike"> & { brand: ObjectId; bike: ObjectId };
}
export interface TestRideRequestListResponse { testRideRequests: TestRideRequest[]; pagination: Pagination }
export interface TestRideRequestResponse { testRideRequest: TestRideRequest }

export interface PlaceOrderResponse { message: string; order: Omit<Order, "bike"> & { bike: ObjectId } }
export interface OrderListResponse { orders: Order[]; pagination: Pagination }
export interface OrderResponse { order: Order }

// ---------- Query params ----------
export interface PageQuery { page?: number; limit?: number }

export interface BikeListQuery extends PageQuery {
  search?: string;
  brand?: string; // one id, or several joined with ","
  type?: BikeType;
  minPrice?: number;
  maxPrice?: number;
  minTopSpeed?: number;
  maxTopSpeed?: number;
  minRange?: number;
  maxRange?: number;
}
export interface AccessoryListQuery extends PageQuery { inStock?: boolean }
export type SparePartListQuery = AccessoryListQuery;
export interface ContactSubmissionListQuery extends PageQuery { status?: ContactStatus; reason?: ContactReason }
export interface TestRideRequestListQuery extends PageQuery { status?: TestRideStatus; brand?: ObjectId; bike?: ObjectId }
export interface OrderListQuery extends PageQuery { status?: OrderStatus; bike?: ObjectId }

// ---------- Request bodies ----------
// For multipart requests, send the same keys in FormData (plus the image file).
export interface LoginInput { email: string; password: string }
export interface ChangePasswordInput { currentPassword: string; newPassword: string }
export interface ForgotPasswordInput { email: string }
export interface ResetPasswordInput { otp: string; newPassword: string }

export type BrandInput = Partial<
  Pick<Brand, "displayName" | "origin" | "established" | "headquarters" | "about" |
    "websiteUrl" | "instagramUrl" | "twitterUrl" | "facebookUrl">
>;

export interface BikeCreateInput {
  name: string;
  brand: ObjectId;
  type: BikeType;
  price: number;
  specs: BikeSpecs; // all seven required
  rating?: number;
  slug?: string;
}

export interface BikeUpdateInput {
  name?: string;
  slug?: string;
  brand?: ObjectId;
  type?: BikeType;
  price?: number;
  rating?: number;
  specs?: Partial<BikeSpecs>; // merged; filled specs can't be cleared
}

export interface AccessoryInput {
  name?: string;
  slug?: string;
  price?: number;
  description?: string;
  features?: string[];
  inStock?: boolean;
}
export type SparePartInput = AccessoryInput;

export interface ContactFormInput {
  fullName: string;
  email: string;
  reason: ContactReason;
  message?: string;
}
export interface UpdateContactStatusInput { status: ContactStatus }

export interface TestRideRequestInput {
  requesterName: string;
  requesterEmail: string;
  requesterWhatsApp: string;
  brand: ObjectId;
  bike: ObjectId;
  preferredCity: string;
  preferredDate: string; // "YYYY-MM-DD"
  preferredTime: string; // "HH:mm"
}
export interface RejectTestRideInput { rejectionReason: string }

export interface PlaceOrderInput {
  bike: ObjectId;
  quantity: number;
  shippingAddress: ShippingAddress;
  paymentMethod?: PaymentMethod;
}
export interface UpdateOrderStatusInput { status: OrderStatus }
```

---

## 13. Frontend integration examples

### API client: axios

```js
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5000/api",
  withCredentials: true, // required: sends the auth cookie
});

// Send expired or missing admin sessions to the login page
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url ?? "";
    const isPublicAuthCall = ["/login", "/forgot-password", "/reset-password"].some((p) =>
      url.includes(`/admin/auth${p}`),
    );
    if (status === 401 && !isPublicAuthCall) {
      window.location.href = "/admin/login";
    }
    return Promise.reject(error);
  },
);

// Readable error text for toasts and forms
export function errorMessage(error) {
  return error.response?.data?.message ?? "Something went wrong. Please try again.";
}
```

Only redirect on `401` inside the admin panel; public pages never receive it.

### API client: fetch

```js
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

export async function request(path, { method = "GET", body, query } = {}) {
  const url = new URL(API_URL + path);
  Object.entries(query ?? {}).forEach(([k, v]) => {
    if (v !== undefined && v !== "") url.searchParams.set(k, v);
  });

  const isForm = body instanceof FormData;
  const res = await fetch(url, {
    method,
    credentials: "include", // required: sends the auth cookie
    headers: body && !isForm ? { "Content-Type": "application/json" } : undefined,
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.message ?? `Request failed (${res.status})`);
    error.status = res.status;
    throw error;
  }
  return data;
}
```

### Admin login, session and logout

```js
// Login
const { data } = await api.post("/admin/auth/login", { email, password });
setAdmin(data.admin); // don't store data.accessToken

// On admin app load: restore the session
try {
  const { data } = await api.get("/admin/auth/me");
  setAdmin(data.admin);
} catch {
  navigate("/admin/login");
}

// Logout
await api.post("/admin/auth/logout");
setAdmin(null);
navigate("/admin/login");
```

### Change password (logged in)

```js
try {
  await api.patch("/admin/auth/change-password", { currentPassword, newPassword });
  toast.success("Password changed");
  // Still logged in: the server set a fresh cookie. Other devices are signed out.
} catch (error) {
  setFormError(errorMessage(error)); // e.g. "Current password is incorrect" (400)
}
```

### Forgot and reset password (logged out)

Exclude these two endpoints from any global "401 → login" redirect, like `/login`.

```js
// Step 1: "Forgot password?" form
async function requestCode(email) {
  const { data } = await api.post("/admin/auth/forgot-password", { email });
  toast.info(data.message); // generic message, shown even if the email isn't an admin
  navigate("/admin/reset-password", { state: { email } });
}

// Step 2: "Enter code + new password" form
async function resetPassword(otp, newPassword) {
  try {
    const { data } = await api.post("/admin/auth/reset-password", {
      otp: otp.trim(), // keep it a string so "048213" keeps its leading zero
      newPassword,
    });
    toast.success(data.message);
    navigate("/admin/login");
  } catch (error) {
    if (error.response?.status === 429) toast.error("Too many attempts. Please wait a few minutes and try again.");
    else setFormError(errorMessage(error)); // e.g. "Invalid or expired OTP"
  }
}
```

UI tips:

- Use `<input inputMode="numeric" autoComplete="one-time-code" maxLength={6}>` for the code (not `type="number"`, which drops leading zeros).
- Offer a "Resend code" button that's disabled for 60 seconds after each send.
- On `Invalid or expired OTP`, offer "Request a new code".

### Public: bike listing with search and filters

```js
// filters comes from your filter sidebar / search box
const { data } = await api.get("/bikes", {
  params: {
    page,
    limit: 12,
    search: filters.search || undefined,
    brand: filters.brandIds.length ? filters.brandIds.join(",") : undefined, // checkboxes
    type: filters.type || undefined,
    minPrice: filters.minPrice ?? undefined,
    maxPrice: filters.maxPrice ?? undefined,
    minTopSpeed: filters.minTopSpeed ?? undefined,
    minRange: filters.minRange ?? undefined,
  },
});
// data.bikes, data.pagination

// Format bike prices on the frontend
const formatPKR = (n) => `PKR ${n.toLocaleString("en-US")}`; // 195000 -> "PKR 195,000"
```

Tips:

- Debounce the search box (about 300 ms) so you don't send a request on every keystroke.
- Reset `page` to `1` whenever a filter changes.
- Make sure a minimum is never greater than its maximum, or the API returns `400`.

### Public: other pages

```js
// Bike detail page: /bikes/:slug
const { data: { bike } } = await api.get(`/bikes/${slug}`);

// Brands (filter checkboxes, brands page)
const { data: { brands } } = await api.get("/brands");

// In-stock accessories
const { data: { accessories, pagination } } = await api.get("/accessories", { params: { inStock: true, page } });

// Spare parts listing and detail page
const { data: { spareParts } } = await api.get("/spare-parts", { params: { page } });
const { data: { sparePart } } = await api.get(`/spare-parts/${slug}`);
```

### Admin: create and update a bike

```js
const fd = new FormData();
fd.append("image", fileInput.files[0]);
fd.append("name", "Crown Electric Spark");
fd.append("brand", brandId);
fd.append("type", "bike");
fd.append("price", "195000");
fd.append("rating", "4.5");
fd.append("specs", JSON.stringify({
  range: "70 km",
  topSpeed: "65 km/h",
  battery: "72V 30Ah",
  chargingTime: "4.5 hrs",
  motorPower: "3000W",
  weight: "115 kg",
  warranty: "2 Years",
})); // all seven are required

// Don't set Content-Type; the browser sets the multipart boundary
const { data: { bike } } = await api.post("/bikes", fd);

// Update without a new image: JSON
await api.patch(`/bikes/${bike._id}`, { price: 199000, specs: { weight: "120 kg" } });

// Update with a new image: FormData
const update = new FormData();
update.append("image", newFile);
await api.patch(`/bikes/${bike._id}`, update);
```

### Admin: brands, accessories and spare parts

```js
// Brand: note the file field is "logo", not "image"
const brandForm = new FormData();
brandForm.append("logo", logoFile);
brandForm.append("displayName", "Okla");
brandForm.append("origin", "Pakistani");
const { data: { brand } } = await api.post("/brands", brandForm);

// Accessory (spare parts are identical, at /spare-parts)
const accessoryForm = new FormData();
accessoryForm.append("image", file);
accessoryForm.append("name", "Charger");
accessoryForm.append("price", "1200");
["Fast charging support", "Overcharge protection"].forEach((f) => accessoryForm.append("features", f));
const { data: { accessory } } = await api.post("/accessories", accessoryForm);

// Deleting a brand that still has bikes returns 409
try {
  await api.delete(`/brands/${brand._id}`);
} catch (error) {
  if (error.response?.status === 409) toast.error(errorMessage(error)); // "Cannot delete brand: 3 bike(s) still belong to it"
}
```

### Public: contact form

```js
const CONTACT_REASONS = ["Product Inquiry", "Business Inquiry", "Support", "General Inquiry"];

async function submitContact(form) {
  try {
    const { data } = await api.post("/contact-submissions", form);
    toast.success(data.message);
    resetForm();
  } catch (error) {
    if (error.response?.status === 429) toast.error("You've sent several messages already. Please try again later.");
    else setFormError(errorMessage(error));
  }
}
```

### Admin: contact inbox

```js
const { data: { submissions, pagination } } = await api.get("/contact-submissions", {
  params: { page, status: statusFilter || undefined, reason: reasonFilter || undefined },
});

await api.patch(`/contact-submissions/${submission._id}/status`, { status: "answered" });
await api.delete(`/contact-submissions/${submission._id}`);
```

### Public: test ride form

```js
// Brand dropdown, then a bike dropdown filtered by the chosen brand
const { data: { brands } } = await api.get("/brands");
const { data: { bikes } } = await api.get("/bikes", { params: { brand: brandId, limit: 100 } });

async function requestTestRide(form) {
  try {
    const { data } = await api.post("/test-ride-requests", form);
    toast.success(data.message);
    resetForm();
  } catch (error) {
    if (error.response?.status === 429) toast.error("You've sent several requests already. Please try again later.");
    else setFormError(errorMessage(error));
  }
}
```

`<input type="date" min={today}>` and `<input type="time">` already produce the `YYYY-MM-DD` and `HH:mm` values the API expects.

### Admin: test ride requests

```js
const { data: { testRideRequests, pagination } } = await api.get("/test-ride-requests", {
  params: { page, status: statusFilter || undefined },
});

await api.patch(`/test-ride-requests/${request._id}/accept`);
await api.patch(`/test-ride-requests/${request._id}/reject`, { rejectionReason });

const date = request.preferredDate.slice(0, 10); // "2026-10-10", no timezone shift
const whatsAppUrl = `https://wa.me/${request.requesterWhatsApp.replace(/^\+/, "")}`;
```

Only show Accept and Reject while `status === "pending"`. A `409` means the request was already reviewed; refresh the list.

### Public: checkout

```js
async function placeOrder({ bikeId, quantity, shippingAddress }) {
  try {
    const { data } = await api.post("/orders", { bike: bikeId, quantity, shippingAddress });
    showConfirmation(data.message, data.order); // e.g. show data.order.totalAmount and data.order._id
  } catch (error) {
    if (error.response?.status === 429) toast.error("You've placed several orders already. Please try again in an hour.");
    else setFormError(errorMessage(error));
  }
}
```

### Admin: orders

```jsx
const { data: { orders, pagination } } = await api.get("/orders", {
  params: { page, status: statusFilter || undefined },
});

// One button per allowed next status
order.nextStatuses.map((status) => (
  <button key={status} onClick={() => api.patch(`/orders/${order._id}/status`, { status })}>
    {status}
  </button>
));
```

### Showing errors

All errors share `{ message }`. Show it directly in a toast or above the form:

```js
try {
  await api.post("/bikes", fd);
} catch (error) {
  setFormError(errorMessage(error)); // e.g. "Name is required, Range is required"
}
```

### Client-side checks that save a round trip

| Check | Rule |
|---|---|
| Image type | `["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"].includes(file.type)` |
| Image size | `file.size <= 5 * 1024 * 1024` |
| Required: brand | `displayName`, `logo` |
| Required: bike | `name`, `brand`, `type`, `price`, `image`, and all seven specs |
| Required: accessory / spare part | `name`, `price`, `image` |
| Required: test ride | Every field |
| Required: order | `bike`, `quantity`, every `shippingAddress` field |
| Rating | `0 <= rating <= 5` |
| Slug | `/^[a-z0-9]+(?:-[a-z0-9]+)*$/` |
| Phone / WhatsApp | `/^\+?\d{8,15}$/.test(value.replace(/[\s()-]/g, ""))` |
| Preferred time | `/^([01]\d\|2[0-3]):[0-5]\d$/` |
| Order quantity | `Number.isInteger(quantity) && quantity >= 1 && quantity <= 10` |
| Postal code | `/^\d{5}$/` |
| Bike price / speed / range filters | Non-negative numbers, minimum ≤ maximum |

### Local development with Vite

The default setup (frontend on `http://localhost:5173`, API on `http://localhost:5000`) works out of the box: CORS allows `CLIENT_URL` and the cookie is sent because both are on `localhost`. If a frontend runs on another port, add it to `CLIENT_URL` (e.g. `CLIENT_URL=http://localhost:5173,http://localhost:5174`).

Or proxy the API through Vite so everything is same-origin:

```js
// vite.config.js
export default {
  server: {
    proxy: { "/api": "http://localhost:5000" },
  },
};
// then use baseURL: "/api"
```

---

## 14. Running and deploying

### Requirements

- Node.js 22 or newer (24 recommended)
- A MongoDB database (e.g. MongoDB Atlas)
- A Cloudinary account
- A Gmail account with 2-Step Verification, for sending emails

### Setup

```bash
npm install
cp .env.example .env    # then fill in the values
npm run seed:admin      # creates the admin from ADMIN_* in .env
npm run dev             # starts on http://localhost:5000 and restarts on file changes
```

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Port to listen on. Default `5000`. |
| `NODE_ENV` | No | `development` or `production`. In production the auth cookie is HTTPS-only and 500 errors hide details. |
| `CLIENT_URL` | No | Frontend origins allowed by CORS, **comma-separated**. Default `http://localhost:5173`. Example: `https://evinn.pk,https://www.evinn.pk,https://admin.evinn.pk`. Each must match exactly (scheme, host and port); `www` and non-`www` are different origins. Spaces and trailing slashes are ignored. |
| `TRUST_PROXY` | No | Number of reverse proxies in front of the server. Default `0`. **Set it to `1` in production behind nginx or Caddy** (the Docker setup only listens on `127.0.0.1`, so a proxy is expected), or `2` if Cloudflare is in front of that proxy. Without it, every visitor appears to have the proxy's IP and rate limits are shared by all customers. Don't set it when nothing sits in front of the server, or clients could fake their IP. |
| `MONGODB_URI` | **Yes** | MongoDB connection string. |
| `DNS_SERVERS` | No | e.g. `8.8.8.8,1.1.1.1`. Set this if a `mongodb+srv://` URI fails with `querySrv ECONNREFUSED`. |
| `JWT_SECRET` | **Yes** | Long random string used to sign tokens and hash reset codes. Generate: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`. Changing it logs every admin out. |
| `CLOUDINARY_CLOUD_NAME` | **Yes** | From the Cloudinary console. |
| `CLOUDINARY_API_KEY` | **Yes** | From the Cloudinary console. |
| `CLOUDINARY_API_SECRET` | **Yes** | From the Cloudinary console. |
| `GMAIL_USER` | **Yes** | Gmail address that sends emails, e.g. `evinn.shop@gmail.com`. |
| `GMAIL_APP_PASSWORD` | **Yes** | 16-character Gmail **App Password** (not the normal password). Spaces are ignored. See below. |
| `MAIL_FROM_NAME` | No | Sender name shown in inboxes. Default `Evinn`. |
| `ADMIN_FULL_NAME` | Seed only | Name for the seeded admin. |
| `ADMIN_EMAIL` | Seed only | Email for the seeded admin. |
| `ADMIN_PASSWORD` | Seed only | Password for the seeded admin (min 8 chars). Can be removed after seeding. |

If a required variable is missing, the server prints `Missing required environment variables: ...` and exits.

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start with auto-restart on file changes. |
| `npm start` | Start normally. |
| `npm run seed:admin` | Create the admin account from `ADMIN_*`. Safe to run again (skips if the email exists). |
| `npm run backfill:bike-specs` | Fill `topSpeedKmh` / `rangeKm` for bikes saved before those fields existed. Prints each bike and the numbers found (`NOT A NUMBER` when a spec has none, so you can fix its text). Doesn't change `updatedAt`; safe to run again. Not needed on an empty database or for bikes created or edited through the API. |

### Gmail setup

Gmail doesn't accept the account's normal password from apps, so the server uses an App Password:

1. Sign in to the Gmail account that will send emails.
2. Turn on **2-Step Verification**: Google Account → Security.
3. Open <https://myaccount.google.com/apppasswords>, create an app password (e.g. `Evinn server`) and copy the 16-character code.
4. Put the address in `GMAIL_USER` and the code in `GMAIL_APP_PASSWORD`, then restart the server.

On startup the server logs `Mailer connected: <address>` if the login works, or `Mailer check failed: ...` with the reason. Sending happens in the background, so a failed email never shows up in an API response; check the server logs.

Limits and gotchas:

- A personal Gmail account can send roughly 500 emails a day.
- Some hosts block outgoing email ports (SMTP 465/587), often on free plans. If emails work locally but not after deploying, check your host's SMTP policy.
- Changing the Gmail account's password revokes its App Passwords; create a new one afterwards.

### Docker

```bash
docker compose up -d --build                                  # build and start on 127.0.0.1:5000
docker compose logs -f api                                    # follow logs
docker compose exec api node scripts/seed-admin.js            # seed the admin inside the container
docker compose exec api node scripts/backfill-bike-specs.js   # backfill bike spec numbers inside the container
docker compose down                                           # stop
```

Settings are read from `.env`; it isn't copied into the image. The container restarts automatically and has a health check on `GET /api/health`.

### Production checklist

- [ ] `NODE_ENV=production` (secure cookie, hidden error details).
- [ ] Served over **HTTPS** (the cookie is `Secure` in production, so login won't work over plain HTTP).
- [ ] `CLIENT_URL` lists every frontend origin (website, admin panel, `www` variant).
- [ ] `TRUST_PROXY=1` when running behind nginx / Caddy (2 with Cloudflare in front).
- [ ] A long, random `JWT_SECRET`.
- [ ] Frontend and API on the same site (e.g. `evinn.pk` and `api.evinn.pk`) so the cookie is sent. See [Cross-domain deployment](#cross-domain-deployment).
- [ ] Startup logs show `MongoDB connected`, `Cloudinary connected` and `Mailer connected`.
- [ ] An admin account exists (`npm run seed:admin`).
- [ ] If bikes existed before the top speed / range filters were added, run `npm run backfill:bike-specs` once.

### Troubleshooting

| Symptom | Likely cause |
|---|---|
| `Missing required environment variables: ...` on start | `.env` is missing a required value. |
| `querySrv ECONNREFUSED` when connecting to MongoDB | DNS problem with `mongodb+srv://`; set `DNS_SERVERS=8.8.8.8,1.1.1.1`. |
| Browser shows a CORS error | The frontend's origin isn't in `CLIENT_URL` exactly (check `www`, `http`/`https`, port). |
| Login succeeds but the next request is `401 Access token is missing` | Request sent without credentials, frontend and API on different sites, or HTTP used in production. |
| Every customer hits `429` quickly | `TRUST_PROXY` isn't set behind a reverse proxy. |
| No notification emails | Check the logs for `Mailer check failed` or `Failed to send ...`; verify the App Password and the host's SMTP policy. |
| Bike missing from top speed / range filters | Its spec text has no number, or it was saved before the filters existed (run the backfill). |

For the full file layout, see [Project structure](#project-structure).
