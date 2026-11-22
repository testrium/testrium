# Testrium Testing Guide

**Version:** 2.2.1
**Last Updated:** November 2026

This guide explains how to set up Testrium on different systems and environments, and how to check that a build works before you release or deploy it.

---

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Ways to Run Testrium](#ways-to-run-testrium)
3. [Option A: Docker Compose](#option-a-docker-compose)
4. [Option B: Local Development](#option-b-local-development)
5. [Option C: Single JAR](#option-c-single-jar)
6. [Using MySQL Instead of H2](#using-mysql-instead-of-h2)
7. [First Run: Create the Admin Account](#first-run-create-the-admin-account)
8. [Deploying to a Server](#deploying-to-a-server)
9. [Environment Variables](#environment-variables)
10. [Common Issues & Troubleshooting](#common-issues--troubleshooting)
11. [Testing Checklist](#testing-checklist)
12. [Performance Testing](#performance-testing)

---

## System Requirements

What you need depends on how you run Testrium:

| Option | Requirements |
|--------|--------------|
| Docker Compose | Docker with the Compose plugin (`docker compose`) |
| Local development | Java 17+, Maven 3.9+, Node.js 18+, npm 9+ |
| Single JAR (run only) | Java 17+ |

MySQL is **optional**. Without any database configuration, the backend uses an embedded H2 file database at `./data/testrium`. The Docker Compose setup runs MySQL 8.0 for you.

**Hardware:** 2 GB RAM is enough for a small team, and 4 GB or more is better when MySQL runs on the same machine. You need about 1 GB of disk, plus space for attachments and the database.

**Supported OS:** Windows 10/11, macOS 12+, and Linux (any distribution that runs Docker or Java 17).

### Installing Java and Node.js

```bash
# Ubuntu / Debian
sudo apt update
sudo apt install -y openjdk-17-jdk maven
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# macOS (Homebrew)
brew install openjdk@17 maven node@20

# Windows (Chocolatey)
choco install temurin17 maven nodejs-lts
```

Check the versions:

```bash
java -version
mvn -v
node --version
```

---

## Ways to Run Testrium

| | Database | Frontend served from | URL |
|---|---|---|---|
| **A. Docker Compose** (recommended) | MySQL 8.0 container | Backend (single container) | `http://localhost:${APP_PORT}` |
| **B. Local development** | H2 file DB | Vite dev server | `http://localhost:5173` |
| **C. Single JAR** | H2 file DB (or MySQL) | Backend | `http://localhost:8080` |

---

## Option A: Docker Compose

This uses the published image `sddmhossain/testrium` and the `docker-compose.yml` in the repository root.

```bash
# From a clone of the repo, or download the two files:
curl -O https://raw.githubusercontent.com/testrium/testrium/master/docker-compose.yml
curl -O https://raw.githubusercontent.com/testrium/testrium/master/.env.example

cp .env.example .env
# Edit .env: set JWT_SECRET, the MySQL passwords and APP_PORT

docker compose up -d
```

- The app listens on `APP_PORT`. `.env.example` sets it to `80`, so open `http://localhost`. Without a `.env`, the compose file defaults to `8080`.
- Set `TESTRIUM_VERSION` in `.env` to pin a release (for example `2.2.1`) instead of `latest`.
- Data is kept in the `mysql_data` and `uploads_data` volumes. `docker compose down` keeps them, while `docker compose down -v` **deletes** them.

Useful commands:

```bash
docker compose ps            # container status
docker compose logs -f app   # follow application logs
docker compose pull && docker compose up -d   # upgrade to a newer image
```

On Windows, `start.bat` and `stop.bat` in the repo root wrap these commands. If Docker isn't installed, `start.bat` falls back to running the JAR with Java.

### Building the image yourself

```bash
docker build -t testrium:local .
```

The `Dockerfile` builds the frontend, bundles it into the backend JAR and runs it on `eclipse-temurin:17-jre-alpine`. To run your local image, set `image: testrium:local` for the `app` service in `docker-compose.yml`.

---

## Option B: Local Development

Use this when you work on the code. The backend and the frontend run separately.

### 1. Backend

```bash
git clone https://github.com/testrium/testrium.git
cd testrium/backend
mvn spring-boot:run
```

The backend starts on `http://localhost:8080` with an H2 database in `backend/data/`. No database setup is needed, and tables are created on startup (`spring.jpa.hibernate.ddl-auto=update`).

### 2. Frontend

In a second terminal, from the repository root:

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. The frontend calls the API at `VITE_API_BASE_URL`, which defaults to `http://localhost:8080/api`. To point it elsewhere, create a `.env.local` in the repo root:

```properties
VITE_API_BASE_URL=http://localhost:8080/api
```

### 3. Check the backend is up

```bash
curl http://localhost:8080/api/admin/admin-exists
# {"exists":false}  on a fresh database
```

This endpoint doesn't need a login, so it works as a quick health check. Spring Boot Actuator is not included, so `/actuator/*` endpoints don't exist.

### H2 console (local only)

```bash
H2_CONSOLE_ENABLED=true mvn spring-boot:run
```

Then open `http://localhost:8080/h2-console`. Use the JDBC URL `jdbc:h2:file:./data/testrium`, the user `sa` and an empty password. **Never enable this in production.**

---

## Option C: Single JAR

The JAR can include the built frontend, so a single process serves both the UI and the API.

**Linux / macOS:**

```bash
VITE_API_BASE_URL=/api npm run build
mkdir -p backend/src/main/resources/static
cp -r dist/* backend/src/main/resources/static/
cd backend
mvn clean package -DskipTests
java -jar target/testrium-2.2.1.jar
```

**Windows:** run `build.bat` from the repository root.

Open `http://localhost:8080`. Pre-built JARs are also attached to [GitHub Releases](https://github.com/testrium/testrium/releases).

Settings can be passed as environment variables or as command-line flags:

```bash
java -jar target/testrium-2.2.1.jar --server.port=8081
SERVER_PORT=8081 JWT_SECRET=... java -jar target/testrium-2.2.1.jar
```

---

## Using MySQL Instead of H2

Docker Compose already uses MySQL. For a JAR or `mvn spring-boot:run`, create the database and a user:

```sql
CREATE DATABASE testrium CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'testrium'@'localhost' IDENTIFIED BY 'ChangeMe123!';
GRANT ALL PRIVILEGES ON testrium.* TO 'testrium'@'localhost';
FLUSH PRIVILEGES;
```

Then point the backend at it with environment variables. You don't need to edit `application.properties`:

```bash
export DB_URL='jdbc:mysql://localhost:3306/testrium?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true'
export DB_DRIVER=com.mysql.cj.jdbc.Driver
export DB_DIALECT=org.hibernate.dialect.MySQLDialect
export DB_USERNAME=testrium
export DB_PASSWORD='ChangeMe123!'

java -jar target/testrium-2.2.1.jar
```

All four of `DB_URL`, `DB_DRIVER`, `DB_DIALECT` and the credentials must be set together. If you change only the URL, the app still uses the H2 driver and dialect.

---

## First Run: Create the Admin Account

On a fresh database there are no users. When you open the app, the login page detects this and redirects to **`/setup`**, where you create the first admin with your own email and password (at least 6 characters). After that, the setup screen is locked.

You can also do this through the API:

```bash
curl -X POST http://localhost:8080/api/admin/create-admin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"a-strong-password","username":"admin"}'
```

Other users can then register (if `REGISTRATION_ENABLED=true`) or be added by the admin.

---

## Deploying to a Server

Docker Compose ([Option A](#option-a-docker-compose)) is the simplest way to deploy. Before you expose it:

- Set a long random `JWT_SECRET` and your own MySQL passwords in `.env`.
- Set `CORS_ALLOWED_ORIGINS` to your public URL, for example `https://testrium.example.com`.
- Put a reverse proxy with TLS (Nginx, Caddy, Traefik) in front of the app.
- Don't publish the MySQL port. The compose file keeps it on the internal network.

### systemd service (single JAR)

```ini
# /etc/systemd/system/testrium.service
[Unit]
Description=Testrium
After=network.target mysql.service

[Service]
User=testrium
WorkingDirectory=/opt/testrium
EnvironmentFile=/opt/testrium/testrium.env
ExecStart=/usr/bin/java -jar /opt/testrium/testrium.jar
SuccessExitStatus=143
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

`testrium.env` holds the [environment variables](#environment-variables) as `KEY=value` lines. Uploads and the H2 database are stored relative to `WorkingDirectory`.

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now testrium
sudo systemctl status testrium
journalctl -u testrium -f
```

### Nginx reverse proxy

Because the JAR and the Docker image serve both the UI and the API, Nginx only needs to proxy everything to one port:

```nginx
server {
    listen 80;
    server_name testrium.example.com;

    client_max_body_size 10m;   # matches the 10 MB upload limit

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Add TLS with `sudo certbot --nginx -d testrium.example.com`.

### Testing from other devices on your network

1. Find the machine's IP (`ip addr` on Linux and macOS, `ipconfig` on Windows).
2. Allow the port through the firewall:
   ```bash
   sudo ufw allow 8080/tcp   # Linux
   ```
   ```powershell
   netsh advfirewall firewall add rule name="Testrium" dir=in action=allow protocol=TCP localport=8080
   ```
3. Add the URL you'll use (for example `http://192.168.1.100:8080`) to `CORS_ALLOWED_ORIGINS`.
4. If you use the Vite dev server, run `npm run dev -- --host` and set `VITE_API_BASE_URL=http://192.168.1.100:8080/api`.

### Cloud VMs (AWS, Azure, GCP)

Any VM with 2 vCPU and 4 GB RAM is enough. Install Docker and follow Option A. Open only ports 80 and 443 (plus 22 for SSH) in the security group, never 3306.

---

## Environment Variables

### Backend

| Variable | Default | Purpose |
|----------|---------|---------|
| `SERVER_PORT` | `8080` | HTTP port |
| `DB_URL` | `jdbc:h2:file:./data/testrium` | JDBC URL |
| `DB_DRIVER` | `org.h2.Driver` | Use `com.mysql.cj.jdbc.Driver` for MySQL |
| `DB_DIALECT` | `org.hibernate.dialect.H2Dialect` | Use `org.hibernate.dialect.MySQLDialect` for MySQL |
| `DB_USERNAME` / `DB_PASSWORD` | `sa` / *(empty)* | Database credentials |
| `JWT_SECRET` | placeholder | **Change in production.** At least 32 characters |
| `JWT_EXPIRATION` | `86400000` | Token lifetime in ms (24 h) |
| `JIRA_ENCRYPTION_KEY` | `TestriumJiraKey1` | Encrypts stored JIRA tokens. Must be exactly 16 characters |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,http://localhost` | Comma-separated list of allowed frontend origins |
| `UPLOAD_DIR` | `./uploads` | Where attachments are stored |
| `H2_CONSOLE_ENABLED` | `false` | Enable `/h2-console` (local only) |
| `CLIENT_NAME` | `Testrium` | Display name |
| `CLIENT_ALLOWED_DOMAINS` | *(empty)* | Restrict registration to these email domains |
| `REGISTRATION_ENABLED` | `true` | Allow self-registration |
| `EMAIL_VERIFICATION_REQUIRED` | `false` | Require email verification on sign-up (needs SMTP) |
| `MAIL_SMTP_HOST` / `MAIL_SMTP_PORT` | `smtp.gmail.com` / `587` | SMTP server |
| `MAIL_SMTP_USERNAME` / `MAIL_SMTP_PASSWORD` | *(empty)* | SMTP credentials |
| `MAIL_SMTP_FROM` | `noreply@testrium.com` | Sender address |

Docker Compose adds its own variables (`MYSQL_*`, `APP_PORT`, `TESTRIUM_VERSION`). See `.env.example`.

JIRA, per-project SMTP and Slack/Teams webhooks are configured **in the UI** per project, not through environment variables.

### Frontend (build time)

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_API_BASE_URL` | `http://localhost:8080/api` | API base URL. Use `/api` when the backend serves the UI |

Vite reads this value when it builds, so changing it requires a rebuild.

---

## Common Issues & Troubleshooting

### Port 8080 already in use

```bash
# Linux / macOS
lsof -i :8080
# Windows
netstat -ano | findstr :8080
```

Stop that process, or start Testrium on another port with `SERVER_PORT=8081`.

### Port 5173 already in use

The dev server uses `strictPort` and exits instead of switching ports. Stop the other Vite process, or run `npm run dev -- --port 5174` and add that origin to `CORS_ALLOWED_ORIGINS`.

### CORS error in the browser console

The frontend's origin isn't in `CORS_ALLOWED_ORIGINS`. Add it (scheme, host and port, comma-separated, no trailing slash) and restart the backend. There's no need to edit `SecurityConfig.java`.

### Backend can't connect to MySQL

- Check that MySQL is running: `sudo systemctl status mysql`, or `docker compose ps`.
- Check that `DB_DRIVER` and `DB_DIALECT` are set to the MySQL values, not just `DB_URL`.
- With Docker, the app waits for the MySQL health check. Watch `docker compose logs -f mysql` on first start, since initialization can take a minute.

### Login page keeps redirecting to `/setup`

No admin exists in the database the backend is using. This happens when you switch between H2 and MySQL, or run the JAR from a different working directory (the H2 file is relative). Create the admin again, or start from the original directory.

### `npm install` fails

```bash
rm -rf node_modules
npm cache clean --force
npm ci
```

### Build fails with a Java version error

```bash
java -version   # must be 17 or newer
mvn -v          # check the "Java version" line, since Maven may use a different JDK
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
```

---

## Testing Checklist

Use this before tagging a release or after deploying to a new environment.

### Build & startup

- [ ] `mvn -B verify` passes in `backend/` (CI runs this)
- [ ] `npm run build` passes
- [ ] `docker build .` succeeds
- [ ] App starts with H2 and with MySQL
- [ ] `/setup` appears on a fresh database and is locked after the admin is created
- [ ] CORS works from the configured origins

### Users & access

- [ ] Registration (respects `REGISTRATION_ENABLED` and allowed domains)
- [ ] Email verification, when enabled
- [ ] Login, logout and token expiry
- [ ] Forgot password
- [ ] Role-based access: admin, lead and member see only what they should

### Projects

- [ ] Create, edit and delete projects
- [ ] Add and remove project members
- [ ] Non-members can't open a project

### Test cases

- [ ] Create, edit and delete test cases with steps and expected results
- [ ] Modules, priority and automation type
- [ ] Tags: add, remove, and filter by tag
- [ ] Search and filters
- [ ] Bulk import from Excel/CSV (see [BULK_IMPORT_GUIDE.md](./BULK_IMPORT_GUIDE.md))
- [ ] Export filtered test cases to Excel

### Test runs

- [ ] Create, edit and clone test runs
- [ ] Execute individual tests with comments and actual results
- [ ] Bulk status update, select all, and select by module
- [ ] Create a JIRA bug from a failed execution
- [ ] Progress tracking

### Notifications

- [ ] Per-project SMTP settings, including the "send test email" button
- [ ] Slack / Teams webhooks fire on "test run assigned" and "test run completed"

### Test data & automation API

- [ ] Create, edit and delete test data in every environment (DEV, QA, STAGING, PROD)
- [ ] All data types (KEY_VALUE, JSON, CSV, XML)
- [ ] Automation API with a JWT (see [AUTOMATION_API_GUIDE.md](./AUTOMATION_API_GUIDE.md))

### Reports & dashboards

- [ ] Dashboard statistics
- [ ] Cross-project Overview: admins see all projects, leads and members see their own
- [ ] PDF export with charts, and Excel export
- [ ] Custom report names, trends and project filtering

### Security

- [ ] `/api/**` returns 401 without a token
- [ ] Users can't reach other projects' data by changing IDs
- [ ] Stored JIRA and SMTP passwords are encrypted
- [ ] Production uses a custom `JWT_SECRET` and has the H2 console disabled

### Browsers & layouts

- [ ] Chrome, Firefox, Edge and Safari (latest)
- [ ] Light and dark mode
- [ ] Desktop (1920×1080), laptop (1366×768), tablet (768×1024) and mobile (375×667)

---

## Performance Testing

### Targets

- Pages load in under 3 seconds.
- Most API calls respond in under 500 ms.
- The app stays responsive with 10+ concurrent users and 1,000+ test cases in a project.

### Load testing

Any HTTP load tool works. With [k6](https://k6.io):

```javascript
// load-test.js
import http from 'k6/http';
import { check } from 'k6';

export const options = { vus: 20, duration: '1m' };
const BASE = 'http://localhost:8080/api';
const TOKEN = __ENV.TOKEN; // a JWT from POST /api/auth/login

export default function () {
  const res = http.get(`${BASE}/projects`, { headers: { Authorization: `Bearer ${TOKEN}` } });
  check(res, { 'status 200': (r) => r.status === 200 });
}
```

```bash
k6 run -e TOKEN=eyJ... load-test.js
```

JMeter works too: create a thread group that calls the same endpoints with an `Authorization: Bearer` header, then run `jmeter -n -t plan.jmx -l results.jtl -e -o report`.

Run load tests against MySQL, not H2, to get realistic numbers.

### Database

```sql
-- MySQL: log queries slower than 1 second
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;

SHOW INDEX FROM test_cases;
ANALYZE TABLE test_cases, test_runs, test_executions;
```

---

## Version History

See [CHANGELOG.md](./CHANGELOG.md).

---

## Support & Contribution

- **Issues:** https://github.com/testrium/testrium/issues
- **Automation API:** [AUTOMATION_API_GUIDE.md](./AUTOMATION_API_GUIDE.md)
- **Contributing:** see the Contributing section in [README.md](./README.md)

---

## License

Testrium is licensed under the [Apache License 2.0](./LICENSE.txt). See [NOTICE](./NOTICE) and the [Trademark & Attribution Policy](./TRADEMARKS.md).
