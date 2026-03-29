---
layout: home

hero:
  name: "Testrium"
  text: "Test Case Management Built for QA Teams"
  tagline: Plan, execute, and report on your software testing — all in one place. Self-hosted, Docker-ready, and free to use.
  image:
    src: /logo.svg
    alt: Testrium
  actions:
    - theme: brand
      text: Get Started
      link: /guide/
    - theme: alt
      text: View on GitHub
      link: https://github.com/testrium/testrium

features:
  - icon: 🧪
    title: Test Case Management
    details: Create and organize test cases with steps, expected results, priorities, and types. Supports bulk import via Excel or CSV.

  - icon: ▶️
    title: Test Run Execution
    details: Execute tests individually or in bulk. Track real-time progress, record results, comments, and execution time.

  - icon: ⚡
    title: Bulk Operations
    details: Select multiple test executions and update their status in a single action. Save hours during large test runs.

  - icon: 🔗
    title: JIRA Integration
    details: File bugs directly from failed test executions. Configurable per project with encrypted token storage.

  - icon: 📊
    title: Reports & Analytics
    details: Generate PDF and Excel reports with charts. Track trends, pass rates, and metrics across projects and modules.

  - icon: 🤖
    title: Automation API
    details: RESTful API for Selenium, RestAssured, Playwright and more. Fetch test data and post results programmatically.

  - icon: 🗂️
    title: Test Data Management
    details: Store environment-specific test data (DEV, QA, STAGING, PROD) in KEY_VALUE, JSON, CSV, or XML format.

  - icon: 🔒
    title: Role-Based Access
    details: Admin and User roles with project-level permissions. JWT-based authentication with BCrypt password encryption.

  - icon: 🐳
    title: Docker Ready
    details: Single Docker image. Run the full stack — app and database — with one docker compose up command.
---

## Why Testrium?

Most test management tools are either too expensive, too complex, or locked behind a SaaS paywall.
Testrium is **self-hosted**, **open-source**, and designed to be up and running in **under 5 minutes**.

<div class="vp-doc" style="margin-top: 2rem;">

| | Testrium | Spreadsheets | Heavy SaaS Tools |
|---|---|---|---|
| **Self-hosted** | ✅ | ✅ | ❌ |
| **Free** | ✅ | ✅ | ❌ |
| **JIRA Integration** | ✅ | ❌ | ✅ |
| **Automation API** | ✅ | ❌ | ✅ |
| **Reports & Charts** | ✅ | ❌ | ✅ |
| **Bulk Operations** | ✅ | ❌ | ✅ |
| **Docker Deploy** | ✅ | ❌ | ❌ |

</div>

---

## Who Is It For?

### QA Engineers
Manage your test cases, track runs, and report results without needing expensive tools or approvals.

### Development Teams
Integrate test execution into your workflow. Use the Automation API to push results from CI/CD pipelines.

### QA Managers
Get a real-time view of test coverage, pass rates, and execution trends across all projects.

### Automation Engineers
Use the REST API to fetch test data and post execution results from Selenium, RestAssured, or Playwright frameworks.

---

## Up and Running in Minutes

```bash
curl -O https://raw.githubusercontent.com/testrium/testrium/master/docker-compose.yml
curl -O https://raw.githubusercontent.com/testrium/testrium/master/.env.example
cp .env.example .env
docker compose up -d
```

Open **http://localhost:8080** → login → start testing.

[Full setup guide →](/guide/docker-setup)
