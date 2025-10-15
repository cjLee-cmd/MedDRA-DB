# Search API Contract

## GET /api/search/forms

Advanced search with multiple filters.

**Authentication**: Required

**Query Parameters**:
- `q` (string, optional): Full-text search across all fields
- `control_no` (string, optional): Filter by manufacturer control number
- `patient_initials` (string, optional): Filter by patient initials
- `country` (string, optional): Filter by patient country
- `date_from` (date, optional): Date received from (YYYY-MM-DD)
- `date_to` (date, optional): Date received to (YYYY-MM-DD)
- `reaction` (string, optional): Filter by adverse reaction text
- `drug` (string, optional): Filter by drug name
- `page` (integer, optional, default=1)
- `per_page` (integer, optional, default=50, max=100)

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
      "patient_country": "GERMANY",
      "reactions": ["PARALYTIC ILEUS", "HYPOVOLEMIC SHOCK"],
      "drugs": ["Xeloda [Capecitabine]"],
      "match_score": 0.95
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 50,
    "total": 15,
    "total_pages": 1
  }
}
```

## GET /api/search/reactions

Search adverse reaction terms.

**Authentication**: Required

**Query Parameters**:
- `q` (string, required): Search term (minimum 2 characters)
- `lang` (string, optional, default="en"): Language (en|ko)
- `limit` (integer, optional, default=20, max=100)

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "reaction_en": "PARALYTIC ILEUS",
      "reaction_ko": "마비성 장폐색",
      "usage_count": 15
    }
  ]
}
```

## GET /api/search/drugs

Search drug names.

**Authentication**: Required

**Query Parameters**: Same as reactions endpoint

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "drug_name_en": "Xeloda [Capecitabine]",
      "drug_name_ko": "젤로다 [카페시타빈]",
      "usage_count": 42
    }
  ]
}
```
