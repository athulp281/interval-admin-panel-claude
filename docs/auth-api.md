# Auth API — Backend Handoff (design-time)

> **As-built reference**: `AUTH-API.md` (sibling file in the repo root /
> backend handoff bundle) is the authoritative runtime contract — endpoint
> URLs, response shapes, and error codes match it exactly. This file is the
> design-time spec that informed the implementation; both documents agree on
> the wire format. When they conflict, `AUTH-API.md` wins.

This document specifies the HTTP contract the frontend `src/modules/auth` module
expects. The frontend ships a **mock implementation** at
`src/modules/auth/api/authApi.ts` and a **real axios implementation** at
`src/modules/auth/api/authApi.real.ts`; the toggle is automatic — set
`VITE_API_BASE_URL` to use the real backend, leave it unset for the mock.

---

## Conventions

### Base URL
`/api/v1` (or whichever prefix is decided — surface as `VITE_API_BASE_URL`).

### Authentication
- Session-based, transported via an **HTTP-only, Secure cookie** named
  `interval_session`.
- Cookie attributes: `HttpOnly; Secure; SameSite=Lax; Path=/`.
- Cookie lifetime:
  - Default sign-in: 30 minutes (sliding refresh on activity).
  - "Remember me" sign-in: 7 days.
- The frontend never reads or sets the cookie directly; the server is the sole
  authority. The frontend only inspects the **session envelope** (below) on
  every response.

### Session envelope (every authenticated response)
Every response (success or 4xx) from a logged-in scope MUST include a
`session` object so the SPA can react instantly when a session expires
without polling a separate `/me` endpoint:

```json
{
  "data": { ... endpoint-specific payload ... },
  "session": {
    "status": "active" | "expired" | "anonymous",
    "expiresAt": "2026-04-29T13:45:12.000Z" | null
  }
}
```

- `active` — request was authenticated; cookie is still valid.
- `expired` — cookie was present but no longer valid (TTL passed, revoked,
  rotated). The server SHOULD also clear the cookie via `Set-Cookie:
  interval_session=; Max-Age=0`. The frontend will hard-redirect to
  `/auth/login`.
- `anonymous` — request had no session cookie (typical for public endpoints
  like login/register). No action.

Public endpoints (login, register, forgot-password) MAY return
`session.status = "anonymous"` for symmetry. They MUST flip to `"active"` after
a successful sign-in / 2FA verification when issuing the cookie.

### Error format
All non-2xx responses use:

```json
{
  "code": "invalid_credentials",
  "message": "Email or password is incorrect",
  "fieldErrors": { "email": "..." }
}
```

`fieldErrors` is optional — when present, the frontend displays them inline.

---

## Endpoints

### `POST /auth/login`

Initiates sign-in and triggers the **email 2FA challenge**. No session cookie
is issued at this step.

**Request**
```json
{
  "email": "user@example.com",
  "password": "Plaintext-Over-TLS",
  "rememberMe": true
}
```

**Response — 200 (2FA required)**
```json
{
  "data": {
    "kind": "twoFactorRequired",
    "challengeId": "ch_8a7d6b5c"
  },
  "session": { "status": "anonymous", "expiresAt": null }
}
```

> The server should email a 6-digit code to the user's verified email. The
> `challengeId` is an opaque short-lived token (5-minute TTL recommended)
> that the client passes back to `/auth/2fa/verify`.

**Response — 200 (2FA disabled, optional path)**
```json
{
  "data": { "kind": "loggedIn", "user": { ...User } },
  "session": { "status": "active", "expiresAt": "..." }
}
```
> Issue the `interval_session` cookie. `rememberMe: true` → 7-day cookie.

**Errors**
- `400 invalid_email` — malformed email.
- `401 invalid_credentials` — generic; do **not** distinguish between
  "user not found" and "wrong password" (avoid account enumeration).
- `429 too_many_attempts` — rate-limited.

---

### `POST /auth/2fa/verify`

Completes sign-in by verifying the emailed code. **Issues the session cookie
on success.**

**Request**
```json
{ "challengeId": "ch_8a7d6b5c", "code": "123456" }
```

**Response — 200**
```json
{
  "data": {
    "user": {
      "id": "u_...",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "emailVerified": true,
      "createdAt": "2026-04-29T12:00:00.000Z"
    }
  },
  "session": { "status": "active", "expiresAt": "..." }
}
```

`Set-Cookie: interval_session=...; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=...`

The `Max-Age` reflects the `rememberMe` flag captured during `/auth/login`
(server-side state on the challenge record).

**Errors**
- `400 invalid_code` — wrong code (consider counting attempts; lock the
  challenge after 5 failures).
- `410 challenge_expired` — TTL passed or already consumed. Frontend redirects
  back to `/auth/login`.

---

### `POST /auth/2fa/resend`

Issues a fresh code for an existing challenge (extends the challenge TTL).

**Request**
```json
{ "challengeId": "ch_8a7d6b5c" }
```

**Response — 200**
```json
{ "data": { "ok": true }, "session": { "status": "anonymous", "expiresAt": null } }
```

**Errors**
- `410 challenge_expired`
- `429 too_many_resends` (recommend max 3 resends per challenge).

---

### `POST /auth/register`

**Request**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Min8Chars1Upper1Lower1Digit",
  "acceptedTerms": true
}
```

Server-side password policy MUST mirror the frontend zod schema in
`src/modules/auth/schemas/register.schema.ts` (≥8 chars, 1 upper, 1 lower,
1 digit). Reject anything weaker.

**Response — 201**
```json
{
  "data": { "user": { ...User, "emailVerified": false } },
  "session": { "status": "anonymous", "expiresAt": null }
}
```

> Registration does **not** auto-sign-in. Send a verification email; the user
> then signs in via `/auth/login` (which triggers the 2FA flow).
> `acceptedTerms` must be `true`; record the timestamp + ToS version against
> the user.

**Errors**
- `400 invalid_email` / `weak_password` (`fieldErrors` populated).
- `409 email_taken` with `fieldErrors.email = "Email is already registered"`.

---

### `POST /auth/forgot-password`

**Always returns 200**, regardless of whether the email exists, to prevent
account enumeration.

**Request**
```json
{ "email": "jane@example.com" }
```

**Response — 200**
```json
{ "data": { "ok": true }, "session": { "status": "anonymous", "expiresAt": null } }
```

If the email is on file, send a reset link of the form
`https://app.interval.com/auth/reset-password?token=...` with a single-use,
short-lived (15 min) token.

---

### `POST /auth/reset-password` *(future — UI not yet wired)*

```json
{ "token": "...", "password": "NewMin8Chars..." }
```

---

### `GET /auth/me`

Used on app boot to hydrate `AuthContext` from the cookie.

**Response — 200**
```json
{
  "data": { "user": { ...User } | null },
  "session": { "status": "active" | "expired" | "anonymous", "expiresAt": "..." }
}
```

When the cookie is missing or invalid, return `data.user = null` with the
appropriate `session.status`. **Do not return 401** — the frontend treats this
endpoint as a status probe.

---

### `POST /auth/logout`

**Response — 200**
```json
{ "data": { "ok": true }, "session": { "status": "anonymous", "expiresAt": null } }
```
`Set-Cookie: interval_session=; Max-Age=0; Path=/`

---

## Other (non-auth) endpoints

Every authenticated endpoint across the app MUST wrap its payload in the same
session envelope. Example for a hypothetical `GET /api/v1/dashboard/stats`:

```json
{
  "data": { "totalUsers": 1234, "...": "..." },
  "session": { "status": "active", "expiresAt": "..." }
}
```

When the cookie is invalid:
- Return **HTTP 200** with `session.status = "expired"` and `data: null` —
  this lets the frontend uniformly redirect to login on every response without
  a separate 401 branch.
- Alternatively, return **HTTP 401** with the same envelope; the frontend
  handles both. The 200+envelope path is preferred for consistency.

---

## Frontend client architecture (for reference)

The frontend uses **axios + Zustand** with a single response interceptor that
reads the session envelope on every reply and pushes `session.status` into
`useAuthStore`. Stores never read envelopes themselves — they only consume
unwrapped `data`. Concretely:

- `src/lib/axios.ts` — global `axiosClient` (`withCredentials: true`,
  `baseURL = VITE_API_BASE_URL`). The response interceptor:
  1. Detects the `{ data, session }` shape via duck-typing.
  2. Calls `onSessionEnvelope(env)` registered by the auth store.
  3. Returns the raw axios response so callers can pull `data.data`.
  Error responses are normalized to the `ApiError` shape and rejected.
- `src/lib/apiCall.ts` — `api.get/post/...` returns `T` directly (the
  unwrapped `data`).
- `src/stores/authStore.ts` — reacts to envelope events via
  `_onSessionEnvelope(status)`, flipping local user/status atomically.

**Practical implication for the backend:** as long as every authenticated
response includes the envelope, the SPA will detect a server-side session
expiration on the very next call without needing a separate `/me` poll. No
401 handling code paths are required on the client.

A `VITE_USE_MOCK_API` env flag toggles between the mock implementation and
real axios; the store is identical in both modes.

## Mock reference (current frontend behaviour)

The mock in `src/modules/auth/api/authApi.ts` simulates:
- **Seed user**: `demo@interval.com` / `Demo@1234`
- **2FA**: a 6-digit code is `console.info`'d so testers can copy it from
  DevTools instead of an inbox.
- **Cookie**: a non-HttpOnly cookie `interval_session` is set in the browser
  (the production server should make it HttpOnly).
- **Latency**: 350ms artificial delay per request.

Any deviation between the real API and this mock should be reflected in
`src/modules/auth/api/types.ts` and a follow-up commit to
`src/modules/auth/api/authApi.ts`. No other file in the module needs to
change.

---

## Security notes (for backend)

1. **Hash passwords** with argon2id (preferred) or bcrypt cost ≥ 12.
2. **Rate-limit** `/auth/login` (per IP + per email), `/auth/2fa/verify`
   (per challenge), and `/auth/forgot-password` (per email).
3. **Constant-time** comparison of password hashes and 2FA codes.
4. **Challenge cleanup**: invalidate challenges on password change, logout,
   or after 5 failed verification attempts.
5. **Session rotation**: rotate the cookie value on privilege change (e.g.
   password reset).
6. **CORS**: if the API is on a different origin, allow only the SPA origin
   and set `credentials: "include"` on the frontend fetch (already wired in
   the API client).
7. **CSRF**: with `SameSite=Lax` cookies, CSRF risk on safe methods is
   minimal; for unsafe methods called from non-GET forms, add a
   double-submit token (`X-CSRF-Token` header echoing a non-HttpOnly cookie).
