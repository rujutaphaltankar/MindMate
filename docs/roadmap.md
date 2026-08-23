# Roadmap

Tracks progress against the 10-phase build plan.

## ✅ Phase 1 — Project setup + authentication
- Flask app factory, MongoDB connection, JWT auth (access + refresh tokens)
- Register / login / logout / refresh endpoints
- Password hashing (bcrypt), input validation, uniform error handling
- User profile GET/PUT (including privacy-setting fields, unused until Phase 4+)
- React + Vite + Tailwind frontend: Landing, Login, Register, Forgot Password (placeholder),
  Dashboard (placeholder), Profile
- AuthContext with token storage + silent refresh
- Protected routes
- Backend tests (pytest + mongomock): 7/7 passing
- Frontend tests (vitest + testing-library): 2/2 passing
- Production build verified (`npm run build`)

## ✅ Phase 2 — Dashboard + mood tracking
- `mood_records` collection + CRUD API (`/api/mood`)
- Mood Tracker page: 1–10 sliders for mood/stress/energy, sleep duration, optional note
- Recharts trend charts (daily/weekly/monthly)
- Dashboard: Today's Overview, Quick Actions, Wellness Snapshot wired to real data

## ✅ Phase 3 — Journal
- `journal_entries` collection + CRUD API, scoped strictly to the authenticated user
- Journal list + detail pages, search, date filter, tags

## ✅ Phase 4 — NLP emotion analysis
- AI service abstraction (Anthropic Claude API or rule-based fallback, swappable)
- `/api/ai/analyze` — non-clinical sentiment/emotion/intensity output
- Consent gate: only runs if `privacy_settings.allow_ai_analysis` is true

## ✅ Phase 5 — AI wellness companion (chat)
- `chat_sessions` / `chat_messages` collections
- `/api/ai/chat` with empathetic, non-diagnostic system prompt
- Safety classifier sits in front of every AI chat call (see Phase 9)

## ✅ Phase 6 — Wellness toolkit
- Breathing exercise (animated 4-7-8, timed)
- Meditation categories, activity completion tracking

## ✅ Phase 7 — Insights & analytics
- `/api/insights` — non-clinical pattern summaries, correlation language guarded
  ("may be worth observing," never "causes")
- Recommendation engine based on recent mood/stress/journal themes

## ✅ Phase 8 — Anonymous community
- `community_posts` / `community_comments` — no real name/email ever exposed publicly
- Categories, likes, reporting, search

## ✅ Phase 9 — Safety system & moderation
- Safety classifier in front of AI chat and community posts
- Crisis resource directory (`resources` collection), backend-configurable, no invented numbers
- Admin dashboard for report review (no automatic access to private journals)

## ✅ Phase 10 — Testing, deployment, documentation
- Full test coverage across all services (35 backend tests, frontend test suite)
- Docker/docker-compose, GitHub Actions CI (backend tests, frontend build, lint)
- Deployment guide (Vercel/Netlify + Render/Railway + MongoDB Atlas)
- Complete project documentation
