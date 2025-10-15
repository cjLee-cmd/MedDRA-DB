# Phase 0: Technology Research & Decisions

**Feature**: CIOMS-I Form Data Management Web UI
**Date**: 2025-10-15
**Status**: Complete

## Overview

This document consolidates research findings and technology decisions for implementing a web-based CIOMS-I (Council for International Organizations of Medical Sciences) adverse event reporting system. Key decisions include using MySQL for database, vanilla JavaScript for frontend, and Flask for backend API.

## Key Technology Decisions

### Decision 1: MySQL 8.0+ as Database Engine

**What was chosen**: MySQL 8.0+ Community Edition

**Rationale**:
- User explicitly requested MySQL ("DB는 MySQL을 사용함")
- MySQL 8.0+ provides all required features:
  - JSON column type for flexible data storage
  - Full transaction support with ACID compliance
  - Referential integrity with foreign key constraints
  - Excellent performance for expected scale (100,000 records)
  - Strong community support and extensive documentation
- Simpler deployment in many environments compared to PostgreSQL
- Wide compatibility with hosting providers
- Native support for UTF-8 encoding (critical for Korean/English bilingual data)

**Alternatives Considered**:
1. **PostgreSQL 14+**: Constitution-specified database
   - **Pros**: More advanced features (better JSON support, window functions), stricter SQL standards compliance
   - **Cons**: User specifically requested MySQL, slightly more complex setup
   - **Rejected because**: User requirement takes precedence; MySQL provides adequate features for this use case

2. **SQLite**:
   - **Pros**: Zero configuration, embedded database, perfect for testing
   - **Cons**: Poor concurrency (write locks entire database), no user management, not suitable for 50 concurrent users
   - **Rejected because**: Cannot meet multi-user concurrency requirements

3. **MariaDB 10.6+**:
   - **Pros**: MySQL-compatible with additional features, fully open source
   - **Cons**: Less familiar to most teams, fewer hosting options
   - **Rejected because**: MySQL more widely known and supported; MariaDB advantages not needed

**Best Practices for MySQL in this Context**:
- Use InnoDB storage engine (default in MySQL 8.0+) for transaction support and foreign keys
- Enable `utf8mb4` character set for full Unicode support including emojis
- Configure connection pooling (mysql-connector-python pooling feature)
- Use prepared statements exclusively to prevent SQL injection
- Index foreign keys and frequently searched columns (form ID, patient initials, dates)
- Set appropriate isolation level (READ COMMITTED for balance of consistency and performance)
- Regular backups using mysqldump or MySQL Enterprise Backup
- Monitor slow query log and optimize queries exceeding 200ms

### Decision 2: Vanilla HTML/CSS/JavaScript for Frontend

**What was chosen**: Vanilla JavaScript (ES6+), HTML5, CSS3 with no frameworks or build tools

**Rationale**:
- User explicitly requested "Use vanilla HTML, CSS, and JavaScript as much as possible"
- Benefits for this project:
  - Zero build pipeline complexity (no webpack, vite, rollup)
  - No framework dependencies to update or manage
  - Faster initial page load (no framework bundle to download)
  - Simpler debugging with browser dev tools
  - Easier for developers unfamiliar with modern frameworks
  - Adequate for CRUD operations without complex state management
  - Direct DOM manipulation is straightforward for forms and tables
- Modern JavaScript features (ES6 modules, fetch API, async/await) provide good DX
- CSS Grid and Flexbox eliminate need for CSS frameworks

**Alternatives Considered**:
1. **React**:
   - **Pros**: Component reusability, large ecosystem, virtual DOM performance, extensive documentation
   - **Cons**: Build pipeline required, larger bundle size, steeper learning curve, overkill for simple CRUD
   - **Rejected because**: User requirement for vanilla JS; complexity not justified for straightforward forms

2. **Vue.js**:
   - **Pros**: Progressive framework, can use without build step, gentle learning curve, good documentation
   - **Cons**: Still adds framework dependency and concepts, bundle size overhead
   - **Rejected because**: Even lightweight frameworks violate user's "as vanilla as possible" requirement

3. **Svelte**:
   - **Pros**: Compiles to vanilla JS, smallest bundle size, excellent performance, great DX
   - **Cons**: Requires build step (defeats vanilla requirement), smaller ecosystem
   - **Rejected because**: Build step requirement conflicts with vanilla JS goal

**Best Practices for Vanilla JavaScript**:
- Use ES6 modules for code organization (`import`/`export`)
- Create reusable "components" as functions that return DOM elements
- Use template literals for HTML generation
- Implement simple state management with JavaScript objects and observer pattern
- Leverage `fetch` API for AJAX requests
- Use `async`/`await` for cleaner asynchronous code
- Implement client-side validation before API calls
- Use CSS custom properties (CSS variables) for theming
- Follow semantic HTML for accessibility (proper heading hierarchy, form labels, ARIA attributes)
- Implement progressive enhancement (works without JavaScript, enhanced with it)

**Code Organization Pattern**:
```javascript
// Vanilla JS module pattern
export class FormView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.data = null;
  }

  async render(formId) {
    this.data = await api.getForm(formId);
    this.container.innerHTML = this.template(this.data);
    this.attachEventListeners();
  }

  template(data) {
    return `<div class="form-view">...</div>`;
  }

  attachEventListeners() {
    // DOM event binding
  }
}
```

### Decision 3: Flask 3.0+ for Backend API

**What was chosen**: Flask 3.0+ with minimal extensions (Flask-CORS, python-dotenv)

**Rationale**:
- Lightweight Python web framework perfect for REST APIs
- Minimal dependencies align with project's simplicity goal
- Easy to learn and maintain
- Excellent documentation and community support
- Built-in development server for easy testing
- Compatible with WSGI servers (Gunicorn, uWSGI) for production
- Flask ecosystem provides what we need without bloat:
  - `flask-cors` for CORS handling (frontend/backend separation)
  - `python-dotenv` for environment variable management
  - Native support for JSON responses

**Alternatives Considered**:
1. **FastAPI**:
   - **Pros**: Auto-generated OpenAPI docs, async support, type hints validation, modern Python features
   - **Cons**: Requires understanding of async/await, Pydantic models add complexity, less mature ecosystem
   - **Rejected because**: Simpler Flask adequate for expected load; synchronous code easier to debug and maintain

2. **Django + Django REST Framework**:
   - **Pros**: Full-featured ORM, admin panel, built-in authentication, comprehensive ecosystem
   - **Cons**: Heavy framework with many unused features, opinionated structure, steeper learning curve
   - **Rejected because**: Too much overhead for API-only backend; Flask's simplicity better matches project goals

3. **Bottle**:
   - **Pros**: Single file framework, extremely lightweight, no dependencies
   - **Cons**: Too minimal (missing features like blueprints), smaller community, less documentation
   - **Rejected because**: Flask provides better balance of simplicity and features

**Best Practices for Flask API**:
- Use Flask Blueprints for route organization (`auth`, `forms`, `import`)
- Implement service layer pattern (routes → services → models)
- Use `@app.errorhandler` for consistent error responses
- Return proper HTTP status codes (200, 201, 400, 401, 404, 500)
- Implement request validation in service layer
- Use Flask's `jsonify` for consistent JSON responses
- Configure logging with appropriate levels
- Use environment variables for configuration (database credentials, secret keys)
- Implement CORS properly for frontend/backend separation
- Add request rate limiting for production (Flask-Limiter extension)

**Typical Flask Route Pattern**:
```python
@forms_bp.route('/forms/<int:form_id>', methods=['GET'])
@require_auth
def get_form(form_id):
    try:
        form = form_service.get_by_id(form_id)
        return jsonify(form.to_dict()), 200
    except NotFoundError:
        return jsonify({'error': 'Form not found'}), 404
    except Exception as e:
        logger.error(f"Error retrieving form {form_id}: {e}")
        return jsonify({'error': 'Internal server error'}), 500
```

### Decision 4: mysql-connector-python for Database Access

**What was chosen**: mysql-connector-python 8.1+ (official MySQL driver)

**Rationale**:
- Official MySQL driver maintained by Oracle
- Pure Python implementation (no C dependencies to compile)
- Native support for MySQL 8.0+ features
- Built-in connection pooling
- Supports prepared statements for SQL injection prevention
- Excellent documentation
- Compatible with all major platforms (Windows, Linux, macOS)

**Alternatives Considered**:
1. **SQLAlchemy ORM**:
   - **Pros**: Powerful ORM with relationship management, migration support (Alembic), database-agnostic
   - **Cons**: Additional abstraction layer, learning curve, potential performance overhead, complexity for simple CRUD
   - **Rejected because**: Direct SQL with connection pooling is simpler and more transparent; ORM benefits don't outweigh complexity

2. **PyMySQL**:
   - **Pros**: Pure Python, lightweight, drop-in replacement for MySQLdb
   - **Cons**: Slower than mysql-connector-python, less feature-complete
   - **Rejected because**: mysql-connector-python is official and better maintained

3. **mysqlclient (MySQLdb)**:
   - **Pros**: Fast C implementation, widely used
   - **Cons**: Requires C compiler to install, platform-specific builds, harder to deploy
   - **Rejected because**: Pure Python solution preferred for easier deployment

**Best Practices for mysql-connector-python**:
- Use connection pooling (`mysql.connector.pooling.MySQLConnectionPool`)
- Always use parameterized queries (never string concatenation)
- Properly close cursors and connections (use context managers)
- Set appropriate timeouts for connections
- Handle exceptions at service layer (DatabaseError, IntegrityError)
- Use transactions for multi-statement operations
- Configure connection pool size based on expected concurrency (start with 10, tune as needed)

**Example Connection Pool Setup**:
```python
from mysql.connector import pooling

connection_pool = pooling.MySQLConnectionPool(
    pool_name="cioms_pool",
    pool_size=10,
    pool_reset_session=True,
    host=os.getenv('DB_HOST'),
    database=os.getenv('DB_NAME'),
    user=os.getenv('DB_USER'),
    password=os.getenv('DB_PASSWORD'),
    charset='utf8mb4',
    use_unicode=True
)
```

### Decision 5: Session-Based Authentication

**What was chosen**: Flask session-based authentication with secure cookies

**Rationale**:
- Simplest authentication method for vanilla JavaScript frontend
- No token management complexity (JWT storage, refresh tokens)
- Flask provides built-in session support
- Works seamlessly with cookies (browser automatically handles)
- Secure when configured properly (HTTPOnly, Secure, SameSite flags)
- Adequate for expected 50 concurrent users

**Alternatives Considered**:
1. **JWT (JSON Web Tokens)**:
   - **Pros**: Stateless, can scale horizontally easily, standard format
   - **Cons**: More complex for vanilla JS (localStorage vs cookie storage debate), token refresh logic needed, larger payload
   - **Rejected because**: Additional complexity not justified for expected scale; session-based is simpler

2. **OAuth2 / OpenID Connect**:
   - **Pros**: Industry standard, delegated authentication, SSO support
   - **Cons**: Significant complexity, requires external identity provider or implementation
   - **Rejected because**: Massive overkill for internal tool with local user management

3. **HTTP Basic Authentication**:
   - **Pros**: Simple to implement, built-in browser support
   - **Cons**: Credentials sent with every request, no logout mechanism, poor UX
   - **Rejected because**: Poor security and UX for modern web application

**Best Practices for Session Authentication**:
- Set secure cookie flags: `HTTPOnly=True`, `Secure=True` (HTTPS only), `SameSite=Lax`
- Use strong session secret key (random, 32+ characters)
- Implement session timeout (30 minutes of inactivity)
- Hash passwords with bcrypt (work factor 12+)
- Implement rate limiting on login endpoint (prevent brute force)
- Clear session on logout
- Validate session on every authenticated request
- Store minimal data in session (user ID only, fetch details from database)

### Decision 6: pytest for Backend Testing

**What was chosen**: pytest 7.4+ with pytest-flask for integration testing

**Rationale**:
- Industry-standard Python testing framework
- Clean, Pythonic syntax (assert statements, no boilerplate)
- Excellent fixture system for test setup/teardown
- Rich plugin ecosystem (pytest-flask, pytest-cov, pytest-mock)
- Built-in parametrization for data-driven tests
- Detailed test failure reporting
- Compatible with TDD workflow (Red-Green-Refactor)

**Best Practices for pytest in this Project**:
- Structure tests by type: `contract/`, `integration/`, `unit/`
- Use fixtures for database setup (`@pytest.fixture`)
- Mock external dependencies in unit tests
- Use in-memory database or test database for integration tests
- Aim for 80%+ code coverage (use pytest-cov)
- Run tests in CI/CD pipeline before deployment
- Follow TDD: Write failing test → Make it pass → Refactor
- Name tests descriptively: `test_create_form_with_valid_data_succeeds`

**Example pytest Test**:
```python
def test_create_form_with_valid_data(client, auth_headers):
    """Test POST /api/forms with valid CIOMS-I data"""
    form_data = {
        "manufacturer_control_no": "12345",
        "patient_initials": "ABC",
        "patient_age": "45 Years",
        "patient_sex": "M"
    }

    response = client.post('/api/forms',
                         json=form_data,
                         headers=auth_headers)

    assert response.status_code == 201
    assert response.json['manufacturer_control_no'] == "12345"
    # Verify database persistence
    assert Form.get_by_control_no("12345") is not None
```

## Data Structure Research: CIOMS-I Form

Based on the provided JSON example (`CIOMS-I-Form_example 1 (1).json`), the CIOMS-I form has the following structure:

### Form Sections

1. **Report Information (보고서_정보)**:
   - Manufacturer Control Number
   - Date Received by Manufacturer

2. **Patient Information (환자_정보)**:
   - Initials
   - Country
   - Age (with unit: Years/Months/Days)
   - Sex (M/F/Unknown)

3. **Adverse Reactions (반응_정보)**:
   - Multiple reactions possible
   - Each reaction has English and Korean translations
   - Examples: "PARALYTIC ILEUS" / "마비성 장폐색"

4. **Suspected Drug Information (의심_약물_정보)**:
   - Multiple drugs possible
   - Drug name (English + Korean)
   - Indication for use (English + Korean)

5. **Concomitant Medications (병용_약물_정보)**:
   - Array of concurrent medications
   - Same structure as suspected drugs

6. **Causality Assessment (인과관계_평가)**:
   - Relationship assessment between drug and reaction

7. **Laboratory Test Results (주요_검사실_결과)**:
   - Clinical lab data relevant to adverse event

### Key Observations

- **Bilingual Support**: All user-facing fields support both English and Korean
- **One-to-Many Relationships**:
  - One form → Many adverse reactions
  - One form → Many suspected drugs
  - One form → Many concomitant drugs
  - One form → Many lab results
- **Data Types**:
  - Strings for most text fields
  - Dates in DD/MM/YYYY format
  - Arrays for multi-value fields
  - Nested objects for bilingual data

## Security Research

### SQL Injection Prevention

**Decision**: Use parameterized queries exclusively

**Implementation**:
```python
# SECURE: Parameterized query
cursor.execute(
    "SELECT * FROM forms WHERE manufacturer_control_no = %s",
    (control_no,)
)

# INSECURE: Never do this
# cursor.execute(f"SELECT * FROM forms WHERE manufacturer_control_no = '{control_no}'")
```

### XSS Prevention

**Decision**: Escape all user-provided data before rendering in HTML

**Implementation**:
```javascript
// Vanilla JS: Use textContent instead of innerHTML for user data
element.textContent = userProvidedData;  // Safe
// element.innerHTML = userProvidedData; // Dangerous

// Or use DOMPurify library for rich text if needed
```

### HTTPS Enforcement

**Decision**: Require HTTPS in production, redirect HTTP to HTTPS

**Implementation**:
- Configure reverse proxy (nginx) to handle HTTPS and redirect HTTP
- Set `Secure` flag on cookies
- Use HSTS header (`Strict-Transport-Security`)

## Performance Optimization Research

### Database Indexing Strategy

**Indexes to Create**:
```sql
-- Primary searches
CREATE INDEX idx_manufacturer_control_no ON forms(manufacturer_control_no);
CREATE INDEX idx_patient_initials ON patient_info(initials);
CREATE INDEX idx_date_received ON forms(date_received);

-- Foreign keys (for JOIN performance)
CREATE INDEX idx_patient_form_id ON patient_info(form_id);
CREATE INDEX idx_reaction_form_id ON adverse_reactions(form_id);
CREATE INDEX idx_drug_form_id ON suspected_drugs(form_id);

-- Composite indexes for common query patterns
CREATE INDEX idx_form_search ON forms(date_received, manufacturer_control_no);
```

### Query Optimization

- Use `EXPLAIN` to analyze query execution plans
- Avoid `SELECT *`, specify needed columns
- Use `LIMIT` for paginated results
- Implement result caching for frequently accessed data (consider Flask-Caching)
- Batch INSERT operations for bulk import (use `executemany`)

### Frontend Performance

- Minimize DOM manipulation (batch updates, use DocumentFragment)
- Debounce search input (wait 300ms after user stops typing)
- Lazy load data (pagination for large result sets)
- Compress JSON responses (gzip)
- Cache static assets (CSS, JS) with appropriate headers

## Deployment Considerations

### Development Environment

- **Database**: MySQL 8.0 running locally or Docker container
- **Backend**: Flask development server (`flask run`)
- **Frontend**: Served by Flask static files or `python -m http.server`
- **Testing**: pytest with test database

### Production Environment

**Option 1: Traditional Server Deployment**
- **Web Server**: nginx (reverse proxy, static file serving, HTTPS termination)
- **Application Server**: Gunicorn with 4-8 workers
- **Database**: MySQL 8.0 on dedicated server or managed service
- **Process Management**: systemd or supervisor
- **Monitoring**: Application logs, MySQL slow query log

**Option 2: Docker Containers**
- **Containers**: backend (Python + Gunicorn), frontend (nginx), database (MySQL)
- **Orchestration**: docker-compose for single-server, Kubernetes for multi-server
- **Benefits**: Reproducible environments, easier scaling, isolated dependencies

**Recommendation**: Start with Option 1 for simplicity, move to Option 2 if scaling becomes necessary.

## Summary of Key Research Findings

1. **MySQL 8.0+ is adequate** for all project requirements (transactions, JSON, UTF-8, performance)
2. **Vanilla JavaScript is feasible** for CRUD operations with modern ES6+ features
3. **Flask provides optimal balance** of simplicity and features for backend API
4. **Session-based auth is simplest** and adequate for expected scale
5. **CIOMS-I form has complex nested structure** requiring careful database schema design
6. **Security focus areas**: SQL injection (parameterized queries), XSS (escape output), HTTPS (production requirement)
7. **Performance focus**: Database indexing, query optimization, frontend DOM efficiency

## Next Steps

- Proceed to Phase 1: Design data model based on CIOMS-I structure
- Design API contracts for CRUD operations, search, and bulk import
- Create quickstart guide for development environment setup
