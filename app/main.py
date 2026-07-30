from fastapi import FastAPI, File, Form, UploadFile, Request
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import ValidationError
import io,os

from fastapi import Header
from supabase import create_client
from fastapi.middleware.cors import CORSMiddleware

from app.validate.input_form import InputForm, ProfileForm
from app.services.claude import Claude_Analyser

from app.services.database import (
    connect_db, save_scan, get_scans_by_user,
    save_profile, get_profile,
    create_user, get_user_by_email, verify_password,
)



app = FastAPI()

RAILWAY_ORIGIN = os.getenv("ALLOWED_ORIGIN", "")
 
ALLOWED_ORIGINS = [
    "http://localhost:8000",       # local production build
    "http://localhost:5173",
    "http://localhost:5500"       # local vite dev server
]
if RAILWAY_ORIGIN:
    ALLOWED_ORIGINS.append(RAILWAY_ORIGIN)

from app.payments import router as payments_router, get_scans_remaining
app.include_router(payments_router)
 
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],          
    allow_headers=["Authorization", "Content-Type", "X-Requested-With"]
)
 
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"]         = "DENY"
    response.headers["Referrer-Policy"]          = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"]       = "camera=self"
    return response
 
connect_db()


scan_counts_by_ip = {}
MAX_SCANS_PER_IP = 2


SUPABASE_URL = os.getenv("SUPABASE_CONN_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SECRET_KEY")
supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)

MAX_SCANS_FREE = 20


def get_user_id_from_token(authorization: str | None) -> str | None:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ")[1]
    try:
        response = supabase_client.auth.get_user(token)
        return response.user.id if response.user else None
    except Exception as e:
        return None

def get_user_scan_count(user_id: str) -> int:
    result = supabase_client.from_("scans")\
        .select("id", count="exact")\
        .eq("user_id", user_id)\
        .execute()
    return result.count or 0


def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host

def validate_user(request: Request) -> bool:
    ip = get_client_ip(request)
    return scan_counts_by_ip.get(ip, 0) <= MAX_SCANS_PER_IP

def record_scan(request: Request):
    ip = get_client_ip(request)
    scan_counts_by_ip[ip] = scan_counts_by_ip.get(ip, 0) + 1


analyser = Claude_Analyser()



@app.post("/scan")
async def scan(
    request: Request,
    quiz_data: str = Form(...),
    images: list[UploadFile] = File(...),
    authorization: str = Header(None)
):
    # Get user from JWT if logged in
    user_id = get_user_id_from_token(authorization)

    # ── Gate: check balance only (do NOT consume yet) ──
    if user_id:
        if get_scans_remaining(user_id) <= 0:
            return JSONResponse(status_code=402, content={
                "error": "No scans remaining. Please purchase more."
            })
    else:
        # guests: IP-based limit
        if not validate_user(request):
            return JSONResponse(status_code=429, content={
                "error": "Scan limit reached. Create an account to track your scans."
            })

    # ── Validation (nothing consumed — these just return) ──
    try:
        form = InputForm.model_validate_json(quiz_data)
    except ValidationError as e:
        return JSONResponse(status_code=400, content={"error": e.errors()[0]["msg"]})

    image_list = []
    for img in images:
        if img.content_type not in ("image/jpeg", "image/png"):
            return JSONResponse(status_code=400, content={"error": "Only JPG and PNG images are allowed."})
        data = await img.read()
        if len(data) > 10 * 1024 * 1024:
            return JSONResponse(status_code=400, content={"error": "Each image must be under 10 MB."})
        image_list.append({"bytes": data, "type": img.content_type})

    result = analyser.analysis(images=image_list, quiz_data=form.to_claude_dict())
    del image_list

    # Claude error — return, balance untouched
    if result.get("error"):
        return JSONResponse(status_code=502, content={"error": result["message"]})

    # Image validation from Claude — return, balance untouched
    if result.get("image_check") and result["image_check"].lower() != "pass":
        return JSONResponse(status_code=400, content={"error": result["image_check"]})

    # ── Success: save, then consume one credit ──
    save_scan(quiz_data=form.to_claude_dict(), result=result, user_id=user_id)

    if user_id:
        supabase_client.rpc("decrement_scan_credit", {"p_user_id": user_id}).execute()
    else:
        record_scan(request)

    return result


# ── GET /profile ──────────────────────────────────────────────────────────────
# Frontend calls this on login to fetch stored profile fields (for the profile
# page, and to decide whether to show the full quiz or the short QuickScan).
# Returns {"profile": <row>} or {"profile": null} if not completed yet.
@app.get("/profile")
async def fetch_profile(authorization: str = Header(None)):
    user_id = get_user_id_from_token(authorization)
    if not user_id:
        return JSONResponse(status_code=401, content={"error": "Login required."})
    profile = get_profile(user_id)
    return {"profile": profile}


# ── POST /profile ─────────────────────────────────────────────────────────────
# Frontend calls this to save/update stable profile fields (from the profile
# page edit, or after the first full quiz). Backend fetches user_id from JWT —
# the frontend never sends it.
@app.post("/profile")
async def create_or_update_profile(request: Request, authorization: str = Header(None)):
    user_id = get_user_id_from_token(authorization)
    if not user_id:
        return JSONResponse(status_code=401, content={"error": "Login required to save a profile."})

    body = await request.json()
    try:
        form = ProfileForm(**body)
    except ValidationError as e:
        return JSONResponse(status_code=400, content={"error": e.errors()[0]["msg"]})

    try:
        saved = save_profile(user_id, form.model_dump())
        return {"ok": True, "profile": saved}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": "Could not save profile.", "detail": str(e)})


@app.post("/register")
async def register(request: Request):
    body = await request.json()
    name     = body.get("name", "").strip()
    email    = body.get("email", "").strip().lower()
    password = body.get("password", "")
    if not name or not email or not password:
        return JSONResponse(status_code=400, content={"error": "All fields required."})
    if len(password) < 6:
        return JSONResponse(status_code=400, content={"error": "Password must be at least 6 characters."})
    try:
        user = create_user(name, email, password)
        return {"ok": True, "user": user}
    except ValueError:
        return JSONResponse(status_code=409, content={"error": "An account with this email already exists."})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": "Could not create account.", "detail": str(e)})


@app.post("/login")
async def login(request: Request):
    body     = await request.json()
    email    = body.get("email", "").strip().lower()
    password = body.get("password", "")
    user     = get_user_by_email(email)
    if not user or not verify_password(password, user["password"]):
        return JSONResponse(status_code=401, content={"error": "Invalid email or password."})
    return {"ok": True, "user": {"id": user["id"], "name": user["name"], "email": user["email"]}}


app.mount("/", StaticFiles(directory="static/dist", html=True), name="static")
