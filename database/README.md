# CIOMS-I Form Management System - Database

MySQL database schema and migration scripts for CIOMS-I adverse event reporting forms.

## Overview

MySQL 8.0+ database with:
- 9 normalized tables for CIOMS-I form data
- Bilingual support (English/Korean) with UTF-8 encoding
- Foreign key constraints with CASCADE delete
- Audit logging for all modifications
- Optimized indexes for performance

## Directory Structure

```
database/
├── schema/
│   └── cioms_i_schema.sql      # Complete database schema (CREATE TABLE statements)
├── migrations/
│   ├── 001_initial_schema.sql  # Initial schema creation
│   ├── 002_audit_logs.sql      # Audit logging tables
│   └── 003_indexes.sql         # Performance indexes
└── seed/
    └── sample_data.sql          # Sample CIOMS-I forms for testing
```

## Database Schema

### Core Tables

1. **forms** - Main CIOMS-I report table
2. **patient_info** - Patient demographics (1:1 with forms)
3. **adverse_reactions** - Bilingual adverse reactions (1:N)
4. **suspected_drugs** - Suspected and concomitant drugs (1:N)
5. **causality_assessment** - Causality data with JSON field (1:1)
6. **lab_results** - Laboratory test results (1:N)
7. **users** - Authentication with bcrypt passwords
8. **audit_logs** - Complete audit trail with JSON old/new values
9. **import_jobs** - Bulk import tracking

See `specs/001-ui/data-model.md` for complete schema details.

## Setup

### 1. Install MySQL

```bash
# macOS:
brew install mysql@8.0
brew services start mysql@8.0

# Ubuntu/Debian:
sudo apt-get install mysql-server mysql-client

# Windows:
# Download from https://dev.mysql.com/downloads/mysql/
```

### 2. Create Database and User

```bash
mysql -u root -p
```

```sql
CREATE DATABASE cioms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'cioms_user'@'localhost' IDENTIFIED BY 'secure_password_here';
GRANT ALL PRIVILEGES ON cioms_db.* TO 'cioms_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Run Migrations

From backend directory:

```bash
cd backend
source venv/bin/activate
python src/db/migrate.py
```

Or manually run SQL scripts:

```bash
mysql -u cioms_user -p cioms_db < database/migrations/001_initial_schema.sql
mysql -u cioms_user -p cioms_db < database/migrations/002_audit_logs.sql
mysql -u cioms_user -p cioms_db < database/migrations/003_indexes.sql
```

### 4. Load Sample Data (Optional)

```bash
mysql -u cioms_user -p cioms_db < database/seed/sample_data.sql
```

## Migration Strategy

### Naming Convention

Migrations follow sequential numbering:
- `001_initial_schema.sql` - Core tables
- `002_audit_logs.sql` - Audit logging
- `003_indexes.sql` - Performance indexes
- `00X_description.sql` - Future migrations

### Running Migrations

Migrations are designed to be:
- **Idempotent**: Safe to run multiple times
- **Atomic**: Use transactions where possible
- **Tested**: Migration tests in `backend/tests/integration/test_migrations.py`

### Rollback Strategy

Each migration should include:
- Forward migration (UP)
- Rollback script (DOWN) in comments

Example:
```sql
-- UP: Create table
CREATE TABLE example (...);

-- DOWN: Drop table
-- DROP TABLE IF EXISTS example;
```

## Data Model Highlights

### Bilingual Support

Tables with bilingual fields use UTF-8 (utf8mb4) encoding:
- `adverse_reactions`: `reaction_en`, `reaction_ko`
- `suspected_drugs`: `drug_name_en`, `drug_name_ko`, `indication_en`, `indication_ko`

### Referential Integrity

Foreign key constraints with CASCADE delete:
```sql
FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
```

When a form is deleted, all related records (reactions, drugs, lab results) are automatically deleted.

### Audit Trail

All modifications logged to `audit_logs` table:
- User ID, timestamp, operation (INSERT/UPDATE/DELETE)
- Table and record ID
- JSON old/new values for comparison

### Performance Indexes

Optimized indexes for common queries:
- `forms`: manufacturer_control_no (UNIQUE), date_received, created_at
- `adverse_reactions`: form_id, reaction_en, reaction_ko
- `suspected_drugs`: form_id, drug_name_en, drug_name_ko
- `audit_logs`: table_name, record_id, created_at, user_id

## Maintenance

### Backup

```bash
# Full backup
mysqldump -u cioms_user -p cioms_db > backup_$(date +%Y%m%d).sql

# Schema only
mysqldump -u cioms_user -p --no-data cioms_db > schema_backup.sql

# Data only
mysqldump -u cioms_user -p --no-create-info cioms_db > data_backup.sql
```

### Restore

```bash
mysql -u cioms_user -p cioms_db < backup_20251015.sql
```

### Database Statistics

```sql
-- Table sizes
SELECT
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb,
    table_rows
FROM information_schema.TABLES
WHERE table_schema = 'cioms_db'
ORDER BY (data_length + index_length) DESC;

-- Index usage
SELECT
    table_name,
    index_name,
    cardinality
FROM information_schema.STATISTICS
WHERE table_schema = 'cioms_db'
ORDER BY table_name, index_name;
```

### Cleanup Old Data

```sql
-- Delete audit logs older than 1 year
DELETE FROM audit_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);

-- Delete completed import jobs older than 90 days
DELETE FROM import_jobs
WHERE status = 'completed'
  AND completed_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
```

## Troubleshooting

### Connection Issues

```bash
# Check MySQL is running
brew services list  # macOS
sudo systemctl status mysql  # Linux

# Test connection
mysql -u cioms_user -p -h localhost cioms_db
```

### Character Encoding Issues

Verify database uses utf8mb4:

```sql
SHOW CREATE DATABASE cioms_db;
-- Should show: CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci

SHOW CREATE TABLE adverse_reactions;
-- Should show: CHARSET=utf8mb4
```

### Performance Issues

Check query performance:

```sql
-- Enable query profiling
SET profiling = 1;

-- Run slow query
SELECT * FROM forms WHERE date_received > '2020-01-01';

-- Show profile
SHOW PROFILES;
SHOW PROFILE FOR QUERY 1;
```

Add missing indexes if needed:

```sql
-- Check missing indexes
SELECT * FROM sys.schema_unused_indexes WHERE object_schema = 'cioms_db';
```

## Additional Resources

- Data Model Documentation: `specs/001-ui/data-model.md`
- API Contracts: `specs/001-ui/contracts/`
- Quickstart Guide: `specs/001-ui/quickstart.md`
