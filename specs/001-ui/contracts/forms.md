# Forms API Contract

## GET /api/forms

List forms with pagination and basic filtering.

**Authentication**: Required

**Query Parameters**:
- `page` (integer, optional, default=1): Page number
- `per_page` (integer, optional, default=50, max=100): Items per page
- `sort` (string, optional, default="date_received"): Sort field
- `order` (string, optional, default="desc"): Sort order (asc/desc)

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "manufacturer_control_no": "40054",
      "date_received": "2010-12-15",
      "patient_initials": "INT",
      "reaction_count": 3,
      "drug_count": 2,
      "created_at": "2025-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 50,
    "total": 234,
    "total_pages": 5
  }
}
```

## GET /api/forms/{id}

Get complete form with all related data.

**Authentication**: Required

**Path Parameters**:
- `id` (integer, required): Form ID

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "manufacturer_control_no": "40054",
    "date_received": "2010-12-15",
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-15T10:30:00Z",
    "created_by": {
      "id": 1,
      "username": "admin",
      "full_name": "Admin User"
    },
    "patient_info": {
      "initials": "INT",
      "country": "GERMANY",
      "age": "62 Years",
      "sex": "M"
    },
    "adverse_reactions": [
      {
        "id": 1,
        "reaction_en": "PARALYTIC ILEUS",
        "reaction_ko": "마비성 장폐색",
        "sequence_no": 1
      }
    ],
    "suspected_drugs": [
      {
        "id": 1,
        "drug_name_en": "Xeloda [Capecitabine]",
        "drug_name_ko": "젤로다 [카페시타빈]",
        "indication_en": "RECTAL CANCER",
        "indication_ko": "직장암",
        "sequence_no": 1
      }
    ],
    "concomitant_drugs": [],
    "causality_assessment": {
      "assessment_data": {
        "method": "WHO-UMC",
        "category": "Probable"
      }
    },
    "lab_results": []
  }
}
```

**Error Response** (404 Not Found):
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Form with ID 999 not found"
  }
}
```

## POST /api/forms

Create new CIOMS-I form.

**Authentication**: Required (user or admin role)

**Request Body**:
```json
{
  "manufacturer_control_no": "40054",
  "date_received": "2010-12-15",
  "patient_info": {
    "initials": "INT",
    "country": "GERMANY",
    "age": "62 Years",
    "sex": "M"
  },
  "adverse_reactions": [
    {
      "reaction_en": "PARALYTIC ILEUS",
      "reaction_ko": "마비성 장폐색"
    }
  ],
  "suspected_drugs": [
    {
      "drug_name_en": "Xeloda [Capecitabine]",
      "drug_name_ko": "젤로다 [카페시타빈]",
      "indication_en": "RECTAL CANCER",
      "indication_ko": "직장암"
    }
  ],
  "concomitant_drugs": [],
  "causality_assessment": null,
  "lab_results": []
}
```

**Validation Rules**:
- `manufacturer_control_no`: Required, unique, max 100 chars
- `date_received`: Required, valid date, not in future
- `patient_info`: Required object
  - `initials`: Required, 1-10 alphanumeric chars
  - `country`: Required, max 100 chars
  - `age`: Required, format: "{number} {Years|Months|Days}"
  - `sex`: Required, one of: "M", "F", "Unknown"
- `adverse_reactions`: Required array, min 1 item
  - `reaction_en`: Required, max 255 chars
  - `reaction_ko`: Optional, max 255 chars
- `suspected_drugs`: Required array, min 1 item
  - `drug_name_en`: Required, max 255 chars
  - `indication_en`: Required, max 255 chars

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": 123,
    "manufacturer_control_no": "40054",
    /* ... full form object ... */
  },
  "message": "Form created successfully"
}
```

**Error Response** (400 Bad Request):
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
      },
      {
        "field": "adverse_reactions",
        "message": "At least one adverse reaction is required"
      }
    ]
  }
}
```

**Error Response** (409 Conflict):
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_CONTROL_NUMBER",
    "message": "Form with control number '40054' already exists"
  }
}
```

## PUT /api/forms/{id}

Update existing form.

**Authentication**: Required (user or admin role)

**Path Parameters**:
- `id` (integer, required): Form ID

**Request Body**: Same as POST, all fields optional (partial update supported)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": 123,
    /* ... full updated form object ... */
  },
  "message": "Form updated successfully"
}
```

**Error Responses**: Same as POST plus 404 if form not found

## DELETE /api/forms/{id}

Delete form (soft delete with audit trail).

**Authentication**: Required (admin role only)

**Path Parameters**:
- `id` (integer, required): Form ID

**Response** (204 No Content):
No response body

**Error Response** (403 Forbidden):
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "Only administrators can delete forms"
  }
}
```

**Error Response** (404 Not Found):
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Form with ID 999 not found"
  }
}
```

## Notes

- All timestamps in ISO 8601 format (UTC)
- All string fields support UTF-8 (Korean/English bilingual)
- Audit logs created automatically for all create/update/delete operations
- Related entities (patient, reactions, drugs) created/updated/deleted in single transaction
