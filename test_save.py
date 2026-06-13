"""
OZEN — test_save.py
Makes a real HTTP POST to /scan with the Claude result JSON
to test the full save pipeline end to end.
Run from project root: uv run test_save.py
Make sure the backend is running: uv run uvicorn app.main:app --port 8000
"""
import requests
import json

BASE_URL = "http://localhost:8000"
IMAGE_PATH = "/Users/dinesh/Project/Stage /static/sample.jpg"

# ── Quiz data — exact format that mapAnswersToForm sends ─────────────────────
QUIZ_DATA = {
    "age": 25,
    "gender": "m",
    "ethnicity": "Indian / South Asian",
    "city": "Abu Dhabi",
    "primary_goal": "General glow-up",
    "skincare_routine": "Basic cleanser only",
    "skin_issues": "Oiliness",
    "body_type": "Average",
    "height": 175.0,
    "weight": 72.0,
    "style_type": "Minimal / Clean",
    "monthly_budget": "AED 200 – 500",
    "currency": "aed",
    "gym_fitness": "3–4× per week",
    "sleep_bed": "23:00",
    "sleep_wake": "07:00",
    "sleep_hours": 8.0,
}

print("\n" + "="*60)
print("Testing full /scan pipeline (Claude + database save)")
print("="*60)

# Load image
try:
    with open(IMAGE_PATH, "rb") as f:
        image_bytes = f.read()
    print(f"✓ Image loaded — {len(image_bytes) / 1024:.0f} KB")
except FileNotFoundError:
    print(f"❌ Image not found at: {IMAGE_PATH}")
    exit(1)

# Build multipart form request — exactly what the frontend sends
files = [
    ("images", ("front.jpg", image_bytes, "image/jpeg")),
]
data = {
    "quiz_data": json.dumps(QUIZ_DATA),
}

print(f"\n⏳ Posting to {BASE_URL}/scan ...")
print(f"   (This calls Claude + saves to database — ~15-30 seconds)")

try:
    resp = requests.post(
        f"{BASE_URL}/scan",
        data=data,
        files=files,
        timeout=60,
    )

    print(f"\n   HTTP status: {resp.status_code}")

    result = resp.json()

    if resp.status_code != 200 or result.get("error"):
        print(f"❌ Error: {result.get('error') or result.get('message')}")
        exit(1)

    print(f"\n✅ SUCCESS — scan complete and saved")
    print(f"   overall_score:   {result.get('overall_score')}")
    print(f"   potential_score: {result.get('potential_score')}")
    print(f"   scores: {result.get('scores')}")
    print(f"\n   Check Supabase Table Editor → scans for the new row")

except requests.exceptions.ConnectionError:
    print(f"\n❌ Could not connect to {BASE_URL}")
    print(f"   Make sure backend is running:")
    print(f"   uv run uvicorn app.main:app --port 8000 --reload")
except Exception as e:
    print(f"\n❌ Unexpected error: {e}")