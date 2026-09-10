# MindMate AI

MindMate AI is a full-stack mental wellness application that combines mood tracking, private journaling, AI-assisted reflections, wellness tools, community features, and admin moderation in one workspace.

This repository currently contains:

- a Flask REST API in `backend/`
- a React + Vite frontend in `frontend/`
- MongoDB-backed persistence for app data
- Docker and CI setup for local development and deployment

> MindMate AI is not a medical device, therapist, psychologist, psychiatrist, or emergency service. It is designed for non-clinical support and should not replace professional help.

---

## Features

- Mood tracking and trend views
- Private journal CRUD with search and filtering
- AI companion chat with safety screening
- Non-clinical sentiment/emotion analysis for journal entries
- Wellness toolkit with breathing and meditation support
- Insights and recommendations
- Anonymous community posts and comments
- Crisis resource directory and admin moderation tools
- JWT-based authentication and privacy controls

---

## Tech Stack

- Frontend: React 18, Vite, Tailwind CSS, React Router, Axios, Recharts
- Backend: Python 3.10+, Flask 3.x, Flask-CORS, Flask-JWT-Extended, PyMongo
- Database: MongoDB 7
- Testing: pytest + mongomock for backend, Vitest + Testing Library for frontend
- Deployment: Docker, docker-compose, GitHub Actions CI

---

## Project Structure

```text
mindmate-ai-complete/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── extensions.py
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── tests/
│   ├── scripts/
│   ├── .env.example
│   ├── Dockerfile
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   ├── src/
│   ├── public/
│   ├── .env.example
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── .github/
│   └── workflows/
│       └── ci.yml
├── data/
├── docs/
├── docker-compose.yml
├── CONTRIBUTING.md
├── LICENSE
├── README.md
└── .gitignore
```

---

## Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm
- MongoDB running locally or accessible via MongoDB Atlas

### 1) Backend setup

```bash
cd backend
python -m venv .venv
```

On Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

On macOS/Linux:

```bash
source .venv/bin/activate
```

Then install dependencies and configure environment variables:

```bash
pip install -r requirements.txt
copy .env.example .env
```

Update `backend/.env` with a secure `JWT_SECRET_KEY` and your MongoDB URI if needed.

Start the backend:

```bash
python run.py
```

The API will run at `http://localhost:5000`.

### 2) Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run at `http://localhost:5173` and proxy `/api` requests to the Flask backend in development.

---

## Environment Variables

### Backend (`backend/.env`)

```env
FLASK_DEBUG=1
PORT=5000
JWT_SECRET_KEY=replace-with-a-long-random-secret
JWT_ACCESS_TOKEN_EXPIRES_MINUTES=60
JWT_REFRESH_TOKEN_EXPIRES_DAYS=30
MONGO_URI=mongodb://localhost:27017/mindmate_ai
FRONTEND_ORIGIN=http://localhost:5173
AI_PROVIDER=rule_based
ANTHROPIC_API_KEY=
```

Notes:

- `AI_PROVIDER` defaults to `rule_based`, which works without an external API key.
- Set `AI_PROVIDER=anthropic` and provide `ANTHROPIC_API_KEY` to use the Claude integration.
- The backend also exposes `/api/health` for quick service checks.

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Docker

This repo includes a Docker Compose setup for running the app end-to-end.

```bash
docker compose up --build
```

Services:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- MongoDB: `localhost:27017`

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

CI is configured in `.github/workflows/ci.yml` to run backend tests, frontend tests, and the frontend build automatically.

---

## Admin Setup

To give a user admin access, run:

```bash
cd backend
python scripts/make_admin.py user@example.com
```

This promotes the specified user to the `admin` role in the application.

---

## Deployment Notes

- Deploy the backend to any host that can run Flask/Gunicorn.
- Deploy the frontend as a static Vite build, or use the included Nginx container.
- Set `JWT_SECRET_KEY`, `MONGO_URI`, `FRONTEND_ORIGIN`, and optional AI provider settings in production.
- Update the seeded crisis resources from the admin dashboard or resource service after deployment.

---

## Safety and Scope

MindMate AI includes content safety checks for chat and community interactions. It is focused on supportive, non-clinical guidance and should not be used as a substitute for crisis response or professional mental health care.

If someone is in immediate danger or at risk of self-harm, contact emergency services or a local crisis line right away.

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

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
