# Triage ML Service

Python FastAPI microservice for triage scoring.

## Endpoints
- `GET /health`
- `POST /triage`

## Local run
```bash
cd ml/triage_service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python train_model.py
uvicorn app:app --reload --port 8000
```

## Integrate with Next.js
Set this env var in `.env.local`:
```bash
TRIAGE_ML_SERVICE_URL=http://localhost:8000
```

`/api/ai/triage` will use this service first, then OpenAI, then heuristic fallback.
