# import os
# import json
# import bcrypt
# import psycopg2
# from psycopg2.extras import RealDictCursor
# from datetime import datetime

# # ============================================================================
# # OZEN — Database Service
# # Requires DATABASE_URL in .env
# # e.g. postgresql://user:password@host:5432/dbname
# #
# # Run create_tables() once on startup to initialise schema.
# # ============================================================================

# def get_conn():
#     """Get a fresh DB connection. Always close after use."""
#     return psycopg2.connect(os.getenv("DATABASE_URL"), cursor_factory=RealDictCursor)


# # ── Schema ───────────────────────────────────────────────────────────────────

# CREATE_TABLES_SQL = """
# CREATE TABLE IF NOT EXISTS users (
#     id          SERIAL PRIMARY KEY,
#     name        TEXT NOT NULL,
#     email       TEXT UNIQUE NOT NULL,
#     password    TEXT NOT NULL,
#     created_at  TIMESTAMP DEFAULT NOW()
# );

# CREATE TABLE IF NOT EXISTS scans (
#     id              SERIAL PRIMARY KEY,
#     user_id         INTEGER REFERENCES users(id) ON DELETE SET NULL,
#     overall_score   NUMERIC(3,1),
#     potential_score NUMERIC(3,1),
#     quiz_data       JSONB,
#     full_result     JSONB,
#     created_at      TIMESTAMP DEFAULT NOW()
# );
# """

# def create_tables():
#     """Call once on app startup to ensure tables exist."""
#     try:
#         conn = get_conn()
#         cur  = conn.cursor()
#         cur.execute(CREATE_TABLES_SQL)
#         conn.commit()
#         cur.close()
#         conn.close()
#         print("✓ DB tables ready")
#     except Exception as e:
#         print(f"✗ DB init error: {e}")


# # ── Users ────────────────────────────────────────────────────────────────────

# def create_user(name: str, email: str, password: str) -> dict:
#     """
#     Hash password and insert user.
#     Returns the created user dict or raises on duplicate email.
#     """
#     hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
#     conn = get_conn()
#     try:
#         cur = conn.cursor()
#         cur.execute(
#             """
#             INSERT INTO users (name, email, password)
#             VALUES (%s, %s, %s)
#             RETURNING id, name, email, created_at
#             """,
#             (name.strip(), email.strip().lower(), hashed)
#         )
#         user = dict(cur.fetchone())
#         conn.commit()
#         return user
#     except psycopg2.errors.UniqueViolation:
#         raise ValueError("email_taken")
#     finally:
#         cur.close()
#         conn.close()


# def get_user_by_email(email: str) -> dict | None:
#     """Fetch user row by email. Returns None if not found."""
#     conn = get_conn()
#     try:
#         cur = conn.cursor()
#         cur.execute("SELECT * FROM users WHERE email = %s", (email.strip().lower(),))
#         row = cur.fetchone()
#         return dict(row) if row else None
#     finally:
#         cur.close()
#         conn.close()


# def verify_password(plain: str, hashed: str) -> bool:
#     return bcrypt.checkpw(plain.encode(), hashed.encode())


# # ── Scans ────────────────────────────────────────────────────────────────────

# def save_scan(quiz_data: dict, result: dict, user_id: int | None = None) -> int:
#     """
#     Store a completed scan.
#     user_id is optional — anonymous scans are allowed for MVP.
#     Returns the new scan id.
#     """
#     overall   = result.get("overall_score")
#     potential = result.get("potential_score")

#     conn = get_conn()
#     try:
#         cur = conn.cursor()
#         cur.execute(
#             """
#             INSERT INTO scans (user_id, overall_score, potential_score, quiz_data, full_result)
#             VALUES (%s, %s, %s, %s, %s)
#             RETURNING id
#             """,
#             (
#                 user_id,
#                 overall,
#                 potential,
#                 json.dumps(quiz_data),
#                 json.dumps(result),
#             )
#         )
#         scan_id = cur.fetchone()["id"]
#         conn.commit()
#         return scan_id
#     finally:
#         cur.close()
#         conn.close()


# def get_scans_by_user(user_id: int) -> list[dict]:
#     """Fetch all scans for a user, newest first."""
#     conn = get_conn()
#     try:
#         cur = conn.cursor()
#         cur.execute(
#             """
#             SELECT id, overall_score, potential_score, created_at
#             FROM scans
#             WHERE user_id = %s
#             ORDER BY created_at DESC
#             """,
#             (user_id,)
#         )
#         return [dict(row) for row in cur.fetchall()]
#     finally:
#         cur.close()
#         conn.close()


import os
import json
import bcrypt
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

# ============================================================================
# OZEN — Database Service
# Requires DATABASE_URL in .env
# e.g. postgresql://user:password@host:5432/dbname
# ============================================================================

def get_conn():
    """Get a fresh DB connection. Always close after use."""
    return psycopg2.connect(os.getenv("SUPABASE_CONN_URL"), cursor_factory=RealDictCursor)


# ── Schema ───────────────────────────────────────────────────────────────────
# user_id is TEXT (not INTEGER) to match Supabase JWT UUID strings e.g. "a3f2c1d0-..."
# users table kept for legacy /register + /login routes (not used in Supabase auth flow)

CREATE_TABLES_SQL = """
CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    name        TEXT NOT NULL,
    email       TEXT UNIQUE NOT NULL,
    password    TEXT NOT NULL,
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scans (
    id              SERIAL PRIMARY KEY,
    user_id         TEXT,
    overall_score   NUMERIC(3,1),
    potential_score NUMERIC(3,1),
    quiz_data       JSONB,
    full_result     JSONB,
    created_at      TIMESTAMP DEFAULT NOW()
);
"""

# Migration: if scans table already exists with INTEGER user_id, alter it
ALTER_USER_ID_SQL = """
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'scans'
        AND column_name = 'user_id'
        AND data_type = 'integer'
    ) THEN
        ALTER TABLE scans DROP CONSTRAINT IF EXISTS scans_user_id_fkey;
        ALTER TABLE scans ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
    END IF;
END $$;
"""

def create_tables():
    """Call once on app startup to ensure tables exist and schema is correct."""
    try:
        conn = get_conn()
        cur  = conn.cursor()
        cur.execute(CREATE_TABLES_SQL)
        cur.execute(ALTER_USER_ID_SQL)
        conn.commit()
        cur.close()
        conn.close()
        print("✓ DB tables ready")
    except Exception as e:
        print(f"✗ DB init error: {e}")


# ── Users (legacy — used by /register and /login only) ───────────────────────

def create_user(name: str, email: str, password: str) -> dict:
    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO users (name, email, password)
            VALUES (%s, %s, %s)
            RETURNING id, name, email, created_at
            """,
            (name.strip(), email.strip().lower(), hashed)
        )
        user = dict(cur.fetchone())
        conn.commit()
        return user
    except psycopg2.errors.UniqueViolation:
        raise ValueError("email_taken")
    finally:
        cur.close()
        conn.close()


def get_user_by_email(email: str) -> dict | None:
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM users WHERE email = %s", (email.strip().lower(),))
        row = cur.fetchone()
        return dict(row) if row else None
    finally:
        cur.close()
        conn.close()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


# ── Scans ────────────────────────────────────────────────────────────────────

def save_scan(quiz_data: dict, result: dict, user_id: str | None = None) -> int:
    """
    Store a completed scan.
    user_id is a Supabase UUID string or None for anonymous scans.
    Returns the new scan id.
    """
    overall   = result.get("overall_score")
    potential = result.get("potential_score")

    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO scans (user_id, overall_score, potential_score, quiz_data, full_result)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id
            """,
            (
                str(user_id) if user_id else None,
                overall,
                potential,
                json.dumps(quiz_data),
                json.dumps(result),
            )
        )
        scan_id = cur.fetchone()["id"]
        conn.commit()
        print(f"✓ Scan saved — id={scan_id}, user_id={user_id}")
        return scan_id
    except Exception as e:
        print(f"✗ save_scan error: {e}")
        raise
    finally:
        cur.close()
        conn.close()


def get_scans_by_user(user_id: str) -> list[dict]:
    """Fetch all scans for a user, newest first."""
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute(
            """
            SELECT id, overall_score, potential_score, created_at, full_result
            FROM scans
            WHERE user_id = %s
            ORDER BY created_at DESC
            """,
            (str(user_id),)
        )
        return [dict(row) for row in cur.fetchall()]
    finally:
        cur.close()
        conn.close()