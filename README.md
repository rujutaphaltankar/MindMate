# MindMate AI — AI Mental Wellness Companion

A privacy-conscious mental wellness platform: mood tracking, private journaling, non-clinical AI
reflection, an empathetic AI companion, wellness recommendations, meditation/breathing tools, and
an anonymous community — built as a full-stack, portfolio-ready project.

> **MindMate AI is not a medical device, therapist, psychologist, psychiatrist, or emergency
> service.** It does not diagnose mental health conditions or provide medical treatment. If you
> or someone you know is in crisis, contact local emergency services or a crisis line in your area.

## Status: all 10 phases complete ✅

- ✅ Phase 1 — Project setup + authentication (JWT, bcrypt, protected routes)
- ✅ Phase 2 — Dashboard + mood tracking (Recharts trends, Today's Overview, Quick Actions)
- ✅ Phase 3 — Journal (CRUD, search, tags, strictly user-scoped)
- ✅ Phase 4 — NLP emotion analysis (consent-gated, non-clinical wording)
- ✅ Phase 5 — AI wellness companion chat (with safety gate on every message)
- ✅ Phase 6 — Wellness toolkit (animated 4-7-8 breathing, meditation library)
- ✅ Phase 7 — Insights & analytics (trends, careful "may be worth observing" language)
- ✅ Phase 8 — Anonymous community (posts, comments, likes, reports — never exposes identity)
- ✅ Phase 9 — Safety system & moderation + admin dashboard
- ✅ Phase 10 — Testing, Docker, CI, deployment docs

**35/35 backend tests passing** (pytest + mongomock) · **Frontend build clean** (Vite + Vitest)

## Tech stack

| Layer    | Tech |
|----------|------|
| Frontend | React 18, Vite, Tailwind CSS, React Router, Axios, Recharts |
| Backend  | Python, Flask, Flask-CORS, Flask-JWT-Extended |
| Database | MongoDB (PyMongo) |
| AI/NLP   | Pluggable: Anthropic Claude API, or a zero-dependency rule-based fallback |
| Deploy   | Docker, docker-compose, GitHub Actions CI |

## Architecture

```
React Frontend  →  REST API  →  Flask Backend  →  MongoDB
                                     │
                                     ├── Authentication
                                     ├── User Management
                                     ├── Journal Service
                                     ├── Mood Service
                                     ├── AI Service (analyze + chat, pluggable provider)
                                     ├── Recommendation / Insights Service
                                     ├── Community Service
                                     ├── Safety Service (classifies every chat msg + post)
                                     ├── Resource Service (crisis directory, DB-configurable)
                                     └── Admin Service (aggregate stats + report review)
```

## AI service — works with zero setup

`backend/app/services/ai_service.py` defaults to `AI_PROVIDER=rule_based`, a small
keyword-based sentiment/reply engine with **no external dependency or API key** — the whole
app works out of the box. Set `AI_PROVIDER=anthropic` and `ANTHROPIC_API_KEY=...` in
`backend/.env` to use Claude instead; if the API call ever fails, it silently falls back to
the rule-based engine so the app never breaks.

## Safety system

Every message sent to the AI companion, and every community post/comment, passes through
`app/services/safety_service.py` first. Messages flagged as high-risk (self-harm, suicidal
intent, violence) skip the normal AI reply and instead return a caring, non-judgmental message
plus the crisis resource directory — which is stored in MongoDB (`resources` collection) and
manageable from the admin dashboard, not hard-coded in the frontend.

## Project structure

```
mindmate-ai/
├── backend/
│   ├── app/
│   │   ├── __init__.py            # Flask app factory, blueprint registration, resource seeding
│   │   ├── config.py              # env-driven config
│   │   ├── extensions.py          # db (safe proxy), jwt, cors
│   │   ├── models/                # user, mood, journal, chat, wellness, community
│   │   ├── routes/                # auth, user, mood, journal, ai, wellness, insights,
│   │   │                          # community, resources, admin, privacy
│   │   ├── services/               # ai_service, safety_service, resource_service
│   │   └── utils/                  # validators, admin decorator
│   ├── tests/                      # 35 tests across every route module
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/                    # one module per backend resource
│   │   ├── components/             # AppShell, ProtectedRoute, FormField
│   │   ├── context/                # AuthContext
│   │   ├── pages/                  # Landing, Login, Register, Dashboard, Mood, Journal,
│   │   │                          # Companion, Toolkit, Insights, Community, GetHelp,
│   │   │                          # PrivacySettings, Profile, Admin
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile, nginx.conf
│   ├── tailwind.config.js
│   └── .env.example
├── docker-compose.yml
├── .github/workflows/ci.yml
└── docs/roadmap.md
```

## Getting started (local development)

### Prerequisites
- Node.js 18+, Python 3.10+
- A running MongoDB instance (local or MongoDB Atlas)

### Backend
```bash
cd backend
cp .env.example .env
# edit .env: set JWT_SECRET_KEY (generate with the command in the file) and MONGO_URI
pip install -r requirements.txt
python run.py          # http://localhost:5000
```

Run tests:
```bash
pip install mongomock
pytest -v               # 35 tests
```

### Frontend
```bash
cd frontend
npm install
npm run dev              # http://localhost:5173 (proxies /api to localhost:5000)
```

Run tests / build:
```bash
npm test
npm run build
```

## Running with Docker (all services at once)

```bash
cp backend/.env.example backend/.env   # optional: only needed to customize
export JWT_SECRET_KEY=$(python -c "import secrets; print(secrets.token_hex(32))")
docker compose up --build
```
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- MongoDB: localhost:27017 (persisted in a named volume)

## Making a user an admin

The admin dashboard (`/admin`) requires `role: "admin"` on a user document. Promote a user
after they've registered:
```bash
cd backend
python scripts/make_admin.py user@example.com
```

## Deploying to production

| Component | Suggested host |
|-----------|-----------------|
| Frontend  | Vercel, Netlify, or the provided Nginx Docker image |
| Backend   | Render, Railway, Fly.io, or any Docker host |
| Database  | MongoDB Atlas (free tier is enough to start) |

Steps:
1. Create a MongoDB Atlas cluster, get the connection string.
2. Deploy the backend (Docker image from `backend/Dockerfile`, or directly via
   `gunicorn run:app`). Set env vars: `JWT_SECRET_KEY`, `MONGO_URI` (Atlas string),
   `FRONTEND_ORIGIN` (your deployed frontend URL), optionally `AI_PROVIDER` +
   `ANTHROPIC_API_KEY`.
3. Deploy the frontend (`npm run build`, upload `dist/` to Vercel/Netlify, or use the
   Nginx Docker image). Set `VITE_API_URL` to your deployed backend URL + `/api`.
4. Update CORS: the backend only accepts requests from `FRONTEND_ORIGIN`, so double-check
   it matches your deployed frontend's URL exactly.
5. Replace the seeded crisis resources in `app/services/resource_service.py` (or via the
   admin dashboard) with verified, up-to-date numbers for your target region(s) before
   going live — never rely on the defaults for a real deployment.

## Putting this on GitHub

```bash
cd mindmate-ai
git init
git add .
git commit -m "Initial commit: MindMate AI - full-stack wellness companion"
git branch -M main
git remote add origin https://github.com/<your-username>/mindmate-ai.git
git push -u origin main
```
`.gitignore` already excludes `.env`, `node_modules/`, `dist/`, and Python cache directories —
double check `git status` before your first push to be sure no secrets are staged.

## API reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|--------------|
| POST | `/api/auth/register` | - | Create account |
| POST | `/api/auth/login` | - | Log in |
| POST | `/api/auth/refresh` | refresh token | New access token |
| POST | `/api/auth/logout` | access token | Stateless logout |
| GET/PUT | `/api/user/profile` | access token | View/update profile + privacy settings |
| POST/GET | `/api/mood` | access token | Create/list mood records |
| PUT/DELETE | `/api/mood/:id` | access token | Update/delete a mood record |
| POST/GET | `/api/journal` | access token | Create/list journal entries (search, tag filter) |
| GET/PUT/DELETE | `/api/journal/:id` | access token | Single entry ops |
| POST | `/api/ai/analyze` | access token | Non-clinical sentiment analysis (consent-gated) |
| POST | `/api/ai/chat` | access token | Chat with the AI companion (safety-gated) |
| GET | `/api/ai/chat/sessions` | access token | List chat sessions |
| GET | `/api/ai/chat/sessions/:id/messages` | access token | Session history |
| GET | `/api/wellness` | access token | Activity catalog |
| POST | `/api/wellness/:id/complete` | access token | Log a completed activity |
| GET | `/api/wellness/history` | access token | Completion history |
| GET | `/api/insights` | access token | Summary + trend + observations |
| GET | `/api/insights/recommendations` | access token | Personalized suggestions |
| GET/POST | `/api/community` | access token | List/create anonymous posts |
| POST | `/api/community/:id/like` | access token | Toggle like |
| DELETE | `/api/community/:id` | access token | Delete own post |
| GET/POST | `/api/community/:id/comments` | access token | Comments |
| POST | `/api/community/:id/report` | access token | Report a post |
| GET | `/api/resources` | - | Public crisis/wellness resource directory |
| GET | `/api/admin/stats` | admin | Aggregate platform stats |
| GET/PUT | `/api/admin/reports` | admin | Review/resolve reports |
| GET/POST/DELETE | `/api/admin/resources` | admin | Manage crisis resources |
| DELETE | `/api/privacy/journal` | access token | Delete all journal + mood data |
| DELETE | `/api/privacy/account` | access token | Delete account + all data |

## Security & privacy

- Passwords hashed with bcrypt; JWTs read only from the `Authorization` header.
- Every journal/mood/chat/activity query is scoped to `user_id` at the database level -
  verified by cross-user isolation tests.
- AI journal analysis only runs with explicit consent (`privacy_settings.allow_ai_analysis`).
- Community posts never expose the author's name or email.
- Admins get aggregate stats and moderation tools only - never direct journal access.
- Full account/journal deletion endpoints, no soft-delete trap.

## License

MIT - see `LICENSE`.
