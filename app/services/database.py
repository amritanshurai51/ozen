# import os
# import json
# from datetime import datetime
# from supabase import create_client, Client

# # ============================================================================
# # OZEN — Database Service (Supabase SDK)
# # Uses SUPABASE_CONN_URL and SUPABASE_SECRET_KEY from .env
# # No psycopg2 or raw connection string needed.
# # ============================================================================

# def get_client() -> Client:
#     url = os.getenv("SUPABASE_CONN_URL")
#     key = os.getenv("SUPABASE_SECRET_KEY")
#     if not url or not key:
#         raise ValueError("SUPABASE_CONN_URL and SUPABASE_SECRET_KEY must be set in .env")
#     return create_client(url, key)


# def create_tables():
#     """
#     Supabase manages schema via dashboard — no CREATE TABLE needed here.
#     This function just verifies the connection is working on startup.
#     """
#     try:
#         client = get_client()
#         client.from_("scans").select("id").limit(1).execute()
#         print("✓ Supabase connection ready")
#     except Exception as e:
#         print(f"✗ Supabase connection error: {e}")


# # ── Scans ─────────────────────────────────────────────────────────────────────

# def save_scan(quiz_data: dict, result: dict, user_id: str | None = None) -> int:
#     """
#     Store a completed scan.
#     user_id is the Supabase auth UUID string, or None for anonymous scans.
#     Returns the new scan id.
#     """
#     overall   = result.get("overall_score")
#     potential = result.get("potential_score")

#     try:
#         client = get_client()
#         response = client.from_("scans").insert({
#             "user_id":         str(user_id) if user_id else None,
#             "overall_score":   overall,
#             "potential_score": potential,
#             "quiz_data":       quiz_data,
#             "full_result":     result,
#         }).execute()

#         scan_id = response.data[0]["id"] if response.data else None
#         print(f"✓ Scan saved — id={scan_id}, user_id={user_id}")
#         return scan_id

#     except Exception as e:
#         print(f"✗ save_scan error: {e}")
#         raise


# def get_scans_by_user(user_id: str) -> list[dict]:
#     """Fetch all scans for a user, newest first."""
#     try:
#         client = get_client()
#         response = client.from_("scans")\
#             .select("id, overall_score, potential_score, created_at, full_result")\
#             .eq("user_id", str(user_id))\
#             .order("created_at", desc=True)\
#             .execute()
#         return response.data or []
#     except Exception as e:
#         print(f"✗ get_scans_by_user error: {e}")
#         return []


# # ── Legacy user functions ──────────────────────────────────────────────────────
# # Auth is handled by Supabase directly — these stubs keep main.py imports working

# def create_user(name: str, email: str, password: str) -> dict:
#     raise NotImplementedError("Use Supabase auth instead of /register")

# def get_user_by_email(email: str) -> dict | None:
#     return None

# def verify_password(plain: str, hashed: str) -> bool:
#     return False


import os
import json
from datetime import datetime
from supabase import create_client, Client

# ============================================================================
# OZEN — Database Service (Supabase SDK)
# Uses SUPABASE_CONN_URL and SUPABASE_SECRET_KEY from .env
# No psycopg2 or raw connection string needed.
# ============================================================================

def get_client() -> Client:
    url = os.getenv("SUPABASE_CONN_URL")
    key = os.getenv("SUPABASE_SECRET_KEY")
    if not url or not key:
        raise ValueError("SUPABASE_CONN_URL and SUPABASE_SECRET_KEY must be set in .env")
    return create_client(url, key)


def create_tables():
    """
    Supabase manages schema via dashboard — no CREATE TABLE needed here.
    This function just verifies the connection is working on startup.
    """
    try:
        client = get_client()
        client.from_("scans").select("id").limit(1).execute()
        print("✓ Supabase connection ready")
    except Exception as e:
        print(f"✗ Supabase connection error: {e}")


# ── Scans ─────────────────────────────────────────────────────────────────────

def save_scan(quiz_data: dict, result: dict, user_id: str | None = None) -> int:
    """
    Store a completed scan.
    user_id is the Supabase auth UUID string, or None for anonymous scans.
    Returns the new scan id.
    """
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
        print(f"✓ Scan saved — id={scan_id}, user_id={user_id}")
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


# ── Legacy user functions ──────────────────────────────────────────────────────
# Auth is handled by Supabase directly — these stubs keep main.py imports working

def create_user(name: str, email: str, password: str) -> dict:
    raise NotImplementedError("Use Supabase auth instead of /register")

def get_user_by_email(email: str) -> dict | None:
    return None

def verify_password(plain: str, hashed: str) -> bool:
    return False