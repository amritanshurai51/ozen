# import os
# import io
# import base64

# from dotenv import load_dotenv
# from PIL import Image
# import anthropic
# from app.services.prompts import OZEN_SYSTEM_PROMPT

# load_dotenv()

# class Claude_Analyser:

#     def __init__(self):

#         api_key = os.getenv("ANTHROPIC_API_KEY")
#         self.client = anthropic.Anthropic(api_key=api_key)
#         self.MODEL_NAME = "claude-sonnet-4-5"


#     def compress_image(self, image_bytes: bytes, max_size=4 * 1024 * 1024) -> bytes:
#         img = Image.open(io.BytesIO(image_bytes))
#         img = img.convert("RGB")
#         img.thumbnail((1024, 1024))

#         buffer = io.BytesIO()
#         img.save(buffer, format="JPEG", quality=85)

#         if buffer.tell() > max_size:
#             buffer = io.BytesIO()
#             img.save(buffer, format="JPEG", quality=60)

#         return buffer.getvalue()
    
#     def set_tool_params(self, quiz_data: dict) -> dict:
#         gender  = quiz_data.get("gender", "m").lower()
#         is_male = gender == "m"

#         score_properties = {
#             "eyes":         {"type": "number"},
#             "eyebrows":     {"type": "number"},
#             "hair":         {"type": "number"},
#             "skin_quality": {"type": "number"},
#             "jawline":      {"type": "number"},
#         }
#         obs_properties  = {k: {"type": "string"} for k in score_properties}
#         required_scores = list(score_properties.keys())

#         if is_male:
#             score_properties["facial_hair"] = {"type": "number"}
#             obs_properties["facial_hair"]   = {"type": "string"}
#             required_scores.append("facial_hair")

#         parameters = {
#             "gender":           gender,
#             "is_male":          is_male,
#             "bmi":              quiz_data.get("bmi"),
#             "score_properties": score_properties,
#             "obs_properties":   obs_properties,
#             "required_scores":  required_scores,
#         }

#         return parameters 
    
#     def build_tool(self, score_properties: dict, obs_properties: dict, required_scores: list) -> dict:
#         tool = {
#             "name": "face_score_analysis",
#             "description": "Scored facial analysis with actionable recommendations",
#             "input_schema": {
#                 "type": "object",
#                 "properties": {
#                     "image_check": {
#                         "type": "string",
#                         "description": "pass if images are valid, otherwise the rejection reason"
#                     },
#                     "image_conditions": {
#                         "type": "object",
#                         "properties": {
#                             "lighting":             {"type": "string"},
#                             "angle":                {"type": "string"},
#                             "compensation_applied": {"type": "string"}
#                         }
#                     },
#                     "detected_ethnicity": {
#                         "type": "string",
#                         "description": "Echo back the user-provided ethnicity exactly. Do NOT visually override."
#                     },
#                     "face_shape": {"type": "string"},
#                     "scores": {
#                         "type": "object",
#                         "description": "Score each parameter 1.0-10.0. Exceptional features must score 8.5+.",
#                         "properties": score_properties,
#                         "required":   required_scores
#                     },
#                     "observations": {
#                         "type": "object",
#                         "description": "1-2 sentence observation per parameter justifying the score.",
#                         "properties": obs_properties,
#                         "required":   required_scores
#                     },
#                     "overall_score": {
#                         "type": "number",
#                         "description": "Weighted overall 1.0-10.0. Weights: jawline 1.3x, eyes 1.2x, skin_quality 1.1x, eyebrows 1.0x, hair 1.0x, facial_hair 0.9x (men)."
#                     },
#                     "potential_score": {
#                         "type": "number",
#                         "description": "Realistic 6-12 month ceiling. Max +1.5 above current overall."
#                     },
#                     "strengths": {
#                         "type": "array",
#                         "items": {"type": "string"},
#                         "description": "2-3 strongest features, framed positively and specifically."
#                     },
#                     "primary_focus_areas": {
#                         "type": "array",
#                         "description": "2-3 highest-leverage improvement areas. Only include if score is below 7.5.",
#                         "items": {
#                             "type": "object",
#                             "properties": {
#                                 "area":          {"type": "string"},
#                                 "current_score": {"type": "number"},
#                                 "zone": {
#                                     "type": "string",
#                                     "description": "red (below 5.5) / yellow (5.5-7.0) / green (7.0+)"
#                                 },
#                                 "why_it_matters": {
#                                     "type": "string",
#                                     "description": "1-2 sentences. Encouraging, constructive, no clinical terms."
#                                 },
#                                 "action_steps": {
#                                     "type": "array",
#                                     "items": {
#                                         "type": "object",
#                                         "properties": {
#                                             "step": {
#                                                 "type": "string",
#                                                 "description": "Concrete actionable habit."
#                                             },
#                                             "product_recommendation": {
#                                                 "type": "object",
#                                                 "description": "Single product matched to user's budget. Name a specific real brand with price in AED or INR.",
#                                                 "properties": {
#                                                     "name":  {"type": "string"},
#                                                     "price": {"type": "string"},
#                                                     "where": {"type": "string"}
#                                                 },
#                                                 "required": ["name", "price", "where"]
#                                             },
#                                             "timeframe": {"type": "string"}
#                                         }
#                                     }
#                                 }
#                             }
#                         }
#                     },
#                     "30_day_protocol": {
#                         "type": "array",
#                         "items": {"type": "string"},
#                         "description": "5-7 concrete daily habits to start tomorrow."
#                     },
#                     "disclaimer": {"type": "string"}
#                 },
#                 "required": ["image_check", "scores", "observations", "overall_score", "disclaimer"]
#             }
#         }

#         return tool
    

#     def analysis(self, images: list[dict], quiz_data: dict) -> dict:

#         params = self.set_tool_params(quiz_data)

#         # Make List of Images [compressed/resized] as content to be passed 
#         content = []
#         for img in images:
#             compressed = self.compress_image(img["bytes"])
#             b64 = base64.standard_b64encode(compressed).decode("utf-8")
#             content.append({
#                 "type": "image",
#                 "source": {"type": "base64", "media_type": "image/jpeg", "data": b64}
#             })
#         content.append({
#             "type": "text",
#             "text": self.build_prompt(quiz_data, params["is_male"], params["bmi"])
#         })

#         tool = self.build_tool(params["score_properties"],params["obs_properties"],params["required_scores"])

#         try:
#             response = self.client.messages.create(
#                 model=self.MODEL_NAME,
#                 max_tokens=4000,
#                 system=OZEN_SYSTEM_PROMPT,
#                 tools=[tool],
#                 tool_choice={"type": "tool", "name": "face_score_analysis"},
#                 messages=[{"role": "user", "content": content}]
#             )
#             result = response.content[0].input
#             result["gender"] = params["gender"]
#             return result

#         except anthropic.AuthenticationError as e:
#             return {"error": True, "message": "Authentication failed", "detail": str(e)}
#         except anthropic.RateLimitError as e:
#             return {"error": True, "message": "Rate limited — try again shortly", "detail": str(e)}
#         except anthropic.BadRequestError as e:
#             return {"error": True, "message": "Bad request — check image format", "detail": str(e)}
#         except anthropic.APIConnectionError as e:
#             return {"error": True, "message": "Could not connect to Claude", "detail": str(e)}
#         except anthropic.APIError as e:
#             return {"error": True, "message": "Claude service error", "detail": str(e)}


import os
import io
import base64

from dotenv import load_dotenv
from PIL import Image
import anthropic
from app.services.prompts import OZEN_SYSTEM_PROMPT

load_dotenv()


class Claude_Analyser:

    def __init__(self):
        self.client     = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        self.model      = "claude-sonnet-4-6"

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

    def build_prompt(self, quiz_data: dict, is_male: bool, bmi: float) -> str:
        facial_hair_instruction = (
            "- facial_hair: Score beard/stubble grooming, coverage, and how it complements or detracts from structure. "
            "No facial hair → score 5.0 and note they could consider growing it. "
            "Well-groomed full beard that enhances structure → 7.0-8.5. "
            "Patchy or unkempt stubble that detracts → 3.5-5.0."
            if is_male else
            "- facial_hair: DO NOT score this parameter for female users. Omit entirely."
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
- Budget: {quiz_data.get('monthly_budget', 'unknown')} ({quiz_data.get('currency', 'aed')})
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

    def analysis(self, images: list[dict], quiz_data: dict) -> dict:
        params = self.construct_quiz_parameters(quiz_data)

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
                system=OZEN_SYSTEM_PROMPT,
                tools=[self.build_tool()],
                tool_choice={"type": "tool", "name": "face_score_analysis"},
                messages=[{"role": "user", "content": content}]
            )
            result = response.content[0].input
            result["gender"] = params["gender"]
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