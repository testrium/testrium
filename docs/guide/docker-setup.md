# Docker Setup

The recommended way to run Testrium. No Java or Node.js required — just Docker.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose plugin on Linux)

## Step 1 — Download the files

```bash
curl -O https://raw.githubusercontent.com/testrium/testrium/master/docker-compose.yml
curl -O https://raw.githubusercontent.com/testrium/testrium/master/.env.example
```

## Step 2 — Configure

```bash
cp .env.example .env
```

Open `.env` and update at minimum:

```bash
# Strong random string — required for security
JWT_SECRET=replace_this_with_a_long_random_string_at_least_32_chars

# Database passwords
MYSQL_ROOT_PASSWORD=your_root_password
MYSQL_PASSWORD=your_db_password

# Admin login
ADMIN_EMAIL=admin@yourcompany.com
ADMIN_PASSWORD=YourSecurePassword
```

::: warning Change the defaults
Never run in production with the default `JWT_SECRET` or passwords. Generate a strong secret with:
```bash
openssl rand -hex 32
```
:::

## Step 3 — Start

```bash
docker compose up -d
```

This starts:
- **MySQL 8** database
- **Testrium** app (frontend + backend in one container)

## Step 4 — Access

Open **http://localhost:8080** in your browser.

Log in with the admin email and password you set in `.env`.

::: tip First login
After logging in, go to your profile and change the default password immediately.
:::

## Useful Commands

```bash
# View logs
docker compose logs -f app

# Stop
docker compose down

# Stop and delete data
docker compose down -v

# Update to latest image
docker compose pull && docker compose up -d
```

## Changing the Port

To run on a different port, set `APP_PORT` in your `.env`:

```bash
APP_PORT=3000
```

Then `http://localhost:3000` will serve the app.

## Data Persistence

MySQL data is stored in a Docker volume (`mysql_data`). It persists across restarts. To backup:

```bash
docker exec testrium-db mysqldump -u testrium -p testrium > backup.sql
```
