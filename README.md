# PowerPulse BD

PowerPulse BD is a Stage 1 course project for Desktop & Web Programming Lab. It focuses on a practical Bangladesh problem: people need a simple way to report local loadshedding, view community updates, and estimate how long a home IPS/solar backup can run essential appliances.

The project is intentionally dependency-light so it can run in a lab machine without npm installation. It still demonstrates the main course outcomes: frontend UI, backend APIs, authentication, persistence, secure password hashing, OOP, validation, and deployment-ready structure.

## Features

- Register, login, logout with JWT-style signed tokens.
- Password hashing with Node crypto PBKDF2.
- Community outage feed with district, area, type, duration, severity, and moderation status.
- Authenticated outage reporting.
- Dashboard metrics for total reports, recent reports, active areas, and verified reports.
- Solar backup estimator built with OOP classes: `Battery`, `Appliance`, `Fan`, `Light`, `Router`, `Laptop`, `PhoneCharger`, and `PowerCalculator`.
- Saved solar estimates per user.
- Admin moderation for report status.
- Local JSON persistence that can later migrate to PostgreSQL/Prisma.

## Demo Accounts

```text
User:
Email: demo@powerpulse.bd
Password: Demo@12345

Admin:
Email: mahi242-35-001@diu.edu.bd
Password: Mahi@12345
```

## Run Locally

From this folder:

```powershell
node backend/src/server.js
```

If the Windows Store Node shim is blocked, use the bundled Codex Node runtime:

```powershell
& 'C:\Users\Admin\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' backend\src\server.js
```

Open:

```text
http://localhost:4200
```

The database is created automatically at:

```text
backend/data/powerpulse.db.json
```

## Tests

```powershell
node backend/tests/solar.test.js
node backend/tests/api-smoke.test.js
```

Bundled runtime version:

```powershell
& 'C:\Users\Admin\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' backend\tests\solar.test.js
& 'C:\Users\Admin\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' backend\tests\api-smoke.test.js
```

## Course Mapping

| Course topic | Where it appears |
| --- | --- |
| HTML5/CSS3 | `frontend/index.html`, `frontend/assets/styles.css` |
| JavaScript DOM/events | `frontend/src/app.js` |
| Component-based UI | `frontend/src/components.js`, `frontend/src/pages.js` |
| Server-side scripting | `backend/src/server.js`, `backend/src/routes/` |
| REST APIs | `/api/auth`, `/api/outages`, `/api/solar`, `/api/metrics` |
| Database integration | `backend/src/services/database.js` |
| Authentication/security | `backend/src/services/authService.js`, `backend/src/utils/security.js` |
| OOP | `backend/src/services/solar/` |
| Version control/project structure | separated `frontend/`, `backend/`, `architecture/`, `notes/` |

## Stage 2 Ideas

- PostgreSQL + Prisma migration.
- React + Vite frontend once npm is available.
- Real map using Leaflet.
- Multi-confirmation trust score for reports.
- SMS/email alerts.
- Bangla localization.
- Official utility notice integration where public data is available.
