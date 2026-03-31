# Changelog

All notable changes to Pramana Manager will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.1.0] - 2026-03-31

### Added

#### Tags / Labels on Test Cases
- Tag input component with chip UI — press Enter or comma to add, Backspace to remove
- Project-aware autocomplete with built-in suggestions (smoke, regression, critical, sanity, e2e, etc.)
- Tag filter in Test Cases page — click any tag chip to filter by it
- Tag chips displayed on each test case card
- Backend: `@ElementCollection` tags field on `TestCase` entity (auto-creates `test_case_tags` table)
- Backend: `GET /api/test-cases/tags?projectId=` endpoint for tag suggestions
- Tag normalization: lowercase, trimmed, max 50 chars, deduplicated

#### Clone Test Run
- Clone button (copy icon) on each test run row — prompts for a name pre-filled with the original run's name
- Cloned run starts with status `NOT_STARTED` and all executions reset to `NOT_EXECUTED`
- Backend: `POST /api/test-runs/{id}/clone` endpoint

#### Edit Test Run
- Edit button (pencil icon) on each test run row — edit name, description, and assignee
- Backend: `PUT /api/test-runs/{id}` endpoint

### Fixed
- Module dropdown not loading in Test Cases filter — `applicationId` type mismatch (string vs number)
- Assign To dropdown in Test Run modals now loads all users (previously used wrong API method, returning empty list)

### Changed
- Updated version from 2.0.0 to 2.1.0

---

## [1.7.0] - 2024-12-14

### Added - Test Run Execution Enhancements

#### Bulk Update Feature
- **Checkbox selection** for individual test cases in test run execution page
- **Select All** button to select/deselect all tests at once
- **Select by Module** button to select all tests within a specific module
- **Bulk Action Toolbar** that appears when tests are selected
  - Shows count of selected tests
  - Status dropdown for bulk updates (Pass/Fail/Blocked/Skipped/Not Executed)
  - "Update Selected" button to apply status to all selected tests
  - "Clear Selection" option to reset selections
- Visual feedback with selected test count display
- Non-intrusive UI - checkboxes don't interfere with existing test execution workflow

#### Backend API
- New `bulkUpdateExecutions()` method in TestExecutionService
- New `/api/test-executions/bulk-update` PUT endpoint
- `BulkUpdateRequest` class for handling bulk update payloads
- Efficient batch processing using `saveAll()` for multiple test executions
- Frontend API method `bulkUpdate()` in testExecutions.js

### Changed
- Updated project version from 1.6.0 to 1.7.0
- Enhanced TestRunExecution component with selection capabilities
- Improved user experience for updating multiple test results

### Technical Details
- Backend: Added transactional bulk update support in TestExecutionService.java
- Frontend: Added state management for selected execution IDs
- UI: Integrated Square and CheckSquare icons from lucide-react
- Performance: Optimized bulk updates with single database transaction

### Files Modified
- `backend/pom.xml` - Version updated to 1.7.0
- `package.json` - Version updated to 1.7.0
- `backend/src/main/java/com/pramana/manager/service/TestExecutionService.java`
- `backend/src/main/java/com/pramana/manager/controller/TestExecutionController.java`
- `src/services/testExecutions.js`
- `src/pages/TestRunExecution.jsx`

### Documentation
- Created comprehensive `TESTING_GUIDE.md` for system testing and deployment
- Created `CHANGELOG.md` to track version history
- Updated feature descriptions with bulk update capabilities

---

## [1.6.0] - 2024-12-13

### Added
- **JIRA Integration**
  - Create JIRA bugs directly from failed test executions
  - Auto-populate bug details from test case information
  - Support for different issue types and priorities
  - Direct links to created JIRA issues

### Changed
- **Advanced Reporting**
  - Added pie chart visualization for test execution distribution
  - Custom color coding (#2B9600 for pass status)
  - Charts included in PDF exports using html2canvas
  - Custom report naming functionality

- **Project Access Control**
  - Filter reports page to show only projects user has access to
  - Admin users see all projects
  - Regular users see only their assigned projects

### Fixed
- Reports page project dropdown filtering
- PDF report title now uses custom report name

---

## [1.5.0] - 2024-12-12

### Added
- **Test Data Management Redesign**
  - Converted from card view to professional table view
  - Search functionality for test data by name/description
  - Environment-based filtering (ALL, DEV, QA, STAGING, PROD)
  - Pagination with configurable rows per page (5, 10, 25, 50, 100)
  - Navigation and Footer components integration

- **Test Runs UI Overhaul**
  - Table view with 8 columns (Name, Project, Status, Progress, Results, Assigned To, Start Date, Actions)
  - CSS Grid layout for single-row search and filters
  - Search, project filter, and status filter in one row
  - Visual progress bars and result counts
  - Pagination matching Test Data page pattern

- **Reports Page Enhancements**
  - Removed cumulative statistics section
  - Show only selected test run statistics
  - "No Test Run Selected" message for better UX
  - Conditional display of templates and trend analysis

### Changed
- Test Data page: Complete UI redesign from cards to table
- Test Runs page: Layout changed from flexbox to CSS Grid (12-column)
- Reports page: Focus on single test run analysis

### Technical Improvements
- Consistent pagination pattern across all list views
- Responsive design with Tailwind CSS utilities
- Dark mode support across all pages
- Improved filtering and search performance

---

## [1.4.0] - 2024-12-11

### Added
- Test Modules management
- Test Case associations with modules
- Module-based test organization

### Changed
- Enhanced test case creation workflow
- Improved project organization

---

## [1.3.0] - 2024-12-10

### Added
- Test Data Management API for automation frameworks
- Support for multiple data types (KEY_VALUE, JSON, CSV, XML)
- Environment-specific test data (DEV, QA, STAGING, PROD)
- Automation API endpoints for test data retrieval
- Created AUTOMATION_API_GUIDE.md

### Features
- RESTful API for test data access
- Integration examples for Java, Python, JavaScript
- Health check endpoint
- JWT-based authentication for API access

---

## [1.2.0] - 2024-12-09

### Added
- Reports and Analytics module
- Test execution trend analysis
- PDF and Excel export functionality
- Dashboard with key metrics

### Enhanced
- Reporting capabilities with charts
- Export formats with detailed test information

---

## [1.1.0] - 2024-12-08

### Added
- Test Run execution interface
- Real-time test execution tracking
- Status tracking (Pass, Fail, Blocked, Skipped, Not Executed)
- Execution time recording
- Comments and actual results capture

### Enhanced
- Test execution workflow
- Progress tracking
- Result visualization

---

## [1.0.0] - 2024-12-07

### Initial Release

#### Core Features
- **User Management**
  - User registration and authentication
  - JWT-based security
  - Role-based access control (ADMIN, USER)
  - Password encryption

- **Project Management**
  - Create and manage test projects
  - Project member management
  - Access control

- **Test Case Management**
  - Create, read, update, delete test cases
  - Test case prioritization (Critical, High, Medium, Low)
  - Test case organization by projects
  - Rich test case details (preconditions, steps, expected results)

- **Test Runs**
  - Create test runs from test cases
  - Assign test runs to users
  - Track test run status (Not Started, In Progress, Completed)

#### Technology Stack
- **Backend:** Spring Boot 3.2.0, Java 17
- **Frontend:** React 18.2, Vite 5.4.21
- **Database:** MySQL 8.0
- **Security:** JWT, Spring Security
- **UI:** Tailwind CSS, Lucide Icons

#### Additional Features
- Dark mode support
- Responsive design
- RESTful API architecture
- Real-time data updates

---

## Version Numbering

We use Semantic Versioning (MAJOR.MINOR.PATCH):

- **MAJOR** version: Incompatible API changes or major architectural changes
- **MINOR** version: New features in a backward-compatible manner
- **PATCH** version: Backward-compatible bug fixes

---

## Legend

- `Added` - New features
- `Changed` - Changes in existing functionality
- `Deprecated` - Soon-to-be removed features
- `Removed` - Removed features
- `Fixed` - Bug fixes
- `Security` - Vulnerability fixes

---

## Upcoming Features (Planned)

### Version 1.8.0 (Planned)
- [ ] Test case templates
- [ ] Test suite management
- [ ] Automated test scheduling
- [ ] Email notifications for test results
- [ ] Enhanced dashboard widgets

### Version 2.0.0 (Future)
- [ ] Multi-tenancy support
- [ ] Advanced analytics and ML insights
- [ ] Mobile application
- [ ] CI/CD integration plugins
- [ ] Test case version control

---

**For detailed API documentation, see [AUTOMATION_API_GUIDE.md](./AUTOMATION_API_GUIDE.md)**

**For testing and deployment, see [TESTING_GUIDE.md](./TESTING_GUIDE.md)**
