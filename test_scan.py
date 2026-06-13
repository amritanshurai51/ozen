"""
OZEN — Test Script
Run from project root: python test_scan.py
Tests: Claude scoring response + database saving
"""

import sys
import os
import json

# Add app to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from app.services.claude import Claude_Analyser
from app.services.old_database import create_tables, save_scan

# ── Test quiz data — matches exact format from mapAnswersToForm in App.jsx ───
QUIZ_DATA = {
    "age":              25,
    "gender":           "m",
    "ethnicity":        "Indian / South Asian",
    "city":             "Abu Dhabi",
    "primary_goal":     "General glow-up",
    "skincare_routine": "Basic cleanser only",
    "skin_issues":      "Oiliness",
    "body_type":        "Average",
    "height":           175.0,
    "weight":           72.0,
    "style_type":       "Minimal / Clean",
    "monthly_budget":   "AED 200 – 500",
    "currency":         "aed",
    "gym_fitness":      "3–4× per week",
    "sleep_bed":        "23:00",
    "sleep_wake":       "07:00",
    "sleep_hours":      8.0,
}

IMAGE_PATH = "/Users/dinesh/Project/Stage /static/sample.jpg"

def test_claude():
    print("\n" + "="*60)
    print("STEP 1 — Testing Claude scoring")
    print("="*60)

    # Load image
    if not os.path.exists(IMAGE_PATH):
        print(f"❌ Image not found at: {IMAGE_PATH}")
        print("   Place a sample.jpg at that path and retry.")
        return None

    with open(IMAGE_PATH, "rb") as f:
        image_bytes = f.read()

    print(f"✓ Image loaded — {len(image_bytes) / 1024:.0f} KB")
    print(f"  Gender: {QUIZ_DATA['gender']} ({'Male' if QUIZ_DATA['gender'] == 'm' else 'Female'})")
    print(f"  BMI will be calculated as: {round(QUIZ_DATA['weight'] / ((QUIZ_DATA['height']/100)**2), 1)}")

    analyser = Claude_Analyser()
    images = [{"bytes": image_bytes, "type": "image/jpeg"}]

    print("\n⏳ Calling Claude... (takes ~10-15 seconds)")
    result = analyser.score_analysis(images=images, quiz_data=QUIZ_DATA)

    if result.get("error"):
        print(f"❌ Claude error: {result.get('message')} — {result.get('detail', '')}")
        return None

    print(f"\n✓ Claude responded successfully")
    print(f"\n  image_check:     {result.get('image_check')}")
    print(f"  detected_ethnicity: {result.get('detected_ethnicity')}")
    print(f"  face_shape:      {result.get('face_shape')}")
    print(f"  overall_score:   {result.get('overall_score')}")
    print(f"  potential_score: {result.get('potential_score')}")

    scores = result.get("scores", {})
    print(f"\n  SCORES ({len(scores)} categories):")
    for k, v in scores.items():
        print(f"    {k:<20} {v}")

    observations = result.get("observations", {})
    print(f"\n  OBSERVATIONS:")
    for k, v in observations.items():
        print(f"    {k}: {v[:80]}...")

    strengths = result.get("strengths", [])
    print(f"\n  STRENGTHS ({len(strengths)}):")
    for s in strengths:
        print(f"    · {s}")

    focus_areas = result.get("primary_focus_areas", [])
    print(f"\n  FOCUS AREAS ({len(focus_areas)}):")
    for a in focus_areas:
        print(f"    · {a.get('area')} [{a.get('zone')}] — {a.get('current_score')}")

    protocol = result.get("30_day_protocol", [])
    print(f"\n  30-DAY PROTOCOL ({len(protocol)} items):")
    for i, item in enumerate(protocol, 1):
        print(f"    {i}. {item}")

    return result


def test_database(result):
    print("\n" + "="*60)
    print("STEP 2 — Testing database save")
    print("="*60)

    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("❌ DATABASE_URL not set in .env — skipping database test")
        return

    print("⏳ Initialising tables...")
    create_tables()

    # Test with a fake UUID (Supabase format)
    test_user_id = "test-uuid-1234-abcd-5678"
    print(f"⏳ Saving scan with user_id: {test_user_id}")

    try:
        scan_id = save_scan(
            quiz_data=QUIZ_DATA,
            result=result,
            user_id=test_user_id
        )
        print(f"✓ Scan saved — scan_id: {scan_id}")
        print(f"✓ user_id (TEXT) accepted correctly — UUID bug is fixed")
    except Exception as e:
        print(f"❌ Database save failed: {e}")


if __name__ == "__main__":
    result = test_claude()

    if result:
        test_database(result)
        print("\n" + "="*60)
        print("Full JSON result (for debugging):")
        print("="*60)
        # Print clean JSON without image bytes
        print(json.dumps(result, indent=2, default=str))
    else:
        print("\n❌ Claude step failed — skipping database test")