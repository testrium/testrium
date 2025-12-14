# Pramana Manager

**Version:** 1.7.0
**A Comprehensive Test Case Management System**

![Java](https://img.shields.io/badge/Java-17-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-brightgreen)
![React](https://img.shields.io/badge/React-18.2-blue)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue)
![License](https://img.shields.io/badge/License-Proprietary-red)

---

## Overview

Pramana Manager is a modern, full-stack test case management system designed to streamline test planning, execution, and reporting for QA teams. Built with Spring Boot and React, it provides a comprehensive solution for managing test cases, executing test runs, tracking results, and generating detailed reports.

### Key Features

✅ **Test Case Management** - Create, organize, and maintain test cases with detailed steps and expected results
✅ **Test Run Execution** - Execute tests individually or in bulk with real-time status tracking
✅ **Bulk Operations (NEW in 1.7.0)** - Select and update multiple test results at once
✅ **JIRA Integration** - Create bugs directly from failed test executions
✅ **Test Data Management** - Centralized test data with environment-specific configurations
✅ **Advanced Reporting** - Generate PDF/Excel reports with charts and visualizations
✅ **Automation API** - RESTful API for integration with automation frameworks
✅ **Role-Based Access** - Secure access control with user roles and permissions
✅ **Dark Mode** - Full dark mode support across the application

---

## Technology Stack

### Backend
- **Framework:** Spring Boot 3.2.0
- **Language:** Java 17
- **Database:** MySQL 8.0
- **Security:** Spring Security + JWT
- **Build Tool:** Maven 3.9+

### Frontend
- **Framework:** React 18.2
- **Build Tool:** Vite 5.4.21
- **UI Library:** Tailwind CSS
- **Icons:** Lucide React
- **Charts:** Recharts
- **HTTP Client:** Axios

---

## Quick Start

### Prerequisites

- Java JDK 17+
- Node.js 18+
- MySQL 8.0+
- Maven 3.9+ (optional)

### 1. Database Setup

```sql
CREATE DATABASE pramana_manager;
```

### 2. Backend Setup

```bash
cd backend

# Update database credentials in application.properties
# spring.datasource.username=root
# spring.datasource.password=your_password

# Build and run
mvn spring-boot:run
```

Backend will start at `http://localhost:8080`

### 3. Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will start at `http://localhost:5173`

### 4. Access Application

- Open browser: `http://localhost:5173`
- Register a new account or login
- Start creating projects and test cases!

---

## What's New in Version 1.7.0

### 🎯 Bulk Update Feature

The latest release introduces powerful bulk update capabilities for test execution:

- **Multi-Select Tests**: Use checkboxes to select individual tests
- **Select All**: One-click selection of all tests in a run
- **Module Selection**: Select all tests within a specific module
- **Bulk Status Update**: Update status for multiple tests simultaneously
- **Visual Feedback**: Clear indication of selected tests and count

### How to Use Bulk Update

1. Navigate to a test run execution page
2. Use checkboxes to select tests you want to update
3. Or click "Select All" to select all tests
4. Choose the desired status from the dropdown
5. Click "Update Selected" to apply the status

This feature significantly speeds up test result updates, especially for large test runs!

---

## Documentation

| Document | Description |
|----------|-------------|
| [TESTING_GUIDE.md](./TESTING_GUIDE.md) | Complete guide for testing on different systems and environments |
| [AUTOMATION_API_GUIDE.md](./AUTOMATION_API_GUIDE.md) | API documentation for automation framework integration |
| [CHANGELOG.md](./CHANGELOG.md) | Version history and release notes |

---

## Project Structure

```
pramana-manager/
├── backend/                    # Spring Boot backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/pramana/manager/
│   │   │   │   ├── controller/    # REST controllers
│   │   │   │   ├── service/       # Business logic
│   │   │   │   ├── repository/    # Data access
│   │   │   │   ├── entity/        # JPA entities
│   │   │   │   ├── dto/           # Data transfer objects
│   │   │   │   └── security/      # Security configuration
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   └── pom.xml
├── src/                        # React frontend
│   ├── components/            # Reusable components
│   ├── pages/                 # Page components
│   ├── services/              # API services
│   ├── contexts/              # React contexts
│   ├── api/                   # API configurations
│   └── App.jsx
├── public/
├── package.json
├── vite.config.js
├── tailwind.config.js
├── README.md
├── TESTING_GUIDE.md
├── AUTOMATION_API_GUIDE.md
└── CHANGELOG.md
```

---

## Core Modules

### 1. User Management
- User registration and authentication
- JWT-based security
- Role-based access control (ADMIN/USER)
- Password encryption and validation

### 2. Project Management
- Create and manage test projects
- Assign team members to projects
- Project-level access control
- Project statistics and metrics

### 3. Test Case Management
- Create detailed test cases with steps and expected results
- Organize by projects and modules
- Priority levels (Critical, High, Medium, Low)
- Search and filter capabilities
- Test case templates

### 4. Test Run Execution
- Create test runs from selected test cases
- Real-time execution tracking
- **NEW: Bulk status updates**
- Execution time recording
- Comments and actual results
- Progress visualization
- JIRA integration for bug creation

### 5. Test Data Management
- Environment-specific test data (DEV, QA, STAGING, PROD)
- Multiple data types (KEY_VALUE, JSON, CSV, XML)
- Centralized data repository
- API access for automation frameworks
- Search and filter by environment

### 6. Reports & Analytics
- Test execution reports with charts
- PDF export with pie charts
- Excel export with detailed data
- Custom report naming
- Trend analysis over time
- Pass/fail rate calculations

### 7. Dashboard & Metrics
- Real-time statistics
- Project-wise metrics
- Test execution trends
- Performance indicators

---

## API Integration

Pramana Manager provides RESTful APIs for integration with automation frameworks like Selenium, RestAssured, Playwright, and more.

### Example: Fetch Test Data

```bash
curl -X GET "http://localhost:8080/api/automation/test-data/by-name?projectId=1&name=Login%20Credentials&environment=QA" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Example Response

```json
{
  "id": 1,
  "name": "Login Credentials",
  "environment": "QA",
  "dataType": "KEY_VALUE",
  "data": "{\"username\":\"testuser@example.com\",\"password\":\"Test@123\"}"
}
```

For complete API documentation, see [AUTOMATION_API_GUIDE.md](./AUTOMATION_API_GUIDE.md)

---

## Configuration

### Backend Configuration

Edit `backend/src/main/resources/application.properties`:

```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/pramana_manager
spring.datasource.username=root
spring.datasource.password=your_password

# JWT
jwt.secret=YourSuperSecretKeyMinimum256BitsLong
jwt.expiration=86400000

# Server
server.port=8080

# JIRA (Optional)
jira.base.url=https://your-domain.atlassian.net
jira.api.token=your_token
jira.email=your-email@example.com
```

### Frontend Configuration

Create `.env` file:

```properties
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_NAME=Pramana Manager
VITE_APP_VERSION=1.7.0
```

---

## Building for Production

### Backend

```bash
cd backend
mvn clean package -DskipTests
java -jar target/pramana-manager-1.7.0.jar
```

### Frontend

```bash
npm run build
npm run preview
```

The production build will be in the `dist/` directory.

---

## Deployment

### Docker Deployment (Recommended)

```bash
# Using docker-compose
docker-compose up -d
```

### Traditional Deployment

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for detailed deployment instructions for:
- Linux servers
- Windows servers
- Cloud platforms (AWS, Azure, GCP)
- Nginx configuration
- SSL setup

---

## Testing

### Run Backend Tests

```bash
cd backend
mvn test
```

### Run Frontend Tests

```bash
npm test
```

### Testing Checklist

For comprehensive testing checklist, see [TESTING_GUIDE.md](./TESTING_GUIDE.md)

---

## Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Edge (latest)
- ✅ Safari (latest)

---

## Screenshots

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### Test Run Execution with Bulk Update
![Test Execution](docs/screenshots/test-execution-bulk.png)

### Reports with Charts
![Reports](docs/screenshots/reports-charts.png)

---

## Roadmap

### Version 1.8.0 (Planned)
- Test case templates
- Test suite management
- Automated test scheduling
- Email notifications

### Version 2.0.0 (Future)
- Multi-tenancy support
- Advanced analytics with ML
- Mobile application
- CI/CD integration plugins

See [CHANGELOG.md](./CHANGELOG.md) for complete version history.

---

## Troubleshooting

### Common Issues

**Port 8080 already in use:**
```bash
# Kill process or use different port
java -jar target/pramana-manager-1.7.0.jar --server.port=8081
```

**Database connection failed:**
```bash
# Check MySQL is running
sudo systemctl status mysql
```

**CORS errors:**
- Update CORS configuration in SecurityConfig.java
- Add frontend URL to allowed origins

For more troubleshooting, see [TESTING_GUIDE.md](./TESTING_GUIDE.md)

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards

- **Backend:** Follow Java coding conventions
- **Frontend:** Use ESLint and Prettier
- **Commits:** Use conventional commit messages
- **Tests:** Write unit tests for new features

---

## Security

### Reporting Security Issues

If you discover a security vulnerability, please email security@pramana-manager.com instead of using the issue tracker.

### Security Features

- JWT-based authentication
- Password encryption with BCrypt
- SQL injection prevention
- XSS protection
- CSRF tokens
- Role-based access control

---

## Support

For support and questions:

- **Email:** support@pramana-manager.com
- **Documentation:** See guides in the repository
- **Issues:** Use GitHub Issues for bug reports

---

## License

Pramana Manager © 2024. All rights reserved.

This is proprietary software. Unauthorized copying, modification, distribution, or use of this software is strictly prohibited.

---

## Acknowledgments

- Spring Boot team for the excellent framework
- React team for the powerful UI library
- Tailwind CSS for the utility-first CSS framework
- All contributors and users of Pramana Manager

---

## Contact

**Project Maintainer:** Pramana Manager Team
**Email:** info@pramana-manager.com
**Version:** 1.7.0
**Last Updated:** December 14, 2024

---

Made with ❤️ for QA Teams
