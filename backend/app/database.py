import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]
DB_PATH = BASE_DIR / "data" / "fitfusion.db"


def create_connection():
    """Create a SQLite connection that is safe with FastAPI's threadpool.

    FastAPI can resolve sync dependencies and route handlers in different worker
    threads. SQLite's default check_same_thread=True can therefore crash with:
    "SQLite objects created in a thread can only be used in that same thread".
    For this small local app we use one request-scoped connection with
    check_same_thread=False and close it after the request.
    """
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA journal_mode = WAL")
    return conn


def get_db():
    conn = create_connection()
    try:
        yield conn
    finally:
        conn.close()


def init_db():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = create_connection()
    cur = conn.cursor()
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            username TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS user_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL UNIQUE,
            age INTEGER,
            height_cm REAL,
            weight_kg REAL,
            goal TEXT DEFAULT 'General Fitness',
            level TEXT DEFAULT 'Beginner',
            preferred_focus TEXT DEFAULT 'Full Body',
            bio TEXT,
            music_enabled INTEGER DEFAULT 1,
            voice_enabled INTEGER DEFAULT 1,
            tracker_enabled INTEGER DEFAULT 1,
            motion_sensitivity INTEGER DEFAULT 14,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
        """
    )
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS workout_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            exercise_name TEXT NOT NULL,
            reps INTEGER DEFAULT 0,
            duration_seconds INTEGER DEFAULT 0,
            calories REAL DEFAULT 0,
            form_score REAL DEFAULT 0,
            intensity TEXT DEFAULT 'Medium',
            notes TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
        """
    )
    cur.execute("PRAGMA table_info(user_profiles)")
    profile_columns = {row[1] for row in cur.fetchall()}
    if "tracker_enabled" not in profile_columns:
        cur.execute("ALTER TABLE user_profiles ADD COLUMN tracker_enabled INTEGER DEFAULT 1")
    if "motion_sensitivity" not in profile_columns:
        cur.execute("ALTER TABLE user_profiles ADD COLUMN motion_sensitivity INTEGER DEFAULT 14")

    cur.execute("PRAGMA table_info(workout_sessions)")
    session_columns = {row[1] for row in cur.fetchall()}
    if "form_score" not in session_columns:
        cur.execute("ALTER TABLE workout_sessions ADD COLUMN form_score REAL DEFAULT 0")

    conn.commit()
    conn.close()
