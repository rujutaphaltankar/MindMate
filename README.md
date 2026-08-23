# 🧠 MindMate AI — AI Mental Wellness Companion

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.0-000000?logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb&logoColor=white)](https://mongodb.com)
[![CI](https://github.com/rujutaphaltankar/MindMate/actions/workflows/ci.yml/badge.svg)](https://github.com/rujutaphaltankar/MindMate/actions)

A privacy-conscious mental wellness platform: mood tracking, private journaling, non-clinical AI
reflection, an empathetic AI companion, wellness recommendations, meditation & breathing tools, and
an anonymous community — built as a full-stack, portfolio-ready project.

> [!CAUTION]
> **MindMate AI is not a medical device, therapist, psychologist, psychiatrist, or emergency
> service.** It does not diagnose mental health conditions or provide medical treatment. If you
> or someone you know is in crisis, contact local emergency services or a crisis line in your area.

---

## ✨ Feature Highlights

| Feature | Description |
|---------|-------------|
| 🎯 **Mood Tracking** | Daily mood, stress, energy & sleep logging with Recharts trend visualizations |
| 📓 **Private Journaling** | Full CRUD with search, tags, date filtering — strictly user-scoped |
| 🤖 **AI Companion Chat** | Empathetic, non-diagnostic conversation with safety gate on every message |
| 🔬 **NLP Emotion Analysis** | Consent-gated, non-clinical sentiment analysis of journal entries |
| 🧘 **Wellness Toolkit** | Animated 4-7-8 breathing exercise, guided meditation library, activity tracking |
| 📊 **Insights & Analytics** | Trend analysis with careful "may be worth observing" language — never diagnoses |
| 👥 **Anonymous Community** | Posts, comments, likes, reports — identity is never exposed |
| 🛡️ **Safety System** | Real-time content classification; crisis resources served from DB, not hard-coded |
| 🔒 **Privacy Controls** | Granular consent settings, full data/account deletion, no soft-delete traps |
| 👑 **Admin Dashboard** | Aggregate stats, report moderation, crisis resource management |

---

## 📋 Project Status — All 10 Phases Complete ✅

| Phase | Scope | Status |
|-------|-------|--------|
| 1 | Project setup + authentication (JWT, bcrypt, protected routes) | ✅ |
| 2 | Dashboard + mood tracking (Recharts trends, Today's Overview, Quick Actions) | ✅ |
| 3 | Journal (CRUD, search, tags, strictly user-scoped) | ✅ |
| 4 | NLP emotion analysis (consent-gated, non-clinical wording) | ✅ |
| 5 | AI wellness companion chat (with safety gate on every message) | ✅ |
| 6 | Wellness toolkit (animated 4-7-8 breathing, meditation library) | ✅ |
| 7 | Insights & analytics (trends, careful "may be worth observing" language) | ✅ |
| 8 | Anonymous community (posts, comments, likes, reports — never exposes identity) | ✅ |
| 9 | Safety system & moderation + admin dashboard | ✅ |
| 10 | Testing, Docker, CI, deployment docs | ✅ |

**35/35 backend tests passing** (pytest + mongomock) · **Frontend build clean** (Vite + Vitest)

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| **Frontend** | React 18, Vite 5, Tailwind CSS 3, React Router 6, Axios, Recharts |
| **Backend** | Python 3.10+, Flask 3.0, Flask-CORS, Flask-JWT-Extended |
| **Database** | MongoDB 7 (PyMongo 4.8) |
| **AI / NLP** | Pluggable — Anthropic Claude API or zero-dependency rule-based fallback |
| **Testing** | pytest + mongomock (backend), Vitest + Testing Library (frontend) |
| **Deploy** | Docker, docker-compose, GitHub Actions CI |

---

## 🏗️ Architecture

```
┌──────────────────┐       ┌─────────────┐       ┌──────────────┐
│  React Frontend  │──────▶│  REST API   │──────▶│   MongoDB    │
│  (Vite + TW)     │  HTTP │  (Flask)    │       │  (PyMongo)   │
└──────────────────┘       └──────┬──────┘       └──────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
               ┌────▼────┐  ┌────▼────┐  ┌────▼────┐
               │  Auth   │  │   AI    │  │ Safety  │
               │ Service │  │ Service │  │ Service │
               └─────────┘  └─────────┘  └─────────┘
                    │
        ┌───────────┼───────────┬───────────┬───────────┐
   ┌────▼────┐ ┌────▼────┐ ┌────▼────┐ ┌────▼────┐ ┌────▼────┐
   │  Mood   │ │ Journal │ │Wellness │ │Community│ │  Admin  │
   │ Service │ │ Service │ │ Service │ │ Service │ │ Service │
   └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘
```

---

## 🤖 AI Service — Works with Zero Setup

[`ai_service.py`](backend/app/services/ai_service.py) defaults to `AI_PROVIDER=rule_based`, a
keyword-based sentiment/reply engine with **no external dependency or API key** — the whole
app works out of the box.

Set `AI_PROVIDER=anthropic` and `ANTHROPIC_API_KEY=...` in `backend/.env` to use Claude instead;
if the API call ever fails, it silently falls back to the rule-based engine so the app never breaks.

---

## 🛡️ Safety System

Every message sent to the AI companion, and every community post/comment, passes through
[`safety_service.py`](backend/app/services/safety_service.py) first. Messages flagged as
high-risk (self-harm, suicidal intent, violence) skip the normal AI reply and instead return a
caring, non-judgmental message plus the crisis resource directory — stored in MongoDB
(`resources` collection) and manageable from the admin dashboard, not hard-coded in the frontend.

---

## 📁 Project Structure

```
mindmate-ai-complete/
├── backend/
│   ├── app/
│   │   ├── __init__.py              # Flask app factory, blueprint registration, resource seeding
│   │   ├── config.py                # Env-driven configuration
│   │   ├── extensions.py            # db (safe proxy), jwt, cors
│   │   ├── models/
│   │   │   ├── user.py              # User model + auth helpers
│   │   │   ├── mood.py              # Mood records
│   │   │   ├── journal.py           # Journal entries
│   │   │   ├── chat.py              # Chat sessions & messages
│   │   │   ├── wellness.py          # Activities & completion tracking
│   │   │   └── community.py         # Posts, comments, reports
│   │   ├── routes/
│   │   │   ├── auth.py              # Register, login, logout, refresh
│   │   │   ├── user.py              # Profile & privacy settings
│   │   │   ├── mood.py              # Mood CRUD
│   │   │   ├── journal.py           # Journal CRUD + search
│   │   │   ├── ai.py                # Analyze & chat endpoints
│   │   │   ├── wellness.py          # Activity catalog & completion
│   │   │   ├── insights.py          # Trends & recommendations
│   │   │   ├── community.py         # Anonymous posts, likes, reports
│   │   │   ├── resources.py         # Public crisis resource directory
│   │   │   ├── admin.py             # Stats, report review, resource mgmt
│   │   │   └── privacy.py           # Data & account deletion
│   │   ├── services/
│   │   │   ├── ai_service.py        # Pluggable AI provider (Claude / rule-based)
│   │   │   ├── safety_service.py    # Content safety classifier
│   │   │   └── resource_service.py  # Crisis resource seeding & management
│   │   └── utils/
│   │       ├── validators.py        # Input validation helpers
│   │       └── decorators.py        # Admin role decorator
│   ├── tests/                       # 35 tests across 7 test modules
│   ├── scripts/
│   │   └── make_admin.py            # Promote a user to admin role
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/                     # One module per backend resource (11 modules)
│   │   ├── components/
│   │   │   ├── AppShell.jsx         # Sidebar navigation layout
│   │   │   ├── ProtectedRoute.jsx   # Auth guard wrapper
│   │   │   └── FormField.jsx        # Reusable form input
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # JWT auth state + silent refresh
│   │   ├── pages/
│   │   │   ├── Landing.jsx          # Public landing page
│   │   │   ├── Login.jsx            # Login form
│   │   │   ├── Register.jsx         # Registration form
│   │   │   ├── Dashboard.jsx        # Overview + quick actions
│   │   │   ├── Profile.jsx          # User profile management
│   │   │   ├── PrivacySettings.jsx  # Granular consent controls
│   │   │   ├── GetHelp.jsx          # Crisis resources page
│   │   │   ├── mood/               # Mood tracking & trends
│   │   │   ├── journal/            # Journal entries & editor
│   │   │   ├── companion/          # AI chat interface
│   │   │   ├── toolkit/            # Breathing & meditation
│   │   │   ├── insights/           # Analytics & recommendations
│   │   │   ├── community/          # Anonymous community feed
│   │   │   └── admin/              # Admin dashboard
│   │   ├── App.jsx                  # Router & layout
│   │   └── main.jsx                 # Entry point
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── tailwind.config.js
│   └── .env.example
├── docker-compose.yml               # MongoDB + backend + frontend
├── .github/workflows/ci.yml         # Backend tests, frontend build + lint
├── docs/roadmap.md                  # 10-phase build plan
├── CONTRIBUTING.md
├── LICENSE                          # MIT
└── .gitignore
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites

- **Node.js** 18+ and **npm**
- **Python** 3.10+
- A running **MongoDB** instance (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env → set JWT_SECRET_KEY and MONGO_URI
pip install -r requirements.txt
python run.py                    # → http://localhost:5000
```

Run tests:
```bash
pip install mongomock
pytest -v                        # 35 tests
```

### Frontend

```bash
cd frontend
npm install
npm run dev                      # → http://localhost:5173 (proxies /api → localhost:5000)
```

Run tests & build:
```bash
npm test
npm run build
```

---

## 🐳 Running with Docker

```bash
cp backend/.env.example backend/.env          # optional — only to customize
export JWT_SECRET_KEY=$(python -c "import secrets; print(secrets.token_hex(32))")
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:5000 |
| MongoDB | `localhost:27017` (persisted in a named volume) |

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `JWT_SECRET_KEY` | **Yes** | — | Secret for signing JWTs (generate with `python -c "import secrets; print(secrets.token_hex(32))"`) |
| `MONGO_URI` | **Yes** | `mongodb://localhost:27017/mindmate_ai` | MongoDB connection string |
| `FRONTEND_ORIGIN` | **Yes** | `http://localhost:5173` | Allowed CORS origin |
| `AI_PROVIDER` | No | `rule_based` | `rule_based` or `anthropic` |
| `ANTHROPIC_API_KEY` | No | — | Required only when `AI_PROVIDER=anthropic` |
| `FLASK_DEBUG` | No | `1` | Set to `0` in production |

### Frontend (`frontend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | No | `http://localhost:5000/api` | Backend API URL (Vite proxies `/api` in dev) |

---

## 👑 Making a User an Admin

The admin dashboard (`/admin`) requires `role: "admin"` on the user document. After registering a
user, promote them:

```bash
cd backend
python scripts/make_admin.py user@example.com
```

---

## ☁️ Deploying to Production

| Component | Suggested Host |
|-----------|----------------|
| Frontend | Vercel, Netlify, or the provided Nginx Docker image |
| Backend | Render, Railway, Fly.io, or any Docker host |
| Database | MongoDB Atlas (free tier is enough to start) |

**Steps:**

1. Create a MongoDB Atlas cluster and get the connection string.
2. Deploy the backend (Docker image from `backend/Dockerfile`, or `gunicorn run:app`). Set env
   vars: `JWT_SECRET_KEY`, `MONGO_URI`, `FRONTEND_ORIGIN`, and optionally `AI_PROVIDER` +
   `ANTHROPIC_API_KEY`.
3. Deploy the frontend (`npm run build` → upload `dist/` to Vercel/Netlify, or use the Nginx
   Docker image). Set `VITE_API_URL` to your deployed backend URL + `/api`.
4. Update CORS — the backend only accepts requests from `FRONTEND_ORIGIN`, so ensure it matches
   your deployed frontend URL exactly.
5. Replace the seeded crisis resources (via admin dashboard or
   [`resource_service.py`](backend/app/services/resource_service.py)) with verified, up-to-date
   numbers for your target region(s) — never rely on the defaults for a real deployment.

---

## 📡 API Reference

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Log in, returns access + refresh tokens |
| POST | `/api/auth/refresh` | Refresh token | Issue new access token |
| POST | `/api/auth/logout` | Access token | Stateless logout |

### User

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/user/profile` | Access token | View profile + privacy settings |
| PUT | `/api/user/profile` | Access token | Update profile + privacy settings |

### Mood

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/mood` | Access token | Create mood record |
| GET | `/api/mood` | Access token | List mood records |
| PUT | `/api/mood/:id` | Access token | Update mood record |
| DELETE | `/api/mood/:id` | Access token | Delete mood record |

### Journal

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/journal` | Access token | Create journal entry |
| GET | `/api/journal` | Access token | List entries (search, tag filter) |
| GET | `/api/journal/:id` | Access token | Get single entry |
| PUT | `/api/journal/:id` | Access token | Update entry |
| DELETE | `/api/journal/:id` | Access token | Delete entry |

### AI

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/ai/analyze` | Access token | Non-clinical sentiment analysis (consent-gated) |
| POST | `/api/ai/chat` | Access token | Chat with the AI companion (safety-gated) |
| GET | `/api/ai/chat/sessions` | Access token | List chat sessions |
| GET | `/api/ai/chat/sessions/:id/messages` | Access token | Session message history |

### Wellness

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/wellness` | Access token | Activity catalog |
| POST | `/api/wellness/:id/complete` | Access token | Log a completed activity |
| GET | `/api/wellness/history` | Access token | Completion history |

### Insights

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/insights` | Access token | Summary + trends + observations |
| GET | `/api/insights/recommendations` | Access token | Personalized suggestions |

### Community

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/community` | Access token | List anonymous posts |
| POST | `/api/community` | Access token | Create anonymous post |
| POST | `/api/community/:id/like` | Access token | Toggle like |
| DELETE | `/api/community/:id` | Access token | Delete own post |
| GET | `/api/community/:id/comments` | Access token | List comments |
| POST | `/api/community/:id/comments` | Access token | Add comment |
| POST | `/api/community/:id/report` | Access token | Report a post |

### Resources & Admin

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/resources` | — | Public crisis/wellness resource directory |
| GET | `/api/admin/stats` | Admin | Aggregate platform statistics |
| GET | `/api/admin/reports` | Admin | List reported content |
| PUT | `/api/admin/reports` | Admin | Resolve a report |
| GET | `/api/admin/resources` | Admin | List crisis resources |
| POST | `/api/admin/resources` | Admin | Add crisis resource |
| DELETE | `/api/admin/resources` | Admin | Remove crisis resource |

### Privacy

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| DELETE | `/api/privacy/journal` | Access token | Delete all journal + mood data |
| DELETE | `/api/privacy/account` | Access token | Delete account + all associated data |

---

## 🔐 Security & Privacy

- **Password hashing** — bcrypt; JWTs read only from the `Authorization` header.
- **Data isolation** — Every journal/mood/chat/activity query is scoped to `user_id` at the
  database level, verified by cross-user isolation tests.
- **Consent-gated AI** — Journal analysis only runs with explicit consent
  (`privacy_settings.allow_ai_analysis`).
- **Anonymous community** — Posts never expose the author's name or email.
- **Admin boundaries** — Admins get aggregate stats and moderation tools only; never direct
  journal access.
- **True deletion** — Full account/journal deletion endpoints, no soft-delete trap.

---

## 🤝 Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for development setup, PR guidelines, and the
Responsible AI invariants that all contributors must preserve.

---

## 📄 License

MIT — see [`LICENSE`](LICENSE).

Built by [Rujuta Phaltankar](https://github.com/rujutaphaltankar).
