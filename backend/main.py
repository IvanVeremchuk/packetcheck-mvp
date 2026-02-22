from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from utils import extract_ips, check_ip_abuse, explain_ip_activity
import os
import jwt
from jwt import InvalidTokenError, PyJWKClient

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

# Add CORS middleware with explicit allowed frontend origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://packetcheck.net",
    ],
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


class LogText(BaseModel):
    log_text: str


@app.post("/analyze")
async def analyze_log(log: LogText, _: str = Depends(verify_clerk_token)):
    """
    Analyze log text to extract IP addresses and check them against AbuseIPDB.
    
    Args:
        log: Request body containing log_text field
        
    Returns:
        List of IP analysis results with ip, risk_score, and country
    """
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


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"message": "PacketCheck API is running"}


@app.get("/auth-check")
async def auth_check(user_id: str = Depends(verify_clerk_token)):
    """Validate bearer token and return the authenticated Clerk user ID."""
    return {"authenticated": True, "user_id": user_id}

