# Pramana Manager - System Architecture

Version: 1.7.0

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                             │
│  React 18.2 + Vite + Tailwind CSS + Recharts               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓ HTTPS/REST
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                          │
│  Spring Boot 3.2.0 + Spring Security + JWT                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓ JDBC
┌─────────────────────────────────────────────────────────────┐
│                   PERSISTENCE LAYER                          │
│  MySQL 8.0 + Hibernate JPA                                  │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend (React)

```
src/
├── components/          # Reusable UI components
│   ├── Navigation.jsx   # Top navigation bar
│   ├── Footer.jsx       # Footer component
│   └── ui/             # UI primitives (Button, Card, Input)
│
├── pages/              # Route-based pages
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── TestCases.jsx
│   ├── TestRuns.jsx
│   ├── TestRunExecution.jsx  # Bulk update feature
│   ├── TestData.jsx
│   ├── Reports.jsx
│   └── Metrics.jsx
│
├── services/           # API service layer
│   ├── api.js          # Base API config
│   ├── testRuns.js
│   └── testExecutions.js
│
├── contexts/           # React Context
│   └── AuthContext.jsx # Authentication state
│
└── api/               # Additional API services
    ├── jira.js
    ├── reports.js
    └── testData.js
```

### Backend (Spring Boot)

```
com.pramana.manager/
├── controller/         # REST Controllers
│   ├── AuthController
│   ├── TestCaseController
│   ├── TestRunController
│   ├── TestExecutionController  # Bulk update endpoint
│   ├── TestDataController
│   ├── ReportsController
│   └── JiraController
│
├── service/           # Business Logic
│   ├── UserService
│   ├── TestCaseService
│   ├── TestRunService
│   ├── TestExecutionService     # Bulk update logic
│   ├── TestDataService
│   ├── ReportsService
│   └── JiraService
│
├── repository/        # Data Access (JPA)
│   ├── UserRepository
│   ├── TestCaseRepository
│   ├── TestRunRepository
│   ├── TestExecutionRepository
│   ├── TestDataRepository
│   └── ProjectRepository
│
├── entity/           # Database Entities
│   ├── User
│   ├── Project
│   ├── TestCase
│   ├── TestRun
│   ├── TestExecution
│   └── TestData
│
├── dto/              # Data Transfer Objects
│   ├── TestExecutionDTO
│   ├── UpdateTestExecutionRequest
│   └── BulkUpdateRequest        # New in v1.7.0
│
└── security/         # Security Configuration
    ├── SecurityConfig
    ├── JwtAuthenticationFilter
    └── JwtTokenProvider
```

## Database Schema

```sql
Users
├── id (PK)
├── username
├── email (unique)
├── password (encrypted)
├── role (ADMIN/USER)
└── created_at

Projects
├── id (PK)
├── name
├── description
├── created_by_user_id (FK)
└── created_at

Project_Members
├── id (PK)
├── project_id (FK)
├── user_id (FK)
└── role

Test_Cases
├── id (PK)
├── title
├── description
├── steps (TEXT)
├── expected_result (TEXT)
├── priority (ENUM)
├── project_id (FK)
├── module_id (FK)
└── created_by_user_id (FK)

Test_Runs
├── id (PK)
├── name
├── project_id (FK)
├── module_id (FK)
├── assigned_to_user_id (FK)
├── status (NOT_STARTED/IN_PROGRESS/COMPLETED)
├── total_test_cases
├── passed_count
├── failed_count
└── start_date

Test_Executions
├── id (PK)
├── test_run_id (FK)
├── test_case_id (FK)
├── status (PASS/FAIL/BLOCKED/SKIPPED/NOT_EXECUTED)
├── actual_result (TEXT)
├── comments (TEXT)
├── execution_time_minutes
├── defect_reference
├── executed_by_user_id (FK)
├── executed_at
└── updated_at

Test_Data
├── id (PK)
├── name
├── description
├── project_id (FK)
├── environment (DEV/QA/STAGING/PROD)
├── data_type (KEY_VALUE/JSON/CSV/XML)
├── data_content (TEXT)
└── created_by_user_id (FK)
```

## Key Features & Flow

### 1. Bulk Update Feature (v1.7.0)

```
Frontend Flow:
User selects tests → State updated → Bulk toolbar appears
→ User selects status → Clicks "Update Selected"
→ API call with executionIds[] + status

Backend Flow:
BulkUpdateRequest received → Authentication verified
→ TestExecutionService.bulkUpdateExecutions()
→ Load all executions by IDs → Update in loop
→ saveAll() in single transaction → Return DTOs

Database:
Single transaction updates multiple test_executions rows
Automatic timestamp and audit trail updated
```

### 2. Authentication Flow

```
Login → Credentials sent to /api/auth/login
→ JWT token generated (HS256)
→ Token returned to client
→ Token stored in localStorage
→ Token sent in Authorization header for all requests
→ JwtAuthenticationFilter validates on each request
```

### 3. Test Execution Flow

```
Create Test Run → Select test cases
→ TestExecutions created (status: NOT_EXECUTED)
→ Navigate to execution page
→ For each test: Execute → Update status/results
→ OR: Bulk select → Update multiple at once
→ Progress tracked in real-time
→ Generate reports on completion
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - User registration
- POST `/api/auth/login` - User login
- POST `/api/admin/create-admin` - Create admin user

### Test Executions
- GET `/api/test-executions?testRunId={id}` - Get executions
- PUT `/api/test-executions/{id}` - Update single execution
- **PUT `/api/test-executions/bulk-update`** - Bulk update (v1.7.0)

### Test Data (Automation API)
- GET `/api/automation/test-data?projectId={id}` - Get all test data
- GET `/api/automation/test-data/by-name` - Get by name
- POST `/api/automation/test-data` - Create/update data

### Reports
- GET `/api/reports/test-run/{id}` - Get test run report
- GET `/api/reports/trend-analysis` - Trend data

### JIRA Integration
- POST `/api/jira/create-issue` - Create JIRA bug

## Security

```
JWT Authentication:
- HS256 algorithm
- Token expiration: 24 hours
- Secret key stored in environment variable

Password Security:
- BCrypt encryption (strength: 10)
- Min 8 characters with complexity requirements

API Security:
- CORS configured for allowed origins
- CSRF protection enabled
- SQL injection prevention (JPA/Hibernate)
- XSS protection (React escaping)
```

## Deployment Architecture

### Development
```
Windows/Mac/Linux
├── MySQL (localhost:3306)
├── Backend JAR (port 8080)
└── Vite Dev Server (port 5173)
```

### Production
```
Server (Linux)
├── MySQL (localhost:3306 - internal only)
├── Backend (systemd service, port 8080)
└── Nginx
    ├── Serves static files (port 80/443)
    └── Reverse proxy to backend (/api → :8080)
```

### Docker
```
docker-compose
├── mysql container (port 3306)
├── backend container (port 8080)
└── frontend volume (served by Nginx)
```

## Performance Considerations

1. **Database Indexing**
   - Primary keys on all tables
   - Foreign key indexes
   - Index on frequently queried fields (email, project_id)

2. **Caching**
   - JWT tokens cached on client
   - Static assets served with cache headers

3. **Bulk Operations**
   - Single transaction for bulk updates
   - Batch processing using saveAll()

4. **Frontend Optimization**
   - Code splitting with Vite
   - Lazy loading for routes
   - Pagination for large datasets

## Technology Stack Summary

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend Framework | React | 18.2 |
| Build Tool | Vite | 5.4.21 |
| CSS Framework | Tailwind CSS | 3.3.6 |
| Charts | Recharts | 3.5.1 |
| Backend Framework | Spring Boot | 3.2.0 |
| Language | Java | 17 |
| Database | MySQL | 8.0 |
| ORM | Hibernate/JPA | 6.x |
| Security | Spring Security + JWT | 6.x |
| PDF Generation | jsPDF | 3.0.4 |
| Excel Export | XLSX | 0.18.5 |

## Future Enhancements

- Test case templates
- CI/CD integration
- Real-time collaboration
- Advanced analytics with ML
- Mobile application
