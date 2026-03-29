# Local Development

For contributors or teams who want to run Testrium without Docker.

## Prerequisites

- Java JDK 17+
- Node.js 18+
- Maven 3.9+
- Git

## Clone the Repository

```bash
git clone https://github.com/testrium/testrium.git
cd testrium
```

## Backend

The backend uses H2 (file-based database) by default — no MySQL setup needed for local dev.

```bash
cd backend
mvn spring-boot:run
```

Backend starts at **http://localhost:8080**

### First Run — Create Admin

Hit the endpoint to create the default admin account:

```
GET http://localhost:8080/api/admin/admin-exists
POST http://localhost:8080/api/admin/create-admin
```

Or register via the UI after the frontend is running.

## Frontend

```bash
# From the project root
npm install
npm run dev
```

Frontend starts at **http://localhost:5173**

The Vite dev server proxies API calls to `http://localhost:8080` automatically via the `VITE_API_BASE_URL` env variable.

## Environment

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_NAME=Testrium
VITE_APP_VERSION=1.7.0
```

## H2 Console (Dev Only)

Enable the H2 database console for debugging:

In `backend/src/main/resources/application.properties`:
```properties
spring.h2.console.enabled=true
```

Then access: **http://localhost:8080/h2-console**
- JDBC URL: `jdbc:h2:file:./data/testrium`
- Username: `sa`
- Password: *(empty)*

::: warning
Never enable the H2 console in production.
:::
