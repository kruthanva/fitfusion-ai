# FitFusion Studio - Final Project

Full-stack fitness web app with a React/Vite frontend, FastAPI backend, SQLite storage, workout planning, exercise library, workout history, profile preferences, camera-based pose/skeleton tracking prototype, rep counting, and dynamic dashboard form score.

## Run Backend

```bash
cd "$HOME/final_project/backend"
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

## Run Frontend

Open a second terminal:

```bash
cd "$HOME/final_project/frontend"
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

## Notes

- Keep backend and frontend running in separate terminals.
- Camera tracking works best on localhost/127.0.0.1 or HTTPS.
- The skeleton tracker uses MediaPipe Pose when the browser can load the model, with a lightweight fallback.
- New tracked sessions can save an MVP-level form score. The dashboard score stays at 100% until the logged-in user has saved scored sessions, then it updates from the recent average.
