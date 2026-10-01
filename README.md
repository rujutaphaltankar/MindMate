# MindMate AI

MindMate AI is a full-stack mental wellness application combining mood tracking, private journaling,
AI-assisted reflection, wellness tools, anonymous community features, and admin moderation — all in one workspace.

> MindMate AI is not a medical device, therapist, or emergency service. It is designed for
> non-clinical support and should not replace professional mental health care.

**Live frontend:** https://mind-mate-rujuta1.vercel.app

---

## Features

| Area | What it does |
|:---|:---|
| **Mood Tracking** | Log mood, stress, energy, sleep. Trend charts (daily / weekly / monthly). |
| **Journal** | Private CRUD entries with search, tags, date filter, and AI emotion analysis. |
| **AI Companion** | Empathetic chat with SSE streaming, multi-provider support, dual-layer safety. |
| **Wellness Toolkit** | Animated 4-7-8 breathing, guided meditation categories, completion tracking. |
| **Insights** | Non-clinical pattern summaries and personalised recommendations. |
| **Community** | Anonymous posts and comments, likes, reporting, search. |
| **Crisis Safety** | Safety classifier on every AI message and community post; crisis resource directory. |
| **Auth & Security** | JWT auth (access + refresh), rate limiting, token blocklisting, bcrypt passwords. |
| **Password Reset** | Signed token email flow (30-minute expiry) via Resend or SMTP. |
| **Welcome Emails** | Branded HTML welcome sent on registration. |
| **Privacy / GDPR** | Data export endpoint, consent-gated AI, true deletion, anonymous community. |
| **Admin** | Report review dashboard; never exposes private journals. |

---

## Tech Stack

| Layer | Technology |
|:---|:---|
| Frontend | React 18, Vite, Tailwind CSS, React Router, Axios, Recharts |
| Backend | Python 3.12, Flask 3.x, Flask-JWT-Extended, Flask-Limiter, Flask-CORS, PyMongo |
| Email | Resend (primary) / SMTP fallback (Gmail, SendGrid) |
| Database | MongoDB 7 (local) / MongoDB Atlas (production) |
| AI | Anthropic Claude, OpenAI, Ollama, or rule-based fallback |
| Testing | pytest + mongomock (backend), Vitest + Testing Library (frontend) |
| Deployment | Docker, docker-compose, GitHub Actions CI, Vercel (frontend) |

---

## Project Structure

```
mindmate-ai-complete/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── extensions.py
│   │   ├── models/
│   │   ├── routes/          # auth, mood, journal, ai, community, privacy, admin
│   │   ├── services/        # ai_service, email_service, safety_service
│   │   └── utils/
│   ├── tests/
│   ├── scripts/
│   ├── .env.example
│   ├── Dockerfile
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   ├── src/
│   │   ├── pages/           # Dashboard, MoodTracker, Journal, Companion, ...
│   │   ├── components/
│   │   ├── context/         # AuthContext, ThemeContext
│   │   └── api/
│   ├── public/
│   ├── .env.example
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── vite.config.js
├── .github/
│   └── workflows/ci.yml
├── data/
├── docs/
│   └── roadmap.md
├── docker-compose.yml
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```

---

## Quick Start

### Prerequisites

- Python 3.12+
- Node.js 20+
- npm
- MongoDB running locally or accessible via MongoDB Atlas

### 1) Backend

```bash
cd backend
python -m venv .venv
```

**Windows PowerShell:**
```powershell
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
```

**macOS / Linux:**
```bash
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `backend/.env` — at minimum set a strong `JWT_SECRET_KEY`. Then:

```bash
python run.py
```

The API runs at `http://localhost:5000`.

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173` and proxies `/api` to the Flask backend.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|:---|:---|:---|
| `JWT_SECRET_KEY` | Yes | Long random secret for JWTs |
| `SECRET_KEY` | Yes | Flask secret (can equal JWT_SECRET_KEY) |
| `MONGO_URI` | Yes | MongoDB connection string |
| `FRONTEND_ORIGIN` | Yes | Allowed CORS origin (Vercel URL in prod) |
| `FLASK_DEBUG` | No | `1` for dev, `0` for production |
| `PORT` | No | Default 5000 |
| `AI_PROVIDER` | No | `rule_based` (default), `anthropic`, `openai` |
| `ANTHROPIC_API_KEY` | If AI_PROVIDER=anthropic | Claude API key |
| `OPENAI_API_KEY` | If AI_PROVIDER=openai | OpenAI API key |
| `RESEND_API_KEY` | Recommended | Resend email API key (3 000 emails/month free) |
| `MAIL_FROM` | With Resend | Verified sender address |
| `MAIL_SERVER` | SMTP fallback | e.g. `smtp.gmail.com` |
| `MAIL_USERNAME` | SMTP fallback | Your email / SMTP username |
| `MAIL_PASSWORD` | SMTP fallback | App password |
| `RATELIMIT_STORAGE_URI` | No | `memory://` (dev) or Redis URI (prod) |

See `backend/.env.example` for a complete template.

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

In production, set this to your deployed backend URL (e.g. Railway or Fly.io).

---

## Email Setup (Resend — Recommended)

1. Sign up free at [resend.com](https://resend.com) — 3 000 emails/month, no credit card needed.
2. Create an API key in the Resend dashboard.
3. Set `RESEND_API_KEY=re_...` in your `.env` or hosting environment variables.
4. Set `MAIL_FROM=noreply@yourdomain.com` (verify your domain in Resend, or use `onboarding@resend.dev` for testing).

**Gmail SMTP (alternative):**
1. Enable 2-Step Verification on your Google account.
2. Create an App Password at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).
3. Set `MAIL_SERVER=smtp.gmail.com`, `MAIL_PORT=587`, `MAIL_USERNAME=you@gmail.com`, `MAIL_PASSWORD=<app-password>`.

Without either provider configured, emails are printed to the server logs (safe for local dev and CI).

---

## Docker

```bash
docker compose up --build
```

| Service | URL |
|:---|:---|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:5000 |
| MongoDB | localhost:27017 |

---

## Testing

### Backend

```bash
cd backend
pip install mongomock
pytest -v
```

### Frontend

```bash
cd frontend
npm test
npm run build
```

CI runs all of the above automatically on every push to `main` via `.github/workflows/ci.yml`.

---

## Admin Setup

To promote a user to admin:

```bash
cd backend
python scripts/make_admin.py user@example.com
```

---

## Deployment

### Frontend (Vercel)
Already deployed at https://mind-mate-rujuta1.vercel.app.

To connect a backend:
1. Set `VITE_API_URL=https://<your-backend-url>/api` in Vercel → Settings → Environment Variables.
2. Redeploy.

### Backend (Railway — recommended)
1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub.
2. Set **Root Directory** to `backend`.
3. Set **Start Command**: `gunicorn --bind 0.0.0.0:$PORT --workers 2 run:app`
4. Add environment variables (see table above).

### Backend (Fly.io)
```bash
cd backend
flyctl auth login
flyctl launch
flyctl secrets set JWT_SECRET_KEY=... MONGO_URI=... FRONTEND_ORIGIN=https://mind-mate-rujuta1.vercel.app
flyctl deploy
```

### MongoDB (Atlas)
Use the free M0 cluster. Set Network Access to `0.0.0.0/0` for Railway/Fly dynamic IPs.
Copy the connection string to `MONGO_URI`.

---

## Security & Privacy

- **Password hashing** — bcrypt; JWTs accepted from `Authorization` header only (no cookies, reducing CSRF exposure).
- **Token revocation** — Logout blocklists the JWT JTI in MongoDB with a TTL index.
- **Rate limiting** — `/register`, `/login`, `/forgot-password`, and AI endpoints are rate-limited via Flask-Limiter.
- **Data isolation** — Every query scoped to `user_id` at the database level; cross-user isolation verified by tests.
- **Consent-gated AI** — Journal analysis only runs when `privacy_settings.allow_ai_analysis` is enabled.
- **Anonymous community** — Posts never expose the author name or email.
- **Admin boundaries** — Admins access aggregate stats and moderation tools only; no direct journal access.
- **True deletion** — Full account and journal deletion endpoints; no soft-delete trap.
- **GDPR / CCPA** — `/api/privacy/export` returns a complete JSON export of a user's data on request.

---

## Safety

MindMate AI applies a dual-layer safety classifier before every AI response and community post:
- **Layer 1** — Deterministic keyword and pattern matching for explicit crisis signals.
- **Layer 2** — Nuanced semantic detection for passive crisis cues.

When a crisis signal is detected, the response surfaces the crisis resource directory instead of a chat reply.

If someone is in immediate danger, contact emergency services or a local crisis line right away.

---

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for development setup, PR guidelines, and the
Responsible AI invariants that all contributors must preserve.

---

## License

MIT — see [`LICENSE`](LICENSE).

Built by [Rujuta Phaltankar](https://github.com/rujutaphaltankar).
