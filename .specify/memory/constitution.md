<!--
Sync Impact Report:
Version: 2.0.0 (Static Web Architecture)
Ratification Date: 2025-10-15
Last Amendment: 2025-10-15

Modified Principles:
- MAJOR: Changed from 3-tier (DB → API → Frontend) to static architecture (Frontend → IndexedDB)
- MAJOR: Removed backend database requirements (PostgreSQL/MySQL)
- MAJOR: Updated testing approach for client-side only architecture

Added Sections:
- Client-Side Data Management principle
- GitHub Pages deployment standards

Removed Sections:
- Backend API layer requirements
- Server-side database requirements

Templates Status:
✅ plan-template.md - Constitution Check section aligned with static architecture
✅ spec-template.md - Requirements sections aligned with client-side data management
✅ tasks-template.md - Task structure supports client-side only development

Follow-up TODOs: Update existing implementation to remove Flask/MySQL dependencies
-->

# CIOMS-I Form Management System Constitution

## Core Principles

### I. Client-Side Data Management Architecture

The project MUST prioritize browser-based data storage and integrity as the foundation of all functionality:

- IndexedDB serves as the primary client-side database for all CIOMS-I form data
- Data schema MUST be versioned with migration support using IndexedDB version management
- All data operations MUST be transactional with proper error handling
- Data models MUST enforce referential integrity at the application level
- Database access layer MUST be abstracted for testability and maintainability
- Data export/import via JSON/CSV to enable backup and data portability

**Rationale**: GitHub Pages deployment requires static-only hosting. IndexedDB provides robust client-side storage with transaction support, enabling full CRUD operations without server infrastructure. Data portability through export/import ensures users maintain control of their data.

### II. Static Web UI Standards

The web-based data entry interface MUST follow modern static web development standards:

- Vanilla HTML5, CSS3, and JavaScript ES6+ (no build pipeline required)
- Component-based architecture using ES6 modules
- No server-side frameworks - pure client-side rendering
- Responsive design supporting desktop and tablet devices (minimum 768px width)
- Accessible UI following WCAG 2.1 AA standards minimum
- Form validation at client level with comprehensive error messages
- Progressive Web App (PWA) capabilities for offline usage

**Rationale**: Static deployment on GitHub Pages eliminates infrastructure costs and complexity. Vanilla JavaScript ensures maximum compatibility, no build step, and fast initial load. PWA features enable offline functionality essential for field data entry.

### III. Test-First Development (ADAPTED FOR CLIENT-SIDE)

Testing methodology MUST be followed for all data management and UI development:

- IndexedDB schema tests written BEFORE data model implementation
- Data validation tests written BEFORE form implementation
- Integration tests for data workflows written BEFORE feature implementation
- Manual browser testing documented with test cases and screenshots
- Red-Green-Refactor cycle enforced where automated testing is practical
- Tests MUST fail before implementation begins

**Rationale**: While automated testing for vanilla JavaScript is more challenging than framework-based development, test-first thinking prevents regressions and ensures specification compliance. Manual testing documentation provides verification trail.

### IV. Data Integrity & Validation

All data operations MUST enforce strict validation and integrity rules:

- Input validation at UI level with comprehensive error messaging
- CIOMS-I form structure and relationships MUST be preserved in IndexedDB schema
- Data import/export functionality with validation and error reporting (JSON/CSV)
- Audit logging for all data modifications stored in IndexedDB
- Transaction boundaries clearly defined using IndexedDB transactions
- Data backup/restore through export/import functionality

**Rationale**: CIOMS-I adverse event data has complex hierarchical relationships that must be maintained. Client-side validation prevents data corruption. Export/import enables data portability and disaster recovery.

### V. Security & Data Privacy

Security MUST be implemented at the client layer:

- Data stored locally in user's browser only (no server transmission)
- Session management using browser sessionStorage for UI state
- XSS prevention through proper DOM manipulation and input sanitization
- HTTPS enforced by GitHub Pages for secure content delivery
- No sensitive authentication required (single-user browser storage)
- Clear data privacy notice: data never leaves user's browser
- Export encryption option for sensitive data backup

**Rationale**: Browser-based storage eliminates server-side security concerns. All data remains on user's device, providing inherent privacy. GitHub Pages provides HTTPS automatically.

### VI. Performance & User Experience

The system MUST meet performance requirements for client-side operation:

- IndexedDB queries optimized with proper indexing
- UI interactions <100ms response time for standard operations
- Large dataset operations (1000+ records) with progress feedback
- Lazy loading and pagination for large lists
- UI responsiveness with loading states and optimistic updates
- Local caching strategies to minimize IndexedDB access

**Rationale**: Client-side applications must feel responsive to maintain user productivity. IndexedDB provides excellent performance for 10,000+ records when properly indexed.

## Development Workflow

### Code Organization

- **Frontend**: UI components, forms, validation, IndexedDB wrapper
- **Data Layer**: IndexedDB schema, data access objects, migration logic
- **Tests**: Manual test cases, browser compatibility testing, data validation tests
- **Documentation**: API documentation (IndexedDB schema), user guides, data model documentation

### Quality Gates

All code MUST pass these gates before merge:

1. **Manual Tests Pass**: All test cases executed in target browsers with screenshots
2. **Data Integrity**: IndexedDB schema validated, migrations tested
3. **Browser Compatibility**: Tested in Chrome, Firefox, Safari, Edge (latest versions)
4. **Security Scan**: No XSS vulnerabilities, input sanitization verified
5. **Code Review**: Peer review focusing on data integrity and error handling
6. **Performance**: No UI blocking operations, IndexedDB queries indexed properly

### Technology Stack Requirements

- **Database**: IndexedDB (browser native, no installation required)
- **Frontend**: Vanilla HTML5, CSS3, JavaScript ES6+ (no frameworks)
- **Testing**: Manual browser testing with documented test cases, Chrome DevTools
- **Deployment**: GitHub Pages (static hosting)
- **Documentation**: Markdown for all documentation

## GitHub Pages Deployment

### Deployment Requirements

- All files MUST be static (HTML, CSS, JavaScript, assets)
- No server-side processing or database connections
- Repository structure optimized for GitHub Pages
- Custom domain support (optional)
- HTTPS enforced automatically by GitHub Pages

### Repository Structure

```
/
├── index.html              # Main application entry
├── login.html             # (Optional) Simple user identification
├── css/                   # Stylesheets
├── js/                    # JavaScript modules
│   ├── db/               # IndexedDB wrapper and schema
│   ├── models/           # Data models
│   ├── components/       # UI components
│   └── utils/            # Utilities
├── assets/               # Images, icons
└── README.md             # User documentation
```

## Governance

### Amendment Process

Constitution amendments require:

1. Written proposal with rationale and impact analysis
2. Review of affected templates and documentation
3. Migration plan for existing code if principles change
4. Version increment following semantic versioning

### Versioning Policy

- **MAJOR**: Breaking changes to core principles (e.g., changing from IndexedDB to different storage)
- **MINOR**: New principle added or existing principle expanded
- **PATCH**: Clarifications, wording improvements, non-semantic changes

### Compliance Verification

- All development MUST verify compliance with constitution principles
- Complex architectural decisions MUST reference relevant principles
- Violations require explicit justification in Complexity Tracking section of plan.md
- Constitution supersedes convenience but can be amended through proper process

### Complexity Justification

If a design decision violates constitution principles:

1. Document the specific principle violation
2. Explain why the violation is necessary
3. Describe simpler alternatives considered and rejected
4. Get explicit approval before proceeding

**Version**: 2.0.0 | **Ratified**: 2025-10-15 | **Last Amended**: 2025-10-15
