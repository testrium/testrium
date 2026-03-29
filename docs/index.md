---
layout: home

hero:
  name: "Testrium"
  text: "Test Case Management Built for QA Teams"
  tagline: Plan, execute, and report on your software testing — all in one place. Self-hosted, Docker-ready, and free to use.
  image:
    src: /hero.png
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

<details>
<summary><strong>👩‍💻 I'm a QA Engineer managing test cases manually</strong></summary>

Testrium replaces your spreadsheets with a proper test management system. Create structured test cases with steps, priorities, and expected results. Execute test runs, record actual results, and generate reports — all in one place, with no per-seat fees.

</details>

<details>
<summary><strong>🧑‍💼 I'm a QA Manager who needs visibility across projects</strong></summary>

Get a real-time dashboard of pass rates, execution trends, and team activity across all your projects and modules. Generate PDF or Excel reports to share with stakeholders in minutes.

</details>

<details>
<summary><strong>🤖 I'm an Automation Engineer integrating with test frameworks</strong></summary>

Use the REST API to fetch environment-specific test data and post execution results from Selenium, RestAssured, Playwright, or Cypress. No more hardcoded credentials in scripts — store everything in Testrium's test data store.

</details>

<details>
<summary><strong>🧑‍🔧 I'm a Developer who wants testing integrated into CI/CD</strong></summary>

Post test execution results directly from your pipeline using the Automation API. Track automated test runs alongside manual ones in a single view.

</details>

<details>
<summary><strong>💰 Is Testrium free?</strong></summary>

Yes. Testrium is completely free to self-host. There are no per-user fees, no seat limits, and no feature paywalls. You run it on your own infrastructure.

</details>

<details>
<summary><strong>🔓 Is it open source?</strong></summary>

Yes. The full source code is available on [GitHub](https://github.com/testrium/testrium). You can inspect it, fork it, and contribute to it.

</details>

<details>
<summary><strong>☁️ Do I need cloud infrastructure to run it?</strong></summary>

No. Testrium runs anywhere Docker runs — your laptop, a local server, a VPS, or cloud VMs (AWS EC2, Azure VM, GCP Compute). It's a single Docker image with MySQL as the only external dependency.

</details>

<details>
<summary><strong>🔒 Is my data safe?</strong></summary>

Your data never leaves your infrastructure. Testrium is fully self-hosted — there are no external telemetry calls or third-party data sharing. You own everything.

</details>

<details>
<summary><strong>🔁 Can I migrate from another tool?</strong></summary>

Yes. Use the bulk import feature to import test cases from Excel or CSV files. Most test management tools support exporting to Excel, making migration straightforward.

</details>

<details>
<summary><strong>📦 How do I update to a newer version?</strong></summary>

```bash
docker compose pull
docker compose up -d
```

Your database volume is preserved across updates.

</details>

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
