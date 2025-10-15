# Authentication API Contract

## POST /api/auth/login

Authenticate user and create session.

**Authentication**: None required

**Request Body**:
```json
{
  "username": "admin",
  "password": "securepassword123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "full_name": "Admin User",
    "role": "admin"
  },
  "message": "Login successful"
}
```
Sets `Set-Cookie` header with session ID (HTTPOnly, Secure, SameSite=Lax).

**Error Response** (401 Unauthorized):
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid username or password"
  }
}
```

## POST /api/auth/logout

End user session.

**Authentication**: Required

**Response** (204 No Content): Clears session cookie.

## GET /api/auth/me

Get current authenticated user info.

**Authentication**: Required

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "full_name": "Admin User",
    "role": "admin",
    "last_login": "2025-01-15T10:30:00Z"
  }
}
```

**Error Response** (401 Unauthorized):
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```
