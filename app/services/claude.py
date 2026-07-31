import os
import io
import re
import base64

from dotenv import load_dotenv
from PIL import Image
import anthropic

from app.services.prompts import OZEN_SYSTEM_PROMPT, OZEN_K_BEAUTY_PROMPT
from app.services.guardrails import sanitize_output

load_dotenv()


def _strip_em_dashes(obj):
    """
    Recursively replace em/en dashes in all strings of a nested structure.
    Em dashes in OZEN output are almost always parenthetical or trailing
    clauses, where a comma is the correct replacement. Ranges (rare) are
    handled by converting a spaced dash between digits to " to ".
    """
    if isinstance(obj, str):
        s = obj
        # digit range: "6 — 8" or "6—8"  ->  "6 to 8"
        s = re.sub(r'(?<=\d)\s*[—–]\s*(?=\d)', ' to ', s)
        # spaced dash (parenthetical / trailing): " — "  ->  ", "
        s = re.sub(r'\s*[—–]\s*', ', ', s)
        # collapse any doubled commas / comma-space pileups the replace created
        s = re.sub(r',\s*,', ',', s)
        s = re.sub(r'\s{2,}', ' ', s)
        return s
    if isinstance(obj, dict):
        return {k: _strip_em_dashes(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_strip_em_dashes(v) for v in obj]
    return obj


class Claude_Analyser:

    def __init__(self):
        self.client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        self.model  = "claude-sonnet-4-6"

    def compress_image(self, image_bytes: bytes, max_size: int = 4 * 1024 * 1024) -> bytes:
        img = Image.open(io.BytesIO(image_bytes))
        img = img.convert("RGB")
        img.thumbnail((1024, 1024))

        buffer = io.BytesIO()
        img.save(buffer, format="JPEG", quality=85)

        if buffer.tell() > max_size:
            buffer = io.BytesIO()
            img.save(buffer, format="JPEG", quality=60)

        return buffer.getvalue()

    def construct_quiz_parameters(self, quiz_data: dict) -> dict:
        gender  = quiz_data.get("gender", "m").lower()
        is_male = gender == "m"
        bmi     = quiz_data.get("bmi", 22.0)  # calculated by input_form.py

        return {
            "gender":  gender,
            "is_male": is_male,
            "bmi":     bmi,
        }

    def _select_system_prompt(self, quiz_data: dict) -> str:
        """Pick the system prompt based on the user's product preference.
        k_beauty -> Korean-brands-only prompt; everything else -> default."""
        preference = str(quiz_data.get("product_preference", "western")).lower()
        return OZEN_K_BEAUTY_PROMPT if preference == "k_beauty" else OZEN_SYSTEM_PROMPT

    def build_prompt(self, quiz_data: dict, is_male: bool, bmi: float) -> str:

        # Facial hair: men only for now. Everyone else omits it.
        facial_hair_instruction = (
            "- facial_hair: Score beard/stubble grooming, coverage, and how it complements or detracts from structure. "
            "No facial hair → score 5.0 and note they could consider growing it. "
            "Well-groomed full beard that enhances structure → 7.0-8.5. "
            "Patchy or unkempt stubble that detracts → 3.5-5.0."
            if is_male else
            "- facial_hair: Do NOT score this parameter for this user. Omit entirely."
        )

        # lashes_observation is female-only — instruction differs by gender
        lashes_instruction = (
            ""
            if is_male else
            "\nFor female users only: if lashes are clearly visible in any image and there is something genuinely worth noting about density or appearance, include a brief lashes_observation. Do not recommend specific products. Omit the field entirely if lashes are not clearly visible or if nothing notable."
        )

        return f"""Analyse this person's face and provide an honest, calibrated scored assessment.

        User profile:
        - Age: {quiz_data.get('age', 'unknown')}
        - Gender: {'Male' if is_male else 'Female'}
        - Ethnicity (user-confirmed, do not override): {quiz_data.get('ethnicity', 'unknown')}
        - City: {quiz_data.get('city', 'unknown')}
        - Height: {quiz_data.get('height', 170)}cm, Weight: {quiz_data.get('weight', 70)}kg, BMI: {bmi}
        - Skin type: {quiz_data.get('skin_type', 'unknown')}
        - Skincare routine: {quiz_data.get('skincare_routine', 'None')}
        - Products already using: {quiz_data.get('skin_products', 'None')}
        - SPF habit: {quiz_data.get('spf_habit', 'unknown')}, Level: {quiz_data.get('spf_level', 'N/A')}
        - Water intake: {quiz_data.get('water_intake', 'unknown')}
        - Hair type: {quiz_data.get('hair_type', 'unknown')}, Texture: {quiz_data.get('hair_texture', 'unknown')}
        - Scalp condition: {quiz_data.get('scalp_type', 'unknown')}
        - Hair concerns: {quiz_data.get('hair_concerns', 'None specified')}
        - Hair history: {quiz_data.get('hair_history', 'unknown')}
        - Allergies / sensitivities: {quiz_data.get('allergies', 'None specified')}
        - Current medications / active treatments: {quiz_data.get('medications', 'None specified')}
        - Pregnancy status: {quiz_data.get('pregnancy', 'Not specified')}
        - Breastfeeding status: {quiz_data.get('breastfeeding', 'Not specified')}
        - Budget: {quiz_data.get('monthly_budget', 'unknown')} ({quiz_data.get('currency', 'aed')})
        - Fitness: {quiz_data.get('gym_fitness', 'Not training')}, Sleep: {quiz_data.get('sleep_hours', 7)}h
        - Skin concerns (user-selected): {quiz_data.get('skin_concerns', 'None specified')}
        - Focus areas (user-selected): {quiz_data.get('focus_areas', 'Not specified')}

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

        Be specific in observations — describe exactly what you see in the photos that justifies each score.

        TEETH — conditional, only if there is an issue:
        Include teeth_observation ONLY if the user is smiling with teeth clearly visible AND there is a genuine, actionable issue — visible misalignment, notable gaps, or heavy staining. One sentence. Do not comment on natural tooth colour variation and do not recommend whitening unless teeth are visibly and heavily stained. If teeth are healthy, typical, or not clearly visible, OMIT the field entirely.

        LIPS — always include:
        Always include lips_observation. If the lips are healthy, say so briefly and positively (e.g. "Lips appear healthy and well-hydrated"). If there is visible dryness, chapping, or flaking, note that instead and it can be addressed with a simple lip balm. One sentence. NEVER comment on lip shape, size, fullness, or colour. Never recommend cosmetic procedures or fillers.{lashes_instruction}

        HYDRATION — gradual ramp, never the end target:
        For any action_step about water or hydration, do NOT tell the user to jump straight to the ideal daily amount. Start from their CURRENT intake (shown above as "Water intake") and increase it gradually in small steps over time. For example, if they currently drink about 4 glasses a day and the target is 8, the step should read like "Increase from 4 to 6 glasses daily for the next few days, then add one more glass every few days until you reach 8." Phrase it as a progression with a realistic timeframe, not a single end number. If their current intake is unknown, assume a modest starting point and ramp from there. This gradual-increase rule applies ONLY to water/hydration — all other habits are stated normally.

        Do NOT use em dashes or en dashes (— or –) anywhere in your output. Use commas, periods, or the word "to" for ranges instead. Write "6 to 8 glasses", not "6-8 glasses" with a dash. Keep sentences clean and simple."""

    def build_tool(self) -> dict:
        return {
            "name": "face_score_analysis",
            "description": "Scored facial analysis with actionable recommendations",
            "input_schema": {
                "type": "object",
                "properties": {
                    "image_check": {
                        "type": "string",
                        "description": "pass if images are valid, otherwise the rejection reason"
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
                        "description": "Score each parameter 1.0-10.0. Exceptional features must score 8.5+.",
                        "properties": {
                            "eyes":         {"type": "number"},
                            "eyebrows":     {"type": "number"},
                            "hair":         {"type": "number"},
                            "skin_quality": {"type": "number"},
                            "jawline":      {"type": "number"},
                            "facial_hair":  {"type": "number"}
                        },
                        "required": ["eyes", "eyebrows", "hair", "skin_quality", "jawline"]
                    },
                    "observations": {
                        "type": "object",
                        "description": "1-2 sentence observation per parameter justifying the score.",
                        "properties": {
                            "eyes":         {"type": "string"},
                            "eyebrows":     {"type": "string"},
                            "hair":         {"type": "string"},
                            "skin_quality": {"type": "string"},
                            "jawline":      {"type": "string"},
                            "facial_hair":  {"type": "string"}
                        },
                        "required": ["eyes", "eyebrows", "hair", "skin_quality", "jawline"]
                    },
                    "overall_score": {
                        "type": "number",
                        "description": "Weighted overall 1.0-10.0. Weights: jawline 1.3x, eyes 1.2x, skin_quality 1.1x, eyebrows 1.0x, hair 1.0x, facial_hair 0.9x (men)."
                    },
                    "potential_score": {
                        "type": "number",
                        "description": "Realistic 6-12 month ceiling. Max +1.5 above current overall."
                    },
                    "strengths": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "2-3 strongest features, framed positively and specifically."
                    },
                    "primary_focus_areas": {
                        "type": "array",
                        "description": "2-3 highest-leverage improvement areas. Only include if score is below 7.5.",
                        "items": {
                            "type": "object",
                            "properties": {
                                "area":          {"type": "string"},
                                "current_score": {"type": "number"},
                                "zone": {
                                    "type": "string",
                                    "description": "red (below 5.5) / yellow (5.5-7.0) / green (7.0+)"
                                },
                                "why_it_matters": {
                                    "type": "string",
                                    "description": "1-2 sentences. Encouraging, constructive, no clinical terms."
                                },
                                "action_steps": {
                                    "type": "array",
                                    "items": {
                                        "type": "object",
                                        "properties": {
                                            "step": {
                                                "type": "string",
                                                "description": "Concrete actionable habit."
                                            },
                                            "product_recommendation": {
                                                "type": "object",
                                                "description": "Single product matched to user's budget. Name a specific real brand with price in AED or INR.",
                                                "properties": {
                                                    "name":  {"type": "string"},
                                                    "price": {"type": "string"},
                                                    "where": {"type": "string"}
                                                },
                                                "required": ["name", "price", "where"]
                                            },
                                            "timeframe": {"type": "string"}
                                        }
                                    }
                                }
                            }
                        }
                    },
                    "teeth_observation": {
                        "type": "string",
                        "description": "OPTIONAL — include ONLY if teeth are clearly visible AND there is a genuine actionable issue (visible misalignment, notable gaps, or heavy staining). One sentence maximum. Do NOT comment on natural tooth colour variation. Do NOT recommend whitening unless teeth are visibly and heavily stained. If teeth are healthy, typical, or not visible, OMIT this field entirely."
                    },
                    "lips_observation": {
                        "type": "string",
                        "description": "ALWAYS include this field. If lips are healthy, give a brief positive note (e.g. 'Lips appear healthy and well-hydrated'). If there is visible dryness, chapping, or flaking, note that and mention a lip balm would help. One sentence maximum. NEVER comment on lip shape, size, fullness, or colour. NEVER recommend cosmetic procedures or fillers."
                    },
                    "lashes_observation": {
                        "type": "string",
                        "description": "OPTIONAL — female users only, omit entirely for male users. One sentence maximum. General observation on lash density or appearance if clearly visible and genuinely notable. Do NOT recommend specific products. If lashes look typical or are not clearly visible, OMIT this field entirely."
                    },
                    "30_day_protocol": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "5-7 concrete daily habits to start tomorrow."
                    },
                    "disclaimer": {"type": "string"}
                },
                "required": ["image_check", "scores", "observations", "overall_score", "disclaimer", "lips_observation"]
            }
        }

    def analysis(self, images: list[dict], quiz_data: dict) -> dict:
        params = self.construct_quiz_parameters(quiz_data)
        system_prompt = self._select_system_prompt(quiz_data)

        # Build message content — images first, then the text prompt
        content = []
        for img in images:
            compressed = self.compress_image(img["bytes"])
            b64 = base64.standard_b64encode(compressed).decode("utf-8")
            content.append({
                "type": "image",
                "source": {"type": "base64", "media_type": "image/jpeg", "data": b64}
            })
        content.append({
            "type": "text",
            "text": self.build_prompt(quiz_data, params["is_male"], params["bmi"])
        })

        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=4000,
                system=system_prompt,
                tools=[self.build_tool()],
                tool_choice={"type": "tool", "name": "face_score_analysis"},
                messages=[{"role": "user", "content": content}]
            )
            result = response.content[0].input
            result = _strip_em_dashes(result)
            result["gender"] = params["gender"]
            result = sanitize_output(result)
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
            return {"error": True, "message": "Claude service error", "detail": str(e)}