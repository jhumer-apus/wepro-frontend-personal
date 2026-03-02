# Light Server: API Config & Auth (Tokens on Server)

This doc explains how **API config** and **tokens** were moved to the light server so the frontend never sees or stores secrets.

---

## Is it possible? Yes.

- **Before:** Frontend had `config.api.baseUrl`, `config.api.apiKey`, and Redux held `accessToken` / `refreshToken`. Every request added `Authorization: Bearer <token>` and the frontend handled refresh on 401.
- **After:** The **light server** (Next.js API routes) holds backend URL and API key via env vars, and stores tokens in **httpOnly cookies**. The frontend only talks to same-origin `/api/*`; the server adds the token and calls the real backend. Tokens never go to the client.

---

## How it merges with `proxy.ts`

The light server has two roles that work together:

| Piece | Role |
|-------|------|
| **`/api/auth/login`** | Accepts `username`, `password`, `deviceToken`. Calls the main backend login, gets tokens, **stores them in httpOnly cookies**, returns `{ success, profile }` (no tokens). |
| **`/api/auth/logout`** | Clears the auth cookies. Frontend calls this then clears Redux and redirects to `/login`. |
| **`/api/proxy`** | Single route that forwards **any** API call to the main backend. Reads **token from the cookie** (not from the request body or header from the client), adds `Authorization: Bearer <token>`, and on **401** tries **refresh** using the refresh token from the cookie, updates cookies, and retries. |

So:

1. **Config (baseUrl, apiKey)**  
   Used only in API routes via `getBackendConfig()` from `src/lib/lightServerAuth.ts`, which reads `process.env.NEXT_PUBLIC_API_URL` / `API_URL` and `NEXT_PUBLIC_API_KEY` / `API_KEY`. The frontend config no longer needs to send the API key; the proxy uses it on the server if needed.

2. **Tokens**  
   - After login, only the light server sees the tokens; it puts them in **httpOnly** cookies.  
   - The browser sends those cookies automatically to `/api/proxy` (same origin, `withCredentials: true`).  
   - `proxy.ts` reads the cookie via `getAuthFromRequest(req.headers.cookie)`, attaches the access token to the backend request, and on 401 does refresh using the refresh token from the cookie and updates the cookies.  
   So token storage and refresh live entirely on the server and in cookies; the frontend never reads or sends tokens explicitly.

3. **Merge with proxy**  
   - **Login** does **not** go through the proxy: it goes to **`/api/auth/login`**, which talks to the backend and sets cookies.  
   - **All other API calls** go through **`/api/proxy`**: frontend sends `{ method, target_url, data }`, and the proxy uses the cookie to add auth and call the backend.  
   So the proxy is the single place that “forwards app API calls” and “attaches auth from the cookie and handles refresh.”

---

## Request flow (high level)

```
┌─────────────┐                    ┌─────────────────────┐                    ┌─────────────────┐
│   Browser   │                    │  Light server       │                    │  Main backend   │
│   (React)   │                    │  (Next.js API)      │                    │  (your API)     │
└──────┬──────┘                    └──────────┬──────────┘                    └────────┬────────┘
       │                                      │                                              │
       │  POST /api/auth/login                 │                                              │
       │  { username, password }               │  POST /v3/auth/login (form body)            │
       │──────────────────────────────────────>│─────────────────────────────────────────────>
       │                                      │  response: accessToken, refreshToken         │
       │                                      │<─────────────────────────────────────────────
       │  200 { success, profile }             │  Set-Cookie: access_token=…; HttpOnly       │
       │  Set-Cookie (httpOnly)                │  Set-Cookie: refresh_token=…; HttpOnly      │
       │<──────────────────────────────────────│                                              │
       │  (no tokens in JSON)                  │                                              │
       │                                      │                                              │
       │  POST /api/proxy                      │  Cookie: access_token=…                      │
       │  { method: 'GET', target_url: '...' }│  GET /v3/...  Authorization: Bearer <token>  │
       │  Cookie sent automatically           │─────────────────────────────────────────────>
       │──────────────────────────────────────>│  response                                    │
       │                                      │<─────────────────────────────────────────────
       │  200 + backend body                   │  (if 401: refresh with refresh_token,       │
       │<──────────────────────────────────────  set new cookies, retry request)             │
```

---

## Files involved

| File | Purpose |
|------|---------|
| `src/lib/lightServerAuth.ts` | Cookie read/write helpers, `getBackendConfig()`. Used only in API routes. |
| `src/pages/api/auth/login.ts` | Login: backend login → set cookies → return success + optional profile. |
| `src/pages/api/auth/logout.ts` | Logout: clear auth cookies. |
| `src/pages/api/proxy.ts` | Forward requests to backend using cookie for auth; on 401 refresh and retry. |
| `src/services/api.ts` | Frontend client: `withCredentials: true`, transform every call to POST /api/proxy envelope, no token in headers; `clearServerSession()` for logout. |
| `src/pages/login.tsx` | POST `/api/auth/login` with credentials; dispatch `login()` with no tokens; use profile from response or fallback GET profile via proxy. |
| `src/store/slices/authSlice.ts` | `login()` can be called with no payload (session in cookie). |

---

## Security notes

- **httpOnly cookies** are not readable by JavaScript, so XSS cannot steal the token.
- **Backend URL and API key** are only in env on the server, not in client bundles.
- **Refresh** happens on the server; the client only sees 200 or 401 and redirects to login on 401 after the proxy has already tried refresh.

---

## Optional: checking session on load

To know “is the user logged in?” on full page load (e.g. after refresh), you can add something like:

- **`GET /api/auth/me`**  
  Reads the cookie, calls the backend (e.g. profile), returns 200 + profile or 401.  
  Frontend calls it once on app init; if 200, set `isAuthenticated` and profile; if 401, redirect to login.

Right now, login sets `isAuthenticated` and profile from the login response; if the user refreshes, you may need to call `/api/auth/me` (or a proxy GET to profile) to rehydrate auth state.
