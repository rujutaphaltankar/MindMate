# Contributing to MindMate AI

Thanks for your interest in improving MindMate AI.

## Development setup

See the "Getting started" section in `README.md` for backend/frontend setup.

## Before opening a PR

- Backend: `cd backend && python -m pytest tests/ -v`
- Frontend: `cd frontend && npm test && npm run build`
- Don't commit `.env` files, API keys, or real MongoDB credentials.

## Responsible AI & safety

This project handles sensitive mental-wellness data. Any change touching the
AI service (`app/services/ai_service.py`), safety classifier
(`app/services/safety_service.py`), or crisis resources
(`app/services/resource_service.py`) should preserve these invariants:

- Never diagnose a clinical condition.
- Never claim certainty about a user's mental state.
- Never prescribe medication or provide self-harm/violence instructions.
- AI journal analysis only runs with explicit user consent
  (`privacy_settings.allow_ai_analysis`).
- The safety classifier runs before every AI chat message and community
  post — don't bypass it.
- Never invent crisis phone numbers; use verified resources.

## Code style

- Python: standard PEP 8, type hints where practical.
- JS/React: functional components with hooks, Tailwind for styling.
- Keep PRs focused — one feature/fix per PR.
