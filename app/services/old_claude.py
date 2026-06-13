# from anthropic import Anthropic
# import anthropic
# import os
# from dotenv import load_dotenv
# import base64
# from PIL import Image
# import io,os

# load_dotenv()

# class Claude_Analyser: 

#     def __init__(self):
#     #     self.system_prompt = """You are a wellness suggestion assistant. Based on the user's photo and profile,
#     # provide general lifestyle suggestions about skin health, sleep, hydration, diet, and exercise.
#     # Be warm and encouraging. Keep each observation and suggestion to 1-2 sentences maximum. Use plain text, no markdown. Never diagnose. Never recommend medications or specific products.
#     # End with a disclaimer that these are general suggestions only, not medical advice."""

#         self.system_prompt = """You are a wellness suggestion assistant. Based on the user's photos and profile, provide general lifestyle suggestions about skin health, sleep, hydration, diet, and exercise.

#                                 FIRST, check the uploaded images:
#                                 - If any image does not contain a human face or body, set image_check to "no face detected" and leave all other fields empty.
#                                 - If any image contains multiple people, set image_check to "multiple faces detected" and leave all other fields empty.
#                                 - If any face is too blurry, distorted, or obscured, set image_check to "image not clear, please retake" and leave all other fields empty.
#                                 - If all images are valid, set image_check to "pass" and proceed with the analysis.

#                                 Be warm and encouraging. Keep each observation and suggestion to 1-2 sentences maximum. Use plain text, no markdown. Never diagnose. Never recommend medications or specific products.
#                                 End with a disclaimer that these are general suggestions only, not medical advice."""
        
#         api_key=os.getenv("ANTHROPIC_API_KEY")

#         self.client = Anthropic(api_key=api_key)

#         self.MODEL_NAME = "claude-sonnet-4-5"

#         self.OZEN_SYSTEM_PROMPT = """You are OZEN, an advanced facial aesthetics analysis engine specializing in facial assessment for men across South Asian and Middle Eastern ethnicities. This includes Indian, Pakistani, Bangladeshi, Sri Lankan, Arab, Persian, Turkish, and mixed-ethnicity faces common in the UAE and Gulf region.

#         Core Principles:
#         - CONSISTENCY ABOVE ALL. Same face under different conditions must score within +/- 0.3 points.
#         - HONESTY OVER KINDNESS. A 4.2 is a 4.2. Never inflate scores.
#         - CALIBRATE FOR ETHNICITY. Score relative to the user's own ethnic norms, never Western standards.
#         - ACTIONABLE OUTPUT. Every score must pair with a specific, costed recommendation in both INR and AED.
#         - LEGAL SAFETY. Never diagnose medical conditions. Never recommend surgery or prescription medication. Never recommend specific over-the-counter medications by name, including minoxidil, retinol above 0.05%, or hydroquinone. Mention only generic categories like 'oil-control cleanser' or 'SPF moisturiser'.
    
#         Scoring: Score each parameter 1.0-10.0. Most users should land 5.0-6.8. A 7.5+ is genuinely rare.
#         Forced distribution: 1-3.9 bottom 10%, 4-5.4 next 25%, 5.5-6.4 middle 35%, 6.5-7.4 next 20%, 7.5+ top 10%.

#         Output ONLY the tool call with valid data. No text outside the tool."""

    


#     def analyse_face(self,image_bytes: bytes, age: int, bmi: float, ethnicity: str, concerns: str = "") -> str:
#         image_data = base64.standard_b64encode(image_bytes).decode("utf-8")

#         main_prompt = f"Age: {age}, BMI: {bmi}, Ethnicity: {ethnicity}. Concerns: {concerns}. Based on my photo and profile, what lifestyle suggestions do you have?"

#         try: 
#             response = self.client.messages.create(
#                 model="claude-opus-4-6",
#                 max_tokens=2000,
#                 system=self.system_prompt,
#                 tools=[
#                     {
#                         "name": "wellness_analysis",
#                         "description": "Structured wellness analysis based on facial observation",
#                         "input_schema": {
#                             "type": "object",
#                             "properties": {
#                                 "skin": {
#                                     "type": "object",
#                                     "properties": {
#                                         "observation": {"type": "string"},
#                                         "suggestion": {"type": "string"}
#                                     },
#                                     "required": ["observation", "suggestion"]
#                                 },
#                                 "eyes": {
#                                     "type": "object",
#                                     "properties": {
#                                         "observation": {"type": "string"},
#                                         "suggestion": {"type": "string"}
#                                     },
#                                     "required": ["observation", "suggestion"]
#                                 },
#                                 "hydration": {
#                                     "type": "object",
#                                     "properties": {
#                                         "observation": {"type": "string"},
#                                         "suggestion": {"type": "string"}
#                                     },
#                                     "required": ["observation", "suggestion"]
#                                 },
#                                 "overall": {
#                                     "type": "object",
                                    
#                                     "properties": {
#                                         "observation": {"type": "string"},
#                                         "suggestion": {"type": "string","maxLength": 200}
#                                     },
#                                     "required": ["observation", "suggestion"]
#                                 },
#                                 "disclaimer": {"type": "string"},
#                                 "image_check": {
#                                 "type": "string",
#                                 "description": "pass if images are valid, otherwise the rejection reason"
#                             }
#                             },
#                             "required": ["image_check", "disclaimer"]
#                         }
#                     }
#                 ],
#                 tool_choice={"type": "tool", "name": "wellness_analysis"},
#                 messages=[
#                     {
#                         "role": "user",
#                         "content": [
#                             {
#                                 "type": "image",
#                                 "source": {
#                                     "type": "base64",
#                                     "media_type": "image/jpeg",
#                                     "data": image_data
#                                 }
#                             },
#                             {
#                                 "type": "text",
#                                 "text": main_prompt
#                             }
#                         ]
#                     }
#                 ]
#             )

#             return response.content[0].input
        
#         except anthropic.AuthenticationError as e:
#             # 401 — bad or missing API key
    
#             return {'error':'True','message':'Auth Failed ' + str(e)}

#         except anthropic.RateLimitError as e:
#             # 429 — too many requests
#             # print(f"Rate limited: str(e)")

#             return {'error':'True','message':'Rate Limited ', "Full error": str(e)}

#         except anthropic.BadRequestError as e:
#             # 400 — malformed request (bad image, too many tokens, etc.)
#             # print(f"Bad request: str(e)")
#             return {'error':'True','message':'Bad Request ',"Full error": str(e)}

#         except anthropic.APIConnectionError as e:
#             # network-level — no internet, DNS fail, timeout
#             # print(f"Connection failed: str(e)")
#             return {'error':'True','message':'Connection Failed ', "Full error": str(e)}

#         except anthropic.APIStatusError as e:
#             # base class for all HTTP error responses (catch-all for 4xx/5xx)
#             # print(f"API error {e.status_code}: {e.message}")
            
#             return {'error':'True','message':'API Error ', "Full error": str(e)}

#         except anthropic.APIError as e:
#             # base class for everything above — the ultimate catch-all
#             # print(f"Something else: str(e)")

#             return {'error':'True','message':'Claude Service Error ', "Full error": str(e)}


    
#     def api_call(self, images: list[bytes], quiz_data: dict) -> dict:
#         # Build image blocks
#         # content = []
#         # for img_bytes in images:
#         #     b64 = base64.standard_b64encode(img_bytes).decode("utf-8")
#         #     content.append({
#         #         "type": "image",
#         #         "source": {
#         #             "type": "base64",
#         #             "media_type": "image/jpeg",
#         #             "data": b64
#         #         }
#         #     })

#         content = []
#         for img in images:
#             compressed = self.compress_image(img["bytes"])
#             b64 = base64.standard_b64encode(compressed).decode("utf-8")           
#             content.append({
#                 "type": "image",
#                 "source": {
#                     "type": "base64",
#                     "media_type": img["type"],
#                     "data": b64
#                 }
#             })

#         # Build prompt from quiz data
#         prompt = f"""Age: {quiz_data['age']}, Gender: {quiz_data['gender']}, BMI: {quiz_data['bmi']}
#                         Ethnicity: {quiz_data['ethnicity']}, City: {quiz_data['city']}
#                         Goal: {quiz_data['primary_goal']}
#                         Skincare routine: {quiz_data['skincare_routine']}, Issues: {quiz_data['skin_issues']}
#                         Body type: {quiz_data['body_type']}, Height: {quiz_data['height']}cm, Weight: {quiz_data['weight']}kg
#                         Style: {quiz_data['style_type']}, Budget: {quiz_data['monthly_budget']} ({quiz_data['currency']})
#                         Fitness: {quiz_data['gym_fitness']}, Sleep: {quiz_data['sleep_hours']}h

#                         Based on my photos and profile, what lifestyle suggestions do you have?"""

#         content.append({"type": "text", "text": prompt})

#         try:
#             response = self.client.messages.create(
#                 model=self.MODEL_NAME,
#                 cache_control={"type": "ephemeral"},
#                 max_tokens=2000,
#                 system=self.system_prompt,
#                 tools=[
#                     {
#                         "name": "wellness_analysis",
#                         "description": "Structured wellness analysis based on facial observation",
#                         "input_schema": {
#                             "type": "object",
#                             "properties": {
#                                 "skin": {
#                                     "type": "object",
#                                     "properties": {
#                                         "observation": {"type": "string"},
#                                         "suggestion": {"type": "string"}
#                                     },
#                                     "required": ["observation", "suggestion"]
#                                 },
#                                 "eyes": {
#                                     "type": "object",
#                                     "properties": {
#                                         "observation": {"type": "string"},
#                                         "suggestion": {"type": "string"}
#                                     },
#                                     "required": ["observation", "suggestion"]
#                                 },
#                                 "hydration": {
#                                     "type": "object",
#                                     "properties": {
#                                         "observation": {"type": "string"},
#                                         "suggestion": {"type": "string"}
#                                     },
#                                     "required": ["observation", "suggestion"]
#                                 },
#                                 "overall": {
#                                     "type": "object",
#                                     "properties": {
#                                         "observation": {"type": "string"},
#                                         "suggestion": {"type": "string"}
#                                     },
#                                     "required": ["observation", "suggestion"]
#                                 },
#                                 "disclaimer": {"type": "string"},
#                                 "image_check": {
#                                 "type": "string",
#                                 "description": "pass if images are valid and contain only one human face, otherwise the rejection reason"
#                             }
#                             },
#                             "required": ["image_check","skin", "eyes", "hydration", "overall", "disclaimer"]
#                         }
#                     }
#                 ],
#                 tool_choice={"type": "tool", "name": "wellness_analysis"},
#                 messages=[
#                     {
#                         "role": "user",
#                         "content": content
#                     }
#                 ]
#             )

#             return response.content[0].input

#         except anthropic.AuthenticationError as e:
#             print("\n Error",str(e))
#             return {"error": True, "message": "Authentication failed", "detail": str(e)}

#         except anthropic.RateLimitError as e:
#             print("\n Error",str(e))
#             return {"error": True, "message": "Rate limited — try again shortly", "detail": str(e)}

#         except anthropic.BadRequestError as e:
#             print("\n Error",str(e))
#             print(f"CLAUDE ERROR: {e}") 
#             return {"error": True, "message": "Bad request — check image format", "detail": str(e)}

#         except anthropic.APIConnectionError as e:
#             print("\n Error",str(e))
#             return {"error": True, "message": "Could not connect to Claude", "detail": str(e)}

#         except anthropic.APIError as e:
#             print("\n Error",str(e))
#             return {"error": True, "message": "Claude service error", "detail": str(e)}
        
    
#     def compress_image(self, image_bytes: bytes, max_size=4 * 1024 * 1024) -> bytes:
#         img = Image.open(io.BytesIO(image_bytes))
#         img = img.convert("RGB")
#         img.thumbnail((1024, 1024))
        
#         buffer = io.BytesIO()
#         img.save(buffer, format="JPEG", quality=85)
        
#         # If still too big, lower quality
#         if buffer.tell() > max_size:
#             buffer = io.BytesIO()
#             img.save(buffer, format="JPEG", quality=60)
        
#         return buffer.getvalue()
    
#     def score_analysis(self, images: list[dict], quiz_data: dict) -> dict:
        
       

#     # rest of the function uses OZEN_SYSTEM_PROMPT instead of self.system_prompt
#         content = []
#         for img in images:
#             compressed = self.compress_image(img["bytes"])
#             b64 = base64.standard_b64encode(compressed).decode("utf-8")
#             content.append({
#                 "type": "image",
#                 "source": {
#                     "type": "base64",
#                     "media_type": "image/jpeg",
#                     "data": b64
#                 }
#             })

#         prompt = f"""Analyse this person's face and provide scored assessment.

#     Age: {quiz_data['age']}, Gender: {quiz_data['gender']}, BMI: {quiz_data['bmi']}
#     Ethnicity (user-confirmed, do not override from visual assessment): {quiz_data['ethnicity']}, City: {quiz_data['city']}
#     Goal: {quiz_data['primary_goal']}
#     Skincare routine: {quiz_data['skincare_routine']}, Issues: {quiz_data['skin_issues']}
#     Body type: {quiz_data['body_type']}, Height: {quiz_data['height']}cm, Weight: {quiz_data['weight']}kg
#     Style: {quiz_data['style_type']}, Budget: {quiz_data['monthly_budget']} ({quiz_data['currency']})
#     Fitness: {quiz_data['gym_fitness']}, Sleep: {quiz_data['sleep_hours']}h

#     Score each facial parameter 1.0-10.0 based on the photos. Be honest — do not inflate scores. Calibrate for the user's ethnicity."""

#         content.append({"type": "text", "text": prompt})

#         try:
#             response = self.client.messages.create(
#                 model=self.MODEL_NAME,
#                 max_tokens=4000,
#                 system=self.OZEN_SYSTEM_PROMPT,
#                 tools=[
#                     {
#                         "name": "face_score_analysis",
#                         "description": "Scored facial analysis with actionable recommendations",
#                         "input_schema": {
#                             "type": "object",
#                             "properties": {
#                                 "image_check": {
#                                     "type": "string",
#                                     "description": "pass if images show a clear human face, otherwise rejection reason"
#                                 },
#                                 "image_conditions": {
#                                     "type": "object",
#                                     "properties": {
#                                         "lighting": {"type": "string"},
#                                         "angle": {"type": "string"},
#                                         "distance": {"type": "string"},
#                                         "compensation_applied": {"type": "string"}
#                                     }
#                                 },
#                                 "detected_ethnicity": {
#                                                         "type": "string",
#                                                         "description": "Use the ethnicity provided in the user profile exactly as stated. Do NOT visually assess or override the user-provided ethnicity. Simply echo back the value from their profile."
#                                                     },
#                                 "face_shape": {"type": "string"},
#                                 "scores": {
#                                     "type": "object",
#                                     "properties": {
#                                         "eyes": {"type": "number"},
#                                         "eyebrows": {"type": "number"},
#                                         "hair": {"type": "number"},
#                                         "facial_hair": {"type": "number"},
#                                         "skin_quality": {"type": "number"},
#                                         "jawline": {"type": "number"},
#                                         "cheekbones_midface": {"type": "number"},
#                                         "nose": {"type": "number"},
#                                         "lips": {"type": "number"},
#                                         "overall_harmony": {"type": "number"}
#                                     },
#                                 "observations": {
#                                         "type": "object",
#                                         "description": "1-2 sentence honest observation per parameter explaining WHY it scored that way — specific to what is visible in the photos",
#                                         "properties": {
#                                             "eyes":               {"type": "string"},
#                                             "eyebrows":           {"type": "string"},
#                                             "hair":               {"type": "string"},
#                                             "facial_hair":        {"type": "string"},
#                                             "skin_quality":       {"type": "string"},
#                                             "jawline":            {"type": "string"},
#                                             "cheekbones_midface": {"type": "string"},
#                                             "nose":               {"type": "string"},
#                                             "lips":               {"type": "string"},
#                                             "overall_harmony":    {"type": "string"}
#                                         },
#                                         "required": ["eyes","eyebrows","hair","facial_hair","skin_quality",
#                                                     "jawline","cheekbones_midface","nose","lips","overall_harmony"]
#                                     },
#                                 },
#                                 "overall_score": {"type": "number"},
#                                 "potential_score": {"type": "number"},
#                                 "strengths": {
#                                     "type": "array",
#                                     "items": {"type": "string"},
#                                     "description": "2-3 strongest features, framed positively"
#                                 },
#                                 "primary_focus_areas": {
#                                     "type": "array",
#                                     "items": {
#                                         "type": "object",
#                                         "properties": {
#                                             "area": {"type": "string"},
#                                             "current_score": {"type": "number"},
#                                             "zone": {"type": "string", "description": "red / yellow / green"},
#                                             "why_it_matters": {"type": "string", "description": "1-2 sentences explaining why this area matters for appearance. Use encouraging, constructive language. Do NOT use clinical or medical terminology (e.g. 'subcutaneous fat', 'fluid retention', 'sexually dimorphic'). Do NOT make direct statements about the person's attractiveness or masculinity. Frame as opportunity and potential, not deficit."},
#                                             "action_steps": {
#                                                 "type": "array",
#                                                 "items": {
#                                                     "type": "object",
#                                                     "properties": {
#                                                         "step": {"type": "string", "description": "...Do not give specific numeric dietary targets (calories, sodium mg, macros). Describe the habit category only."},
#                                                         "products_or_options": {
#                                                                                 "type": "object",
#                                                                                 "description": "Three price tiers for the user's market only. Category and price range only — no brand names except for skincare actives. Format: 'Category description, price range'",
#                                                                                 "properties": {
#                                                                                     "budget": {
#                                                                                         "type": "string",
#                                                                                         "description": "Most accessible option. Format: 'What to get + where (pharmacy/supermarket/online), price range'. Example: 'Oil-control salicylic acid cleanser from any pharmacy, AED 25-45'"
#                                                                                     },
#                                                                                     "mid": {
#                                                                                         "type": "string",
#                                                                                         "description": "Mid-tier option with better formulation. Same format, no luxury brand names."
#                                                                                     },
#                                                                                     "premium": {
#                                                                                         "type": "string",
#                                                                                         "description": "Premium option or professional service. For services: describe the service type and venue type only, not business names."
#                                                                                     }
#                                                                                 },
#                                                                                 "required": ["budget", "mid", "premium"]
#                                                                             },
#                                                         "timeframe": {"type": "string"}
#                                                     }
#                                                 }
#                                             }
#                                         }
#                                     }
#                                 },
#                                 "30_day_protocol": {
#                                     "type": "array",
#                                     "items": {"type": "string"},
#                                     "description": "5-7 concrete habits to start tomorrow"
#                                 },
#                                 "disclaimer": {"type": "string"}
#                             },
#                             "required": ["image_check", "scores", "observations", "disclaimer"]
#                         }
#                     }
#                 ],
#                 tool_choice={"type": "tool", "name": "face_score_analysis"},
#                 messages=[
#                     {
#                         "role": "user",
#                         "content": content
#                     }
#                 ]
#             )

#             return response.content[0].input

#         except anthropic.AuthenticationError as e:
#             return {"error": True, "message": "Authentication failed", "detail": str(e)}

#         except anthropic.RateLimitError as e:
#             return {"error": True, "message": "Rate limited — try again shortly", "detail": str(e)}

#         except anthropic.BadRequestError as e:
#             return {"error": True, "message": "Bad request — check image format", "detail": str(e)}

#         except anthropic.APIConnectionError as e:
#             return {"error": True, "message": "Could not connect to Claude", "detail": str(e)}

#         except anthropic.APIError as e:
#             print(str(e))
#             return {"error": True, "message": "Claude service error", "detail": str(e)}
            
    
# # client = Claude_Analyser()

# # with open("app/test_data/sample.jpg","rb") as f: 
# #     image_bytes = f.read()

# # img = Image.open(io.BytesIO(image_bytes))
# # img.thumbnail((1024, 1024))
# # buffer = io.BytesIO()
# # img = img.convert("RGB")
# # img.save(buffer, format="JPEG", quality=85)
# # image_bytes = buffer.getvalue()

# # result = client.analyse_face(
# #     image_bytes=image_bytes,
# #     age=25,
# #     bmi=23,
# #     ethnicity="Unknown",
# #     concerns="facial fat"
# # )

# # print(result)



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

        self.OZEN_SYSTEM_PROMPT = """You are OZEN, an advanced facial aesthetics analysis engine specialising in facial assessment for men and women across South Asian and Middle Eastern ethnicities. This includes Indian, Pakistani, Bangladeshi, Sri Lankan, Arab, Persian, Turkish, and mixed-ethnicity faces common in the UAE and Gulf region.

Core Principles:
- CONSISTENCY ABOVE ALL. Same face under different conditions must score within +/- 0.3 points.
- HONESTY OVER KINDNESS. A 4.2 is a 4.2. Never inflate scores.
- CALIBRATE FOR ETHNICITY. Score relative to the user's own ethnic norms, never Western standards.
- ACTIONABLE OUTPUT. Every score must pair with a specific, costed recommendation in both INR and AED.
- LEGAL SAFETY. Never diagnose medical conditions. Never recommend surgery or prescription medication. Never recommend specific over-the-counter medications by name. Mention only generic categories like 'oil-control cleanser' or 'SPF moisturiser'.
- FACIAL FAT & DEFINITION. Always assess and comment on facial fat distribution and definition in the jawline and lower third — this is a high-leverage area regardless of ethnicity.

Scoring: Score each parameter 1.0-10.0. Most users should land 5.0-6.8. A 7.5+ is genuinely rare.
Forced distribution: 1-3.9 bottom 10%, 4-5.4 next 25%, 5.5-6.4 middle 35%, 6.5-7.4 next 20%, 7.5+ top 10%.

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

        # Build image content blocks
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

        # Derive gender context — used for facial_hair instruction
        gender = quiz_data.get("gender", "m").lower()
        is_male = gender == "m"

        # Calculate BMI safely from height + weight if not provided
        height = float(quiz_data.get("height", 170) or 170)
        weight = float(quiz_data.get("weight", 70) or 70)
        bmi = round(weight / ((height / 100) ** 2), 1) if height > 0 else 22.0

        # Gender-specific facial_hair instruction
        facial_hair_instruction = (
            "- facial_hair: Score the beard/stubble grooming, coverage, and how it complements or detracts from facial structure. "
            "If the person has no facial hair, score it 5.0 and note they could consider growing it to add definition."
            if is_male else
            "- facial_hair: DO NOT score this parameter for female users. Omit it entirely from scores and observations."
        )

        prompt = f"""Analyse this person's face and provide a scored assessment.

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

Score the following parameters 1.0-10.0 based strictly on what is visible in the photos.
Be honest — do not inflate scores. Calibrate for the user's ethnicity.

Parameters to score:
- eyes: Shape, spacing, canthal tilt, periorbital area
- eyebrows: Density, arch, symmetry, grooming
- hair: Density, hairline, styling, condition
- skin_quality: Texture, tone, oiliness, clarity, visible pores or acne
- jawline: Definition, angularity, lower third fat distribution and facial definition
{facial_hair_instruction}

For jawline specifically — always assess visible facial fat and lower third definition.
High facial fat reducing jaw angularity should score 4.5-5.5. Good definition 6.5+."""

        content.append({"type": "text", "text": prompt})

        # Build scores and observations schema dynamically based on gender
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
                                        "lighting":               {"type": "string"},
                                        "angle":                  {"type": "string"},
                                        "compensation_applied":   {"type": "string"}
                                    }
                                },
                                "detected_ethnicity": {
                                    "type": "string",
                                    "description": "Echo back the user-provided ethnicity exactly. Do NOT visually override."
                                },
                                "face_shape": {"type": "string"},
                                "scores": {
                                    "type": "object",
                                    "description": "Score each parameter 1.0-10.0. Honest scoring only.",
                                    "properties": score_properties,
                                    "required": required_scores
                                },
                                "observations": {
                                    "type": "object",
                                    "description": "1-2 sentence honest observation per parameter explaining WHY it scored that way — specific to what is visible in the photos. For jawline always mention facial fat distribution.",
                                    "properties": obs_properties,
                                    "required": required_scores
                                },
                                "overall_score": {
                                    "type": "number",
                                    "description": "Weighted overall score 1.0-10.0. Apply weights: jawline 1.3x, eyes 1.2x, skin_quality 1.1x, eyebrows 1.0x, hair 1.0x, facial_hair 0.9x (men only)."
                                },
                                "potential_score": {
                                    "type": "number",
                                    "description": "Realistic 6-12 month ceiling if the user follows all recommendations. Max +1.5 above current overall."
                                },
                                "strengths": {
                                    "type": "array",
                                    "items": {"type": "string"},
                                    "description": "2-3 strongest features framed positively"
                                },
                                "primary_focus_areas": {
                                    "type": "array",
                                    "description": "2-3 highest-leverage areas for improvement",
                                    "items": {
                                        "type": "object",
                                        "properties": {
                                            "area":            {"type": "string"},
                                            "current_score":   {"type": "number"},
                                            "zone":            {"type": "string", "description": "red / yellow / green"},
                                            "why_it_matters":  {
                                                "type": "string",
                                                "description": "1-2 sentences on why this area matters. Encouraging, constructive. No clinical terms, no medical language. Frame as opportunity."
                                            },
                                            "action_steps": {
                                                "type": "array",
                                                "items": {
                                                    "type": "object",
                                                    "properties": {
                                                        "step": {
                                                            "type": "string",
                                                            "description": "Concrete habit or action. No specific numeric dietary targets."
                                                        },
                                                        "products_or_options": {
                                                            "type": "object",
                                                            "description": "Three price tiers for the user's market only. Category and price range — no brand names.",
                                                            "properties": {
                                                                "budget":  {"type": "string", "description": "Most accessible option with price range"},
                                                                "mid":     {"type": "string", "description": "Mid-tier option"},
                                                                "premium": {"type": "string", "description": "Premium option or professional service"}
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
                                    "description": "5-7 concrete daily habits to start tomorrow. Specific and actionable."
                                },
                                "disclaimer": {"type": "string"}
                            },
                            "required": ["image_check", "scores", "observations", "overall_score", "disclaimer"]
                        }
                    }
                ],
                tool_choice={"type": "tool", "name": "face_score_analysis"},
                messages=[
                    {
                        "role": "user",
                        "content": content
                    }
                ]
            )

            result = response.content[0].input
            # Attach gender to result so frontend can use it for facial_hair filtering
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