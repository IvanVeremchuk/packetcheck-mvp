from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from utils import extract_ips, check_ip_abuse, explain_ip_activity
import os

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

# Add CORS middleware to allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class LogText(BaseModel):
    log_text: str


@app.post("/analyze")
async def analyze_log(log: LogText):
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

