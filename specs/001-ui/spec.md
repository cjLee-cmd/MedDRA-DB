# Feature Specification: MedDRA Test Database & Data Entry Web UI

**Feature Branch**: `001-ui`
**Created**: 2025-10-15
**Status**: Draft
**Input**: User description: "오라클을 대신하는 테스트용 데이터베이스 생성 및 입력 웹 UI제작"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Database Schema Setup & Migration (Priority: P1) 🎯 MVP

As a database administrator, I need to create a PostgreSQL database with MedDRA schema structure that mirrors the existing Oracle database, so that the test environment can accurately replicate production data structures for testing purposes.

**Why this priority**: Without the database foundation, no other functionality can be tested. This is the blocking prerequisite for all data entry and retrieval operations.

**Independent Test**: Can be fully tested by running schema migration scripts and verifying that all tables, relationships, constraints, and indexes are created successfully. Delivers a functional database ready to accept MedDRA data.

**Acceptance Scenarios**:

1. **Given** an empty PostgreSQL database instance, **When** the migration scripts are executed, **Then** all MedDRA tables (SOC, HLGT, HLT, PT, LLT) are created with proper hierarchical relationships
2. **Given** the database schema is created, **When** referential integrity is tested, **Then** parent-child relationships between terminology levels are enforced
3. **Given** the migrated schema, **When** sample data is inserted, **Then** all constraints (primary keys, foreign keys, unique constraints) are validated correctly
4. **Given** the database is operational, **When** querying hierarchical relationships, **Then** data can be retrieved following MedDRA's five-level structure

---

### User Story 2 - Browse & Search MedDRA Terms (Priority: P2)

As a data entry specialist, I need to browse and search existing MedDRA terms in the database through a web interface, so that I can verify data consistency and find appropriate terms before creating new entries.

**Why this priority**: Before users can add data, they need visibility into existing data to prevent duplicates and understand the current state of the database. This provides immediate value for data verification.

**Independent Test**: Can be fully tested by accessing the web interface, performing searches by term name or code, and verifying that results display correctly with hierarchical context. Delivers read-only data access capability.

**Acceptance Scenarios**:

1. **Given** the web UI is loaded, **When** a user searches for a MedDRA term by partial name, **Then** matching terms are displayed with their codes and hierarchical levels
2. **Given** search results are displayed, **When** a user selects a specific term, **Then** the full hierarchical path (SOC → HLGT → HLT → PT → LLT) is shown
3. **Given** the database contains MedDRA data, **When** a user browses by hierarchy level, **Then** terms are organized and displayed according to their parent-child relationships
4. **Given** a search query returns no results, **When** the user sees the empty state, **Then** a clear message indicates no matching terms were found

---

### User Story 3 - Add New MedDRA Terms (Priority: P3)

As a medical terminology specialist, I need to add new MedDRA terms through the web interface with proper validation, so that I can maintain and expand the terminology database as medical classifications evolve.

**Why this priority**: Once users can view existing data, the next logical step is creating new entries. This enables full database maintenance capability.

**Independent Test**: Can be fully tested by accessing the data entry form, submitting new terms with valid hierarchical relationships, and verifying that data is persisted correctly. Delivers full CRUD capability for MedDRA terms.

**Acceptance Scenarios**:

1. **Given** the data entry form is displayed, **When** a user enters a new MedDRA term with valid code and hierarchy selection, **Then** the term is saved and immediately appears in search results
2. **Given** a user is creating a new term, **When** an invalid parent relationship is selected (e.g., LLT under SOC), **Then** validation prevents submission and displays clear error messages
3. **Given** a user submits a new term, **When** the code already exists in the database, **Then** a duplicate error is shown and the term is not saved
4. **Given** a new term is successfully saved, **When** the hierarchical view is refreshed, **Then** the new term appears in its correct position within the MedDRA hierarchy

---

### User Story 4 - Edit & Update Existing Terms (Priority: P4)

As a data steward, I need to edit and update existing MedDRA terms while maintaining data integrity, so that I can correct errors and keep the terminology database accurate and current.

**Why this priority**: After basic CRUD operations are established, users need the ability to maintain data quality through updates.

**Independent Test**: Can be fully tested by selecting an existing term, modifying its attributes, saving changes, and verifying that updates are reflected throughout the database while maintaining referential integrity.

**Acceptance Scenarios**:

1. **Given** a term is displayed in detail view, **When** a user clicks edit and modifies the term name, **Then** the changes are saved and reflected in all search results and hierarchical views
2. **Given** a user is editing a term with child terms, **When** attempting to change its hierarchical level, **Then** validation ensures child relationships remain valid or prompts for resolution
3. **Given** a term has been modified, **When** the update transaction is committed, **Then** an audit log entry records who made the change, when, and what was modified
4. **Given** concurrent users are editing different terms, **When** both save simultaneously, **Then** all changes are committed without conflicts or data loss

---

### User Story 5 - Bulk Data Import (Priority: P5)

As a database administrator, I need to import MedDRA terminology data in bulk from standard file formats, so that I can efficiently populate the database with complete terminology sets without manual entry.

**Why this priority**: Manual entry is time-consuming for large datasets. Bulk import enables efficient database population but is lower priority than core CRUD operations.

**Independent Test**: Can be fully tested by uploading a formatted data file, monitoring the import process, and verifying that all records are created with proper validation and error reporting.

**Acceptance Scenarios**:

1. **Given** a valid CSV or Excel file with MedDRA terms, **When** the file is uploaded through the import interface, **Then** all valid records are imported and a summary report shows success/failure counts
2. **Given** an import file contains invalid data, **When** the import process runs, **Then** validation errors are logged with specific row numbers and field issues
3. **Given** a large file is being imported, **When** the import is in progress, **Then** a progress indicator shows percentage complete and estimated time remaining
4. **Given** an import operation fails partially, **When** the user reviews the error report, **Then** successfully imported records remain in the database and failed records are listed for correction

---

### Edge Cases

- What happens when a user attempts to delete a term that has dependent child terms?
- How does the system handle concurrent edits to the same MedDRA term by multiple users?
- What happens when database connection is lost during a data entry operation?
- How does the system handle special characters or non-Latin text in term names?
- What happens when importing a file with circular hierarchical relationships?
- How does the system respond when PostgreSQL storage limits are approached?
- What happens when a user's session expires during a long data entry process?
- How does the system handle orphaned terms (child without valid parent)?

## Requirements *(mandatory)*

### Functional Requirements

#### Database Requirements

- **FR-001**: System MUST create a PostgreSQL database schema that mirrors MedDRA's five-level hierarchical structure (SOC, HLGT, HLT, PT, LLT)
- **FR-002**: System MUST enforce referential integrity constraints between all hierarchical levels to prevent orphaned terms
- **FR-003**: System MUST support database migrations with version control for schema changes
- **FR-004**: System MUST implement transaction support with rollback capability for all data modifications
- **FR-005**: System MUST maintain audit logs recording all data modifications including user, timestamp, and change details
- **FR-006**: System MUST enforce unique constraints on MedDRA term codes across the entire database
- **FR-007**: System MUST support efficient querying of hierarchical relationships with appropriate indexing

#### Web UI Requirements

- **FR-008**: System MUST provide a web-based interface accessible through modern browsers (Chrome, Firefox, Safari, Edge)
- **FR-009**: System MUST display MedDRA terms in a hierarchical tree view showing parent-child relationships
- **FR-010**: Users MUST be able to search for MedDRA terms by code, name, or partial text match
- **FR-011**: System MUST provide data entry forms for creating new MedDRA terms at all hierarchy levels
- **FR-012**: System MUST validate all user inputs before database persistence, displaying clear error messages for invalid data
- **FR-013**: System MUST provide edit functionality for existing terms with change confirmation dialogs
- **FR-014**: System MUST display loading indicators during data fetch and save operations
- **FR-015**: System MUST support responsive design for desktop and tablet devices (minimum 768px width)

#### Data Validation Requirements

- **FR-016**: System MUST validate that new terms are assigned to valid parent terms according to MedDRA hierarchy rules
- **FR-017**: System MUST prevent duplicate term codes from being created
- **FR-018**: System MUST validate term code format according to MedDRA standards (numeric codes with appropriate length)
- **FR-019**: System MUST validate that term names are not empty and meet minimum length requirements (at least 2 characters)
- **FR-020**: System MUST validate hierarchical relationship constraints (e.g., LLT can only be child of PT, not SOC)

#### Import/Export Requirements

- **FR-021**: System MUST support bulk import of MedDRA terms from CSV file format
- **FR-022**: System MUST validate imported data before database insertion, generating detailed error reports
- **FR-023**: System MUST provide progress feedback during bulk import operations
- **FR-024**: System MUST support exporting MedDRA data to CSV format for backup purposes
- **FR-025**: System MUST handle import file encoding (UTF-8) correctly for international characters

#### Security & Access Requirements

- **FR-026**: System MUST require user authentication before allowing any data entry or modification operations
- **FR-027**: System MUST implement role-based access control distinguishing between read-only users and data entry specialists
- **FR-028**: System MUST log all user actions including successful operations and failed attempts
- **FR-029**: System MUST protect against SQL injection through parameterized queries
- **FR-030**: System MUST enforce HTTPS for all web communications

### Key Entities

- **System of Organ Class (SOC)**: Top-level MedDRA category representing broad anatomical or physiological systems (e.g., "Cardiac disorders", "Nervous system disorders"). Contains unique code and descriptive name. Parent to HLGT terms.

- **High Level Group Term (HLGT)**: Second-level grouping providing more specific categorization than SOC but broader than individual conditions. Contains unique code, name, and reference to parent SOC. Parent to HLT terms.

- **High Level Term (HLT)**: Third-level term representing clinically relevant groupings of related medical concepts. Contains unique code, name, and reference to parent HLGT. Parent to PT terms.

- **Preferred Term (PT)**: Fourth-level term representing a distinct medical concept or condition. Primary term used for coding in most contexts. Contains unique code, name, and reference to parent HLT. Parent to LLT terms.

- **Lowest Level Term (LLT)**: Most specific level representing synonyms, lexical variants, and specific manifestations of PTs. Contains unique code, name, and reference to parent PT. Leaf nodes in the hierarchy.

- **User**: Person interacting with the system for data entry or browsing. Contains authentication credentials, role assignment, and activity history.

- **Audit Log Entry**: Record of data modifications containing timestamp, user identifier, action type (create/update/delete), affected term, and change details.

- **Import Job**: Record of bulk import operations containing file information, start/completion timestamps, success/failure counts, and error details.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Database can store and retrieve at least 100,000 MedDRA terms across all hierarchy levels without performance degradation
- **SC-002**: Users can search and retrieve any MedDRA term in under 2 seconds regardless of database size
- **SC-003**: Data entry specialists can create a new MedDRA term including validation in under 1 minute
- **SC-004**: Bulk import operations can process at least 10,000 records per minute with validation
- **SC-005**: Web interface remains responsive with page load times under 3 seconds on standard broadband connections
- **SC-006**: Zero data integrity violations (orphaned terms, broken references) occur during normal operations
- **SC-007**: 95% of data entry attempts succeed on first submission without validation errors
- **SC-008**: All hierarchical relationships are correctly maintained and queryable at any level
- **SC-009**: System successfully migrates from empty database to full schema in under 5 minutes
- **SC-010**: Audit logs capture 100% of data modification events with complete user attribution
- **SC-011**: System supports at least 50 concurrent users performing data entry without conflicts
- **SC-012**: Database backup and restore operations complete in under 15 minutes for typical dataset sizes

### User Experience Outcomes

- **SC-013**: New users can successfully add their first MedDRA term within 5 minutes of accessing the interface without training
- **SC-014**: Users report satisfaction with search functionality finding desired terms on first or second attempt
- **SC-015**: Data entry specialists experience fewer than 5% error rates when creating new terms with proper validation guidance
- **SC-016**: Zero data loss incidents during database operations including imports and concurrent modifications

## Assumptions

1. **MedDRA Structure**: The system assumes standard MedDRA five-level hierarchy (SOC → HLGT → HLT → PT → LLT) without custom levels
2. **Term Codes**: MedDRA term codes are assumed to be numeric identifiers with validation rules consistent with standard MedDRA formatting
3. **User Base**: Initial deployment assumes 10-50 concurrent users, primarily data entry specialists and database administrators
4. **Data Volume**: Expected database size is up to 200,000 terms across all levels based on typical MedDRA terminology scope
5. **Browser Support**: Modern evergreen browsers with JavaScript enabled; no Internet Explorer support required
6. **Network Environment**: Users access the system over reliable network connections (minimum 1 Mbps)
7. **Authentication**: User authentication is required but specific method (local accounts, LDAP, SSO) will be determined during planning phase
8. **Language Support**: Initial version supports English MedDRA terms; international character support (UTF-8) included for future multilingual expansion
9. **Backup Strategy**: Database backups are external responsibility; system provides export functionality but automated backup scheduling is not included
10. **Regulatory Compliance**: MedDRA licensing and usage rights are assumed to be handled externally; system focuses on technical implementation

## Out of Scope

The following items are explicitly excluded from this feature:

1. **Integration with external systems**: No APIs for third-party applications or EDC systems
2. **Advanced analytics**: No reporting dashboards, statistical analysis, or data visualization beyond basic term browsing
3. **Mobile native apps**: Responsive web design only, no iOS/Android native applications
4. **Versioning of terminology**: Single current version of MedDRA terms; historical term versioning not included
5. **Multi-language terminology management**: Initial release English only; international MedDRA translations excluded
6. **Advanced permissions**: Simple role-based access (admin vs. user) only; no granular field-level permissions
7. **Automated data synchronization**: No real-time sync with Oracle or other external databases
8. **Custom terminology hierarchies**: MedDRA standard five-level structure only; no custom levels or relationships
9. **Workflow management**: No approval workflows, review queues, or staged publishing of term changes
10. **API development**: No REST or GraphQL APIs for programmatic access (web UI only for this phase)

## Dependencies

1. **PostgreSQL Availability**: Requires PostgreSQL 14+ database server to be provisioned and accessible
2. **MedDRA Source Data**: Requires access to MedDRA terminology data files or Oracle export for initial population
3. **Web Hosting**: Requires web server infrastructure capable of hosting Python backend application
4. **User Authentication System**: Requires decision on authentication mechanism (local vs. external)
5. **SSL Certificate**: Requires HTTPS certificate for production deployment
