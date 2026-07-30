import os
import json
from datetime import datetime, timezone
from supabase import create_client, Client


def get_client() -> Client:
    url = os.getenv("SUPABASE_CONN_URL")
    key = os.getenv("SUPABASE_SECRET_KEY")
    if not url or not key:
        raise ValueError("SUPABASE_CONN_URL and SUPABASE_SECRET_KEY must be set in .env")
    return create_client(url, key)


def connect_db():
    try:
        client = get_client()
        client.from_("scans").select("id").limit(1).execute()
        print("Supabase connection ready")
    except Exception as e:
        print(f"Supabase connection error: {e}")



# ── Profile ──────────────────────────────────────────────────────────────────
 
def save_profile(user_id: str, profile_data: dict) -> dict:
    """
    Upsert stable profile fields into the users table.
    Called once after the first full quiz, and again if the user
    ever updates their weight via the QuickScan weight confirm screen.
 
    profile_data keys match the columns added to the users table:
      age, gender, ethnicity, climate, body_type, height, weight,
      hair_type, hair_texture, scalp_type, hair_history, budget
 
    Sets profile_completed_at on first save (if not already set).
    Always updates weight (the one field that can change scan-to-scan).
    """
    try:
        client = get_client()
 
        # Check if a row already exists for this user
        existing = client.from_("users")\
            .select("id, profile_completed_at")\
            .eq("id", str(user_id))\
            .single()\
            .execute()
 
        payload = {**profile_data}
 
        # Only stamp profile_completed_at on the very first save
        if existing.data and not existing.data.get("profile_completed_at"):
            payload["profile_completed_at"] = datetime.now(timezone.utc).isoformat()
 
        if existing.data:
            # Row exists — update it
            response = client.from_("users")\
                .update(payload)\
                .eq("id", str(user_id))\
                .execute()
        else:
            # No row yet (edge case) — insert one
            payload["id"] = str(user_id)
            payload["profile_completed_at"] = datetime.now(timezone.utc).isoformat()
            response = client.from_("users")\
                .insert(payload)\
                .execute()
 
        return response.data[0] if response.data else {}
 
    except Exception as e:
        print(f"✗ save_profile error: {e}")
        raise
 
 
def get_profile(user_id: str) -> dict | None:
    """
    Fetch the stored profile row from the users table.
    Returns None if no profile exists yet (user hasn't completed
    the first quiz), which tells App.jsx to show full Onboarding.
    """
    try:
        client = get_client()
        response = client.from_("users")\
            .select("*")\
            .eq("id", str(user_id))\
            .single()\
            .execute()
 
        data = response.data
        # Profile is only "complete" if weight is present —
        # that's the last stable field collected in the full quiz.
        if data and data.get("weight") is not None:
            return data
        return None
 
    except Exception as e:
        # .single() raises if no row found — that's fine, just return None
        return None
 


def save_scan(quiz_data: dict, result: dict, user_id: str | None = None) -> int:

    overall   = result.get("overall_score")
    potential = result.get("potential_score")

    try:
        client = get_client()
        response = client.from_("scans").insert({
            "user_id":         str(user_id) if user_id else None,
            "overall_score":   overall,
            "potential_score": potential,
            "quiz_data":       quiz_data,
            "full_result":     result,
        }).execute()

        scan_id = response.data[0]["id"] if response.data else None
        return scan_id

    except Exception as e:
        print(f"✗ save_scan error: {e}")
        raise


def get_scans_by_user(user_id: str) -> list[dict]:
    """Fetch all scans for a user, newest first."""
    try:
        client = get_client()
        response = client.from_("scans")\
            .select("id, overall_score, potential_score, created_at, full_result")\
            .eq("user_id", str(user_id))\
            .order("created_at", desc=True)\
            .execute()
        return response.data or []
    except Exception as e:
        print(f"✗ get_scans_by_user error: {e}")
        return []


def create_user(name: str, email: str, password: str) -> dict:
    raise NotImplementedError("Use Supabase auth instead of /register")

def get_user_by_email(email: str) -> dict | None:
    return None

def verify_password(plain: str, hashed: str) -> bool:
    return False