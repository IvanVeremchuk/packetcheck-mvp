import json
import re
import requests
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

ABUSE_IP_KEY = os.getenv("ABUSE_IP_KEY")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "gpt-4o-mini")


def extract_ips(text: str) -> list[str]:
    """
    Extract unique public IPv4 addresses from text.
    Filters out private IP ranges: 10.x.x.x, 192.168.x.x, 172.16-31.x.x, 127.0.0.1
    
    Args:
        text: Input text to search for IP addresses
        
    Returns:
        List of unique public IPv4 addresses
    """
    # Regex pattern to match IPv4 addresses
    ip_pattern = re.compile(r'\b(?:\d{1,3}\.){3}\d{1,3}\b')
    all_ips = ip_pattern.findall(text)
    
    public_ips = set()
    
    for ip in all_ips:
        # Validate IP octets are in valid range (0-255)
        octets = ip.split('.')
        if len(octets) != 4:
            continue
            
        try:
            first_octet = int(octets[0])
            second_octet = int(octets[1])
            
            # Validate all octets are in range 0-255
            if not all(0 <= int(octet) <= 255 for octet in octets):
                continue
            
            # Filter out private IP ranges
            # 10.0.0.0/8
            if first_octet == 10:
                continue
            
            # 192.168.0.0/16
            if first_octet == 192 and second_octet == 168:
                continue
            
            # 172.16.0.0/12 (172.16.0.0 to 172.31.255.255)
            if first_octet == 172 and 16 <= second_octet <= 31:
                continue
            
            # 127.0.0.1 (localhost)
            if ip == "127.0.0.1":
                continue
            
            public_ips.add(ip)
        except ValueError:
            # Skip invalid IPs
            continue
    
    return list(public_ips)


def check_ip_abuse(ip: str) -> dict:
    """
    Check IP address against AbuseIPDB API v2.
    
    Args:
        ip: IP address to check
        
    Returns:
        JSON response from AbuseIPDB API
        
    Raises:
        requests.RequestException: If API request fails
    """
    url = "https://api.abuseipdb.com/api/v2/check"
    headers = {
        "Key": ABUSE_IP_KEY,
        "Accept": "application/json"
    }
    params = {
        "ipAddress": ip,
        "maxAgeInDays": 90
    }
    
    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()  # Raise exception for bad status codes
    return response.json()


def explain_ip_activity(ip: str, log_lines: list[str]) -> str:
    """
    Ask OpenRouter to explain why an IP is suspicious and what to do next.
    """
    if not OPENROUTER_API_KEY:
        raise ValueError("OPENROUTER_API_KEY environment variable is not set")

    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }

    # Keep prompt concise and limit log context to reduce token usage.
    context_lines = log_lines[:3] if log_lines else []
    context_text = "\n".join(context_lines) if context_lines else "(no matching log lines)"

    payload = {
        "model": OPENROUTER_MODEL,
        "messages": [
            {
                "role": "system",
                "content": "You are a security analyst. Respond in 3-6 short bullet points.",
            },
            {
                "role": "user",
                "content": (
                    "Given the suspicious IP and log context, explain why it may be attacking "
                    "a server and what the operator should do next.\n\n"
                    f"IP: {ip}\n"
                    f"Log context:\n{context_text}"
                ),
            },
        ],
        "temperature": 0.2,
        "max_tokens": 200,
    }

    response = requests.post(url, headers=headers, json=payload, timeout=20)
    response.raise_for_status()
    data = response.json()

    choices = data.get("choices", [])
    if not choices:
        raise ValueError("OpenRouter response missing choices")
    message = choices[0].get("message", {})
    content = message.get("content", "").strip()
    if not content:
        raise ValueError("OpenRouter response missing content")
    return content



SCAN_SYSTEM_PROMPT = """You are PacketCheck, a calm security analyst helping a non-expert decide whether
someone has remote access to their computer (Remote Desktop, VNC, remote-control apps,
remote-access trojans, tunnels, leftover backdoors after a scam or a fishy download).

You receive a snapshot report of the computer's open ports, live connections, remote
sessions, remote-control services, startup entries and admin accounts, the findings of
a rule-based pre-check, and reputation data for the public IPs it talks to.

Rules:
- Judge from the evidence only. Say plainly when something is normal (browsers on 443,
  Windows on 135/445/5040, Apple and Microsoft services) so the user can relax.
- The rule-based findings may contain false alarms; confirm or downgrade them.
- Never invent processes, IPs or files that are not in the report.
- Write for someone who is not technical: short sentences, no jargon without a gloss.
- Steps must be concrete and safe (where to click, what to uninstall). Never tell the
  user to run downloaded scripts or disable security features.

Reply with JSON only, exactly this shape:
{"verdict": "clear" | "review" | "alert",
 "headline": "one sentence, max 90 characters",
 "summary": "2-4 sentences in plain language",
 "items": [{"title": "...", "severity": "high" | "medium" | "low" | "ok",
            "explanation": "1-2 sentences", "action": "1 sentence"}],
 "next_steps": ["up to 4 short steps in order"]}
Keep items to the 6 most important, including at most 2 "ok" items about normal activity."""


def explain_scan(report: str, local_findings: list[dict], ip_reputation: list[dict]) -> dict:
    """
    Ask the model for a plain-language verdict on a remote-access scan.
    Returns the parsed JSON object described in SCAN_SYSTEM_PROMPT.
    """
    if not OPENROUTER_API_KEY:
        raise ValueError("OPENROUTER_API_KEY environment variable is not set")

    findings_text = "\n".join(
        f"- [{f.get('severity')}] {f.get('title')}: {'; '.join(f.get('evidence', [])[:3])}"
        for f in local_findings
    ) or "- none"
    rep_text = "\n".join(
        f"- {r['ip']}: abuse score {r['risk_score']}, {r.get('country') or '??'}, {r.get('owner') or 'unknown owner'}"
        for r in ip_reputation
    ) or "- not checked"

    payload = {
        "model": OPENROUTER_MODEL,
        "messages": [
            {"role": "system", "content": SCAN_SYSTEM_PROMPT},
            {
                "role": "user",
                "content": (
                    f"Rule-based findings:\n{findings_text}\n\n"
                    f"IP reputation:\n{rep_text}\n\n"
                    f"Report:\n{report}"
                ),
            },
        ],
        "temperature": 0.1,
        "max_tokens": 900,
        "response_format": {"type": "json_object"},
    }
    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={"Authorization": f"Bearer {OPENROUTER_API_KEY}", "Content-Type": "application/json"},
        json=payload,
        timeout=45,
    )
    response.raise_for_status()
    data = response.json()
    choices = data.get("choices", [])
    if not choices:
        raise ValueError("model returned no answer")
    content = (choices[0].get("message", {}).get("content") or "").strip()
    # Some models wrap JSON in a code fence despite response_format.
    if content.startswith("```"):
        content = content.strip("`")
        content = content[content.find("{"):]
    start, end = content.find("{"), content.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("model did not return JSON")
    parsed = json.loads(content[start:end + 1])

    verdict = parsed.get("verdict") if parsed.get("verdict") in ("clear", "review", "alert") else "review"
    items = []
    for item in (parsed.get("items") or [])[:8]:
        if not isinstance(item, dict):
            continue
        items.append({
            "title": str(item.get("title", ""))[:160],
            "severity": item.get("severity") if item.get("severity") in ("high", "medium", "low", "ok") else "low",
            "explanation": str(item.get("explanation", ""))[:600],
            "action": str(item.get("action", ""))[:300],
        })
    return {
        "verdict": verdict,
        "headline": str(parsed.get("headline", ""))[:160],
        "summary": str(parsed.get("summary", ""))[:1200],
        "items": items,
        "next_steps": [str(s)[:240] for s in (parsed.get("next_steps") or [])[:4]],
        "model": OPENROUTER_MODEL,
        "tokens": data.get("usage", {}),
    }
