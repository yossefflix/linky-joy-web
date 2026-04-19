# SnipLink API Documentation

## Overview

This document describes the API endpoints required for the SnipLink backend.
The frontend uses `VITE_API_BASE_URL` to locate these endpoints.

When `VITE_API_BASE_URL` is not set, the app runs in **mock mode** using local data.

---

## Authentication

All authenticated endpoints require:
```
Authorization: Bearer <jwt_token>
```

### POST /api/auth/signup
Create a new account.
```json
// Request
{ "email": "user@example.com", "password": "securepassword" }

// Response 200
{ "user": { "id": "uuid", "email": "user@example.com" }, "token": "jwt_token" }
```

### POST /api/auth/login
```json
// Request
{ "email": "user@example.com", "password": "securepassword" }

// Response 200
{ "user": { "id": "uuid", "email": "user@example.com" }, "token": "jwt_token" }
```

### GET /api/auth/me
Returns current user and their roles.
```json
// Response 200
{ "user": { "id": "uuid", "email": "user@example.com" }, "roles": ["user"] }
```

### POST /api/auth/logout
Invalidates the current token (optional server-side).
```json
// Response 200
{ "success": true }
```

---

## Links

### GET /api/links
Returns all links for the authenticated user.
```json
// Response 200
{
  "links": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "original_url": "https://example.com/long",
      "short_code": "Ab3kL9",
      "custom_code": null,
      "title": "Example",
      "created_at": "2026-03-10T10:00:00Z",
      "expires_at": null,
      "password": null,
      "is_active": true,
      "total_clicks": 42
    }
  ]
}
```

### POST /api/links
Create a new short link.
```json
// Request
{
  "original_url": "https://example.com/very-long-url",
  "custom_code": "mybrand",     // optional
  "password": "secret",          // optional
  "expires_at": "2026-12-31"    // optional, ISO date
}

// Response 201
{ "link": { ...Link } }
```

### DELETE /api/links/:id
Delete a link owned by the authenticated user.
```json
// Response 200
{ "success": true }
```

---

## Redirect

### GET /api/r/:short_code
Resolves a short code and redirects (302) to the original URL.

Query params:
- `password` (string) — required if link is password-protected

Side effects:
- Creates a row in the `clicks` table with: link_id, ip_address, country, device, browser, timestamp

---

## Analytics

### GET /api/analytics/:linkId
Returns aggregated analytics for a specific link.
```json
// Response 200
{
  "clicksOverTime": [{ "date": "Mar 10", "clicks": 12 }],
  "topCountries": [{ "country": "United States", "clicks": 89 }],
  "devices": [{ "device": "Desktop", "clicks": 120 }],
  "browsers": [{ "browser": "Chrome", "clicks": 105 }]
}
```

### GET /api/analytics/:linkId/export
Returns a CSV file with click data for the link.
```
Content-Type: text/csv
```

---

## Admin

### GET /api/admin/stats
Requires `admin` role in `user_roles` table.
```json
// Response 200
{ "totalUsers": 1247, "totalLinks": 8934, "totalClicks": 142567 }
```

---

## Database Schema

### Table: links
| Column       | Type      | Notes                    |
|-------------|-----------|--------------------------|
| id          | UUID PK   | gen_random_uuid()        |
| user_id     | UUID FK   | references auth.users    |
| original_url| TEXT      | NOT NULL                 |
| short_code  | VARCHAR(20)| UNIQUE, NOT NULL        |
| custom_code | VARCHAR(50)| nullable                |
| title       | TEXT      | nullable                 |
| created_at  | TIMESTAMP | default now()            |
| expires_at  | TIMESTAMP | nullable                 |
| password    | TEXT      | nullable, hashed         |
| is_active   | BOOLEAN   | default true             |
| total_clicks| INTEGER   | default 0                |

### Table: clicks
| Column     | Type      | Notes                     |
|-----------|-----------|---------------------------|
| id        | UUID PK   | gen_random_uuid()         |
| link_id   | UUID FK   | references links.id       |
| ip_address| INET      |                           |
| country   | VARCHAR   |                           |
| device    | VARCHAR   |                           |
| browser   | VARCHAR   |                           |
| timestamp | TIMESTAMP | default now()             |

### Table: user_roles
| Column   | Type          | Notes                    |
|---------|---------------|--------------------------|
| id      | UUID PK       | gen_random_uuid()        |
| user_id | UUID FK       | references auth.users    |
| role    | app_role ENUM | 'admin','moderator','user'|
| UNIQUE  | (user_id, role)|                         |

---

## Environment Variables

| Variable            | Description                          |
|--------------------|--------------------------------------|
| VITE_API_BASE_URL  | API base URL (e.g. https://app.vercel.app/api) |
| DATABASE_URL       | PostgreSQL connection string (server) |
| JWT_SECRET         | JWT signing secret (server)          |
