# Quickstart Guide: CIOMS-I Form Management System

**Feature**: CIOMS-I Form Data Management Web UI
**Date**: 2025-10-15
**Estimated Setup Time**: 30 minutes

## Prerequisites

- Python 3.10 or higher
- MySQL 8.0 or higher
- Modern web browser (Chrome, Firefox, Safari, or Edge)
- Git (for cloning repository)
- Text editor or IDE

## Quick Start (Development Environment)

### 1. Database Setup

```bash
# Install MySQL (if not already installed)
# macOS:
brew install mysql@8.0
brew services start mysql@8.0

# Ubuntu/Debian:
sudo apt-get install mysql-server mysql-client

# Windows:
# Download from https://dev.mysql.com/downloads/mysql/

# Create database and user
mysql -u root -p
```

```sql
CREATE DATABASE cioms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'cioms_user'@'localhost' IDENTIFIED BY 'secure_password_here';
GRANT ALL PRIVILEGES ON cioms_db.* TO 'cioms_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create Python virtual environment
python3 -m venv venv

# Activate virtual environment
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment configuration
cp .env.example .env

# Edit .env with your database credentials
nano .env  # or use your preferred editor
```

**.env Configuration**:
```ini
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=cioms_db
DB_USER=cioms_user
DB_PASSWORD=secure_password_here

# Application Configuration
FLASK_APP=src/app.py
FLASK_ENV=development
SECRET_KEY=generate-random-32-char-secret-key-here

# Security
SESSION_COOKIE_SECURE=False  # Set True in production with HTTPS
SESSION_COOKIE_HTTPONLY=True
SESSION_COOKIE_SAMESITE=Lax
SESSION_TIMEOUT_MINUTES=30

# CORS (for frontend development)
CORS_ORIGINS=http://localhost:8000,http://127.0.0.1:8000
```

```bash
# Run database migrations
python src/db/migrate.py

# Create initial admin user
python src/db/seed.py --create-admin

# Start Flask development server
flask run
# Backend API now running at http://localhost:5000
```

### 3. Frontend Setup

```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Start simple HTTP server for static files
# Python 3:
python3 -m http.server 8000

# Alternative (Node.js):
npx http-server src -p 8000

# Frontend now running at http://localhost:8000
```

### 4. Verify Installation

Open your browser and navigate to:
- Frontend: `http://localhost:8000`
- Backend API: `http://localhost:5000/api/health` (should return {"status": "ok"})

**Default Admin Credentials**:
- Username: `admin`
- Password: `admin123` (change immediately!)

## Project Structure

```
project_root/
├── backend/              # Python Flask API
│   ├── src/
│   │   ├── api/         # REST API endpoints
│   │   ├── models/      # Database models
│   │   ├── services/    # Business logic
│   │   ├── db/          # Database migrations
│   │   └── app.py       # Flask application entry
│   ├── tests/           # Backend tests (pytest)
│   ├── requirements.txt # Python dependencies
│   └── .env            # Configuration (gitignored)
├── frontend/            # Vanilla HTML/CSS/JS
│   └── src/
│       ├── index.html   # Main application
│       ├── login.html   # Login page
│       ├── css/         # Stylesheets
│       └── js/          # JavaScript modules
├── database/            # Database schema and migrations
│   ├── schema/
│   └── seed/
└── docs/               # Documentation
```

## Common Development Tasks

### Run Backend Tests

```bash
cd backend
source venv/bin/activate  # if not already activated
pytest
```

### Run Frontend (Manual Testing)

Open browser developer tools and test:
1. Login functionality
2. Form CRUD operations
3. Search and filtering
4. Data validation

### Database Management

```bash
# View database
mysql -u cioms_user -p cioms_db

# Run specific migration
python src/db/migrate.py --version 003

# Reset database (WARNING: destroys data)
python src/db/migrate.py --reset
```

### Import Sample Data

```bash
# Import CIOMS-I forms from CSV
curl -X POST http://localhost:5000/api/import/upload \
  -H "Cookie: session=your_session_id" \
  -F "file=@sample_data.csv"
```

## Development Workflow

1. **Start Backend**: `cd backend && flask run`
2. **Start Frontend**: `cd frontend && python3 -m http.server 8000`
3. **Make Changes**: Edit code in `src/` directories
4. **Backend Auto-Reload**: Flask development server reloads automatically
5. **Frontend Refresh**: Reload browser to see changes (no build step!)
6. **Run Tests**: `pytest` in backend directory

## Troubleshooting

### Database Connection Error

**Problem**: `Can't connect to MySQL server on 'localhost'`

**Solution**:
```bash
# Check MySQL is running
brew services list  # macOS
sudo systemctl status mysql  # Linux

# Verify credentials in .env match database user
```

### Port Already in Use

**Problem**: `Address already in use: 5000` or `8000`

**Solution**:
```bash
# Find process using port
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill process or use different port
flask run --port 5001
python3 -m http.server 8001
```

### CORS Errors in Browser

**Problem**: `Access to fetch blocked by CORS policy`

**Solution**:
- Verify `CORS_ORIGINS` in .env includes your frontend URL
- Restart Flask server after changing .env
- Check browser console for exact error

### Import CSV Fails

**Problem**: CSV import returns validation errors

**Solution**:
- Ensure CSV is UTF-8 encoded
- Verify required columns present: manufacturer_control_no, date_received, patient_initials, etc.
- Check date format is YYYY-MM-DD or DD/MM/YYYY
- Review error log in import job details

## Next Steps

1. **Read API Documentation**: See `contracts/` directory for endpoint specifications
2. **Review Data Model**: See `data-model.md` for database schema details
3. **Run Tests**: Execute pytest suite to ensure everything works
4. **Create Feature Branch**: `git checkout -b feature/your-feature-name`
5. **Follow TDD**: Write tests first, then implement features
6. **Generate Tasks**: Run `/speckit.tasks` to create implementation task list

## Production Deployment

For production deployment, see separate deployment guide. Key changes needed:

1. Use production-grade WSGI server (Gunicorn, uWSGI)
2. Configure nginx as reverse proxy
3. Enable HTTPS and set `SESSION_COOKIE_SECURE=True`
4. Use environment-specific database credentials
5. Set strong `SECRET_KEY`
6. Configure proper logging
7. Set up database backups
8. Implement monitoring and alerting

## Support and Resources

- API Documentation: `specs/001-ui/contracts/`
- Data Model: `specs/001-ui/data-model.md`
- Technology Research: `specs/001-ui/research.md`
- Implementation Plan: `specs/001-ui/plan.md`
- Issue Tracking: Create GitHub issues for bugs/features

## Security Notes

- Change default admin password immediately
- Never commit `.env` file to version control
- Use strong passwords (12+ characters, mixed case, numbers, symbols)
- Keep dependencies updated: `pip install --upgrade -r requirements.txt`
- Enable HTTPS in production
- Regularly backup database
- Review audit logs for suspicious activity
