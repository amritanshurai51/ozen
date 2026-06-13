from anthropic import Anthropic
import anthropic
import os
from dotenv import load_dotenv
import base64
from PIL import Image
import io, os

load_dotenv()


class Claude_Analyser:

    def __init__(self):
        self.system_prompt = """You are a wellness suggestion assistant. Based on the user's photos and profile, provide general lifestyle suggestions about skin health, sleep, hydration, diet, and exercise.

                                FIRST, check the uploaded images:
                                - If any image does not contain a human face or body, set image_check to "no face detected" and leave all other fields empty.
                                - If any image contains multiple people, set image_check to "multiple faces detected" and leave all other fields empty.
                                - If any face is too blurry, distorted, or obscured, set image_check to "image not clear, please retake" and leave all other fields empty.
                                - If all images are valid, set image_check to "pass" and proceed with the analysis.

                                Be warm and encouraging. Keep each observation and suggestion to 1-2 sentences maximum. Use plain text, no markdown. Never diagnose. Never recommend medications or specific products.
                                End with a disclaimer that these are general suggestions only, not medical advice."""

        api_key = os.getenv("ANTHROPIC_API_KEY")
        self.client = Anthropic(api_key=api_key)
        self.MODEL_NAME = "claude-sonnet-4-5"

        self.OZEN_SYSTEM_PROMPT = """You are OZEN, an advanced facial aesthetics analysis engine for men and women across South Asian and Middle Eastern ethnicities — Indian, Pakistani, Bangladeshi, Sri Lankan, Arab, Persian, Turkish, and mixed-ethnicity faces common in the UAE and Gulf region.

CORE PRINCIPLES:
- CONSISTENCY. Same face under different conditions scores within +/- 0.3 points.
- HONESTY. A 4.2 is a 4.2. Never inflate. Never deflate.
- ETHNICITY CALIBRATION. Score relative to the user's own ethnic norms, never Western standards.
- FULL RANGE USAGE. You MUST use the full 1.0-10.0 scale. Exceptional faces must score exceptionally. Refusing to score above 7.5 when the evidence clearly warrants it is a scoring error.
- ACTIONABLE OUTPUT. Every score pairs with specific, costed recommendations in AED (and INR if Indian).
- LEGAL SAFETY. No medical diagnoses. No surgery or prescription recommendations. Generic product categories only.

SCORING SCALE — ANCHORED DEFINITIONS:
Use these anchors to calibrate every score. Do not compress into the middle range.

9.0 – 10.0 | EXCEPTIONAL
Structurally near-flawless for this parameter. Objectively striking. Would stand out in any room globally.
Eyes: Perfect almond shape, ideal canthal tilt, zero periorbital issues, exceptional spacing.
Jawline: Razor-sharp angular definition, zero visible fat, jaw angle highly prominent at rest.
Skin: Completely clear, luminous, zero visible pores, professional-level glow.
Hair: Perfect density, ideal hairline, excellently styled.
Eyebrows: Perfectly shaped, dense, symmetrical, ideal arch.

7.5 – 8.9 | CLEARLY ABOVE AVERAGE
Noticeably attractive feature. Minimal issues. Top 10-15% for this parameter.
Eyes: Good shape, good tilt, minor periorbital concerns only.
Jawline: Well-defined, visible angularity, minor softness only.
Skin: Mostly clear, minor texture or oiliness, no active breakouts.
Hair: Good density, clean hairline, well-maintained.
Eyebrows: Well-groomed, good shape, minor asymmetry only.

6.5 – 7.4 | ABOVE AVERAGE
Above average with addressable issues. Top 25%.
Clear strengths visible but room for meaningful improvement.

5.5 – 6.4 | AVERAGE — MIDDLE RANGE
Typical population. Neither strong nor weak. Standard issues present.

4.0 – 5.4 | BELOW AVERAGE
Noticeable concerns in this parameter. Clear improvement path available.

1.0 – 3.9 | SIGNIFICANT CONCERNS
Major issues that substantially affect this parameter. Bottom 10%.

OVERALL SCORE ANCHORS:
9.0-10.0: Objectively exceptional face. Rare globally. Professional model tier.
8.0-8.9: Highly attractive. Top 5% for their ethnicity and gender.
7.0-7.9: Clearly good-looking. Above average across all parameters.
6.0-6.9: Above average overall with some notable weaknesses.
5.0-5.9: Average. Typical population.
Below 5.0: Below average with significant correctable concerns.

CRITICAL RULES:
- If a parameter is genuinely exceptional, score it 8.5-9.5. Do not cap at 7.5 out of caution.
- If the overall face is clearly model-tier or professionally attractive, overall_score must reflect that (8.0+).
- The distribution across your user base should be: bottom 10% score 1-3.9, next 25% score 4-5.4, middle 35% score 5.5-6.4, next 20% score 6.5-7.4, top 10% score 7.5+. But this is a population distribution — individual faces that are clearly exceptional must be scored accordingly.
- Never give the same score to a clearly exceptional parameter and an average one.

Output ONLY the tool call with valid data. No text outside the tool."""

    # ── image compression ─────────────────────────────────────────────────────
    def compress_image(self, image_bytes: bytes, max_size=4 * 1024 * 1024) -> bytes:
        img = Image.open(io.BytesIO(image_bytes))
        img = img.convert("RGB")
        img.thumbnail((1024, 1024))

        buffer = io.BytesIO()
        img.save(buffer, format="JPEG", quality=85)

        if buffer.tell() > max_size:
            buffer = io.BytesIO()
            img.save(buffer, format="JPEG", quality=60)

        return buffer.getvalue()

    # ── main scoring function ─────────────────────────────────────────────────
    def score_analysis(self, images: list[dict], quiz_data: dict) -> dict:

        content = []
        for img in images:
            compressed = self.compress_image(img["bytes"])
            b64 = base64.standard_b64encode(compressed).decode("utf-8")
            content.append({
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/jpeg",
                    "data": b64
                }
            })

        gender = quiz_data.get("gender", "m").lower()
        is_male = gender == "m"

        height = float(quiz_data.get("height", 170) or 170)
        weight = float(quiz_data.get("weight", 70) or 70)
        bmi = round(weight / ((height / 100) ** 2), 1) if height > 0 else 22.0

        facial_hair_instruction = (
            "- facial_hair: Score beard/stubble grooming, coverage, and how it complements or detracts from structure. "
            "No facial hair → score 5.0 and note they could consider growing it. "
            "Well-groomed full beard that enhances structure → 7.0-8.5. "
            "Patchy or unkempt stubble that detracts → 3.5-5.0."
            if is_male else
            "- facial_hair: DO NOT score this parameter for female users. Omit entirely."
        )

        prompt = f"""Analyse this person's face and provide an honest, calibrated scored assessment.

User profile:
- Age: {quiz_data.get('age', 'unknown')}
- Gender: {'Male' if is_male else 'Female'}
- Ethnicity (user-confirmed, do not override): {quiz_data.get('ethnicity', 'unknown')}
- City: {quiz_data.get('city', 'unknown')}
- Height: {height}cm, Weight: {weight}kg, BMI: {bmi}
- Goal: {quiz_data.get('primary_goal', 'General glow-up')}
- Skincare routine: {quiz_data.get('skincare_routine', 'None')}, Issues: {quiz_data.get('skin_issues', 'None')}
- Body type: {quiz_data.get('body_type', 'Average')}
- Style: {quiz_data.get('style_type', 'unknown')}, Budget: {quiz_data.get('monthly_budget', 'unknown')} ({quiz_data.get('currency', 'aed')})
- Fitness: {quiz_data.get('gym_fitness', 'Not training')}, Sleep: {quiz_data.get('sleep_hours', 7)}h

Score each parameter 1.0-10.0. Use the full scale. Refer to the scoring anchors in your system prompt.
If a feature is genuinely exceptional, score it 8.5-9.5. Do not compress high scores out of caution.
Calibrate for the user's ethnicity — score relative to their ethnic peer group, not global Western standards.

Parameters to score:
- eyes: Shape, spacing, canthal tilt, periorbital area, symmetry
- eyebrows: Density, arch definition, symmetry, grooming
- hair: Density, hairline integrity, styling, condition
- skin_quality: Texture, tone evenness, oiliness, clarity, pores, breakouts
- jawline: Angular definition, lower third structure, facial fat distribution
  → Sharp angular jaw with zero fat = 8.5-9.5
  → Good definition with minor softness = 7.0-8.0
  → Moderate fat reducing angularity = 5.5-6.5
  → Significant fat obscuring structure = 4.0-5.5
{facial_hair_instruction}

Be specific in observations — describe exactly what you see in the photos that justifies each score."""

        content.append({"type": "text", "text": prompt})

        score_properties = {
            "eyes":         {"type": "number"},
            "eyebrows":     {"type": "number"},
            "hair":         {"type": "number"},
            "skin_quality": {"type": "number"},
            "jawline":      {"type": "number"},
        }
        obs_properties = {
            "eyes":         {"type": "string"},
            "eyebrows":     {"type": "string"},
            "hair":         {"type": "string"},
            "skin_quality": {"type": "string"},
            "jawline":      {"type": "string"},
        }
        required_scores = ["eyes", "eyebrows", "hair", "skin_quality", "jawline"]

        if is_male:
            score_properties["facial_hair"] = {"type": "number"}
            obs_properties["facial_hair"]   = {"type": "string"}
            required_scores.append("facial_hair")

        try:
            response = self.client.messages.create(
                model=self.MODEL_NAME,
                max_tokens=4000,
                system=self.OZEN_SYSTEM_PROMPT,
                tools=[
                    {
                        "name": "face_score_analysis",
                        "description": "Scored facial analysis with actionable recommendations",
                        "input_schema": {
                            "type": "object",
                            "properties": {
                                "image_check": {
                                    "type": "string",
                                    "description": "pass if images show a clear human face, otherwise the rejection reason"
                                },
                                "image_conditions": {
                                    "type": "object",
                                    "properties": {
                                        "lighting":             {"type": "string"},
                                        "angle":                {"type": "string"},
                                        "compensation_applied": {"type": "string"}
                                    }
                                },
                                "detected_ethnicity": {
                                    "type": "string",
                                    "description": "Echo back the user-provided ethnicity exactly. Do NOT visually override."
                                },
                                "face_shape": {"type": "string"},
                                "scores": {
                                    "type": "object",
                                    "description": "Score each parameter 1.0-10.0 using the full scale. Exceptional features must score 8.5+. Do not compress.",
                                    "properties": score_properties,
                                    "required": required_scores
                                },
                                "observations": {
                                    "type": "object",
                                    "description": "1-2 sentence observation per parameter explaining exactly what is visible in the photos that justifies the score.",
                                    "properties": obs_properties,
                                    "required": required_scores
                                },
                                "overall_score": {
                                    "type": "number",
                                    "description": "Weighted overall 1.0-10.0. Weights: jawline 1.3x, eyes 1.2x, skin_quality 1.1x, eyebrows 1.0x, hair 1.0x, facial_hair 0.9x (men). A face with multiple 8.5+ parameters must score 8.0+ overall."
                                },
                                "potential_score": {
                                    "type": "number",
                                    "description": "Realistic 6-12 month ceiling following all recommendations. Max +1.5 above current overall."
                                },
                                "strengths": {
                                    "type": "array",
                                    "items": {"type": "string"},
                                    "description": "2-3 strongest features framed positively and specifically"
                                },
                                "primary_focus_areas": {
                                    "type": "array",
                                    "description": "2-3 highest-leverage improvement areas. Only include if score is below 7.5 for that parameter.",
                                    "items": {
                                        "type": "object",
                                        "properties": {
                                            "area":           {"type": "string"},
                                            "current_score":  {"type": "number"},
                                            "zone":           {"type": "string", "description": "red (below 5.5) / yellow (5.5-7.0) / green (7.0+)"},
                                            "why_it_matters": {
                                                "type": "string",
                                                "description": "1-2 sentences. Encouraging and constructive. No clinical terms. Frame as opportunity."
                                            },
                                            "action_steps": {
                                                "type": "array",
                                                "items": {
                                                    "type": "object",
                                                    "properties": {
                                                        "step": {
                                                            "type": "string",
                                                            "description": "Concrete actionable habit. No specific numeric dietary targets."
                                                        },
                                                        "products_or_options": {
                                                            "type": "object",
                                                            "description": "Three price tiers for user's market. Category and price range only — no brand names.",
                                                            "properties": {
                                                                "budget":  {"type": "string"},
                                                                "mid":     {"type": "string"},
                                                                "premium": {"type": "string"}
                                                            },
                                                            "required": ["budget", "mid", "premium"]
                                                        },
                                                        "timeframe": {"type": "string"}
                                                    }
                                                }
                                            }
                                        }
                                    }
                                },
                                "30_day_protocol": {
                                    "type": "array",
                                    "items": {"type": "string"},
                                    "description": "5-7 concrete daily habits to start tomorrow."
                                },
                                "disclaimer": {"type": "string"}
                            },
                            "required": ["image_check", "scores", "observations", "overall_score", "disclaimer"]
                        }
                    }
                ],
                tool_choice={"type": "tool", "name": "face_score_analysis"},
                messages=[{"role": "user", "content": content}]
            )

            result = response.content[0].input
            result["gender"] = gender
            return result

        except anthropic.AuthenticationError as e:
            return {"error": True, "message": "Authentication failed", "detail": str(e)}
        except anthropic.RateLimitError as e:
            return {"error": True, "message": "Rate limited — try again shortly", "detail": str(e)}
        except anthropic.BadRequestError as e:
            return {"error": True, "message": "Bad request — check image format", "detail": str(e)}
        except anthropic.APIConnectionError as e:
            return {"error": True, "message": "Could not connect to Claude", "detail": str(e)}
        except anthropic.APIError as e:
            print(str(e))
            return {"error": True, "message": "Claude service error", "detail": str(e)}