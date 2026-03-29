# Testrium

**A modern, full-stack Test Case Management System for QA teams.**

Built with Spring Boot + React. One Docker image. Runs in minutes.

---

## Quick Start

```bash
# 1. Download compose file and config template
curl -O https://raw.githubusercontent.com/PanjatanCoders/testrium/master/docker-compose.yml
curl -O https://raw.githubusercontent.com/PanjatanCoders/testrium/master/.env.example

# 2. Configure
cp .env.example .env
# Edit .env — set your DB passwords, JWT secret, and admin credentials

# 3. Run
docker compose up -d
```

Open **http://localhost:8080** and login with `admin@testrium.com` / `Admin@123`

> Change the default admin password after first login.

---

## What's Inside

- **Test Case Management** — Create, organize, and manage test cases with priorities, types, and automation flags
- **Test Run Execution** — Execute test runs with real-time tracking and bulk status updates
- **JIRA Integration** — Create bugs directly from failed test executions
- **Test Data Management** — Environment-specific data (DEV/QA/STAGING/PROD) with API access for automation frameworks
- **Reports & Analytics** — PDF/Excel exports, charts, trend analysis, and metrics dashboard
- **Role-Based Access** — ADMIN and USER roles with project-level permissions
- **Bulk Import** — Import test cases via Excel or CSV
- **Dark Mode** — Full dark mode support

---

## Architecture

A single all-in-one image:
- **Backend:** Spring Boot 3.2, Java 17
- **Frontend:** React 18, served directly by Spring Boot
- **Database:** MySQL 8 (via Docker Compose) or H2 for local dev

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `MYSQL_PASSWORD` | `testrium123` | MySQL user password |
| `MYSQL_ROOT_PASSWORD` | `rootpassword` | MySQL root password |
| `JWT_SECRET` | *(insecure default)* | **Change this!** Min 32 chars |
| `ADMIN_EMAIL` | `admin@testrium.com` | Default admin login |
| `ADMIN_PASSWORD` | `Admin@123` | Default admin password |
| `JIRA_ENCRYPTION_KEY` | `TestriumJiraKey1` | Exactly 16 chars for AES-128 |
| `APP_PORT` | `8080` | Host port to expose |
| `CLIENT_NAME` | `Testrium` | Branding name |
| `REGISTRATION_ENABLED` | `true` | Allow new user registration |
| `EMAIL_VERIFICATION_REQUIRED` | `false` | Require email verification |
| `MAIL_SMTP_USERNAME` | *(empty)* | Gmail SMTP username |
| `MAIL_SMTP_PASSWORD` | *(empty)* | Gmail SMTP password |

---

## Source Code

GitHub: [https://github.com/PanjatanCoders/testrium](https://github.com/PanjatanCoders/testrium)

---

## License

Proprietary © Testrium. All rights reserved.
