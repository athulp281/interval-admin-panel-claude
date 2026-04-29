# Auth API — Frontend Integration Guide

This is the **as-built** contract for the auth surface served by `apps/hr-api`.
It supersedes the design-time `auth-api.md` at the repo root for anything the
frontend needs at runtime — endpoint URLs, request shapes, response shapes,
status codes, error codes, cookie behaviour, and edge cases.

**Base URL (dev):** `http://localhost:3000`
**Base URL (prod / proxied):** whatever your `VITE_API_BASE_URL` resolves to.
All paths below are relative to that base.

---

## 1. Conventions

### 1.1 Session envelope (every successful response)

Every 2xx response wraps its payload in:

```json
{
  "data": { "...endpoint-specific..." },
  "session": {
    "status": "active" | "expired" | "anonymous",
    "expiresAt": "2026-04-29T11:23:59.346Z" | null
  }
}
```

- `active` — request was authenticated; cookie is still valid.
- `expired` — cookie was sent but is no longer valid (TTL passed, revoked, or
  user deactivated). The server also clears the cookie via `Set-Cookie:
  interval_session=; Max-Age=0`. The SPA should hard-redirect to `/auth/login`.
- `anonymous` — request had no session cookie. Normal for public endpoints.

`expiresAt` is an ISO-8601 string when `status === "active"`, otherwise `null`.

### 1.2 Error envelope (every non-2xx response)

```json
{
  "code": "invalid_credentials",
  "message": "Email or password is incorrect",
  "fieldErrors": { "email": "..." }
}
```

- `code` — stable, machine-readable identifier (table in §4).
- `message` — human-readable, safe to surface inline.
- `fieldErrors` — present on validation failures; keys are the form field
  names. Render alongside the matching input.

Errors do **not** carry the session envelope. Use the HTTP status to branch.

### 1.3 Session cookie

| Attribute | Value |
|---|---|
| Name | `interval_session` |
| Type | Opaque random hex (server-side stores SHA-256 hash) |
| Flags | `HttpOnly; SameSite=Lax; Path=/` (`Secure` in production) |
| Default lifetime | 30 minutes (sliding refresh on activity) |
| Remember-me lifetime | 7 days (fixed; no slide) |

The frontend never reads or writes this cookie. `fetch` calls **must** use
`credentials: "include"`:

```ts
await fetch(`${baseUrl}/auth/login`, {
  method: 'POST',
  credentials: 'include',     // <-- required
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});
```

### 1.4 Multi-tenant headers

- **Login / 2FA / forgot-password / me / logout** — no tenant header needed;
  tenant is resolved from the user record (or the session cookie).
- **Register** — accepts an optional `x-tenant-slug: <slug>` header. When
  omitted, the server uses the tenant set by `DEFAULT_TENANT_SLUG`
  (currently `interval`).

### 1.5 Status code legend

| Code | When |
|---|---|
| 200 | Success (incl. `/auth/me` even when logged out) |
| 201 | Resource created (registration) |
| 400 | Bad request — validation failure or wrong 2FA code |
| 401 | Authentication failed (login) or required (protected route, no cookie) |
| 403 | Account inactive |
| 409 | Conflict (email already registered) |
| 410 | Challenge expired or already consumed |
| 429 | Rate-limited (too many attempts / resends) |

---

## 2. Endpoints

### 2.1 `POST /auth/register`

Creates a new user. Does **not** sign them in.

**Request**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Min8Chars1Upper1Lower1Digit",
  "acceptedTerms": true
}
```

Password policy enforced server-side: ≥8 chars, ≥1 uppercase, ≥1 lowercase,
≥1 digit. `acceptedTerms` must be `true`.

**Headers (optional)**
- `x-tenant-slug` — bind the new user to a non-default tenant.

**Response — 201**
```json
{
  "data": {
    "user": {
      "id": "u_2a29fbeb-...",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "emailVerified": false,
      "createdAt": "2026-04-29T10:53:42.791Z"
    }
  },
  "session": { "status": "anonymous", "expiresAt": null }
}
```

A verification email is sent (best-effort in Phase A — adapter is stubbed).

**Errors**
- `400 invalid_request` — Zod validation failure (`fieldErrors` populated).
- `400 invalid_email` — malformed email (`fieldErrors.email` populated).
- `400 weak_password` — fails policy (`fieldErrors.password` populated).
- `400 terms_not_accepted` — `acceptedTerms !== true`.
- `409 email_taken` — email already registered (`fieldErrors.email`).

---

### 2.2 `POST /auth/login`

Initiates sign-in. Always triggers an **email 2FA challenge**; no session
cookie is issued at this step.

**Request**
```json
{
  "email": "jane@example.com",
  "password": "Min8Chars1Upper1Lower1Digit",
  "rememberMe": true
}
```

`rememberMe` is optional, defaults to `false`. The choice is captured against
the challenge record so 2FA verify issues the right cookie lifetime.

**Response — 200**
```json
{
  "data": {
    "kind": "twoFactorRequired",
    "challengeId": "106d52d6ee8a884a90be2df19f0b09598b360676658a9ef1"
  },
  "session": { "status": "anonymous", "expiresAt": null }
}
```

Hold the `challengeId` in component state and POST it to `/auth/2fa/verify`
along with the 6-digit code the user pasted from email. The challenge has a
5-minute TTL.

**Errors**
- `400 invalid_email` — malformed email.
- `401 invalid_credentials` — wrong email **or** wrong password (the server
  intentionally does not distinguish, to avoid account enumeration).
- `403 account_inactive` — user is deactivated.
- `429 too_many_attempts` — repeated failures triggered the lockout window
  (15 minutes after 10 consecutive failures).

---

### 2.3 `POST /auth/2fa/verify`

Completes sign-in. **Issues the `interval_session` cookie on success.**

**Request**
```json
{
  "challengeId": "106d52d6ee8a884a90be2df19f0b09598b360676658a9ef1",
  "code": "035524"
}
```

**Response — 200** (also `Set-Cookie: interval_session=...`)
```json
{
  "data": {
    "user": {
      "id": "u_2a29fbeb-...",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "emailVerified": true,
      "createdAt": "2026-04-29T10:53:42.791Z"
    }
  },
  "session": {
    "status": "active",
    "expiresAt": "2026-04-29T11:23:59.346Z"
  }
}
```

**Errors**
- `400 invalid_code` — wrong 6-digit code (`fieldErrors.code`). The challenge
  remains usable until the attempt counter hits 5; then it's invalidated.
- `410 challenge_expired` — TTL passed, attempt limit reached, or the
  challenge was already consumed. SPA should redirect back to `/auth/login`.

---

### 2.4 `POST /auth/2fa/resend`

Issues a fresh 6-digit code for an existing challenge. Resets the attempt
counter and extends the challenge TTL by 5 minutes.

**Request**
```json
{ "challengeId": "106d52d6ee8a884a90be2df19f0b09598b360676658a9ef1" }
```

**Response — 200**
```json
{
  "data": { "ok": true },
  "session": { "status": "anonymous", "expiresAt": null }
}
```

**Errors**
- `410 challenge_expired` — the challenge no longer exists or has expired.
- `429 too_many_resends` — max 3 resends per challenge.

---

### 2.5 `POST /auth/forgot-password`

Triggers a password-reset email if the address is on file. **Always returns
200**, regardless of whether the email exists, to prevent enumeration.

**Request**
```json
{ "email": "jane@example.com" }
```

**Response — 200**
```json
{
  "data": { "ok": true },
  "session": { "status": "anonymous", "expiresAt": null }
}
```

The reset link is delivered as
`${APP_URL}/auth/reset-password?token=<token>` (single-use, 15-minute TTL).
The reset endpoint is not yet wired in Phase A — link the SPA's reset page,
but expect the verification call to land in a later round.

---

### 2.6 `GET /auth/me`

Status probe. Used on app boot to hydrate the auth context from the cookie.
**Never returns 401** — treat it as a status read, not an authorization gate.

**Request** — no body. Cookie sent automatically by the browser when the
fetch uses `credentials: "include"`.

**Response — 200 (signed in)**
```json
{
  "data": {
    "user": {
      "id": "u_2a29fbeb-...",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "emailVerified": true,
      "createdAt": "2026-04-29T10:53:42.791Z"
    }
  },
  "session": {
    "status": "active",
    "expiresAt": "2026-04-29T11:23:59.346Z"
  }
}
```

**Response — 200 (anonymous or expired)**
```json
{
  "data": { "user": null },
  "session": { "status": "anonymous", "expiresAt": null }
}
```

If the cookie was present but invalid, `session.status` is `"expired"` and
the server includes a clearing `Set-Cookie` so the next request is plainly
anonymous.

---

### 2.7 `POST /auth/logout`

Revokes the current session and clears the cookie.

**Response — 200** (also `Set-Cookie: interval_session=; Max-Age=0`)
```json
{
  "data": { "ok": true },
  "session": { "status": "anonymous", "expiresAt": null }
}
```

Calling `/logout` without a cookie is still 200 — it's idempotent.

---

## 3. The `User` shape

Every response that returns a user uses this shape:

```ts
interface User {
  id: string;                  // UUID
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;           // ISO-8601
}
```

`emailVerified` flips to `true` automatically on first successful 2FA verify
(the code was, by definition, delivered to that inbox).

---

## 4. Error code reference

| Code | HTTP | Meaning | Where |
|---|---|---|---|
| `invalid_request` | 400 | Generic Zod validation failure | All endpoints |
| `invalid_email` | 400 | Email is malformed | login, register, forgot-password |
| `weak_password` | 400 | Password fails policy | register |
| `terms_not_accepted` | 400 | `acceptedTerms !== true` | register |
| `invalid_code` | 400 | Wrong 2FA code | 2fa/verify |
| `invalid_credentials` | 401 | Wrong email or password | login |
| `unauthenticated` | 401 | Protected route, no/expired cookie | (any protected route) |
| `account_inactive` | 403 | User is deactivated | login, 2fa/verify |
| `email_taken` | 409 | Email already registered | register |
| `challenge_expired` | 410 | 2FA challenge gone | 2fa/verify, 2fa/resend |
| `tenant_unknown` | 400 | `x-tenant-slug` doesn't resolve | register |
| `too_many_attempts` | 429 | Login lockout active | login |
| `too_many_resends` | 429 | >3 resends on a challenge | 2fa/resend |

`fieldErrors` is populated whenever a field can be highlighted directly
(register validation, `invalid_code`, `email_taken`).

---

## 5. Frontend integration recipe

### 5.1 The fetch wrapper

```ts
// src/modules/auth/api/client.ts
const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export interface Envelope<T> {
  data: T;
  session: {
    status: 'active' | 'expired' | 'anonymous';
    expiresAt: string | null;
  };
}

export interface ApiError {
  code: string;
  message: string;
  fieldErrors?: Record<string, string>;
}

export async function api<T>(
  path: string,
  init: RequestInit = {},
): Promise<Envelope<T>> {
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw Object.assign(new Error(body?.message ?? res.statusText), {
      status: res.status,
      code: body?.code ?? 'unknown',
      fieldErrors: body?.fieldErrors,
    } satisfies Partial<ApiError> & { status: number });
  }

  // Auto-redirect on session expiry — every response carries the envelope.
  if (body?.session?.status === 'expired') {
    window.location.assign('/auth/login');
  }

  return body as Envelope<T>;
}
```

### 5.2 The auth module API

```ts
// src/modules/auth/api/authApi.ts
import { api, type Envelope } from './client';

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
}

export type LoginResult =
  | { kind: 'twoFactorRequired'; challengeId: string }
  | { kind: 'loggedIn'; user: User };

export const authApi = {
  register: (input: {
    name: string;
    email: string;
    password: string;
    acceptedTerms: true;
  }) => api<{ user: User }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  }),

  login: (input: { email: string; password: string; rememberMe?: boolean }) =>
    api<LoginResult>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  verifyTwoFactor: (input: { challengeId: string; code: string }) =>
    api<{ user: User }>('/auth/2fa/verify', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  resendTwoFactor: (challengeId: string) =>
    api<{ ok: true }>('/auth/2fa/resend', {
      method: 'POST',
      body: JSON.stringify({ challengeId }),
    }),

  forgotPassword: (email: string) =>
    api<{ ok: true }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  me: () => api<{ user: User | null }>('/auth/me'),

  logout: () => api<{ ok: true }>('/auth/logout', { method: 'POST' }),
};
```

### 5.3 Error handling pattern

```ts
try {
  const res = await authApi.login({ email, password });
  if (res.data.kind === 'twoFactorRequired') {
    navigate(`/auth/two-factor?challenge=${res.data.challengeId}`);
  }
} catch (err) {
  switch (err.code) {
    case 'invalid_credentials':
      setFormError('Email or password is incorrect');
      break;
    case 'too_many_attempts':
      setFormError('Too many tries. Wait 15 minutes.');
      break;
    case 'invalid_request':
      // err.fieldErrors → setError(field, message) for each
      Object.entries(err.fieldErrors ?? {}).forEach(([field, msg]) =>
        setError(field as never, { message: msg }),
      );
      break;
    default:
      setFormError(err.message);
  }
}
```

---

## 6. End-to-end flow (verified live)

```bash
# 1. Seed the tenant (one-time)
curl -X POST http://localhost:3000/tenants \
  -H 'Content-Type: application/json' \
  -d @apps/hr-api/templates/tenant-interval.json
# → { "data": { "id": "...", "slug": "interval" }, "session": { "status": "anonymous", ... } }

# 2. Register
curl -X POST http://localhost:3000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Demo User","email":"demo@interval.com","password":"Demo@1234","acceptedTerms":true}'
# → 201 with { "data": { "user": { ... } }, ... }

# 3. Login → 2FA challenge
curl -X POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"demo@interval.com","password":"Demo@1234","rememberMe":false}'
# → { "data": { "kind": "twoFactorRequired", "challengeId": "<token>" }, ... }
# In dev, the 6-digit code is logged by the API (search for `[2FA] code for ...`).

# 4. Verify (sets the cookie)
curl -i -c cookies.txt -X POST http://localhost:3000/auth/2fa/verify \
  -H 'Content-Type: application/json' \
  -d '{"challengeId":"<token>","code":"035524"}'
# → 200 + Set-Cookie: interval_session=...; HttpOnly; SameSite=Lax

# 5. /me with the cookie
curl -b cookies.txt http://localhost:3000/auth/me
# → { "data": { "user": { ... } }, "session": { "status": "active", ... } }

# 6. Logout
curl -b cookies.txt -X POST http://localhost:3000/auth/logout
# → 200 + Set-Cookie: interval_session=; Max-Age=0
```

---

## 7. Operational notes

- **Dev 2FA codes** are printed to the API log (Pino) at INFO level, e.g.
  `[2FA] code for demo@interval.com: 035524`. In production this line is
  suppressed and the code is delivered only via the email adapter.
- **CORS**: when the SPA runs on a different origin than the API in dev,
  configure CORS to allow the SPA origin and `credentials: true`. The Vite
  dev server can also proxy `/api/*` to `http://localhost:3000` to avoid
  CORS entirely.
- **`/auth/me` on boot**: call it once at app startup, populate the auth
  context, and gate routes on the result. The endpoint is cheap (single
  indexed lookup) and never throws 401.
- **Session expiry detection**: every response carries `session.status`. The
  fetch wrapper above hard-redirects to `/auth/login` on `expired` — that is
  the only built-in behaviour. No polling required.
