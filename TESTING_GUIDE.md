# Pramana Manager Testing Guide

**Version:** 1.7.0
**Last Updated:** December 14, 2024

This guide provides comprehensive instructions for setting up and testing Pramana Manager on different systems and environments.

---

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Environment Setup](#environment-setup)
3. [Database Configuration](#database-configuration)
4. [Backend Setup](#backend-setup)
5. [Frontend Setup](#frontend-setup)
6. [Testing on Different Systems](#testing-on-different-systems)
7. [Environment Variables](#environment-variables)
8. [Common Issues & Troubleshooting](#common-issues--troubleshooting)
9. [Testing Checklist](#testing-checklist)
10. [Performance Testing](#performance-testing)

---

## System Requirements

### Minimum Requirements

- **Java:** JDK 17 or higher
- **Node.js:** v18.x or higher
- **npm:** v9.x or higher
- **MySQL:** 8.0 or higher
- **RAM:** 4GB minimum (8GB recommended)
- **Disk Space:** 2GB free space

### Supported Operating Systems

- Windows 10/11 (64-bit)
- macOS 11.0 (Big Sur) or higher
- Linux (Ubuntu 20.04+, CentOS 8+, Debian 11+)

### Development Tools (Optional)

- Maven 3.9.x
- Git 2.x
- VS Code / IntelliJ IDEA / Eclipse

---

## Environment Setup

### Windows Setup

1. **Install Java JDK 17+**
   ```powershell
   # Download from Oracle or use Chocolatey
   choco install openjdk17

   # Verify installation
   java -version
   ```

2. **Install Node.js**
   ```powershell
   # Download from nodejs.org or use Chocolatey
   choco install nodejs-lts

   # Verify installation
   node --version
   npm --version
   ```

3. **Install MySQL**
   ```powershell
   # Download from mysql.com or use Chocolatey
   choco install mysql

   # Start MySQL service
   net start MySQL80
   ```

### macOS Setup

1. **Install Java JDK 17+**
   ```bash
   # Using Homebrew
   brew install openjdk@17

   # Add to PATH
   echo 'export PATH="/usr/local/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc
   source ~/.zshrc

   # Verify
   java -version
   ```

2. **Install Node.js**
   ```bash
   # Using Homebrew
   brew install node@18

   # Verify
   node --version
   npm --version
   ```

3. **Install MySQL**
   ```bash
   # Using Homebrew
   brew install mysql@8.0
   brew services start mysql@8.0

   # Secure installation
   mysql_secure_installation
   ```

### Linux (Ubuntu/Debian) Setup

1. **Install Java JDK 17+**
   ```bash
   sudo apt update
   sudo apt install openjdk-17-jdk -y

   # Verify
   java -version
   ```

2. **Install Node.js**
   ```bash
   # Using NodeSource repository
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs

   # Verify
   node --version
   npm --version
   ```

3. **Install MySQL**
   ```bash
   sudo apt install mysql-server -y
   sudo systemctl start mysql
   sudo systemctl enable mysql

   # Secure installation
   sudo mysql_secure_installation
   ```

---

## Database Configuration

### 1. Create Database

```sql
-- Login to MySQL
mysql -u root -p

-- Create database
CREATE DATABASE pramana_manager;

-- Create user (optional - for production)
CREATE USER 'pramana_user'@'localhost' IDENTIFIED BY 'YourStrongPassword123!';
GRANT ALL PRIVILEGES ON pramana_manager.* TO 'pramana_user'@'localhost';
FLUSH PRIVILEGES;

-- Verify
SHOW DATABASES;
USE pramana_manager;
```

### 2. Configure Database Connection

Edit `backend/src/main/resources/application.properties`:

```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/pramana_manager?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=your_mysql_password

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# Server Configuration
server.port=8080
```

### 3. Test Database Connection

```bash
# Test connection using MySQL command
mysql -u root -p -e "SELECT 1 FROM DUAL;"
```

---

## Backend Setup

### 1. Clone/Copy Project

```bash
cd /path/to/pramana-manager
cd backend
```

### 2. Build Backend

**Using Maven (recommended):**

```bash
# Clean and compile
mvn clean compile

# Run tests
mvn test

# Package as JAR
mvn clean package -DskipTests
```

**Using Maven Wrapper (if mvnw exists):**

Windows:
```cmd
mvnw.cmd clean package -DskipTests
```

Linux/macOS:
```bash
./mvnw clean package -DskipTests
```

### 3. Run Backend

**Option A - Using Maven:**
```bash
mvn spring-boot:run
```

**Option B - Using JAR:**
```bash
java -jar target/pramana-manager-1.7.0.jar
```

**Option C - With Custom Port:**
```bash
java -jar target/pramana-manager-1.7.0.jar --server.port=8081
```

### 4. Verify Backend is Running

```bash
# Check health endpoint
curl http://localhost:8080/actuator/health

# Or open in browser
# http://localhost:8080/actuator/health
```

---

## Frontend Setup

### 1. Navigate to Frontend Directory

```bash
cd /path/to/pramana-manager
# Already in root directory
```

### 2. Install Dependencies

```bash
# Install all npm packages
npm install

# Or use clean install
npm ci
```

### 3. Configure API URL

Edit `src/services/api.js` or relevant config file to point to backend:

```javascript
const API_BASE_URL = 'http://localhost:8080/api';
```

### 4. Run Frontend

**Development Mode:**
```bash
npm run dev
```

**Production Build:**
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### 5. Access Application

- **Development:** http://localhost:5173
- **Production Preview:** http://localhost:4173

---

## Testing on Different Systems

### Testing on Local Machine (Development)

1. Start MySQL server
2. Start backend: `mvn spring-boot:run`
3. Start frontend: `npm run dev`
4. Access at http://localhost:5173

### Testing on Remote Server (Staging/Production)

#### Option 1: Docker Deployment (Recommended)

Create `Dockerfile` for backend:
```dockerfile
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/pramana-manager-1.7.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: pramana_manager
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/pramana_manager
      SPRING_DATASOURCE_USERNAME: root
      SPRING_DATASOURCE_PASSWORD: rootpassword
    depends_on:
      - mysql

  frontend:
    image: node:18-alpine
    working_dir: /app
    command: sh -c "npm install && npm run build && npm run preview"
    ports:
      - "4173:4173"
    volumes:
      - ./:/app

volumes:
  mysql-data:
```

Run with Docker:
```bash
docker-compose up -d
```

#### Option 2: Traditional Deployment

**Backend on Linux Server:**
```bash
# Create systemd service
sudo nano /etc/systemd/system/pramana-backend.service
```

```ini
[Unit]
Description=Pramana Manager Backend
After=mysql.service

[Service]
User=pramana
WorkingDirectory=/opt/pramana-manager/backend
ExecStart=/usr/bin/java -jar /opt/pramana-manager/backend/target/pramana-manager-1.7.0.jar
SuccessExitStatus=143
TimeoutStopSec=10
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable pramana-backend
sudo systemctl start pramana-backend
sudo systemctl status pramana-backend
```

**Frontend with Nginx:**
```bash
# Build frontend
npm run build

# Install Nginx
sudo apt install nginx -y

# Configure Nginx
sudo nano /etc/nginx/sites-available/pramana-manager
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/pramana-manager/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site and restart Nginx
sudo ln -s /etc/nginx/sites-available/pramana-manager /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Testing on Different Networks

#### LAN Testing

1. **Find your IP address:**
   - Windows: `ipconfig`
   - Linux/Mac: `ifconfig` or `ip addr`

2. **Update API URL** in frontend to use server IP:
   ```javascript
   const API_BASE_URL = 'http://192.168.1.100:8080/api';
   ```

3. **Allow firewall access:**
   ```bash
   # Windows
   netsh advfirewall firewall add rule name="Pramana Backend" dir=in action=allow protocol=TCP localport=8080

   # Linux
   sudo ufw allow 8080/tcp
   sudo ufw allow 5173/tcp
   ```

4. **Access from other devices:**
   - Frontend: http://192.168.1.100:5173
   - Backend: http://192.168.1.100:8080

#### Cloud Testing (AWS, Azure, GCP)

**AWS EC2 Example:**

1. Launch EC2 instance (t2.medium recommended)
2. Configure Security Group:
   - Port 22 (SSH)
   - Port 80 (HTTP)
   - Port 443 (HTTPS)
   - Port 8080 (Backend)
   - Port 3306 (MySQL - restrict to VPC only)

3. Install dependencies and deploy using Traditional Deployment method above

4. Use Elastic IP for static address

5. Configure Route 53 for domain mapping

---

## Environment Variables

### Backend Environment Variables

Create `.env` file in backend directory:

```properties
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=pramana_manager
DB_USERNAME=root
DB_PASSWORD=your_password

# JWT Security
JWT_SECRET=YourSuperSecretKeyMinimum256BitsLongForHS256Algorithm
JWT_EXPIRATION=86400000

# Server
SERVER_PORT=8080

# JIRA Integration (Optional)
JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_API_TOKEN=your_jira_api_token
JIRA_EMAIL=your-email@example.com
```

### Frontend Environment Variables

Create `.env` file in root directory:

```properties
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_NAME=Pramana Manager
VITE_APP_VERSION=1.7.0
```

### Using Environment Variables

**Backend (application.properties):**
```properties
spring.datasource.url=jdbc:mysql://${DB_HOST:localhost}:${DB_PORT:3306}/${DB_NAME:pramana_manager}
spring.datasource.username=${DB_USERNAME:root}
spring.datasource.password=${DB_PASSWORD}
```

**Frontend (Vite):**
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
```

---

## Common Issues & Troubleshooting

### Issue 1: Backend fails to start - "Port 8080 already in use"

**Solution:**
```bash
# Find process using port 8080
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :8080
kill -9 <PID>

# Or use different port
java -jar target/pramana-manager-1.7.0.jar --server.port=8081
```

### Issue 2: Database connection refused

**Solution:**
```bash
# Check MySQL is running
# Windows
sc query MySQL80

# Linux
sudo systemctl status mysql

# Start if not running
# Windows
net start MySQL80

# Linux
sudo systemctl start mysql

# Verify connection
mysql -u root -p -e "SELECT 1;"
```

### Issue 3: Frontend can't connect to backend (CORS error)

**Solution:**

Check backend CORS configuration in `SecurityConfig.java`:
```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(Arrays.asList(
        "http://localhost:5173",
        "http://localhost:4173",
        "http://your-production-domain.com"
    ));
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true);
    // ... rest of config
}
```

### Issue 4: npm install fails

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install

# If still fails, try with legacy peer deps
npm install --legacy-peer-deps
```

### Issue 5: Build fails - Java version mismatch

**Solution:**
```bash
# Check Java version
java -version

# Set JAVA_HOME if needed
# Windows
set JAVA_HOME=C:\Program Files\Java\jdk-17

# Linux/Mac
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk
export PATH=$JAVA_HOME/bin:$PATH
```

---

## Testing Checklist

### Pre-Deployment Testing

- [ ] Database connection successful
- [ ] Backend starts without errors
- [ ] Frontend builds successfully
- [ ] All API endpoints respond correctly
- [ ] Authentication/Authorization working
- [ ] CORS configured properly for target environment

### Feature Testing

#### User Management
- [ ] User registration works
- [ ] User login works
- [ ] JWT token generation and validation
- [ ] Role-based access control (ADMIN/USER)
- [ ] Password reset functionality

#### Project Management
- [ ] Create/Read/Update/Delete projects
- [ ] Project member management
- [ ] Access control based on project membership

#### Test Case Management
- [ ] Create/Read/Update/Delete test cases
- [ ] Test case prioritization
- [ ] Module association
- [ ] Test case search and filtering

#### Test Run Execution
- [ ] Create test runs
- [ ] Execute individual tests
- [ ] **Bulk update test status (NEW in 1.7.0)**
- [ ] Select all tests
- [ ] Select tests by module
- [ ] JIRA integration for bug creation
- [ ] Progress tracking

#### Test Data Management
- [ ] Create/Read/Update/Delete test data
- [ ] Environment-specific data (DEV/QA/STAGING/PROD)
- [ ] Data type support (KEY_VALUE/JSON/CSV/XML)
- [ ] Automation API access
- [ ] Search and filtering

#### Reporting
- [ ] Test run reports generation
- [ ] PDF export with pie charts
- [ ] Excel export
- [ ] Custom report naming
- [ ] Trend analysis
- [ ] Project-based filtering

#### Metrics & Dashboard
- [ ] Dashboard statistics display
- [ ] Project metrics
- [ ] Test execution metrics
- [ ] Pass/Fail rate calculations

### Performance Testing

- [ ] Page load time < 3 seconds
- [ ] API response time < 500ms
- [ ] Concurrent user handling (10+ users)
- [ ] Large dataset handling (1000+ test cases)
- [ ] File upload/download performance

### Security Testing

- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] JWT token expiration
- [ ] Unauthorized access blocked
- [ ] Sensitive data encryption

### Cross-Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Safari (latest)

### Responsive Design Testing

- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

---

## Performance Testing

### Load Testing with Apache JMeter

1. **Install JMeter**
   ```bash
   # Download from https://jmeter.apache.org/download_jmeter.cgi
   ```

2. **Create Test Plan**
   - Add Thread Group (100 users, 10 second ramp-up)
   - Add HTTP Request sampler for API endpoints
   - Add listeners (View Results Tree, Summary Report)

3. **Run Load Test**
   ```bash
   jmeter -n -t test-plan.jmx -l results.jtl -e -o report
   ```

### Database Performance

```sql
-- Check slow queries
SHOW VARIABLES LIKE 'slow_query_log';
SET GLOBAL slow_query_log = 'ON';

-- Analyze table
ANALYZE TABLE test_cases;
ANALYZE TABLE test_runs;
ANALYZE TABLE test_executions;

-- Check indexes
SHOW INDEX FROM test_cases;
```

### Application Monitoring

**Spring Boot Actuator Endpoints:**
```bash
# Health check
curl http://localhost:8080/actuator/health

# Metrics
curl http://localhost:8080/actuator/metrics

# HTTP trace
curl http://localhost:8080/actuator/httptrace
```

---

## Version History

### Version 1.7.0 (Current)
- **NEW:** Bulk update functionality for test executions
- **NEW:** Select all tests option
- **NEW:** Module-based test selection
- **NEW:** Bulk status update with dropdown
- **IMPROVED:** User experience in test execution workflow
- **ENHANCED:** Backend bulk update API endpoint

### Version 1.6.0
- JIRA integration for bug creation
- Advanced reporting with pie charts
- Custom report naming
- Project access filtering

### Version 1.5.0
- Test Data Management UI redesign
- Test Runs table view with pagination
- Reports page improvements
- Environment-based data filtering

---

## Support & Contribution

For issues, questions, or contributions:
- **GitHub Issues:** [Create an issue]
- **Email:** support@pramana-manager.com
- **Documentation:** See AUTOMATION_API_GUIDE.md for API integration

---

## License

Pramana Manager © 2024. All rights reserved.
