# Implementation Plan: CIOMS-I Form Data Management Web UI

**Branch**: `001-ui` | **Date**: 2025-10-15 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-ui/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Create a web-based data entry and management system for CIOMS-I (Council for International Organizations of Medical Sciences) adverse event reporting forms. The system will use MySQL database to store structured medical adverse event data including patient information, adverse reactions, suspected drugs, concomitant medications, causality assessments, and laboratory results. The web interface will be built with vanilla HTML, CSS, and JavaScript to maximize simplicity and minimize dependencies, with a Python backend API layer for database operations.

**Primary Requirement**: Replace Oracle-based MedDRA database with MySQL for testing purposes, providing a lightweight web UI for CIOMS-I form data entry, viewing, search, and bulk import/export capabilities.

**Technical Approach**: Three-tier architecture with MySQL database, Python REST API backend (Flask), and vanilla JavaScript frontend. Focus on simplicity, maintainability, and minimal external dependencies per user request.

## Technical Context

**Language/Version**: Python 3.10+ (backend), Vanilla JavaScript ES6+ (frontend), HTML5, CSS3
**Primary Dependencies**:
- Backend: Flask 3.0+, mysql-connector-python 8.1+, python-dotenv 1.0+ (minimal dependencies)
- Frontend: No frameworks - vanilla JavaScript only, CSS Grid/Flexbox for layout
- Development: pytest 7.4+ (backend testing), browser developer tools (frontend testing)

**Storage**: MySQL 8.0+ (user-specified database replacing PostgreSQL from constitution)
**Testing**: pytest for backend, manual browser testing for frontend (per vanilla JS requirement)
**Target Platform**: Linux/Windows server with Python runtime, modern web browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: Web application (backend + frontend separation)
**Performance Goals**:
- API response times <500ms for CRUD operations
- Page load <3 seconds on broadband connections
- Support 50 concurrent users
- Bulk import 10,000 records/minute

**Constraints**:
- No frontend frameworks (React/Vue/Svelte) - vanilla JS only per user requirement
- MySQL instead of PostgreSQL (user-specified)
- Minimal external dependencies
- Must support UTF-8 for Korean/English bilingual data (per CIOMS-I form)
- HTTPS required for production deployment
- Session-based authentication (simplest approach for vanilla JS)

**Scale/Scope**:
- Expected 10-50 concurrent users
- Up to 100,000 CIOMS-I adverse event reports in database
- Support for bilingual (Korean/English) data fields
- Desktop and tablet device support (minimum 768px width)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Compliance Status

#### ✅ Principle I: Database-First Architecture - COMPLIANT (with noted violation)

- ✅ Database schema designed with migration scripts
- ✅ Transactional operations with rollback capability
- ✅ Referential integrity enforced at database level
- ✅ Database access layer abstracted (Flask models + MySQL connector)
- ⚠️  **VIOLATION**: Using MySQL instead of PostgreSQL as specified in constitution

**Justification**: User explicitly requested MySQL ("DB는 MySQL을 사용함"). While constitution specifies PostgreSQL 14+, MySQL 8.0+ provides equivalent capabilities for this use case:
- Both support JSON fields (MySQL 5.7.8+)
- Both support transactions and referential integrity
- Both provide adequate performance for expected scale (100K records)
- MySQL simpler to deploy in some environments
- Migration from MySQL to PostgreSQL is feasible if needed later

**Simpler Alternative Rejected**: Using PostgreSQL per constitution was rejected because user specifically requested MySQL, likely due to existing infrastructure or team familiarity.

#### ⚠️  Principle II: Web UI Standards - PARTIAL COMPLIANCE (with justified violation)

- ❌ **VIOLATION**: Using vanilla HTML/CSS/JavaScript instead of modern framework (React/Vue/Svelte)
- ✅ Backend API layer with clear separation (Flask REST API)
- ✅ RESTful API design
- ✅ Responsive design (CSS Grid/Flexbox)
- ✅ Accessible UI (semantic HTML, ARIA labels where needed)
- ✅ Form validation at client and server levels

**Justification**: User explicitly requested vanilla JavaScript ("Use vanilla HTML, CSS, and JavaScript as much as possible"). Benefits:
- Zero build pipeline complexity
- No framework version dependencies or updates
- Faster initial page load (no large framework bundle)
- Easier debugging and maintenance for small teams
- Simpler deployment (static files + API)
- Adequate for CRUD operations without complex state management

**Trade-offs Accepted**:
- More manual DOM manipulation code
- Less structured component architecture
- No built-in reactivity (manual DOM updates)
- More verbose code for complex interactions

**Simpler Alternative Rejected**: Using React/Vue per constitution was rejected due to user's explicit requirement for vanilla JavaScript, prioritizing simplicity over framework features.

#### ✅ Principle III: Test-First Development (NON-NEGOTIABLE) - COMPLIANT

- ✅ Database migration tests written before schema changes
- ✅ API contract tests written before endpoint implementation
- ✅ Integration tests for database-API workflows before feature implementation
- ✅ Red-Green-Refactor cycle enforced
- ⚠️  Frontend testing: Manual browser testing (vanilla JS limitation - no Jest/Vitest needed)

**Note**: Frontend testing will be manual due to vanilla JS approach. Backend will follow full TDD with pytest.

#### ✅ Principle IV: Data Integrity & Validation - COMPLIANT

- ✅ Input validation at UI (JavaScript), API (Flask), and database (MySQL constraints) layers
- ✅ CIOMS-I form structure and relationships preserved
- ✅ Data import/export with validation
- ✅ Audit logging for all modifications
- ✅ Transaction boundaries clearly defined

#### ✅ Principle V: Security & Access Control - COMPLIANT

- ✅ Authentication and authorization (session-based, simplest for vanilla JS)
- ✅ Role-based access control (admin vs. user roles)
- ✅ SQL injection prevention (parameterized queries via mysql-connector-python)
- ✅ HTTPS required for production
- ✅ Session management with timeout

#### ✅ Principle VI: Performance & Scalability - COMPLIANT

- ✅ Database queries optimized with indexing
- ✅ API response times <500ms target
- ✅ Bulk operations with progress feedback
- ✅ Connection pooling (MySQL connector pool)
- ✅ UI responsiveness with loading states

### Quality Gates

All constitution quality gates will be enforced:

1. **Tests Pass**: pytest for backend, manual testing for frontend
2. **Database Integrity**: Migration scripts tested, schema validated
3. **API Contract**: OpenAPI/Swagger documentation maintained
4. **Security Scan**: SQL injection prevention, XSS protection, HTTPS
5. **Code Review**: Focus on data integrity and error handling
6. **Performance**: Query optimization, proper indexing verified

## Project Structure

### Documentation (this feature)

```
specs/001-ui/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (technology decisions, MySQL best practices)
├── data-model.md        # Phase 1 output (CIOMS-I form structure)
├── quickstart.md        # Phase 1 output (setup and deployment guide)
├── contracts/           # Phase 1 output (API endpoint specifications)
│   ├── openapi.yaml     # OpenAPI 3.0 specification
│   ├── auth.md          # Authentication endpoints
│   ├── forms.md         # CIOMS-I form CRUD endpoints
│   ├── search.md        # Search and filtering endpoints
│   └── import.md        # Bulk import/export endpoints
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
backend/
├── src/
│   ├── models/
│   │   ├── __init__.py
│   │   ├── form.py              # CIOMS-I form model
│   │   ├── patient.py           # Patient information model
│   │   ├── adverse_reaction.py  # Adverse reaction model
│   │   ├── drug.py              # Suspected/concomitant drug models
│   │   ├── user.py              # User authentication model
│   │   ├── audit_log.py         # Audit trail model
│   │   └── import_job.py        # Bulk import job tracking
│   ├── api/
│   │   ├── __init__.py
│   │   ├── auth.py              # Authentication endpoints
│   │   ├── forms.py             # CIOMS-I form CRUD endpoints
│   │   ├── search.py            # Search endpoints
│   │   └── import_export.py     # Bulk operations endpoints
│   ├── services/
│   │   ├── __init__.py
│   │   ├── form_service.py      # Business logic for forms
│   │   ├── validation_service.py # Multi-layer validation
│   │   ├── import_service.py    # CSV import logic
│   │   └── auth_service.py      # Authentication logic
│   ├── db/
│   │   ├── __init__.py
│   │   ├── connection.py        # MySQL connection pool
│   │   └── migrations/          # SQL migration scripts
│   │       ├── 001_initial_schema.sql
│   │       ├── 002_audit_logs.sql
│   │       └── 003_indexes.sql
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── validators.py        # Input validation utilities
│   │   └── errors.py            # Custom exception classes
│   ├── config.py                # Configuration management
│   └── app.py                   # Flask application entry point
├── tests/
│   ├── contract/                # API contract tests
│   │   ├── test_auth_contract.py
│   │   ├── test_forms_contract.py
│   │   └── test_import_contract.py
│   ├── integration/             # Database-API integration tests
│   │   ├── test_form_crud.py
│   │   ├── test_search.py
│   │   └── test_bulk_import.py
│   └── unit/                    # Business logic unit tests
│       ├── test_validators.py
│       ├── test_form_service.py
│       └── test_import_service.py
├── requirements.txt             # Python dependencies
├── requirements-dev.txt         # Development dependencies
├── .env.example                 # Environment variable template
└── README.md                    # Backend setup instructions

frontend/
├── src/
│   ├── index.html               # Main application page
│   ├── login.html               # Login page
│   ├── css/
│   │   ├── main.css             # Global styles
│   │   ├── forms.css            # Form-specific styles
│   │   ├── components.css       # Reusable component styles
│   │   └── responsive.css       # Mobile/tablet breakpoints
│   ├── js/
│   │   ├── app.js               # Application initialization
│   │   ├── api.js               # API client wrapper
│   │   ├── auth.js              # Authentication logic
│   │   ├── forms/
│   │   │   ├── form-view.js     # CIOMS-I form display
│   │   │   ├── form-edit.js     # Form editing
│   │   │   └── form-list.js     # Form listing/search
│   │   ├── components/
│   │   │   ├── modal.js         # Reusable modal dialog
│   │   │   ├── toast.js         # Toast notifications
│   │   │   └── table.js         # Data table component
│   │   ├── utils/
│   │   │   ├── validators.js    # Client-side validation
│   │   │   ├── dom.js           # DOM manipulation helpers
│   │   │   └── formatters.js    # Data formatting utilities
│   │   └── import.js            # Bulk import UI logic
│   └── assets/
│       ├── icons/               # SVG icons
│       └── images/              # Images
├── README.md                    # Frontend setup instructions
└── .env.example                 # Frontend config template

database/
├── schema/
│   └── cioms_i_schema.sql       # Complete database schema
├── migrations/
│   └── (SQL migration scripts copied from backend/src/db/migrations/)
├── seed/
│   └── sample_data.sql          # Sample CIOMS-I forms for testing
└── docs/
    └── erd.md                   # Entity-relationship diagram

tests/
├── e2e/                         # End-to-end tests (manual test cases)
│   ├── test_plan.md             # E2E test scenarios
│   ├── login_workflow.md        # Login test cases
│   ├── form_crud_workflow.md    # CRUD operation test cases
│   └── import_workflow.md       # Import operation test cases
└── performance/
    └── load_test.md             # Performance test plan

docs/
├── api.md                       # API documentation (generated from OpenAPI)
├── setup.md                     # Installation and setup guide
├── user_guide.md                # End-user documentation
└── developer_guide.md           # Developer documentation
```

**Structure Decision**: Selected **Option 2: Web application** structure with backend/frontend separation. This aligns with the requirement for a web-based data entry system with clear separation between database access (backend) and user interface (frontend). The vanilla JavaScript approach eliminates need for build tools in frontend, keeping it as simple static HTML/CSS/JS files served by backend or separate web server.

**Key Directories**:
- `backend/src/models/`: MySQL database models reflecting CIOMS-I form structure
- `backend/src/api/`: Flask REST API endpoints
- `backend/src/services/`: Business logic layer separating API from database
- `frontend/src/js/`: Vanilla JavaScript modules (no bundler needed, ES6 modules)
- `database/`: SQL scripts for schema creation, migrations, and sample data
- `tests/`: Comprehensive test coverage following TDD principle

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Using MySQL instead of PostgreSQL | User explicitly requested MySQL for database ("DB는 MySQL을 사용함"). May be due to existing infrastructure, team familiarity, or deployment constraints. | PostgreSQL per constitution was rejected because: (1) User specific requirement for MySQL, (2) MySQL 8.0+ provides equivalent features (JSON, transactions, referential integrity), (3) Performance adequate for expected scale (100K records), (4) Migration path to PostgreSQL exists if needed later. |
| Using vanilla JavaScript instead of React/Vue/Svelte framework | User explicitly requested "Use vanilla HTML, CSS, and JavaScript as much as possible". Prioritizes simplicity, zero dependencies, and ease of maintenance over framework features. | Framework-based frontend per constitution was rejected because: (1) User explicit requirement for vanilla JS, (2) Eliminates build pipeline complexity, (3) Faster initial load (no framework bundle), (4) Simpler debugging for small teams, (5) CRUD operations don't require complex state management that frameworks excel at. Trade-off: More verbose DOM manipulation code accepted. |
