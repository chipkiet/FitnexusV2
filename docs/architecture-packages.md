# FitnexusApp – Architecture & Package Diagrams

This document describes the module/package layout of the Fitnexus monorepo, including diagrams, naming conventions, and brief responsibilities for each package and sub‑system.

## Monorepo Overview

```mermaid
graph TD
  A[fitnexusapp (monorepo)] --> B[packages/backend]
  A --> C[packages/frontend]
  A --> D[AITrainer]
  A --> E[scripts/]
  A --> F[data/]
  A --> G[docs/]
```

### Package Descriptions

| Package             | Description                                                                                                                                     |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/backend`  | Node/Express API: auth, onboarding, exercises, workout plans, admin, nutrition AI proxy, and AI trainer proxy. Uses Sequelize with PostgreSQL.  |
| `packages/frontend` | React/Vite SPA: routing, layouts, pages, components (3D model, exercises, plans, nutrition), auth context, API client/interceptors.             |
| `AITrainer`         | Python FastAPI service: accepts image upload, runs YOLOv8 pose, computes metrics, queries Gemini for recommendations, returns annotated result. |
| `scripts/`          | Data ingestion/normalization scripts for exercises/muscles.                                                                                     |
| `data/`             | Static datasets (exercises, crosswalk, nutrition tables).                                                                                       |
| `docs/`             | Project documentation (system overview, DB schema, backlog).                                                                                    |

---

## Backend Sub‑System (`packages/backend`)

```mermaid
graph LR
  APP[app.js] --> CFG[config/]
  APP --> MIDDLE[middleware/]
  APP --> ROUTES[routes/]
  ROUTES --> CTRL[controllers/]
  CTRL --> MODELS[models/]
  MODELS --> DB[(PostgreSQL)]
  CTRL --> UTILS[utils/]
  subgraph Integrations
    AI[AITrainer (FastAPI)]
    GEM[Gemini API]
  end
  ROUTES -. upload .-> AI
  ROUTES -. nutrition .-> GEM
  CFG --> SEQ[sequelize.js]
  CFG --> PASS[passport.js]
  MODELS -. init .-> INIT[models/initModels.js]
  APP --> BIN[bin/www]
  DB --- MIG[migrations/]
```

### Packages (backend)

- `bin/` – HTTP server bootstrap (`bin/www`).
- `app.js` – Express app construction: security, logging, sessions, CORS, Passport, rate limiters, routers.
- `config/` – DB config (`database.js`, `config.js`), Passport Google OAuth, RBAC policy.
- `middleware/` – `auth.guard.js`, `authOrSession.guard.js`, `role.guard.js`, `activity.tracker.js`.
- `routes/` – Route modules per domain: `auth.routes.js`, `admin.routes.js`, `exercise.routes.js`, `plan.routes.js`, `onboarding.routes.js`, `nutrition.routes.js`, `trainer.routes.js`.
- `controllers/` – Request handlers: authentication, admin, exercises (incl. steps/type filters), plans, onboarding, email OTP/reset.
- `models/` – Sequelize models (User, Exercise, WorkoutPlan, PlanExerciseDetail, UserWorkoutLog, Onboarding\*, PasswordReset…) and `initModels.js` for associations.
- `migrations/` – SQL migrations and seed data.
- `utils/` – Mailer (`nodemailer`), email templates, onboarding validation.

### Naming Conventions (backend)

- Files: `feature.type.js` (`auth.controller.js`, `plan.routes.js`, `user.model.js`).
- Models: PascalCase (e.g., `User`, `Exercise`); DB columns snake_case; enum values UPPERCASE (`role`, `plan`, `status`).
- Functions/vars: lowerCamelCase.
- REST paths: `/api/<resource>` (plural) with subordinate paths for actions.

### Key Flows (backend)

- Auth: JWT + optional Google OAuth (session). Guards accept either JWT or session (`authOrSession`).
- Exercises: listing by muscle/type; steps by id/slug; AI advice endpoint synthesizes Gemini guidance from current DB items.
- Plans: CRUD pseudo endpoints to create plan, fetch items, add items.
- Admin: list users, lock/unlock, set roles/plans, reset password, sub‑admins.
- Nutrition: calls Gemini with safe fallbacks.
- Trainer: receives image upload, forwards to `AITrainer` service, returns annotated results.

---

## Frontend Sub‑System (`packages/frontend`)

```mermaid
graph LR
  APP[App.jsx (Router)] --> PAGES[pages/]
  APP --> LAYOUTS[layouts/]
  APP --> CONTEXT[context/]
  PAGES --> COMPS[components/]
  COMPS --> LIB[lib/]
  CONTEXT --> LIB
  LIB --> API[(Backend API)]
  PUBLIC[public/] --> PAGES
```

### Packages (frontend)

- `src/App.jsx` – Route wiring, protected routes, feature pages.
- `src/pages/` – Feature screens: authentication, onboarding, dashboard, exercises, plans, admin, modeling (3D), nutrition, AI trainer page.
- `src/components/` – Reusable UI (form, auth, common, routing, 3D `HumanModel`, `AiTrainer`).
- `src/layouts/` – Page headers/wrappers (`HeaderDemo`, `HeaderLogin`).
- `src/context/` – `auth.context.jsx` bootstrap user (OAuth session or JWT), redirect helpers.
- `src/lib/` – `api.js` axios client with JWT refresh + pass‑through URLs; token manager; validations.
- `src/hooks/` – Custom hooks (availability checks, onboarding guards…).
- `public/` – Static assets: TFJS models, nutrition tables, images/videos.

### Naming Conventions (frontend)

- Components/Pages: PascalCase (`HeaderDemo.jsx`, `Dashboard.jsx`).
- Hooks: `useXxx` lowerCamelCase (e.g., `usePasswordVisibility`).
- Context: `<name>.context.jsx`.
- Utilities: lowerCamelCase file names (e.g., `api.js`, `tokenManager.js`).

---

## AITrainer Sub‑System (`AITrainer`)

```mermaid
graph LR
  U[Client Image] --> API[/FastAPI\n/analyze-image/]
  API --> YOLO[YOLOv8 Pose]
  YOLO --> METRIC[Compute shoulder/waist ratio]
  API --> LLM[Gemini (LLM)]
  LLM --> ADVICE[JSON Advice]
  API --> IMG[(Annotated Image)]
  API --> OUT{{JSON result}}
```

### Packages (AITrainer)

- `api.py` – FastAPI app: file upload, YOLO inference, prompt to Gemini, response assembly.
- `config.py` – Loads env (e.g., `GEMINI_API_KEY`, `GEMINI_MODEL`).
- `yolov8n-pose.pt` – Model weights.
- `processed_images/` – Served annotated images.

### Naming Conventions (AITrainer)

- Files & functions: `snake_case` (Pythonic). Classes (if any): PascalCase.
- Env vars: UPPER_SNAKE_CASE.

---

## Cross‑Cutting Concerns

- Environments: `.env` in `packages/backend` (JWT, DB, `GEMINI_API_KEY`, `AI_API_URL`, `FRONTEND_URL` …); AITrainer reads environment for Gemini key/model.
- Security: Helmet, rate‑limits, session cookie (OAuth), JWT guard; server‑side CORS allowlist.
- Activity tracking: middleware updates `lastActiveAt` on authenticated requests.
- Email: `nodemailer` with templates for reset/lock/unlock.

---

## Extending the Architecture

- Add a new REST module:
  1. `models/` (Sequelize) + migration;
  2. `controllers/` logic;
  3. `routes/` mapping;
  4. wire in `app.js` and, if needed, `middleware`.
- Add a new page on FE:
  1. create `pages/<Feature>.jsx`;
  2. optional components in `components/`;
  3. add route in `src/App.jsx` (guarded via `PrivateRoute`/`AdminRoute`).
- Integrate an external service:
  - Create dedicated route/controller; store secrets in env; handle fallbacks for resilience.

---

## Appendix: Key Paths at a Glance

- Backend entry: `packages/backend/bin/www`, `packages/backend/app.js`.
- Frontend entry: `packages/frontend/src/App.jsx`.
- AI service entry: `AITrainer/api.py`.
