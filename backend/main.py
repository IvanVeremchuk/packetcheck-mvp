from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from utils import extract_ips, check_ip_abuse, explain_ip_activity, explain_scan
import os
import jwt
import requests
from datetime import datetime
from jwt import InvalidTokenError, PyJWKClient

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

# AI checks included each month. Credits from one-time packs are used after these.
FREE_TIER_LIMIT = int(os.getenv("FREE_MONTHLY_CHECKS", "3"))
PRO_MONTHLY_LIMIT = int(os.getenv("PRO_MONTHLY_CHECKS", "150"))
MAX_SCAN_CHARS = 60_000
MAX_IP_LOOKUPS = 12

# Add CORS middleware with explicit allowed frontend origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://packetcheck.net",
        "https://www.packetcheck.net",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["Authorization", "Content-Type"],
)


def _get_clerk_jwks_client() -> PyJWKClient:
    clerk_issuer = os.getenv("CLERK_ISSUER")
    if not clerk_issuer:
        raise HTTPException(
            status_code=500,
            detail="CLERK_ISSUER environment variable is not set",
        )
    jwks_url = os.getenv("CLERK_JWKS_URL", f"{clerk_issuer.rstrip('/')}/.well-known/jwks.json")
    return PyJWKClient(jwks_url)


def verify_clerk_token(authorization: str = Header(default=None)) -> str:
    """
    Validate Clerk bearer token and return the authenticated Clerk user ID (sub).
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    token = authorization.split(" ", 1)[1].strip()
    if not token:
        raise HTTPException(status_code=401, detail="Missing bearer token")

    clerk_issuer = os.getenv("CLERK_ISSUER")
    if not clerk_issuer:
        raise HTTPException(
            status_code=500,
            detail="CLERK_ISSUER environment variable is not set",
        )

    clerk_audience = os.getenv("CLERK_AUDIENCE")

    try:
        signing_key = _get_clerk_jwks_client().get_signing_key_from_jwt(token).key
        payload = jwt.decode(
            token,
            signing_key,
            algorithms=["RS256"],
            issuer=clerk_issuer,
            audience=clerk_audience if clerk_audience else None,
            options={"verify_aud": bool(clerk_audience)},
        )
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token subject")
        return user_id
    except InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


def _get_clerk_user_metadata(user_id: str) -> dict:
    """Fetch user from Clerk API and return public_metadata."""
    secret_key = os.getenv("CLERK_SECRET_KEY")
    if not secret_key:
        return {}
    url = f"https://api.clerk.com/v1/users/{user_id}"
    resp = requests.get(url, headers={"Authorization": f"Bearer {secret_key}"}, timeout=10)
    if resp.status_code != 200:
        return {}
    data = resp.json()
    return data.get("public_metadata") or {}


def _update_clerk_user_metadata(user_id: str, public_metadata: dict) -> bool:
    """Update user public_metadata via Clerk API."""
    secret_key = os.getenv("CLERK_SECRET_KEY")
    if not secret_key:
        return False
    url = f"https://api.clerk.com/v1/users/{user_id}/metadata"
    resp = requests.patch(
        url,
        headers={"Authorization": f"Bearer {secret_key}", "Content-Type": "application/json"},
        json={"public_metadata": public_metadata},
        timeout=10,
    )
    return resp.status_code == 200


def reserve_usage(user_id: str) -> dict:
    """
    Decide which allowance pays for one AI check, without charging yet.

    Order: the monthly allowance (free or Pro), then prepaid credits from a
    one-time pack. Raises 403 when nothing is left. Pass the returned dict to
    commit_usage() once the check has succeeded, so failures cost nothing.
    """
    metadata = _get_clerk_user_metadata(user_id)
    plan = metadata.get("plan", "free")
    monthly_limit = PRO_MONTHLY_LIMIT if plan == "pro" else FREE_TIER_LIMIT

    current_month = datetime.utcnow().strftime("%Y-%m")
    analyses_count = int(metadata.get("analyses_count", 0) or 0)
    if metadata.get("analyses_month", "") != current_month:
        analyses_count = 0
    credits = int(metadata.get("credits", 0) or 0)

    if analyses_count < monthly_limit:
        source = "monthly"
    elif credits > 0:
        source = "credits"
    else:
        raise HTTPException(
            status_code=403,
            detail=(
                f"You've used this month's {monthly_limit} AI checks. "
                "A 10-check pack is $3 and never expires."
            ),
        )

    return {
        "metadata": metadata,
        "source": source,
        "month": current_month,
        "analyses_count": analyses_count,
        "credits": credits,
    }


def commit_usage(user_id: str, reservation: dict) -> dict:
    """Charge the allowance chosen by reserve_usage(). Returns what is left."""
    metadata = reservation["metadata"]
    analyses_count = reservation["analyses_count"]
    credits = reservation["credits"]
    if reservation["source"] == "monthly":
        analyses_count += 1
    else:
        credits = max(credits - 1, 0)
    new_metadata = {
        **metadata,
        "analyses_month": reservation["month"],
        "analyses_count": analyses_count,
        "credits": credits,
    }
    _update_clerk_user_metadata(user_id, new_metadata)
    plan = metadata.get("plan", "free")
    monthly_limit = PRO_MONTHLY_LIMIT if plan == "pro" else FREE_TIER_LIMIT
    return {
        "plan": plan,
        "monthly_left": max(monthly_limit - analyses_count, 0),
        "credits": credits,
    }


def check_and_increment_usage(user_id: str) -> None:
    """Charge one check up front (used by the IP log analysis)."""
    commit_usage(user_id, reserve_usage(user_id))


class LogText(BaseModel):
    log_text: str


@app.post("/analyze")
async def analyze_log(log: LogText, user_id: str = Depends(verify_clerk_token)):
    """
    Analyze log text to extract IP addresses and check them against AbuseIPDB.
    
    Args:
        log: Request body containing log_text field
        
    Returns:
        List of IP analysis results with ip, risk_score, and country
    """
    check_and_increment_usage(user_id)

    # Validate that ABUSE_IP_KEY is set
    if not os.getenv("ABUSE_IP_KEY"):
        raise HTTPException(
            status_code=500,
            detail="ABUSE_IP_KEY environment variable is not set"
        )
    
    # Extract IPs from log text
    ips = extract_ips(log.log_text)
    
    if not ips:
        return []
    
    results = []
    log_lines = log.log_text.splitlines()
    
    # Check each IP against AbuseIPDB
    for ip in ips:
        try:
            abuse_data = check_ip_abuse(ip)
            
            # Extract data from API response
            if abuse_data.get("data"):
                data = abuse_data["data"]
                risk_score = data.get("abuseConfidenceScore", 0)
                ai_explanation = None

                if risk_score > 50:
                    matching_lines = [line for line in log_lines if ip in line]
                    try:
                        ai_explanation = explain_ip_activity(ip, matching_lines)
                    except Exception as ai_error:
                        ai_explanation = f"AI explanation unavailable: {str(ai_error)}"

                results.append({
                    "ip": ip,
                    "risk_score": risk_score,
                    "country": data.get("countryCode", "Unknown"),
                    "ai_explanation": ai_explanation
                })
            else:
                # If no data in response, still add IP with default values
                results.append({
                    "ip": ip,
                    "risk_score": 0,
                    "country": "Unknown",
                    "ai_explanation": None
                })
        except Exception as e:
            # Handle API errors gracefully
            # Still include IP in results but with error indication
            results.append({
                "ip": ip,
                "risk_score": 0,
                "country": "Unknown",
                "ai_explanation": None,
                "error": f"Failed to check IP: {str(e)}"
            })
    
    return results


class LocalFinding(BaseModel):
    severity: str
    title: str
    detail: str = ""
    evidence: list[str] = []


class ScanRequest(BaseModel):
    report_text: str
    local_findings: list[LocalFinding] = []
    local_verdict: str = ""


@app.post("/scan")
def scan_report(req: ScanRequest, user_id: str = Depends(verify_clerk_token)):
    """
    AI second opinion on a remote-access scan.

    The browser already ran the free rule check and sends its findings with the
    condensed report. We look up the reputation of the public addresses the
    computer is talking to, ask the model for a plain-language verdict, and only
    then charge one check.
    """
    report = req.report_text.strip()
    if not report:
        raise HTTPException(status_code=400, detail="The report is empty.")
    if len(report) > MAX_SCAN_CHARS:
        report = report[:MAX_SCAN_CHARS]

    reservation = reserve_usage(user_id)

    ip_reputation = []
    if os.getenv("ABUSE_IP_KEY"):
        for ip in extract_ips(report)[:MAX_IP_LOOKUPS]:
            try:
                data = check_ip_abuse(ip).get("data") or {}
                ip_reputation.append({
                    "ip": ip,
                    "risk_score": data.get("abuseConfidenceScore", 0),
                    "country": data.get("countryCode") or "",
                    "owner": data.get("isp") or data.get("domain") or "",
                })
            except Exception:
                continue

    try:
        opinion = explain_scan(
            report,
            [f.model_dump() for f in req.local_findings[:25]],
            ip_reputation,
        )
    except Exception as error:
        raise HTTPException(status_code=502, detail=f"AI check failed, you were not charged: {error}")

    usage = commit_usage(user_id, reservation)
    return {**opinion, "ip_reputation": ip_reputation, "usage": usage}


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"message": "PacketCheck API is running"}


@app.get("/auth-check")
async def auth_check(user_id: str = Depends(verify_clerk_token)):
    """Validate bearer token and return the authenticated Clerk user ID."""
    return {"authenticated": True, "user_id": user_id}

