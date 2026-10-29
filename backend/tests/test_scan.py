"""Tests for the /scan endpoint, usage limits and the AI answer parser.

Clerk, AbuseIPDB and OpenRouter are replaced with fakes, so these run offline:
    pip install -r requirements-dev.txt && pytest
"""
import json
import os
import sys
from unittest.mock import MagicMock, patch

import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("OPENROUTER_API_KEY", "test")
os.environ.setdefault("ABUSE_IP_KEY", "test")

import main  # noqa: E402
import utils  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

REPORT = "TCP    192.168.1.24:49812     45.137.21.9:4444       ESTABLISHED     3316"


def ai_response(content: str):
    resp = MagicMock()
    resp.raise_for_status = lambda: None
    resp.json.return_value = {
        "choices": [{"message": {"content": content}}],
        "usage": {"prompt_tokens": 1200, "completion_tokens": 200},
    }
    return resp


GOOD_ANSWER = json.dumps({
    "verdict": "alert",
    "headline": "A program is talking to a backdoor port",
    "summary": "Port 4444 is a backdoor default.",
    "items": [{"title": "Port 4444", "severity": "high", "explanation": "e", "action": "a"}],
    "next_steps": ["Disconnect from the internet"],
})


@pytest.fixture
def account(monkeypatch):
    """A fake Clerk account whose public metadata lives in a dict."""
    store = {"plan": "free", "credits": 0, "analyses_month": "2000-01", "analyses_count": 0}
    monkeypatch.setattr(main, "_get_clerk_user_metadata", lambda uid: dict(store))
    monkeypatch.setattr(main, "_update_clerk_user_metadata", lambda uid, md: store.update(md) or True)
    monkeypatch.setattr(
        main, "check_ip_abuse",
        lambda ip: {"data": {"abuseConfidenceScore": 90, "countryCode": "NL", "isp": "Example Host"}},
    )
    monkeypatch.setattr(utils, "OPENROUTER_API_KEY", "test")
    main.app.dependency_overrides[main.verify_clerk_token] = lambda: "user_1"
    yield store
    main.app.dependency_overrides.clear()


@pytest.fixture
def client():
    return TestClient(main.app)


def scan(client):
    return client.post("/scan", json={"report_text": REPORT, "local_findings": []})


def test_free_checks_then_credits_then_blocked(account, client):
    account["credits"] = 1
    with patch("utils.requests.post", return_value=ai_response(GOOD_ANSWER)):
        for expected_left in (2, 1, 0):
            r = scan(client)
            assert r.status_code == 200
            assert r.json()["usage"]["monthly_left"] == expected_left
        assert account["credits"] == 1

        r = scan(client)  # monthly allowance used up: spends the credit
        assert r.status_code == 200
        assert account["credits"] == 0

        r = scan(client)  # nothing left
        assert r.status_code == 403
        assert "$3" in r.json()["detail"]


def test_monthly_count_resets_in_a_new_month(account, client):
    account.update(analyses_month="2000-01", analyses_count=99)
    with patch("utils.requests.post", return_value=ai_response(GOOD_ANSWER)):
        r = scan(client)
    assert r.status_code == 200
    assert account["analyses_count"] == 1


def test_pro_gets_the_larger_allowance(account, client):
    account.update(plan="pro", analyses_month=main.datetime.utcnow().strftime("%Y-%m"), analyses_count=100)
    with patch("utils.requests.post", return_value=ai_response(GOOD_ANSWER)):
        r = scan(client)
    assert r.status_code == 200
    assert r.json()["usage"]["monthly_left"] == main.PRO_MONTHLY_LIMIT - 101


def test_failed_ai_call_is_not_charged(account, client):
    account["credits"] = 0
    bad = MagicMock()
    bad.raise_for_status.side_effect = Exception("upstream down")
    with patch("utils.requests.post", return_value=bad):
        r = scan(client)
    assert r.status_code == 502
    assert "not charged" in r.json()["detail"]
    assert account["analyses_count"] == 0


def test_empty_report_is_rejected_without_charge(account, client):
    r = client.post("/scan", json={"report_text": "   "})
    assert r.status_code == 400
    assert account["analyses_count"] == 0


def test_ip_reputation_is_returned(account, client):
    with patch("utils.requests.post", return_value=ai_response(GOOD_ANSWER)):
        body = scan(client).json()
    assert body["ip_reputation"] == [
        {"ip": "45.137.21.9", "risk_score": 90, "country": "NL", "owner": "Example Host"}
    ]


def test_parser_accepts_fenced_json_and_cleans_values():
    fenced = "```json\n" + json.dumps({
        "verdict": "maybe",  # invalid, falls back to review
        "headline": "x" * 500,
        "items": [{"title": "t", "severity": "critical"}, "not a dict"],
        "next_steps": ["a", "b", "c", "d", "e"],
    }) + "\n```"
    with patch("utils.requests.post", return_value=ai_response(fenced)):
        out = utils.explain_scan(REPORT, [], [])
    assert out["verdict"] == "review"
    assert len(out["headline"]) == 160
    assert out["items"] == [{"title": "t", "severity": "low", "explanation": "", "action": ""}]
    assert len(out["next_steps"]) == 4


def test_parser_rejects_non_json():
    with patch("utils.requests.post", return_value=ai_response("Sorry, I can't help.")):
        with pytest.raises(ValueError):
            utils.explain_scan(REPORT, [], [])
