from fastapi import FastAPI, File, Form, UploadFile, Request
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import ValidationError
import io,os

from fastapi import Header
from supabase import create_client
from fastapi.middleware.cors import CORSMiddleware

from app.validate.input_form import InputForm
from app.services.claude import Claude_Analyser

from app.services.database import connect_db, save_scan, create_user, get_user_by_email, verify_password



app = FastAPI()

RAILWAY_ORIGIN = os.getenv("ALLOWED_ORIGIN", "")
 
ALLOWED_ORIGINS = [
    "http://localhost:8000",       # local production build
    "http://localhost:5173",       # local vite dev server
]
if RAILWAY_ORIGIN:
    ALLOWED_ORIGINS.append(RAILWAY_ORIGIN)
 
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

    # Rate limit — DB-based for logged-in users, IP-based for guests
    if user_id:
        scan_count = get_user_scan_count(user_id)
        if scan_count >= MAX_SCANS_FREE:
            return JSONResponse(status_code=429, content={
                "error": f"You have used all {MAX_SCANS_FREE} free scans. Thank you for testing!"
            })
    else:
        # fall back to IP limit for guests
        if not validate_user(request):
            return JSONResponse(status_code=429, content={
                "error": "Scan limit reached. Create an account to track your scans."
            })

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

    # Check for Claude errors
    if result.get("error"):
        return JSONResponse(status_code=502, content={"error": result["message"]})
    
    # Check image validation from Claude
    if result.get("image_check") and result["image_check"].lower() != "pass":
        return JSONResponse(status_code=400, content={"error": result["image_check"]})


    save_scan(quiz_data=form.to_claude_dict(), result=result, user_id=user_id)
    
    if not user_id:
        record_scan(request)

    return result


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
