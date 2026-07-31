# app/services/guardrails.py
"""
Output guardrail for Ozen.

This is the SECOND line of defence, behind the system prompt. Claude is
instructed (in OZEN_SYSTEM_PROMPT) never to recommend prescription-only or
professional-procedure interventions — but models occasionally slip, and this
product makes skincare recommendations to paying users, so we do not rely on
the prompt alone. This module scans the assembled analysis result and removes
any sentence (or whole product recommendation) that names a blocked term,
before the result is returned to the user.

Behaviour on a match (as requested):
- In free text (observations, action steps, protocol, etc.) → the whole
  SENTENCE containing the blocked term is removed.
- In a `product_recommendation` object → the entire recommendation is dropped,
  keeping the behavioural action step. This mirrors the prompt's own rule:
  "a missing recommendation is always better than an unsafe one."
- If an action step's own text scrubs down to nothing, the whole step is dropped.

Fails SAFE for content (when in doubt, remove) but fails OPEN on its own errors
(a bug in the guardrail must never break a scan — worst case it passes text
through unchanged, and the event is logged for you to see).
"""

import re
import json

# ── Blocked terms ─────────────────────────────────────────────────────────────
# Grouped for maintenance. Matching is case-insensitive, on word boundaries.
#
# NOTE ON RETINOL: this list intentionally blocks over-the-counter "retinol" as
# well as prescription retinoids, because you asked for retinol to be caught.
# Retinol IS sold without a prescription and is a mainstream ingredient, so if
# you later decide to allow it, delete the "retinol" entry from _RETINOIDS
# below — everything else stays. Nothing else in the list is OTC.

_RETINOIDS = [
    "retinol", "retinoid", "retinoids", "retinoic acid", "retinaldehyde",
    "tretinoin", "retin-a", "isotretinoin", "accutane", "roaccutane",
    "adapalene", "differin", "tazarotene", "tazorac", "trifarotene", "aklief",
]

_STEROIDS = [
    "steroid cream", "steroid creams", "topical steroid", "cortisone cream",
    "hydrocortisone", "betamethasone", "clobetasol", "triamcinolone",
    "mometasone", "fluocinonide", "desonide", "fluticasone",
]

_RX_TOPICAL_ORAL = [
    "hydroquinone", "tri-luma", "metronidazole", "ivermectin", "soolantra",
    "clindamycin", "dapsone", "spironolactone", "doxycycline", "minocycline",
    "tetracycline", "finasteride", "dutasteride",
    "prescription strength", "prescription-strength",
    "prescription cream", "prescription medication",
]

_PROCEDURES = [
    "botox", "botulinum", "dermal filler", "dermal fillers", "fillers",
    "filler", "microneedling", "chemical peel", "tca peel", "phenol peel",
    "laser resurfacing", "fraxel", "microdermabrasion", "mesotherapy",
    "thread lift", "coolsculpting", "rhinoplasty", "cosmetic surgery",
    "injectable", "injectables", "sculptra", "kybella",
]

BLOCKED_TERMS = _RETINOIDS + _STEROIDS + _RX_TOPICAL_ORAL + _PROCEDURES

# Precompiled \b(term1|term2|...)\b. Sorted longest-first so multi-word terms
# ("dermal filler") are tried before their fragments ("filler").
_PATTERN = re.compile(
    r"\b(" + "|".join(
        re.escape(t) for t in sorted(BLOCKED_TERMS, key=len, reverse=True)
    ) + r")\b",
    re.IGNORECASE,
)

# Split into sentences only at ". " / "! " / "? " when followed by a capital
# letter. This deliberately does NOT split on decimals ("6.5 glasses") or
# lowercase abbreviations ("e.g. a gentle cleanser").
_SENTENCE_SPLIT = re.compile(r"(?<=[.!?])\s+(?=[A-Z])")


def _contains_blocked(text: str) -> bool:
    return bool(_PATTERN.search(text))


def _scrub_text(text: str) -> str:
    """Remove any sentence that names a blocked term. May return '' if every
    sentence was removed."""
    if not text or not _contains_blocked(text):
        return text
    sentences = _SENTENCE_SPLIT.split(text)
    kept = [s for s in sentences if not _contains_blocked(s)]
    return " ".join(kept).strip()


def _sanitize(node):
    """Recursively clean the result tree. Returns a cleaned copy.

    - str  → sentence-scrubbed
    - list → each item cleaned; items that collapse to empty are dropped
    - dict → each value cleaned, with two special cases:
        * a `product_recommendation` naming a blocked term is dropped whole
        * an action step whose `step` text scrubs to empty drops the whole step
          (signalled by returning {} for that step dict, which the parent list
          then removes)
    """
    if isinstance(node, str):
        return _scrub_text(node)

    if isinstance(node, list):
        cleaned = []
        for item in node:
            c = _sanitize(item)
            if c is None:
                continue
            if isinstance(c, str) and c.strip() == "":
                continue
            if isinstance(c, dict) and len(c) == 0:  # dropped action step
                continue
            cleaned.append(c)
        return cleaned

    if isinstance(node, dict):
        cleaned = {}
        for key, value in node.items():
            # A product recommendation that names a blocked term is removed
            # entirely — keep the behavioural step, drop the product.
            if key == "product_recommendation" and isinstance(value, dict):
                joined = " ".join(str(v) for v in value.values())
                if _contains_blocked(joined):
                    continue  # omit the product_recommendation key
                cleaned[key] = _sanitize(value)
                continue

            c = _sanitize(value)

            # If an action step's own instruction scrubbed to nothing, signal
            # the parent list to drop the entire step.
            if key == "step" and isinstance(c, str) and c.strip() == "":
                return {}

            cleaned[key] = c
        return cleaned

    return node  # numbers, bools, None — untouched


def sanitize_output(result: dict) -> dict:
    """Entry point. Call right before returning Claude's result to the user.

    Never raises. On any internal error it returns the original result and logs
    the failure, so a guardrail bug can't take down a scan.
    """
    if not isinstance(result, dict):
        return result

    try:
        # Log any hits before cleaning, so you can monitor how often (and which)
        # terms leak through the prompt. Shows up in your Railway logs.
        raw = json.dumps(result, ensure_ascii=False)
        hits = _PATTERN.findall(raw)
        if hits:
            unique = sorted({h.lower() for h in hits})
            print(f"[guardrail] blocked terms detected and removed: {unique}")

        return _sanitize(result)
    except Exception as e:  # fail open, but make it visible
        print(f"[guardrail] ERROR — passed result through unscrubbed: {e}")
        return result