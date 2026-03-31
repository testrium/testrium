# Privacy Policy

**Effective date:** 1 January 2025

Testrium is a **self-hosted, open-source** application. This privacy policy explains what data Testrium collects and how it is handled.

---

## The short version

Testrium collects **zero data** from you or your users. There is no telemetry, no analytics, no third-party data sharing, and no communication back to Testrium servers. Everything stays on your own infrastructure.

---

## What Testrium does NOT collect

- No usage analytics or telemetry
- No crash reports sent to external services
- No personally identifiable information (PII) transmitted outside your server
- No tracking pixels, cookies, or fingerprinting
- No third-party scripts loaded at runtime

---

## Data you store yourself

When you run Testrium, all data your team creates — users, projects, test cases, test runs, reports — is stored in the embedded H2 database on **your own server**. You are the sole data controller.

Testrium does not have access to this data, cannot read it, and has no mechanism to retrieve it.

---

## Authentication data

User credentials (email address and BCrypt-hashed password) are stored in your local database. Passwords are never stored in plain text. JSON Web Tokens (JWT) are used for session management and are never persisted to external systems.

---

## JIRA integration

If you configure JIRA integration, your JIRA API token is stored **encrypted** in your local database. This token is only used to make API calls to your own JIRA instance and is never transmitted to Testrium or any other third party.

---

## Infrastructure

You choose where Testrium runs — your laptop, a company server, a private cloud VM, or on-premises hardware. Testrium does not provide hosting and has no visibility into your deployment.

---

## Updates and downloads

When you pull a Docker image (`docker compose pull`) or download a JAR from GitHub Releases, you interact with Docker Hub and GitHub respectively. Their own privacy policies apply to those interactions.

---

## Changes to this policy

If this policy changes, the updated version will be committed to the repository and the effective date above will be updated.

---

## Contact

Questions about this policy? Open an issue on [GitHub](https://github.com/testrium/testrium/issues).
