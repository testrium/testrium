# Configuration Reference

All Testrium settings are controlled via environment variables. Set them in your `.env` file when using Docker Compose.

## Database

| Variable | Default | Description |
|---|---|---|
| `MYSQL_DATABASE` | `testrium` | Database name |
| `MYSQL_USER` | `testrium` | Database user |
| `MYSQL_PASSWORD` | `testrium123` | **Change this** |
| `MYSQL_ROOT_PASSWORD` | `rootpassword` | **Change this** |

## Security

| Variable | Default | Description |
|---|---|---|
| `JWT_SECRET` | *(insecure default)* | **Required.** Min 32 chars. Generate with `openssl rand -hex 32` |
| `JWT_EXPIRATION` | `86400000` | Token expiry in ms (default: 24 hours) |
| `JIRA_ENCRYPTION_KEY` | `TestriumJiraKey1` | Must be **exactly 16 characters** |

## Admin Account

| Variable | Default | Description |
|---|---|---|
| `ADMIN_EMAIL` | `admin@testrium.com` | Initial admin login email |
| `ADMIN_PASSWORD` | `Admin@123` | Initial admin password — **change after first login** |

## Application

| Variable | Default | Description |
|---|---|---|
| `APP_PORT` | `8080` | Host port to expose |
| `CLIENT_NAME` | `Testrium` | App branding name |
| `REGISTRATION_ENABLED` | `true` | Allow new user self-registration |
| `EMAIL_VERIFICATION_REQUIRED` | `false` | Require email verification on signup |
| `CLIENT_ALLOWED_DOMAINS` | *(empty = all)* | Restrict signups to specific email domains (comma-separated, e.g. `company.com`) |

## Email / SMTP *(Optional)*

Required only if `EMAIL_VERIFICATION_REQUIRED=true` or you want password reset emails.

| Variable | Default | Description |
|---|---|---|
| `MAIL_SMTP_HOST` | `smtp.gmail.com` | SMTP server host |
| `MAIL_SMTP_PORT` | `587` | SMTP port |
| `MAIL_SMTP_USERNAME` | *(empty)* | SMTP username / email |
| `MAIL_SMTP_PASSWORD` | *(empty)* | SMTP password or app password |

## Example `.env`

```bash
# Database
MYSQL_ROOT_PASSWORD=str0ng_r00t_pass
MYSQL_DATABASE=testrium
MYSQL_USER=testrium
MYSQL_PASSWORD=str0ng_db_pass

# Security
JWT_SECRET=b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4

# Admin
ADMIN_EMAIL=admin@mycompany.com
ADMIN_PASSWORD=MySecurePass@2024

# App
APP_PORT=8080
CLIENT_NAME=My QA Team
REGISTRATION_ENABLED=true
```
