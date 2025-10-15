# Import/Export API Contract

## POST /api/import/upload

Upload CSV file for bulk import.

**Authentication**: Required (admin role only)

**Request**: Multipart form data
- `file` (file, required): CSV file with CIOMS-I form data
- `validate_only` (boolean, optional, default=false): Validate without importing

**CSV Format**:
- First row: Column headers
- Required columns: manufacturer_control_no, date_received, patient_initials, patient_country, patient_age, patient_sex
- Optional columns: reaction_en_1, reaction_ko_1, drug_name_en_1, drug_name_ko_1, indication_en_1, etc.
- UTF-8 encoding required

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "job_id": 123,
    "status": "processing",
    "filename": "import_2025-01-15.csv",
    "total_records": 1000
  },
  "message": "Import job started"
}
```

**Error Response** (400 Bad Request):
```json
{
  "success": false,
  "error": {
    "code": "INVALID_FILE_FORMAT",
    "message": "CSV file must contain required columns",
    "details": ["Missing column: manufacturer_control_no"]
  }
}
```

## GET /api/import/jobs/{id}

Get import job status and results.

**Authentication**: Required

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": 123,
    "filename": "import_2025-01-15.csv",
    "status": "completed",
    "total_records": 1000,
    "successful_records": 985,
    "failed_records": 15,
    "errors": [
      {
        "row": 5,
        "error": "Duplicate control number: ABC123"
      }
    ],
    "started_at": "2025-01-15T10:00:00Z",
    "completed_at": "2025-01-15T10:05:32Z"
  }
}
```

## GET /api/import/jobs

List import job history.

**Authentication**: Required

**Query Parameters**:
- `page`, `per_page`: Pagination

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "filename": "import_2025-01-15.csv",
      "status": "completed",
      "total_records": 1000,
      "successful_records": 985,
      "failed_records": 15,
      "started_at": "2025-01-15T10:00:00Z",
      "completed_at": "2025-01-15T10:05:32Z"
    }
  ],
  "pagination": {...}
}
```

## GET /api/export/forms

Export forms to CSV.

**Authentication**: Required

**Query Parameters**:
- `date_from`, `date_to`: Date range filter
- `format` (string, optional, default="csv"): Export format (csv only for now)

**Response** (200 OK):
- Content-Type: text/csv
- Content-Disposition: attachment; filename="cioms_export_2025-01-15.csv"
- CSV file download

**Error Response** (400 Bad Request):
```json
{
  "success": false,
  "error": {
    "code": "INVALID_DATE_RANGE",
    "message": "date_from must be before date_to"
  }
}
```
