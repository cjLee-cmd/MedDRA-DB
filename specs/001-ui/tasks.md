---
description: "Task list for CIOMS-I Form Data Management Web UI implementation"
---

# Tasks: CIOMS-I Form Data Management Web UI

**Input**: Design documents from `/specs/001-ui/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), data-model.md, contracts/

**Tests**: Tests are REQUIRED per constitution Principle III (Test-First Development). All database migration tests, API contract tests, and integration tests MUST be written before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions
- **Web app**: `backend/src/`, `frontend/src/`
- Backend tests: `backend/tests/contract/`, `backend/tests/integration/`, `backend/tests/unit/`
- Database scripts: `backend/src/db/migrations/`
- Frontend manual test cases: `tests/e2e/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create backend directory structure per plan.md: backend/src/{models,api,services,db,utils}, backend/tests/{contract,integration,unit}
- [ ] T002 Create frontend directory structure per plan.md: frontend/src/{css,js/{forms,components,utils},assets}
- [ ] T003 Create database directory structure per plan.md: database/{schema,migrations,seed,docs}
- [ ] T004 [P] Initialize Python project in backend/ with requirements.txt (Flask 3.0+, mysql-connector-python 8.1+, python-dotenv 1.0+, Flask-CORS)
- [ ] T005 [P] Initialize backend testing dependencies in backend/requirements-dev.txt (pytest 7.4+, pytest-flask, pytest-cov, pytest-mock)
- [ ] T006 [P] Create backend/.env.example with database config template (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, SECRET_KEY, FLASK_ENV)
- [ ] T007 [P] Create frontend/.env.example with API base URL configuration
- [ ] T008 [P] Create backend/README.md with setup instructions from quickstart.md
- [ ] T009 [P] Create frontend/README.md with setup instructions from quickstart.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Foundation

- [ ] T010 Write migration test in backend/tests/integration/test_001_initial_schema.py that verifies all 9 tables created with correct columns and constraints
- [ ] T011 Create backend/src/db/migrations/001_initial_schema.sql with complete schema from data-model.md (forms, patient_info, adverse_reactions, suspected_drugs, causality_assessment, lab_results, users, audit_logs, import_jobs)
- [ ] T012 Write migration test in backend/tests/integration/test_002_audit_logs.py that verifies audit logging triggers work correctly
- [ ] T013 Create backend/src/db/migrations/002_audit_logs.sql with audit logging setup
- [ ] T014 Write migration test in backend/tests/integration/test_003_indexes.py that verifies all indexes created and query performance meets <2s requirement
- [ ] T015 Create backend/src/db/migrations/003_indexes.sql with all indexes from data-model.md
- [ ] T016 Create database/schema/cioms_i_schema.sql combining all migrations for reference
- [ ] T017 Create database/seed/sample_data.sql with 5-10 sample CIOMS-I forms for testing based on CIOMS-I-Form_example JSON
- [ ] T018 [P] Implement backend/src/db/connection.py with MySQL connection pool configuration (pool_size=10, utf8mb4 charset)
- [ ] T019 [P] Implement backend/src/db/__init__.py with get_connection(), close_connection(), and transaction context manager functions

### Backend API Foundation

- [ ] T020 [P] Implement backend/src/utils/errors.py with custom exception classes (ValidationError, NotFoundError, DatabaseError, AuthenticationError, AuthorizationError)
- [ ] T021 [P] Implement backend/src/config.py loading environment variables and providing configuration constants
- [ ] T022 Write contract test in backend/tests/contract/test_auth_contract.py for POST /api/auth/login endpoint (test correct credentials, incorrect credentials, missing fields)
- [ ] T023 Implement backend/src/api/auth.py with login, logout, and get current user endpoints per contracts/auth.md
- [ ] T024 [P] Implement backend/src/services/auth_service.py with password hashing (bcrypt), session management, and user validation
- [ ] T025 [P] Implement backend/src/models/user.py with User model and database operations (create, find_by_username, find_by_id, update_last_login)
- [ ] T026 Write integration test in backend/tests/integration/test_auth_integration.py testing full login flow (database → service → API → session creation)
- [ ] T027 Implement backend/src/app.py Flask application with CORS configuration, error handlers, session management, and blueprint registration
- [ ] T028 [P] Create backend/src/utils/validators.py with input validation functions (validate_email, validate_username, validate_date, validate_required_fields)

### Frontend Foundation

- [ ] T029 [P] Create frontend/src/css/main.css with global styles, CSS variables for theming, and base typography
- [ ] T030 [P] Create frontend/src/css/responsive.css with mobile/tablet breakpoints (min-width: 768px)
- [ ] T031 [P] Create frontend/src/css/components.css with reusable component styles (buttons, inputs, cards, tables)
- [ ] T032 [P] Create frontend/src/js/api.js with fetch wrapper functions (get, post, put, delete) handling JSON, errors, and authentication
- [ ] T033 [P] Create frontend/src/js/utils/dom.js with DOM manipulation helpers (createElement, setText, setHTML, show, hide, toggleClass)
- [ ] T034 [P] Create frontend/src/js/utils/validators.js with client-side validation functions matching backend validators
- [ ] T035 [P] Create frontend/src/js/utils/formatters.js with data formatting utilities (formatDate, formatAge, formatDrugName)
- [ ] T036 [P] Create frontend/src/js/components/toast.js with toast notification component for success/error messages
- [ ] T037 [P] Create frontend/src/js/components/modal.js with reusable modal dialog component
- [ ] T038 [P] Create frontend/src/js/components/table.js with data table component supporting pagination and sorting
- [ ] T039 Create frontend/src/login.html with login form UI and validation
- [ ] T040 Implement frontend/src/js/auth.js with login/logout logic, session management, and redirect handling
- [ ] T041 Create frontend/src/index.html with main application shell (header, navigation, content area)
- [ ] T042 Implement frontend/src/js/app.js with application initialization, routing, and authentication check

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Database Schema Setup & Migration (Priority: P1) 🎯 MVP

**Goal**: Create MySQL database with complete CIOMS-I form schema, migrations, and verification

**Independent Test**: Run migration scripts and verify all tables, relationships, constraints, and indexes are created successfully. Insert sample data and verify CIOMS-I form structure is correctly represented.

### Tests for User Story 1 (TDD Required) ⚠️

**NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T043 [P] [US1] Write schema validation test in backend/tests/integration/test_schema_validation.py verifying all 9 tables exist with correct structure
- [ ] T044 [P] [US1] Write referential integrity test in backend/tests/integration/test_referential_integrity.py verifying foreign key constraints and CASCADE deletes
- [ ] T045 [P] [US1] Write constraint test in backend/tests/integration/test_constraints.py verifying UNIQUE constraints, NOT NULL, and ENUM values

### Implementation for User Story 1

- [ ] T046 [US1] Create backend/src/db/migrate.py script to execute migrations in order with rollback capability and migration tracking
- [ ] T047 [US1] Create backend/src/db/seed.py script to load sample_data.sql with --create-admin flag for initial user creation
- [ ] T048 [US1] Update database/docs/erd.md with Entity-Relationship Diagram documentation in Markdown format
- [ ] T049 [US1] Create database/migrations/rollback/ directory with rollback scripts for each migration
- [ ] T050 [US1] Test all migrations execute successfully on clean MySQL 8.0 database and verify sample data loads correctly

**Checkpoint**: At this point, database schema is fully functional and testable independently with sample CIOMS-I data

---

## Phase 4: User Story 2 - Browse & Search CIOMS-I Forms (Priority: P2)

**Goal**: Web interface for browsing and searching CIOMS-I adverse event forms with read-only access

**Independent Test**: Access web UI, perform searches by control number or patient info, verify results display with bilingual data and all form sections

### Tests for User Story 2 (TDD Required) ⚠️

- [ ] T051 [P] [US2] Write contract test in backend/tests/contract/test_forms_list_contract.py for GET /api/forms with pagination
- [ ] T052 [P] [US2] Write contract test in backend/tests/contract/test_forms_get_contract.py for GET /api/forms/{id} returning complete form with all related entities
- [ ] T053 [P] [US2] Write contract test in backend/tests/contract/test_search_contract.py for GET /api/search/forms with filtering parameters
- [ ] T054 [P] [US2] Write integration test in backend/tests/integration/test_form_retrieval.py testing complete form fetch with all 1:1 and 1:N relationships

### Implementation for User Story 2

- [ ] T055 [P] [US2] Implement backend/src/models/form.py with Form model (get_all, get_by_id, get_by_control_no, search methods)
- [ ] T056 [P] [US2] Implement backend/src/models/patient.py with PatientInfo model (get_by_form_id method)
- [ ] T057 [P] [US2] Implement backend/src/models/adverse_reaction.py with AdverseReaction model (get_by_form_id method)
- [ ] T058 [P] [US2] Implement backend/src/models/drug.py with SuspectedDrug model (get_by_form_id, filter by is_suspected methods)
- [ ] T059 [P] [US2] Implement backend/src/models/causality_assessment.py with CausalityAssessment model (get_by_form_id method)
- [ ] T060 [P] [US2] Implement backend/src/models/lab_result.py with LabResult model (get_by_form_id method)
- [ ] T061 [US2] Implement backend/src/services/form_service.py with get_all_forms, get_form_by_id, search_forms business logic assembling complete form objects
- [ ] T062 [US2] Implement backend/src/api/forms.py with GET /api/forms and GET /api/forms/{id} endpoints per contracts/forms.md
- [ ] T063 [US2] Implement backend/src/api/search.py with GET /api/search/forms endpoint per contracts/search.md
- [ ] T064 [P] [US2] Create frontend/src/css/forms.css with CIOMS-I form display styles (sections, bilingual fields, hierarchical data)
- [ ] T065 [P] [US2] Implement frontend/src/js/forms/form-view.js with FormView class rendering complete CIOMS-I form (all sections: patient, reactions, drugs, causality, lab results)
- [ ] T066 [US2] Implement frontend/src/js/forms/form-list.js with FormList class displaying paginated form list with search functionality
- [ ] T067 [US2] Create manual E2E test case in tests/e2e/form_browse_workflow.md documenting search and view scenarios
- [ ] T068 [US2] Integrate form browsing into frontend/src/index.html and frontend/src/js/app.js with proper routing

**Checkpoint**: At this point, users can browse and search all CIOMS-I forms through web interface with complete data display

---

## Phase 5: User Story 3 - Add New CIOMS-I Forms (Priority: P3)

**Goal**: Data entry interface for creating new CIOMS-I adverse event reports with validation

**Independent Test**: Access data entry form, submit new CIOMS-I form with all required sections (patient, reactions, drugs), verify data is persisted and appears in search

### Tests for User Story 3 (TDD Required) ⚠️

- [ ] T069 [P] [US3] Write contract test in backend/tests/contract/test_forms_create_contract.py for POST /api/forms with valid and invalid data
- [ ] T070 [P] [US3] Write contract test verifying duplicate manufacturer_control_no returns 409 Conflict
- [ ] T071 [P] [US3] Write integration test in backend/tests/integration/test_form_creation.py verifying transaction creates form + all related entities atomically
- [ ] T072 [P] [US3] Write validation test in backend/tests/unit/test_form_validation.py for all validation rules from data-model.md

### Implementation for User Story 3

- [ ] T073 [P] [US3] Add create method to backend/src/models/form.py with transaction support
- [ ] T074 [P] [US3] Add create method to backend/src/models/patient.py
- [ ] T075 [P] [US3] Add create method to backend/src/models/adverse_reaction.py with sequence number handling
- [ ] T076 [P] [US3] Add create method to backend/src/models/drug.py with is_suspected flag handling
- [ ] T077 [P] [US3] Add create method to backend/src/models/causality_assessment.py with JSON data handling
- [ ] T078 [P] [US3] Add create method to backend/src/models/lab_result.py
- [ ] T079 [US3] Implement backend/src/services/validation_service.py with comprehensive validation (required fields, format validation, business rules, bilingual data)
- [ ] T080 [US3] Add create_form method to backend/src/services/form_service.py orchestrating transaction for form + all related entities with rollback on error
- [ ] T081 [US3] Add POST /api/forms endpoint to backend/src/api/forms.py per contracts/forms.md with validation and error handling
- [ ] T082 [US3] Implement frontend/src/js/forms/form-edit.js with FormEdit class rendering data entry form for all CIOMS-I sections
- [ ] T083 [US3] Add dynamic form sections in form-edit.js (add/remove adverse reactions, add/remove suspected drugs, add/remove concomitant drugs, add/remove lab results)
- [ ] T084 [US3] Add client-side validation to form-edit.js calling validators.js before submission
- [ ] T085 [US3] Add form submission logic to form-edit.js with loading state, error display, and success redirect
- [ ] T086 [US3] Create manual E2E test case in tests/e2e/form_crud_workflow.md documenting create scenarios with valid/invalid data
- [ ] T087 [US3] Integrate form creation into frontend/src/index.html with "Add New Form" button and routing

**Checkpoint**: At this point, users can create new CIOMS-I forms with complete validation and data persistence

---

## Phase 6: User Story 4 - Edit & Update Existing Forms (Priority: P4)

**Goal**: Update existing CIOMS-I forms while maintaining data integrity and audit trail

**Independent Test**: Select existing form, modify attributes (patient info, add/remove reactions/drugs), save changes, verify updates reflected and audit log created

### Tests for User Story 4 (TDD Required) ⚠️

- [ ] T088 [P] [US4] Write contract test in backend/tests/contract/test_forms_update_contract.py for PUT /api/forms/{id}
- [ ] T089 [P] [US4] Write integration test in backend/tests/integration/test_form_update.py verifying transaction updates form + related entities with audit log creation
- [ ] T090 [P] [US4] Write audit log test in backend/tests/integration/test_audit_logging.py verifying old_values and new_values are correctly captured

### Implementation for User Story 4

- [ ] T091 [P] [US4] Add update method to backend/src/models/form.py
- [ ] T092 [P] [US4] Add update method to backend/src/models/patient.py
- [ ] T093 [P] [US4] Add update, delete methods to backend/src/models/adverse_reaction.py for managing dynamic lists
- [ ] T094 [P] [US4] Add update, delete methods to backend/src/models/drug.py
- [ ] T095 [P] [US4] Add update method to backend/src/models/causality_assessment.py
- [ ] T096 [P] [US4] Add update, delete methods to backend/src/models/lab_result.py
- [ ] T097 [P] [US4] Implement backend/src/models/audit_log.py with create_audit_log method capturing user_id, table_name, record_id, action, old_values, new_values, IP address
- [ ] T098 [US4] Add update_form method to backend/src/services/form_service.py with transaction, audit logging, and handling of added/updated/deleted child entities
- [ ] T099 [US4] Add PUT /api/forms/{id} endpoint to backend/src/api/forms.py per contracts/forms.md
- [ ] T100 [US4] Extend frontend/src/js/forms/form-edit.js to support edit mode (load existing data, track changes, show confirmation dialog)
- [ ] T101 [US4] Add change tracking to form-edit.js to enable/disable save button and show unsaved changes warning
- [ ] T102 [US4] Create manual E2E test case in tests/e2e/form_crud_workflow.md documenting update scenarios including concurrent edit handling
- [ ] T103 [US4] Add "Edit" button to form-view.js and integrate with form-edit.js

**Checkpoint**: At this point, all CIOMS-I forms can be updated with full audit trail and data integrity maintained

---

## Phase 7: User Story 5 - Bulk Data Import (Priority: P5)

**Goal**: CSV import functionality for efficiently populating database with CIOMS-I forms

**Independent Test**: Upload CSV file with CIOMS-I data, monitor import progress, verify successful records created and error report generated for failures

### Tests for User Story 5 (TDD Required) ⚠️

- [ ] T104 [P] [US5] Write contract test in backend/tests/contract/test_import_contract.py for POST /api/import/upload and GET /api/import/jobs/{id}
- [ ] T105 [P] [US5] Write integration test in backend/tests/integration/test_bulk_import.py with sample CSV (valid records, invalid records, duplicate control numbers)
- [ ] T106 [P] [US5] Write unit test in backend/tests/unit/test_import_validation.py for CSV parsing and validation logic

### Implementation for User Story 5

- [ ] T107 [P] [US5] Implement backend/src/models/import_job.py with create, update_status, update_progress, get_by_id methods
- [ ] T108 [US5] Implement backend/src/services/import_service.py with parse_csv, validate_row, import_batch functions handling bilingual data
- [ ] T109 [US5] Add background job support to import_service.py for processing large files (threading or multiprocessing)
- [ ] T110 [US5] Implement backend/src/api/import_export.py with POST /api/import/upload and GET /api/import/jobs endpoints per contracts/import.md
- [ ] T111 [US5] Add file upload handling to import_export.py (multipart/form-data, file validation, UTF-8 encoding check)
- [ ] T112 [US5] Add GET /api/export/forms endpoint to import_export.py for CSV export per contracts/import.md
- [ ] T113 [US5] Implement frontend/src/js/import.js with file upload UI, progress monitoring, and error display
- [ ] T114 [US5] Add CSV export functionality to frontend/src/js/forms/form-list.js with "Export to CSV" button
- [ ] T115 [US5] Create sample CSV template in database/seed/import_template.csv documenting required columns and format
- [ ] T116 [US5] Create manual E2E test case in tests/e2e/import_workflow.md documenting import scenarios (valid file, invalid file, partial success)
- [ ] T117 [US5] Integrate import/export functionality into frontend/src/index.html with navigation and routing

**Checkpoint**: All user stories now complete - full CIOMS-I form lifecycle supported (create, read, update, import)

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final quality gates

- [ ] T118 [P] Add DELETE /api/forms/{id} endpoint to backend/src/api/forms.py (admin only) with audit logging
- [ ] T119 [P] Implement backend/src/services/auth_service.py role-based access control (admin vs user permissions)
- [ ] T120 [P] Create docs/api.md from OpenAPI specification documenting all endpoints
- [ ] T121 [P] Create docs/setup.md with detailed installation instructions for MySQL, Python, and deployment
- [ ] T122 [P] Create docs/user_guide.md with screenshots and step-by-step usage instructions
- [ ] T123 [P] Create docs/developer_guide.md with architecture overview and development workflow
- [ ] T124 [P] Add error handling middleware to backend/src/app.py for consistent error responses
- [ ] T125 [P] Add request logging middleware to backend/src/app.py
- [ ] T126 [P] Add performance monitoring to backend/src/app.py (request timing, slow query detection)
- [ ] T127 [P] Optimize database queries in all models (add missing indexes, use SELECT specific columns, batch operations)
- [ ] T128 [P] Add loading states and spinners to all frontend API calls in app.js and form modules
- [ ] T129 [P] Add form auto-save functionality to frontend/src/js/forms/form-edit.js (save draft every 30 seconds)
- [ ] T130 [P] Add keyboard shortcuts to frontend (Ctrl+S to save, Esc to close modals, etc.)
- [ ] T131 [P] Add accessibility features (ARIA labels, keyboard navigation, screen reader support) to all frontend components
- [ ] T132 Run full backend test suite (pytest backend/tests/) and ensure 80%+ coverage
- [ ] T133 Run security scan on backend (check for SQL injection, XSS, CSRF vulnerabilities)
- [ ] T134 Run performance test with 50 concurrent users and verify <500ms API response times
- [ ] T135 Validate quickstart.md by following setup instructions on clean system
- [ ] T136 Create deployment checklist in docs/deployment.md (Gunicorn, nginx, HTTPS, environment variables)
- [ ] T137 Update README.md files in backend/ and frontend/ with final setup instructions and troubleshooting

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4 → P5)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories (uses read-only models)
- **User Story 3 (P3)**: Depends on User Story 2 models being implemented - Can share model files
- **User Story 4 (P4)**: Depends on User Story 3 create methods - Extends models with update/delete
- **User Story 5 (P5)**: Depends on User Story 3 create methods - Reuses form creation logic for bulk import

### Within Each User Story

- Tests (TDD required) MUST be written and FAIL before implementation
- Models before services
- Services before API endpoints
- API endpoints before frontend
- Frontend components before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes:
  - User Story 1 (database) can proceed independently
  - User Story 2 (browse/search) can start after US1 models created OR in parallel with different developers
  - Models within each story marked [P] can be implemented in parallel
- All tests for a user story marked [P] can be written in parallel
- All Polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 2

```bash
# After Foundational phase complete, launch all models for User Story 2 together:
Task: "Implement backend/src/models/form.py with Form model"
Task: "Implement backend/src/models/patient.py with PatientInfo model"
Task: "Implement backend/src/models/adverse_reaction.py with AdverseReaction model"
Task: "Implement backend/src/models/drug.py with SuspectedDrug model"
Task: "Implement backend/src/models/causality_assessment.py with CausalityAssessment model"
Task: "Implement backend/src/models/lab_result.py with LabResult model"

# Then launch form_service.py (depends on all models above)
Task: "Implement backend/src/services/form_service.py with get_all_forms, get_form_by_id, search_forms business logic"

# Then launch API endpoints and frontend in parallel:
Task: "Implement backend/src/api/forms.py with GET endpoints"
Task: "Create frontend/src/js/forms/form-view.js with FormView class"
Task: "Implement frontend/src/js/forms/form-list.js with FormList class"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Database Schema)
4. **STOP and VALIDATE**: Verify database schema with sample data
5. Deploy/demo if ready (database foundation established)

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Database) → Test schema → Validate (MVP!)
3. Add User Story 2 (Browse/Search) → Test search → Deploy/Demo
4. Add User Story 3 (Add Forms) → Test create → Deploy/Demo
5. Add User Story 4 (Edit Forms) → Test update → Deploy/Demo
6. Add User Story 5 (Import) → Test bulk → Deploy/Demo
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Database)
   - Developer B: User Story 2 models (can start in parallel)
   - Developer C: Frontend foundation components
3. After US1 complete:
   - Developer A: Move to User Story 3 or 5
   - Developer B: Complete User Story 2 API + frontend
   - Developer C: User Story 4 or Polish tasks
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- **TDD REQUIRED**: Verify tests fail before implementing per constitution Principle III
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All file paths are exact locations per plan.md project structure
- Bilingual (Korean/English) support required in all form-related components
- UTF-8 encoding must be enforced at database, API, and frontend levels

---

## Task Count Summary

- **Phase 1 (Setup)**: 9 tasks
- **Phase 2 (Foundational)**: 33 tasks (includes TDD tests)
- **Phase 3 (US1 - Database Schema)**: 8 tasks (includes TDD tests)
- **Phase 4 (US2 - Browse/Search)**: 18 tasks (includes TDD tests)
- **Phase 5 (US3 - Add Forms)**: 19 tasks (includes TDD tests)
- **Phase 6 (US4 - Edit/Update)**: 16 tasks (includes TDD tests)
- **Phase 7 (US5 - Bulk Import)**: 14 tasks (includes TDD tests)
- **Phase 8 (Polish)**: 20 tasks
- **Total**: 137 tasks

### Parallel Opportunities

- **Setup Phase**: 6 parallel tasks
- **Foundational Phase**: 19 parallel tasks
- **User Story 2**: 9 parallel tasks (models)
- **User Story 3**: 6 parallel tasks (models)
- **User Story 4**: 6 parallel tasks (models)
- **User Story 5**: 4 parallel tasks
- **Polish Phase**: 14 parallel tasks
- **Total Parallel**: ~64 tasks (47% can be parallelized)

### Independent Test Criteria

- **US1**: Run migrations, verify 9 tables created, insert sample data, query CIOMS-I form structure
- **US2**: Search forms by control number, view complete form with all sections (patient, reactions, drugs, causality, lab results)
- **US3**: Create new CIOMS-I form with bilingual data, verify persistence, check appears in search
- **US4**: Edit existing form, modify patient info and reactions, verify audit log created with old/new values
- **US5**: Upload CSV with 100 CIOMS-I forms, monitor progress, verify 95+ imported successfully with error report for failures

### Suggested MVP Scope

**Minimum Viable Product**: Phases 1-3 (Setup + Foundational + User Story 1)

**Reasoning**: Delivers functional CIOMS-I database schema with sample data, migration scripts, and verification tests. Provides foundation for all subsequent features.

**Extended MVP**: Add Phase 4 (User Story 2) for browse/search capability, enabling users to view CIOMS-I adverse event data through web interface.

**Full Feature Set**: All phases (1-8) for complete CIOMS-I form lifecycle management including create, read, update, and bulk import with audit trail.
