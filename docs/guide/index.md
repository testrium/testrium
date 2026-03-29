# Introduction

Testrium is a full-stack, self-hosted **Test Case Management System** built with Spring Boot and React.

It gives QA teams a structured way to manage test cases, execute test runs, track results, and generate reports — without relying on spreadsheets or expensive SaaS tools.

## What You Can Do

- **Create and organize** test cases with priorities, types, steps, and expected results
- **Run tests** individually or in bulk with real-time progress tracking
- **Update results** for multiple tests at once with bulk operations
- **Integrate with JIRA** to file bugs directly from failed executions
- **Store test data** per environment (DEV, QA, STAGING, PROD)
- **Generate reports** in PDF or Excel with charts and trend analysis
- **Connect automation frameworks** via the REST API

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Spring Boot 3.2, Java 17 |
| Frontend | React 18, Vite, Tailwind CSS |
| Database | MySQL 8 (Docker) or H2 (local dev) |
| Auth | JWT + Spring Security |
| Deployment | Docker (single image) |

## Choose Your Setup

### I want the fastest setup
→ [Docker Setup](/guide/docker-setup) — Recommended. Up in under 5 minutes, no Java or Node required.

### I want to develop or contribute
→ [Local Development](/guide/local-dev) — Run backend and frontend separately with hot reload.
