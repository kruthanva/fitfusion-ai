from __future__ import annotations

import csv
import io
import os
from collections import Counter, defaultdict
from datetime import datetime, timedelta
from typing import Any, Dict, Optional

from fastapi import Depends, FastAPI, Form, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from starlette.middleware.sessions import SessionMiddleware

from .auth import hash_password, verify_password
from .content import EXERCISES, SESSION_TEMPLATES, VOICE_TIPS
from .database import get_db, init_db

app = FastAPI(title="FitFusion Studio API")

APP_ENV = os.getenv("APP_ENV", "development").lower()
IS_PRODUCTION = APP_ENV == "production"

SESSION_SECRET = os.getenv("SESSION_SECRET", "fitfusion-react-studio-secret")
FRONTEND_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "FRONTEND_ORIGINS",
        "http://127.0.0.1:5173,http://localhost:5173"
    ).split(",")
    if origin.strip()
]
FRONTEND_ORIGIN_REGEX = os.getenv("FRONTEND_ORIGIN_REGEX", r"https://.*\\.vercel\\.app")

app.add_middleware(
    SessionMiddleware,
    secret_key=SESSION_SECRET,
    same_site="none" if IS_PRODUCTION else "lax",
    https_only=IS_PRODUCTION,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_origin_regex=FRONTEND_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()


def fetch_one(db, query: str, params: tuple = ()):
    cur = db.execute(query, params)
    return cur.fetchone()


def fetch_all(db, query: str, params: tuple = ()):
    cur = db.execute(query, params)
    return cur.fetchall()


def ensure_profile(db, user_id: int):
    profile = fetch_one(db, "SELECT * FROM user_profiles WHERE user_id = ?", (user_id,))
    if profile is None:
        db.execute("INSERT INTO user_profiles (user_id) VALUES (?)", (user_id,))
        db.commit()
        profile = fetch_one(db, "SELECT * FROM user_profiles WHERE user_id = ?", (user_id,))
    return profile


def current_payload(request: Request, db) -> Optional[Dict[str, Any]]:
    user_id = request.session.get("user_id")
    if not user_id:
        return None
    user = fetch_one(db, "SELECT * FROM users WHERE id = ?", (user_id,))
    if not user:
        return None
    profile = ensure_profile(db, user_id)
    return {"user": dict(user), "profile": dict(profile)}


def require_auth(request: Request, db=Depends(get_db)) -> Dict[str, Any]:
    payload = current_payload(request, db)
    if not payload:
        raise HTTPException(status_code=401, detail="Authentication required")
    return payload


def calculate_calories(category: str, reps: int, duration_seconds: int, intensity: str) -> float:
    met_map = {"Strength": 5.5, "Cardio": 8.0, "Core": 4.5, "Mobility": 3.0, "Recovery": 2.0, "Full Body": 6.5}
    multiplier = {"Low": 0.85, "Medium": 1.0, "High": 1.2}.get(intensity, 1.0)
    duration_hours = max(duration_seconds, 60) / 3600
    base = met_map.get(category, 5.0) * 70 * duration_hours
    rep_bonus = reps * 0.22
    return round((base + rep_bonus) * multiplier, 1)


def build_dashboard(db, user_id: int, preferred_focus: str):
    sessions = [dict(item) for item in fetch_all(db, "SELECT * FROM workout_sessions WHERE user_id = ? ORDER BY created_at ASC", (user_id,))]
    total_sessions = len(sessions)
    total_reps = sum(item["reps"] for item in sessions)
    total_minutes = round(sum(item["duration_seconds"] for item in sessions) / 60)
    total_calories = round(sum(item["calories"] for item in sessions), 1)
    scored_sessions = [float(item.get("form_score") or 0) for item in sessions if float(item.get("form_score") or 0) > 0]
    recent_scored_sessions = scored_sessions[-5:]
    recent_form_score = round(sum(recent_scored_sessions) / len(recent_scored_sessions)) if recent_scored_sessions else 0
    avg_session = round(total_reps / total_sessions, 1) if total_sessions else 0

    by_day = defaultdict(int)
    for item in sessions:
        day = datetime.fromisoformat(item["created_at"]).date()
        by_day[day] += item["reps"]
    labels, values = [], []
    today = datetime.utcnow().date()
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        labels.append(day.strftime("%a"))
        values.append(by_day.get(day, 0))

    category_counter = Counter(item["category"] for item in sessions)
    focus = category_counter.most_common(1)[0][0] if category_counter else preferred_focus
    recommended = [item for item in SESSION_TEMPLATES if focus.lower() in item["category"].lower() or item["category"] == "Full Body"] or SESSION_TEMPLATES[:3]
    latest = list(reversed(sessions[-5:]))
    for item in latest:
        item["created_label"] = datetime.fromisoformat(item["created_at"]).strftime("%d %b · %H:%M")

    highlights = [
        {"label": "Sessions logged", "value": total_sessions, "note": "Consistent tracking compounds quickly."},
        {"label": "Reps completed", "value": total_reps, "note": "A simple signal for workload and momentum."},
        {"label": "Active minutes", "value": total_minutes, "note": "Short sessions still count when they repeat."},
        {"label": "Estimated calories", "value": total_calories, "note": "Calculated from duration, reps, and intensity."},
    ]
    return {"highlights": highlights, "avgSession": avg_session, "focus": focus, "weekLabels": labels, "weekValues": values, "recommended": recommended[:3], "latest": latest, "recentFormScore": recent_form_score}


@app.get('/api/health')
def health():
    return {'ok': True}


@app.get('/api/me')
def me(request: Request, db=Depends(get_db)):
    payload = current_payload(request, db)
    return payload or {"user": None}


@app.post('/api/auth/register')
def register(request: Request, full_name: str = Form(...), username: str = Form(...), email: str = Form(...), password: str = Form(...), db=Depends(get_db)):
    existing = fetch_one(db, "SELECT id FROM users WHERE email = ? OR username = ?", (email.strip().lower(), username.strip()))
    if existing:
        raise HTTPException(status_code=400, detail='An account with that email or username already exists.')
    db.execute("INSERT INTO users (full_name, username, email, password_hash) VALUES (?, ?, ?, ?)", (full_name.strip(), username.strip(), email.strip().lower(), hash_password(password)))
    db.commit()
    user = fetch_one(db, "SELECT * FROM users WHERE email = ?", (email.strip().lower(),))
    ensure_profile(db, user['id'])
    request.session['user_id'] = user['id']
    return {"ok": True, "user": dict(user)}


@app.post('/api/auth/login')
def login(request: Request, login: str = Form(...), password: str = Form(...), db=Depends(get_db)):
    user = fetch_one(db, "SELECT * FROM users WHERE email = ? OR username = ?", (login.strip().lower(), login.strip()))
    if not user or not verify_password(password, user['password_hash']):
        raise HTTPException(status_code=400, detail='Incorrect email/username or password.')
    request.session['user_id'] = user['id']
    return {"ok": True, "user": dict(user)}


@app.post('/api/auth/logout')
def logout(request: Request):
    request.session.clear()
    return {"ok": True}


@app.get('/api/dashboard')
def dashboard(request: Request, db=Depends(get_db), payload: Dict[str, Any] = Depends(require_auth)):
    return build_dashboard(db, payload['user']['id'], payload['profile']['preferred_focus'])


@app.get('/api/exercises')
def exercises_api(payload: Dict[str, Any] = Depends(require_auth)):
    return {"items": EXERCISES}


@app.get('/api/templates')
def templates_api(payload: Dict[str, Any] = Depends(require_auth)):
    return {"items": SESSION_TEMPLATES}


@app.get('/api/voice-tips')
def voice_tips_api(payload: Dict[str, Any] = Depends(require_auth)):
    return VOICE_TIPS


@app.get('/api/history')
def history_api(payload: Dict[str, Any] = Depends(require_auth), db=Depends(get_db)):
    rows = [dict(item) for item in fetch_all(db, "SELECT * FROM workout_sessions WHERE user_id = ? ORDER BY created_at DESC", (payload['user']['id'],))]
    for item in rows:
        item['createdLabel'] = datetime.fromisoformat(item['created_at']).strftime('%d %b %Y')
    return {"items": rows}


@app.post('/api/session/save')
async def save_session(request: Request, payload: Dict[str, Any] = Depends(require_auth), db=Depends(get_db)):
    body = await request.json()
    title = body.get('title') or body.get('exercise_name') or 'Workout Session'
    category = body.get('category') or 'Strength'
    exercise_name = body.get('exercise_name') or 'Workout'
    reps = int(body.get('reps') or 0)
    duration_seconds = int(body.get('duration_seconds') or 0)
    intensity = body.get('intensity') or 'Medium'
    notes = body.get('notes') or ''
    try:
        form_score = max(0, min(100, float(body.get('form_score') or 0)))
    except (TypeError, ValueError):
        form_score = 0
    calories = calculate_calories(category, reps, duration_seconds, intensity)
    db.execute(
        "INSERT INTO workout_sessions (user_id, title, category, exercise_name, reps, duration_seconds, calories, form_score, intensity, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (payload['user']['id'], title, category, exercise_name, reps, duration_seconds, calories, form_score, intensity, notes),
    )
    db.commit()
    return {"ok": True, "calories": calories, "form_score": form_score}


@app.post('/api/history/manual')
def create_manual_session(request: Request, title: str = Form(...), category: str = Form(...), exercise_name: str = Form(...), reps: int = Form(0), duration_seconds: int = Form(0), intensity: str = Form('Medium'), notes: str = Form(''), db=Depends(get_db), payload: Dict[str, Any] = Depends(require_auth)):
    calories = calculate_calories(category, reps, duration_seconds, intensity)
    db.execute(
        "INSERT INTO workout_sessions (user_id, title, category, exercise_name, reps, duration_seconds, calories, form_score, intensity, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (payload['user']['id'], title, category, exercise_name, reps, duration_seconds, calories, 0, intensity, notes),
    )
    db.commit()
    return {"ok": True}


@app.delete('/api/history/{session_id}')
def delete_session(session_id: int, db=Depends(get_db), payload: Dict[str, Any] = Depends(require_auth)):
    db.execute("DELETE FROM workout_sessions WHERE id = ? AND user_id = ?", (session_id, payload['user']['id']))
    db.commit()
    return {"ok": True}


@app.get('/api/history/export')
def export_history(db=Depends(get_db), payload: Dict[str, Any] = Depends(require_auth)):
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "created_at", "title", "category", "exercise_name", "reps", "duration_seconds", "calories", "form_score", "intensity", "notes"])
    for row in fetch_all(db, "SELECT * FROM workout_sessions WHERE user_id = ? ORDER BY created_at DESC", (payload['user']['id'],)):
        writer.writerow([row['id'], row['created_at'], row['title'], row['category'], row['exercise_name'], row['reps'], row['duration_seconds'], row['calories'], row['form_score'] if 'form_score' in row.keys() else 0, row['intensity'], row['notes'] or ''])
    response = StreamingResponse(iter([output.getvalue()]), media_type='text/csv')
    response.headers['Content-Disposition'] = 'attachment; filename=fitfusion_history.csv'
    return response


@app.get('/api/profile')
def profile_get(payload: Dict[str, Any] = Depends(require_auth)):
    return payload


@app.post('/api/profile')
def profile_update(request: Request, full_name: str = Form(...), age: Optional[int] = Form(None), height_cm: Optional[float] = Form(None), weight_kg: Optional[float] = Form(None), goal: str = Form(...), level: str = Form(...), preferred_focus: str = Form(...), bio: str = Form(''), voice_enabled: Optional[str] = Form(None), music_enabled: Optional[str] = Form(None), tracker_enabled: Optional[str] = Form(None), motion_sensitivity: Optional[int] = Form(14), db=Depends(get_db), payload: Dict[str, Any] = Depends(require_auth)):
    safe_sensitivity = max(6, min(40, int(motion_sensitivity or 14)))
    db.execute("UPDATE users SET full_name = ? WHERE id = ?", (full_name, payload['user']['id']))
    db.execute(
        "UPDATE user_profiles SET age = ?, height_cm = ?, weight_kg = ?, goal = ?, level = ?, preferred_focus = ?, bio = ?, voice_enabled = ?, music_enabled = ?, tracker_enabled = ?, motion_sensitivity = ? WHERE user_id = ?",
        (age, height_cm, weight_kg, goal, level, preferred_focus, bio, 1 if voice_enabled == 'true' else 0, 1 if music_enabled == 'true' else 0, 1 if tracker_enabled == 'true' else 0, safe_sensitivity, payload['user']['id']),
    )
    db.commit()
    return {"ok": True}
