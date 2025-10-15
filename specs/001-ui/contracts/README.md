# API Contracts

**Feature**: CIOMS-I Form Data Management Web UI
**API Version**: 1.0.0
**Base URL**: `http://localhost:5000/api` (development)

## Overview

This directory contains API contract specifications for the CIOMS-I form management system. All APIs follow REST conventions with JSON request/response format.

## Authentication

All API endpoints (except `/auth/login`) require session-based authentication:
- Client sends credentials to `/api/auth/login`
- Server returns session cookie (HTTPOnly, Secure, SameSite=Lax)
- Client includes cookie in all subsequent requests
- Session expires after 30 minutes of inactivity

## Endpoint Categories

### 1. Authentication (`/api/auth`)
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user info

### 2. Forms (`/api/forms`)
- `GET /forms` - List/search forms (with pagination)
- `GET /forms/{id}` - Get specific form with all related data
- `POST /forms` - Create new form
- `PUT /forms/{id}` - Update existing form
- `DELETE /forms/{id}` - Delete form (soft delete with audit)

### 3. Search (`/api/search`)
- `GET /search/forms` - Advanced search with filters
- `GET /search/reactions` - Search adverse reactions
- `GET /search/drugs` - Search drug names

### 4. Import/Export (`/api/import`)
- `POST /import/upload` - Upload CSV file for import
- `GET /import/jobs/{id}` - Get import job status
- `GET /import/jobs` - List import job history
- `GET /export/forms` - Export forms to CSV

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid form data",
    "details": [
      {
        "field": "manufacturer_control_no",
        "message": "This field is required"
      }
    ]
  }
}
```

### Pagination Response
```json
{
  "success": true,
  "data": [ /* array of items */ ],
  "pagination": {
    "page": 1,
    "per_page": 50,
    "total": 234,
    "total_pages": 5
  }
}
```

## HTTP Status Codes

- `200 OK` - Successful GET/PUT request
- `201 Created` - Successful POST request
- `204 No Content` - Successful DELETE request
- `400 Bad Request` - Validation error or malformed request
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Duplicate resource (e.g., control number exists)
- `500 Internal Server Error` - Server error

## Detailed Endpoint Specifications

See individual contract files for detailed specifications:
- [auth.md](auth.md) - Authentication endpoints
- [forms.md](forms.md) - CIOMS-I form CRUD endpoints
- [search.md](search.md) - Search and filtering endpoints
- [import.md](import.md) - Bulk import/export endpoints
