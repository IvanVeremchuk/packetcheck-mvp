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

