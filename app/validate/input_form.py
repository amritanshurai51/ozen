from pydantic import BaseModel, Field
from typing import Literal, Optional


class InputForm(BaseModel):
    """
    Validates the /scan payload.

    Design principle: accept exactly what the user selected in the quiz.
    Never reject a scan because an option doesn't fit a narrow enum, and
    never fabricate a value the user didn't provide — fields the quiz does
    not collect are optional and fall back to "Not specified" so Claude
    knows the data is absent rather than reasoning off a fake default.

    ── FIELD CONTRACT (this is the locked list the frontend sends as quiz_data) ──
    Frontend sends a JSON object with EXACTLY these keys. Types below are what
    the backend expects; the frontend map (mapAnswersToForm) is responsible for
    producing them. Required fields have no default. Optional fields may be
    omitted or null.
    """

    # ── Identity (required) ───────────────────────────────────────────────────
    age: int = Field(ge=18, le=70)                          # from DOB question (currently hardcoded 25 on FE — fix)
    gender: Literal['m', 'f','nb']                               # FE maps Male→m, Female→f
    ethnicity: str = Field(max_length=50)
    city: str = Field(max_length=50)                        # from the "climate" location question

    # ── Skin (required core + optional detail) ────────────────────────────────
    skincare_routine: str = Field(max_length=50)           # None / Basic cleanser only / 3-step / 5+ step
    skin_products: Optional[str] = Field(default=None, max_length=300)
    oil_dry: str = Field(max_length=30)                     # oily / normal / dry / combination
    sensitive_resistant: str = Field(max_length=30)        # sensitive / resistant
    # NEW — collected by the quiz (skin_concerns, focus_area) but previously dropped.
    # Send as a comma-joined string, e.g. "Pimple or acne, Fine lines".
    skin_concerns: Optional[str] = Field(default=None, max_length=200)
    focus_areas: Optional[str] = Field(default=None, max_length=100)

    # ── Fields the current quiz does NOT collect — optional, honest fallback ──
    water_intake: Optional[str] = Field(default=None, max_length=50)
    spf_habit: Optional[str] = Field(default=None, max_length=50)
    spf_level: Optional[str] = Field(default=None, max_length=20)
    hair_type: Optional[str] = Field(default=None, max_length=50)
    hair_texture: Optional[str] = Field(default=None, max_length=50)

    # ── Body (required) ───────────────────────────────────────────────────────
    body_type: str = Field(max_length=50)
    height: float = Field(ge=120, le=230)
    weight: float = Field(ge=30, le=200)

    # ── Budget / fitness (required) ───────────────────────────────────────────
    monthly_budget: str = Field(max_length=100)
    currency: Literal['inr', 'aed']
    gym_fitness: str = Field(max_length=50)

    # ── Sleep (required) ──────────────────────────────────────────────────────
    sleep_bed: str = Field(max_length=5)                   # "HH:MM"
    sleep_wake: str = Field(max_length=5)                  # "HH:MM"
    sleep_hours: float = Field(ge=0, le=24)                # computed on FE from bed/wake

    # ── Health / safety context (all optional, but SAFETY-critical when present) ─
    allergies: Optional[str] = Field(default=None, max_length=300)
    medications: Optional[str] = Field(default=None, max_length=300)
    pregnancy: Optional[str] = Field(default=None, max_length=30)         # "Yes" / "No" / None
    breastfeeding: Optional[str] = Field(default=None, max_length=30)     # "Yes" / "No" / None
    product_preference: str = Field(default="western")                   # "western" / "k_beauty"

    def calculate_bmi(self) -> float:
        height_m = self.height / 100
        return round(self.weight / (height_m ** 2), 1)

    @staticmethod
    def _sanitize(text: Optional[str]) -> str:
        """Strip control chars from free-text before it reaches Claude.
        Length is already capped by the Field(max_length=...) validators."""
        if not text:
            return "None specified"
        cleaned = "".join(ch for ch in text if ch == " " or ch.isprintable())
        cleaned = cleaned.strip()
        return cleaned or "None specified"

    def _skin_type(self) -> str:
        """Build a readable skin type from what the user actually selected.
        oil_dry may be oily/normal/dry/combination; sensitive_resistant is
        sensitive/resistant. e.g. 'Combination-Sensitive'."""
        oil = (self.oil_dry or "").strip().capitalize() or "Unspecified"
        sens = (self.sensitive_resistant or "").strip().capitalize() or "Unspecified"
        return f"{oil}-{sens}"

    def to_claude_dict(self) -> dict:
        return {
            "age": self.age,
            "gender": self.gender,
            "ethnicity": self.ethnicity,
            "city": self.city,

            "height": self.height,
            "weight": self.weight,
            "bmi": self.calculate_bmi(),
            "body_type": self.body_type,

            "skincare_routine": self.skincare_routine,
            "skin_products": self.skin_products or "Not specified",
            "skin_type": self._skin_type(),
            "skin_concerns": self.skin_concerns or "None specified",
            "focus_areas": self.focus_areas or "Not specified",

            "water_intake": self.water_intake or "Not specified",
            "spf_habit": self.spf_habit or "Not specified",
            "spf_level": self.spf_level or "Not specified",

            "hair_type": self.hair_type or "Not specified",
            "hair_texture": self.hair_texture or "Not specified",

            "monthly_budget": self.monthly_budget,
            "currency": self.currency,
            "gym_fitness": self.gym_fitness,

            "sleep_hours": self.sleep_hours,

            # Health / safety context — sanitized free text
            "allergies": self._sanitize(self.allergies),
            "medications": self._sanitize(self.medications),
            "pregnancy": self.pregnancy or "Not specified",
            "breastfeeding": self.breastfeeding or "Not specified",
            "product_preference": self.product_preference,
        }
    


# ── ProfileForm ──────────────────────────────────────────────────────────────
# # Validates the /profile payload — the stable fields stored on the users table
# # and editable from the profile page. All optional so partial edits are allowed
# # (e.g. user only updates allergies). weight is included because it is the one
# # semi-stable field the QuickScan weight-confirm screen can update.
class ProfileForm(BaseModel):
    age: Optional[int] = Field(default=None, ge=18, le=50)
    gender: Optional[Literal['m', 'f']] = None
    ethnicity: Optional[str] = Field(default=None, max_length=50)
    height: Optional[float] = Field(default=None, ge=120, le=230)
    weight: Optional[float] = Field(default=None, ge=30, le=200)

