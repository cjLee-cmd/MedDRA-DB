# Phase 1: Data Model Design

**Feature**: CIOMS-I Form Data Management Web UI
**Date**: 2025-10-15
**Status**: Complete

## Overview

This document defines the database schema for storing CIOMS-I (Council for International Organizations of Medical Sciences) adverse event reporting forms in MySQL 8.0+. The schema is designed to support the complete CIOMS-I form structure including bilingual (English/Korean) data, hierarchical relationships, and audit trail requirements.

## Entity-Relationship Diagram

```
┌─────────────────────┐
│       forms         │
│─────────────────────│
│ id (PK)             │
│ manufacturer_control│
│ date_received       │
│ created_at          │
│ updated_at          │
│ created_by_user_id  │
└──────────┬──────────┘
           │
           │ 1:1
           ├──────────────────────────────┐
           │                              │
           │ 1:N                          │ 1:N
    ┌──────▼──────────┐          ┌───────▼────────────┐
    │  patient_info   │          │  adverse_reactions │
    │─────────────────│          │────────────────────│
    │ id (PK)         │          │ id (PK)            │
    │ form_id (FK)    │          │ form_id (FK)       │
    │ initials        │          │ reaction_en        │
    │ country         │          │ reaction_ko        │
    │ age             │          │ sequence_no        │
    │ sex             │          └────────────────────┘
    └─────────────────┘
           │
           │ 1:N
    ┌──────▼──────────────┐
    │  suspected_drugs    │
    │─────────────────────│
    │ id (PK)             │
    │ form_id (FK)        │
    │ drug_name_en        │
    │ drug_name_ko        │
    │ indication_en       │
    │ indication_ko       │
    │ is_suspected        │
    │ sequence_no         │
    └─────────────────────┘

┌────────────────────────┐
│  concomitant_drugs     │
│────────────────────────│
│ (Same as suspected)    │
└────────────────────────┘

┌────────────────────────┐
│   causality_assessment │
│────────────────────────│
│ id (PK)                │
│ form_id (FK)           │
│ assessment_data (JSON) │
└────────────────────────┘

┌────────────────────────┐
│     lab_results        │
│────────────────────────│
│ id (PK)                │
│ form_id (FK)           │
│ test_name              │
│ result_value           │
│ unit                   │
│ normal_range           │
│ date_performed         │
└────────────────────────┘

┌────────────────────────┐
│        users           │
│────────────────────────│
│ id (PK)                │
│ username               │
│ password_hash          │
│ email                  │
│ role                   │
│ is_active              │
│ created_at             │
└────────────────────────┘

┌────────────────────────┐
│      audit_logs        │
│────────────────────────│
│ id (PK)                │
│ user_id (FK)           │
│ table_name             │
│ record_id              │
│ action                 │
│ old_values (JSON)      │
│ new_values (JSON)      │
│ timestamp              │
│ ip_address             │
└────────────────────────┘

┌────────────────────────┐
│      import_jobs       │
│────────────────────────│
│ id (PK)                │
│ user_id (FK)           │
│ filename               │
│ total_records          │
│ successful_records     │
│ failed_records         │
│ error_log (JSON)       │
│ status                 │
│ started_at             │
│ completed_at           │
└────────────────────────┘
```

## Table Definitions

### 1. forms

Main table for CIOMS-I adverse event report forms.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | Unique form identifier |
| manufacturer_control_no | VARCHAR(100) | NOT NULL, UNIQUE | Manufacturer's control number for the report |
| date_received | DATE | NOT NULL | Date when manufacturer received the report |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Record last update timestamp |
| created_by_user_id | INT UNSIGNED | NOT NULL, FOREIGN KEY → users(id) | User who created the form |

**Indexes**:
- PRIMARY KEY: `id`
- UNIQUE INDEX: `idx_manufacturer_control_no` ON `manufacturer_control_no`
- INDEX: `idx_date_received` ON `date_received`
- INDEX: `idx_created_by` ON `created_by_user_id`

**Validation Rules**:
- `manufacturer_control_no` must be unique across all forms
- `date_received` cannot be in the future
- `created_by_user_id` must reference valid active user

### 2. patient_info

Patient demographic information (one-to-one with forms).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | Unique patient info identifier |
| form_id | INT UNSIGNED | NOT NULL, UNIQUE, FOREIGN KEY → forms(id) ON DELETE CASCADE | Reference to parent form |
| initials | VARCHAR(10) | NOT NULL | Patient initials (anonymized) |
| country | VARCHAR(100) | NOT NULL | Patient's country |
| age | VARCHAR(50) | NOT NULL | Age with unit (e.g., "62 Years", "6 Months") |
| sex | ENUM('M', 'F', 'Unknown') | NOT NULL | Patient sex |

**Indexes**:
- PRIMARY KEY: `id`
- UNIQUE INDEX: `idx_patient_form_id` ON `form_id`
- INDEX: `idx_patient_initials` ON `initials`

**Validation Rules**:
- `initials` must be 1-10 characters, alphanumeric only
- `age` format: number + unit (Years/Months/Days/Hours)
- `sex` must be one of: M, F, Unknown

### 3. adverse_reactions

Adverse reactions reported in the form (one-to-many with forms).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | Unique reaction identifier |
| form_id | INT UNSIGNED | NOT NULL, FOREIGN KEY → forms(id) ON DELETE CASCADE | Reference to parent form |
| reaction_en | VARCHAR(255) | NOT NULL | Reaction description in English |
| reaction_ko | VARCHAR(255) | NULL | Reaction description in Korean |
| sequence_no | TINYINT UNSIGNED | NOT NULL | Order of reaction in the form (1, 2, 3...) |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |

**Indexes**:
- PRIMARY KEY: `id`
- INDEX: `idx_reaction_form_id` ON `form_id`
- INDEX: `idx_reaction_text` ON `reaction_en` (for search)
- UNIQUE INDEX: `idx_form_sequence` ON `(form_id, sequence_no)`

**Validation Rules**:
- `reaction_en` required, `reaction_ko` optional
- `sequence_no` must be positive integer, unique within form
- At least one reaction required per form (enforced at application level)

### 4. suspected_drugs

Suspected drugs associated with adverse event (one-to-many with forms).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | Unique drug identifier |
| form_id | INT UNSIGNED | NOT NULL, FOREIGN KEY → forms(id) ON DELETE CASCADE | Reference to parent form |
| drug_name_en | VARCHAR(255) | NOT NULL | Drug name in English (includes active ingredient) |
| drug_name_ko | VARCHAR(255) | NULL | Drug name in Korean |
| indication_en | VARCHAR(255) | NOT NULL | Indication for use in English |
| indication_ko | VARCHAR(255) | NULL | Indication for use in Korean |
| is_suspected | BOOLEAN | NOT NULL, DEFAULT TRUE | True for suspected drugs, false for concomitant |
| sequence_no | TINYINT UNSIGNED | NOT NULL | Order of drug in the form |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |

**Indexes**:
- PRIMARY KEY: `id`
- INDEX: `idx_drug_form_id` ON `form_id`
- INDEX: `idx_drug_name` ON `drug_name_en`
- INDEX: `idx_drug_type` ON `is_suspected`
- UNIQUE INDEX: `idx_form_drug_sequence` ON `(form_id, is_suspected, sequence_no)`

**Validation Rules**:
- `drug_name_en` and `indication_en` required
- `drug_name_ko` and `indication_ko` optional
- `sequence_no` must be positive, unique within form and drug type (suspected vs concomitant)
- At least one suspected drug required per form (enforced at application level)

**Note**: This table handles both suspected and concomitant drugs using the `is_suspected` flag.

### 5. causality_assessment

Causality assessment between drug and adverse event (one-to-one with forms).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | Unique assessment identifier |
| form_id | INT UNSIGNED | NOT NULL, UNIQUE, FOREIGN KEY → forms(id) ON DELETE CASCADE | Reference to parent form |
| assessment_data | JSON | NULL | Structured causality assessment data |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Record last update timestamp |

**Indexes**:
- PRIMARY KEY: `id`
- UNIQUE INDEX: `idx_causality_form_id` ON `form_id`

**Validation Rules**:
- `assessment_data` can be NULL (assessment may be pending)
- JSON structure is flexible to accommodate different assessment methodologies

**Example JSON Structure**:
```json
{
  "method": "WHO-UMC",
  "category": "Probable",
  "reason": "Temporal relationship established, no alternative cause",
  "assessed_by": "Dr. Smith",
  "assessed_date": "2025-01-15"
}
```

### 6. lab_results

Laboratory test results relevant to adverse event (one-to-many with forms).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | Unique lab result identifier |
| form_id | INT UNSIGNED | NOT NULL, FOREIGN KEY → forms(id) ON DELETE CASCADE | Reference to parent form |
| test_name | VARCHAR(255) | NOT NULL | Name of laboratory test |
| result_value | VARCHAR(100) | NOT NULL | Test result value |
| unit | VARCHAR(50) | NULL | Unit of measurement |
| normal_range | VARCHAR(100) | NULL | Normal reference range |
| date_performed | DATE | NULL | Date when test was performed |
| sequence_no | TINYINT UNSIGNED | NOT NULL | Order of result in the form |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |

**Indexes**:
- PRIMARY KEY: `id`
- INDEX: `idx_lab_form_id` ON `form_id`
- INDEX: `idx_test_name` ON `test_name`
- UNIQUE INDEX: `idx_form_lab_sequence` ON `(form_id, sequence_no)`

**Validation Rules**:
- `test_name` and `result_value` required
- `unit`, `normal_range`, `date_performed` optional
- `sequence_no` must be positive, unique within form

### 7. users

User accounts for authentication and authorization.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| username | VARCHAR(50) | NOT NULL, UNIQUE | Login username |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| email | VARCHAR(255) | NOT NULL, UNIQUE | User email address |
| full_name | VARCHAR(255) | NOT NULL | User's full name |
| role | ENUM('admin', 'user') | NOT NULL, DEFAULT 'user' | User role for access control |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE | Account active status |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Account creation timestamp |
| last_login | DATETIME | NULL | Last successful login timestamp |

**Indexes**:
- PRIMARY KEY: `id`
- UNIQUE INDEX: `idx_username` ON `username`
- UNIQUE INDEX: `idx_email` ON `email`
- INDEX: `idx_role` ON `role`

**Validation Rules**:
- `username` 3-50 characters, alphanumeric and underscore only
- `password_hash` must be bcrypt hash (work factor 12+)
- `email` must be valid email format
- Default role is 'user', can be upgraded to 'admin'

**Security Note**: Never store plain-text passwords. Always use bcrypt hashing with appropriate work factor.

### 8. audit_logs

Audit trail for all data modifications.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | Unique audit log identifier |
| user_id | INT UNSIGNED | NOT NULL, FOREIGN KEY → users(id) | User who performed the action |
| table_name | VARCHAR(50) | NOT NULL | Name of affected table |
| record_id | INT UNSIGNED | NOT NULL | ID of affected record |
| action | ENUM('INSERT', 'UPDATE', 'DELETE') | NOT NULL | Type of operation |
| old_values | JSON | NULL | Previous values (for UPDATE/DELETE) |
| new_values | JSON | NULL | New values (for INSERT/UPDATE) |
| timestamp | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | When the action occurred |
| ip_address | VARCHAR(45) | NULL | IP address of user (IPv4 or IPv6) |

**Indexes**:
- PRIMARY KEY: `id`
- INDEX: `idx_audit_user_id` ON `user_id`
- INDEX: `idx_audit_table_record` ON `(table_name, record_id)`
- INDEX: `idx_audit_timestamp` ON `timestamp`

**Validation Rules**:
- All fields required except `old_values`, `new_values`, `ip_address`
- `old_values` NULL for INSERT, populated for UPDATE/DELETE
- `new_values` NULL for DELETE, populated for INSERT/UPDATE

**Retention Policy**: Audit logs should be retained for minimum 7 years (per regulatory requirements for medical data).

### 9. import_jobs

Tracking for bulk import operations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | Unique import job identifier |
| user_id | INT UNSIGNED | NOT NULL, FOREIGN KEY → users(id) | User who initiated import |
| filename | VARCHAR(255) | NOT NULL | Name of uploaded file |
| total_records | INT UNSIGNED | NOT NULL | Total number of records in file |
| successful_records | INT UNSIGNED | NOT NULL, DEFAULT 0 | Number of successfully imported records |
| failed_records | INT UNSIGNED | NOT NULL, DEFAULT 0 | Number of failed records |
| error_log | JSON | NULL | Details of validation/import errors |
| status | ENUM('pending', 'processing', 'completed', 'failed') | NOT NULL, DEFAULT 'pending' | Job status |
| started_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | When job started |
| completed_at | DATETIME | NULL | When job finished |

**Indexes**:
- PRIMARY KEY: `id`
- INDEX: `idx_import_user_id` ON `user_id`
- INDEX: `idx_import_status` ON `status`
- INDEX: `idx_import_started` ON `started_at`

**Validation Rules**:
- `total_records` must equal `successful_records + failed_records` when complete
- `error_log` JSON array contains per-record error details
- `completed_at` NULL while `status` is 'pending' or 'processing'

**Example error_log Structure**:
```json
[
  {
    "row": 5,
    "error": "Duplicate manufacturer_control_no: ABC123",
    "severity": "error"
  },
  {
    "row": 12,
    "error": "Invalid date format in date_received",
    "severity": "error"
  }
]
```

## Data Integrity Constraints

### Foreign Key Relationships

All foreign key relationships use `ON DELETE CASCADE` to maintain referential integrity:

- When a `form` is deleted, all related records (patient_info, adverse_reactions, suspected_drugs, lab_results, causality_assessment) are automatically deleted
- When a `user` is deleted, their audit_logs and import_jobs remain (for compliance), but foreign key is set to a special "deleted user" ID

### Business Rules Enforced at Database Level

1. **Unique manufacturer control numbers**: Enforced by UNIQUE constraint on `forms.manufacturer_control_no`
2. **One patient per form**: Enforced by UNIQUE constraint on `patient_info.form_id`
3. **One causality assessment per form**: Enforced by UNIQUE constraint on `causality_assessment.form_id`
4. **Unique sequence numbers**: Enforced by composite UNIQUE constraints on `(form_id, sequence_no)` in relevant tables

### Business Rules Enforced at Application Level

1. **At least one adverse reaction per form**: Validated in service layer before form creation
2. **At least one suspected drug per form**: Validated in service layer before form creation
3. **Valid age format**: Regex validation in service layer (e.g., "62 Years", "6 Months")
4. **Date received cannot be in future**: Validated in service layer before persistence

## Database Configuration

### Character Set and Collation

```sql
-- Database-level settings
CREATE DATABASE cioms_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Ensures full Unicode support including emojis and all Korean/Chinese characters
```

### Storage Engine

All tables use **InnoDB** storage engine (MySQL 8.0 default):
- Supports transactions (ACID compliance)
- Supports foreign key constraints
- Row-level locking for better concurrency
- Automatic crash recovery

### Connection Pool Settings

Recommended connection pool configuration (mysql-connector-python):
```python
{
  "pool_size": 10,              # Connections in pool
  "pool_reset_session": True,   # Reset session variables between uses
  "autocommit": False,          # Explicit transaction management
  "charset": "utf8mb4",         # Full Unicode support
  "use_unicode": True,          # Return Unicode strings
  "get_warnings": True          # Retrieve SQL warnings
}
```

## Sample Data

Example of a complete CIOMS-I form record:

```sql
-- Form
INSERT INTO forms (manufacturer_control_no, date_received, created_by_user_id)
VALUES ('40054', '2010-12-15', 1);  -- Assuming form_id = 1

-- Patient Info
INSERT INTO patient_info (form_id, initials, country, age, sex)
VALUES (1, 'INT', 'GERMANY', '62 Years', 'M');

-- Adverse Reactions
INSERT INTO adverse_reactions (form_id, reaction_en, reaction_ko, sequence_no)
VALUES
  (1, 'PARALYTIC ILEUS', '마비성 장폐색', 1),
  (1, 'HYPOVOLEMIC SHOCK', '저혈량성 쇼크', 2),
  (1, 'ACUTE RENAL FAILURE', '급성 신부전', 3);

-- Suspected Drugs
INSERT INTO suspected_drugs (form_id, drug_name_en, drug_name_ko, indication_en, indication_ko, is_suspected, sequence_no)
VALUES
  (1, 'Xeloda [Capecitabine]', '젤로다 [카페시타빈]', 'RECTAL CANCER', '직장암', TRUE, 1),
  (1, 'Eloxatin [Oxaliplatin]', '엘록사틴 [옥살리플라틴]', 'RECTAL CANCER', '직장암', TRUE, 2);
```

## Migration Strategy

### Initial Schema Creation

1. Create database with UTF-8 support
2. Execute migration script `001_initial_schema.sql` (creates all tables)
3. Execute migration script `002_audit_logs.sql` (adds audit logging)
4. Execute migration script `003_indexes.sql` (creates performance indexes)
5. Load seed data for testing (sample forms, test users)

### Future Schema Changes

All schema changes will use versioned migration scripts:
- Naming: `NNN_description.sql` (e.g., `004_add_report_type.sql`)
- Migrations are idempotent (can run multiple times safely)
- Each migration includes rollback script
- Track applied migrations in `schema_migrations` table

## Performance Considerations

### Expected Query Patterns

1. **Search forms by control number**: Uses index `idx_manufacturer_control_no` → O(log n)
2. **Search forms by date range**: Uses index `idx_date_received` → O(log n)
3. **Retrieve complete form with all related data**: Uses indexes on foreign keys → O(1) for each related table
4. **Search reactions by text**: Uses index `idx_reaction_text` with LIKE query → O(log n)
5. **List recent forms**: Uses index `idx_date_received` with `ORDER BY date_received DESC LIMIT N` → O(log n)

### Optimization Strategies

- **Pagination**: Use LIMIT/OFFSET for large result sets (max 50 records per page)
- **Selective columns**: Avoid `SELECT *`, specify needed columns
- **JOIN optimization**: MySQL query optimizer uses indexes on foreign keys automatically
- **Caching**: Consider caching frequently accessed forms at application level (Redis/Memcached)
- **Bulk operations**: Use `INSERT ... VALUES (), (), ()` for importing multiple records

## Data Volume Estimates

Based on expected usage (100,000 forms):

| Table | Estimated Rows | Storage per Row | Total Storage |
|-------|----------------|-----------------|---------------|
| forms | 100,000 | ~500 bytes | ~50 MB |
| patient_info | 100,000 | ~300 bytes | ~30 MB |
| adverse_reactions | 300,000 (avg 3 per form) | ~400 bytes | ~120 MB |
| suspected_drugs | 200,000 (avg 2 per form) | ~500 bytes | ~100 MB |
| lab_results | 500,000 (avg 5 per form) | ~300 bytes | ~150 MB |
| causality_assessment | 100,000 | ~200 bytes | ~20 MB |
| users | 50 | ~300 bytes | ~15 KB |
| audit_logs | 1,000,000+ | ~500 bytes | ~500 MB |
| import_jobs | 1,000 | ~1 KB | ~1 MB |

**Total Database Size**: Approximately **1 GB** for 100,000 forms (excluding indexes, which add ~30-50% overhead).

## Next Steps

- Generate API contracts based on this data model
- Design REST endpoints for CRUD operations on each entity
- Define JSON request/response formats
- Create quickstart guide for database setup
