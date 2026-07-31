import os
import stripe
from fastapi import APIRouter, Header, Request
from fastapi.responses import JSONResponse
from supabase import create_client

if os.getenv("STRIPE_SECRET_KEY"):
    stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
PAYMENT_LINK_URL = (os.getenv("PAYMENT_LINK_URL") or "").rstrip("/")
EXPECTED_PAYMENT_LINK_ID = os.getenv("EXPECTED_PAYMENT_LINK_ID")  # optional
SCANS_PER_PAYMENT = 2

supabase_client = create_client(
    os.getenv("SUPABASE_CONN_URL"), os.getenv("SUPABASE_SECRET_KEY")
)

router = APIRouter(prefix="/payments", tags=["payments"])


def get_user_id_from_token(authorization: str | None) -> str | None:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ")[1]
    try:
        response = supabase_client.auth.get_user(token)
        return response.user.id if response.user else None
    except Exception:
        return None


# Live balance lives in the dedicated scan_allowance table (keyed by auth uuid).
def get_scans_remaining(user_id: str) -> int:
    result = supabase_client.from_("scan_allowance").select("scans_remaining").eq("user_id", user_id).execute()
    return (result.data[0]["scans_remaining"] or 0) if result.data else 0


# ── GET /payments/checkout-url ────────────────────────────────────────────────
# Backend stamps the LOGGED-IN user's id into the link. Frontend: window.location = url
@router.get("/checkout-url")
async def checkout_url(authorization: str = Header(None)):
    user_id = get_user_id_from_token(authorization)
    if not user_id:
        return JSONResponse(status_code=401, content={"error": "Login required."})
    if not PAYMENT_LINK_URL:
        return JSONResponse(status_code=500, content={"error": "Payment link not configured."})
    sep = "&" if "?" in PAYMENT_LINK_URL else "?"
    return {"url": f"{PAYMENT_LINK_URL}{sep}client_reference_id={user_id}"}


# ── GET /payments/scan-status ─────────────────────────────────────────────────
@router.get("/scan-status")
async def scan_status(authorization: str = Header(None)):
    user_id = get_user_id_from_token(authorization)
    if not user_id:
        return JSONResponse(status_code=401, content={"error": "Login required."})
    return {"scans_remaining": get_scans_remaining(user_id)}


# ── POST /payments/webhook ────────────────────────────────────────────────────
# Stripe calls this directly. Grants +2 once, idempotently.
@router.post("/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(payload, sig, WEBHOOK_SECRET)
    except Exception:
        return JSONResponse(status_code=400, content={"error": "Invalid signature"})

    event = event.to_dict()  # stripe object -> plain nested dicts

    if event.get("type") == "checkout.session.completed":
        session = event["data"]["object"]
        if session.get("payment_status") == "paid":
            if EXPECTED_PAYMENT_LINK_ID and session.get("payment_link") != EXPECTED_PAYMENT_LINK_ID:
                return {"received": True}
            user_id = session.get("client_reference_id")
            if user_id:
                supabase_client.rpc(
                    "grant_scans_once",
                    {"p_session_id": session["id"], "p_user_id": user_id, "p_amount": SCANS_PER_PAYMENT},
                ).execute()

    return {"received": True}