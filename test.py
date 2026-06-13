# """
# OZEN — bot_test.py
# Calibration test: logs in, hits /scan with model image + complete quiz data.
# Run from project root: uv run bot_test.py
# """
# import requests
# import json
# import os
# import sys
# from dotenv import load_dotenv
# load_dotenv("/Users/dinesh/Project/Stage /app/services/.env")

# BASE_URL   = "http://localhost:8000"
# EMAIL      = "user1@gmail.com"
# PASSWORD   = "user1234"
# IMAGE_PATH = "/Users/dinesh/Project/Stage /model.jpg"

# SUPABASE_URL = os.getenv("SUPABASE_CONN_URL")
# SUPABASE_KEY = os.getenv("SUPABASE_SECRET_KEY")

# # ── Complete quiz data — all fields required by InputForm ─────────────────────
# # Kendall Jenner approximate stats
# # Every field matches InputForm pydantic schema exactly
# QUIZ_DATA = {
#     "age":              28,
#     "gender":           "f",           # female
#     "ethnicity":        "Other",       # white/american
#     "city":             "Dubai",
#     "primary_goal":     "General glow-up",
#     "skincare_routine": "5+ step",
#     "skin_issues":      "None",
#     "body_type":        "Slim",
#     "height":           178.0,         # 5'10" in cm
#     "weight":           59.0,          # ~130 lbs
#     "style_type":       "Minimal / Clean, Old Money",
#     "monthly_budget":   "AED 1500+",
#     "currency":         "aed",
#     "gym_fitness":      "3–4× per week",
#     "sleep_bed":        "23:00",
#     "sleep_wake":       "07:00",
#     "sleep_hours":      8.0,
# }

# def get_token():
#     print("\n" + "="*60)
#     print("STEP 1 — Logging in")
#     print("="*60)

#     if not SUPABASE_URL or not SUPABASE_KEY:
#         print("❌ SUPABASE_CONN_URL or SUPABASE_SECRET_KEY not set in .env")
#         sys.exit(1)

#     resp = requests.post(
#         f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
#         headers={"apikey": SUPABASE_KEY, "Content-Type": "application/json"},
#         json={"email": EMAIL, "password": PASSWORD},
#         timeout=15,
#     )

#     if resp.status_code != 200:
#         print(f"❌ Login failed ({resp.status_code}): {resp.text}")
#         sys.exit(1)

#     token = resp.json().get("access_token")
#     user_id = resp.json().get("user", {}).get("id")
#     print(f"✓ Logged in as {EMAIL} — user_id: {user_id}")
#     return token


# def run_scan(token):
#     print("\n" + "="*60)
#     print("STEP 2 — Running scan")
#     print("="*60)

#     if not os.path.exists(IMAGE_PATH):
#         print(f"❌ Image not found: {IMAGE_PATH}")
#         sys.exit(1)

#     with open(IMAGE_PATH, "rb") as f:
#         image_bytes = f.read()

#     print(f"✓ Image: {len(image_bytes)/1024:.0f} KB")
#     print(f"  Profile: Female, 28yo, 178cm/59kg, BMI {round(59/1.78**2,1)}, Slim, 5+ step skincare, 3-4x gym")
#     print(f"\n⏳ Sending to Claude... (~15-30 seconds)")

#     resp = requests.post(
#         f"{BASE_URL}/scan",
#         headers={"Authorization": f"Bearer {token}"},
#         data={"quiz_data": json.dumps(QUIZ_DATA)},
#         files=[("images", ("model.jpg", image_bytes, "image/jpeg"))],
#         timeout=90,
#     )

#     print(f"  HTTP {resp.status_code}")
#     result = resp.json()

#     if resp.status_code != 200 or result.get("error"):
#         print(f"❌ Failed: {result.get('error') or result.get('message')}")
#         print(f"   Full response: {json.dumps(result, indent=2)}")
#         sys.exit(1)

#     print(f"\n{'='*60}")
#     print(f"RESULTS")
#     print(f"{'='*60}")
#     print(f"  image_check:     {result.get('image_check')}")
#     print(f"  face_shape:      {result.get('face_shape')}")
#     print(f"  overall_score:   {result.get('overall_score')}")
#     print(f"  potential_score: {result.get('potential_score')}")

#     scores = result.get("scores", {})
#     print(f"\n  SCORES ({len(scores)} params):")
#     for k, v in scores.items():
#         filled = "█" * int(float(v))
#         empty  = "░" * (10 - int(float(v)))
#         print(f"    {k:<20} {str(v):<5} {filled}{empty}")

#     print(f"\n  OBSERVATIONS:")
#     for k, v in result.get("observations", {}).items():
#         print(f"    {k}: {v[:100]}...")

#     print(f"\n  STRENGTHS:")
#     for s in result.get("strengths", []):
#         print(f"    · {s}")

#     print(f"\n  FOCUS AREAS:")
#     for a in result.get("primary_focus_areas", []):
#         print(f"    · {a.get('area')} [{a.get('zone')}] score={a.get('current_score')}")

#     print(f"\n  30-DAY PROTOCOL:")
#     for i, item in enumerate(result.get("30_day_protocol", []), 1):
#         print(f"    {i}. {item}")

#     overall = float(result.get("overall_score", 0))
#     print(f"\n{'='*60}")
#     print(f"CALIBRATION CHECK")
#     print(f"{'='*60}")
#     if overall >= 8.5:
#         print(f"  ✅ EXCELLENT — {overall} correctly identifies supermodel tier (8.5+)")
#     elif overall >= 8.0:
#         print(f"  ✅ GOOD — {overall} is high tier, reasonable for top model")
#     elif overall >= 7.5:
#         print(f"  ⚠️  LOW — {overall} is borderline. Supermodel should score 8.5+")
#     elif overall >= 7.0:
#         print(f"  ❌ UNDERSCORING — {overall} too low for model tier, prompt needs work")
#     else:
#         print(f"  ❌ FAIL — {overall} is way too low, serious calibration issue")

#     return result


# if __name__ == "__main__":
#     token = get_token()
#     run_scan(token)


"""
OZEN — bot_test.py
Calibration test with two modes:
  uv run bot_test.py model   → Kendall Jenner (model tier, expect 8.5+)
  uv run bot_test.py avg     → Average male (expect 5.0-6.5)
"""
import requests
import json
import os
import sys
from dotenv import load_dotenv
load_dotenv("/Users/dinesh/Project/Stage /app/services/.env")

BASE_URL     = "http://localhost:8000"
EMAIL        = "user1@gmail.com"
PASSWORD     = "user1234"
SUPABASE_URL = os.getenv("SUPABASE_CONN_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SECRET_KEY")

# ── Profiles ──────────────────────────────────────────────────────────────────

PROFILES = {
    "model": {
        "image_path": "/Users/dinesh/Project/Stage /model.jpg",
        "label": "Kendall Jenner — Female, 28yo, 178cm/59kg, supermodel",
        "expected": "8.5+",
        "quiz": {
            "age":              28,
            "gender":           "f",
            "ethnicity":        "Other",
            "city":             "Dubai",
            "primary_goal":     "General glow-up",
            "skincare_routine": "5+ step",
            "skin_issues":      "None",
            "body_type":        "Slim",
            "height":           178.0,
            "weight":           59.0,
            "style_type":       "Minimal / Clean, Old Money",
            "monthly_budget":   "AED 1500+",
            "currency":         "aed",
            "gym_fitness":      "3–4× per week",
            "sleep_bed":        "23:00",
            "sleep_wake":       "07:00",
            "sleep_hours":      8.0,
        }
    },
    "avg": {
        "image_path": "/Users/dinesh/Project/Stage /static/sample.jpg",
        "label": "Average male — Male, 26yo, 175cm/80kg, soft jawline, buzz cut",
        "expected": "5.0-6.5",
        "quiz": {
            "age":              26,
            "gender":           "m",
            "ethnicity":        "Other",
            "city":             "Dubai",
            "primary_goal":     "General glow-up",
            "skincare_routine": "None",
            "skin_issues":      "Oiliness",
            "body_type":        "Average",
            "height":           175.0,
            "weight":           80.0,
            "style_type":       "Minimal / Clean",
            "monthly_budget":   "AED 200 – 500",
            "currency":         "aed",
            "gym_fitness":      "1–2× per week",
            "sleep_bed":        "23:30",
            "sleep_wake":       "07:00",
            "sleep_hours":      7.5,
        }
    }
}

# ── Auth ──────────────────────────────────────────────────────────────────────
def get_token():
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("❌ SUPABASE_CONN_URL or SUPABASE_SECRET_KEY not set in .env")
        sys.exit(1)

    resp = requests.post(
        f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
        headers={"apikey": SUPABASE_KEY, "Content-Type": "application/json"},
        json={"email": EMAIL, "password": PASSWORD},
        timeout=15,
    )
    if resp.status_code != 200:
        print(f"❌ Login failed ({resp.status_code}): {resp.text}")
        sys.exit(1)

    print(f"✓ Logged in as {EMAIL}")
    return resp.json().get("access_token")


# ── Scan ──────────────────────────────────────────────────────────────────────
def run_scan(token, profile):
    image_path = profile["image_path"]

    if not os.path.exists(image_path):
        print(f"❌ Image not found: {image_path}")
        sys.exit(1)

    with open(image_path, "rb") as f:
        image_bytes = f.read()

    print(f"✓ Image: {len(image_bytes)/1024:.0f} KB")
    print(f"  Profile: {profile['label']}")
    print(f"  Expected score: {profile['expected']}")
    print(f"\n⏳ Sending to Claude... (~15-30 seconds)")

    resp = requests.post(
        f"{BASE_URL}/scan",
        headers={"Authorization": f"Bearer {token}"},
        data={"quiz_data": json.dumps(profile["quiz"])},
        files=[("images", ("photo.jpg", image_bytes, "image/jpeg"))],
        timeout=90,
    )

    print(f"  HTTP {resp.status_code}")
    result = resp.json()

    if resp.status_code != 200 or result.get("error"):
        print(f"❌ Failed: {result.get('error') or result.get('message')}")
        print(json.dumps(result, indent=2))
        sys.exit(1)

    print(f"\n{'='*60}")
    print(f"RESULTS")
    print(f"{'='*60}")
    print(f"  image_check:     {result.get('image_check')}")
    print(f"  face_shape:      {result.get('face_shape')}")
    print(f"  overall_score:   {result.get('overall_score')}")
    print(f"  potential_score: {result.get('potential_score')}")

    scores = result.get("scores", {})
    print(f"\n  SCORES ({len(scores)} params):")
    for k, v in scores.items():
        filled = "█" * int(float(v))
        empty  = "░" * (10 - int(float(v)))
        print(f"    {k:<20} {str(v):<5} {filled}{empty}")

    print(f"\n  OBSERVATIONS:")
    for k, v in result.get("observations", {}).items():
        print(f"    {k}: {v[:100]}...")

    print(f"\n  STRENGTHS:")
    for s in result.get("strengths", []):
        print(f"    · {s}")

    print(f"\n  FOCUS AREAS:")
    for a in result.get("primary_focus_areas", []):
        print(f"    · {a.get('area')} [{a.get('zone')}] — {a.get('current_score')}")

    print(f"\n  30-DAY PROTOCOL:")
    for i, item in enumerate(result.get("30_day_protocol", []), 1):
        print(f"    {i}. {item}")

    overall = float(result.get("overall_score", 0))
    expected = profile["expected"]
    print(f"\n{'='*60}")
    print(f"CALIBRATION CHECK  (expected: {expected})")
    print(f"{'='*60}")

    if profile == PROFILES["model"]:
        if overall >= 8.5:
            print(f"  ✅ PASS — {overall} correctly identifies supermodel tier")
        elif overall >= 8.0:
            print(f"  ✅ PASS — {overall} is high tier, reasonable for top model")
        elif overall >= 7.5:
            print(f"  ⚠️  LOW — {overall} borderline, supermodel should score 8.5+")
        else:
            print(f"  ❌ FAIL — {overall} too low for model tier")
    else:
        if 5.0 <= overall <= 6.5:
            print(f"  ✅ PASS — {overall} correctly in average range (5.0-6.5)")
        elif overall < 5.0:
            print(f"  ⚠️  LOW — {overall} seems harsh for this face")
        else:
            print(f"  ⚠️  HIGH — {overall} may be inflating average face")

    return result


# ── Main ──────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else None

    if mode not in ("model", "avg"):
        print("Usage: uv run bot_test.py model")
        print("       uv run bot_test.py avg")
        sys.exit(1)

    print(f"\n{'='*60}")
    print(f"OZEN CALIBRATION TEST — mode: {mode.upper()}")
    print(f"{'='*60}")

    token = get_token()
    run_scan(token, PROFILES[mode])