# Pramana Manager v1.3.0 Release Notes

**Release Date:** December 13, 2025
**Version:** 1.3.0

---

## 🎉 What's New

### Application Management System
This release introduces a complete Application Management layer to the hierarchical test structure, enabling better organization and metrics tracking.

#### New Hierarchical Structure
```
Project → Application → Suite → Test Case
```

**Example:**
- **Project:** INTTRA QA
  - **Application:** Booking
    - **Suite:** Create Booking
      - **Test Cases:** Individual test cases
  - **Application:** Delphi
    - **Suite:** Search Functionality
      - **Test Cases:** Individual test cases

---

## ✨ Key Features

### 1. Application CRUD Operations
- **Create Applications** - Define applications within projects (e.g., Booking, Delphi, eVGM)
- **Edit Applications** - Update application details and status
- **Archive Applications** - Soft delete with ACTIVE/ARCHIVED status
- **View Applications** - Grid view with summary cards showing total and active applications

### 2. Enhanced Test Suite Management
- **Application Assignment** - Test suites now require an application assignment
- **Dynamic Filtering** - Application dropdown filters based on selected project
- **Legacy Support** - Existing test suites without applications continue to work

### 3. Metrics Foundation
- **Test Case Flags** - Added `isAutomated` and `isRegression` boolean fields to test cases
- **Database Ready** - Backend schema prepared for automatic metrics calculation

### 4. Role-Based Access Control
- **ADMIN Users** - Full access to all applications across all projects
- **LEAD Users** - Can manage applications in projects where they have LEAD role
- **Regular Users** - Read-only access to applications in their assigned projects

---

## 🔧 Technical Improvements

### Backend Enhancements
1. **New Entity:** Application entity with full JPA relationships
2. **Repository Layer:** ApplicationRepository with custom queries
3. **Service Layer:** ApplicationService with validation and business logic
4. **REST API:** Complete RESTful API for application management
5. **Lazy Loading Fix:** Resolved Hibernate lazy loading issues with proper transaction management
6. **JSON Serialization:** Fixed serialization issues with @JsonIgnoreProperties annotations

### Frontend Enhancements
1. **Applications Page:** Full-featured CRUD interface
2. **API Service:** Axios-based applications API wrapper
3. **Navigation:** New "Applications" menu item
4. **Form Validation:** Client-side and server-side validation
5. **Permission Guards:** Dynamic UI based on user roles

### Data Model Updates
```sql
-- New Applications Table
applications (id, name, description, status, project_id, created_by, created_at, updated_at)

-- Updated Test Suites
test_suites.application_id (nullable for legacy support)

-- Updated Test Cases
test_cases.is_automated (boolean)
test_cases.is_regression (boolean)
```

---

## 🐛 Bug Fixes

1. **JSON Serialization Error** - Fixed lazy loading issues in Application entity
2. **Authentication Issues** - Resolved UserDetails null pointer by using Authentication object
3. **Lazy Loading Exception** - Fixed by forcing relationship loading within @Transactional scope
4. **Permission Check** - Enhanced to support both ADMIN role and project LEAD membership
5. **Legacy Data Support** - Made Application nullable in TestSuite to support existing data

---

## 📋 API Changes

### New Endpoints

```
GET    /api/applications                    - Get all applications
GET    /api/applications/active             - Get active applications
GET    /api/applications/project/{projectId} - Get applications by project
GET    /api/applications/{id}               - Get application by ID
POST   /api/applications                    - Create new application
PUT    /api/applications/{id}               - Update application
DELETE /api/applications/{id}               - Delete/archive application
```

### Modified Endpoints

```
POST/PUT /api/test-suites
- Now requires applicationId in request body
- Returns applicationId and applicationName in response
```

---

## 🔄 Migration Guide

### For Existing Users

1. **Restart Backend:** Use the new JAR file `pramana-manager-1.3.0.jar`
2. **Database Migration:** Automatic - H2 will auto-update schema
3. **Existing Test Suites:** Will continue to work without application assignment
4. **New Test Suites:** Must select an application during creation

### For Developers

```bash
# Backend
cd backend
mvn clean package -DskipTests
java -jar target/pramana-manager-1.3.0.jar

# Frontend
npm install  # if needed
npm run dev
```

---

## 📊 What's Next (Roadmap)

### Phase 3: Test Case Enhancement (Upcoming)
- Add automation checkbox to Test Cases form
- Add regression checkbox to Test Cases form
- Display automation/regression status in test case list
- Add filtering by automation and regression flags

### Phase 4: Metrics Calculation Engine
- Automatic calculation of total tests per application
- Automated vs manual test counts
- Regression vs non-regression counts
- Percentage calculations (automation %, regression coverage)

### Phase 5: Metrics Dashboard
- Application-wise summary table
- Visual charts and graphs
- Drill-down capabilities
- Export metrics to Excel/PDF

### Phase 6: Dashboard Integration
- Add metrics widgets to main dashboard
- Quick stats cards
- Mini trend charts

### Phase 7: Advanced Features
- Historical trend analysis
- Goal setting and tracking
- Coverage heat maps
- Automated alerts

---

## 🔧 System Requirements

- **Java:** 17 or higher
- **Node.js:** 18 or higher
- **Browser:** Modern browsers (Chrome, Firefox, Safari, Edge)
- **Database:** H2 (included) or PostgreSQL/MySQL

---

## 📝 Breaking Changes

### For API Consumers
- Test Suite creation/update now requires `applicationId` field
- Test Suite responses now include `applicationId` and `applicationName`

### For Frontend
- TestSuites form now requires Application selection
- Application dropdown added to suite creation/edit modal

---

## 🙏 Acknowledgments

Special thanks to the QA team for providing valuable feedback on the hierarchical structure and metrics requirements.

---

## 📞 Support

For issues or questions:
1. Check [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) for current status
2. Review the codebase documentation
3. Contact the development team

---

## 📄 License

Proprietary - Internal Use Only
