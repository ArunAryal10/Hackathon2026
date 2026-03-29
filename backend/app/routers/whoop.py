from __future__ import annotations

import os
import time
from datetime import datetime
from typing import Optional

import httpx
from fastapi import APIRouter, HTTPException
from fastapi.responses import RedirectResponse
from pydantic import BaseModel

router = APIRouter(prefix="/api/whoop", tags=["whoop"])

WHOOP_AUTH_URL = "https://api.prod.whoop.com/oauth/oauth2/auth"
WHOOP_TOKEN_URL = "https://api.prod.whoop.com/oauth/oauth2/token"
WHOOP_API_BASE = "https://api.prod.whoop.com/developer/v2"
SCOPES = "read:recovery read:sleep read:cycles offline"

# In-memory token store (demo only — one user at a time)
_token_store: dict = {}


class WhoopData(BaseModel):
    rmssd_ms: float
    sleep_duration_hrs: float
    sleep_efficiency_pct: float
    resting_heart_rate: Optional[float] = None
    recovery_score: Optional[float] = None
    connected: bool = True


@router.get("/auth")
def whoop_auth():
    """Redirect user to WHOOP OAuth login."""
    client_id = os.getenv("WHOOP_CLIENT_ID")
    redirect_uri = os.getenv("WHOOP_REDIRECT_URI", "http://localhost:8000/api/whoop/callback")
    if not client_id:
        raise HTTPException(status_code=500, detail="WHOOP_CLIENT_ID not configured")

    url = (
        f"{WHOOP_AUTH_URL}"
        f"?client_id={client_id}"
        f"&redirect_uri={redirect_uri}"
        f"&response_type=code"
        f"&scope={SCOPES.replace(' ', '%20')}"
        f"&state=mannchillstate123"
    )
    return RedirectResponse(url)


@router.get("/callback")
async def whoop_callback(code: str, state: str = ""):
    """Handle WHOOP OAuth callback, exchange code for token."""
    client_id = os.getenv("WHOOP_CLIENT_ID")
    client_secret = os.getenv("WHOOP_CLIENT_SECRET")
    redirect_uri = os.getenv("WHOOP_REDIRECT_URI", "http://localhost:8000/api/whoop/callback")

    if not client_id or not client_secret:
        raise HTTPException(status_code=500, detail="WHOOP credentials not configured")

    async with httpx.AsyncClient() as client:
        token_resp = await client.post(
            WHOOP_TOKEN_URL,
            data={
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": redirect_uri,
                "client_id": client_id,
                "client_secret": client_secret,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )

    if token_resp.status_code != 200:
        raise HTTPException(status_code=400, detail=f"Token exchange failed: {token_resp.text}")

    token_data = token_resp.json()
    _token_store["access_token"] = token_data["access_token"]
    _token_store["refresh_token"] = token_data.get("refresh_token")
    _token_store["expires_at"] = time.time() + token_data.get("expires_in", 3600)

    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    return RedirectResponse(f"{frontend_url}/sources?whoop=connected")


@router.get("/data")
async def get_whoop_data():
    """Fetch latest HRV + sleep data from WHOOP.

    Strategy per official docs (https://developer.whoop.com/api):
      1. GET /cycle?limit=5  → get recent cycle IDs
      2. GET /cycle/{id}/recovery  → HRV, resting HR, recovery score
      3. GET /cycle/{id}/sleep  → sleep duration, efficiency
    All paths relative to WHOOP_API_BASE (/developer/v1).
    """
    token = _token_store.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="WHOOP not connected")

    headers = {"Authorization": f"Bearer {token}"}

    # Defaults (used if WHOOP has no scored data yet)
    rmssd_ms = 40.0
    resting_hr = None
    recovery_score_val = None
    sleep_duration_hrs = 7.0
    sleep_efficiency_pct = 85.0

    async with httpx.AsyncClient(timeout=15.0) as client:
        # 1) Fetch recent cycles
        cycle_resp = await client.get(
            f"{WHOOP_API_BASE}/cycle",
            headers=headers,
            params={"limit": 5},
        )
        if cycle_resp.status_code != 200:
            raise HTTPException(
                status_code=502,
                detail=f"WHOOP /cycle failed ({cycle_resp.status_code}): {cycle_resp.text[:200]}",
            )

        cycles = cycle_resp.json().get("records", [])
        if not cycles:
            raise HTTPException(status_code=502, detail="No WHOOP cycle data available")

        # 2) Recovery — GET /recovery (collection)
        rec_resp = await client.get(
            f"{WHOOP_API_BASE}/recovery",
            headers=headers,
            params={"limit": 1},
        )
        if rec_resp.status_code == 200:
            for rec in rec_resp.json().get("records", []):
                if rec.get("score_state") == "SCORED" and rec.get("score"):
                    s = rec["score"]
                    rmssd_ms = s.get("hrv_rmssd_milli", rmssd_ms)
                    resting_hr = s.get("resting_heart_rate")
                    recovery_score_val = s.get("recovery_score")
                    break

        # 3) Sleep — GET /activity/sleep (collection)
        slp_resp = await client.get(
            f"{WHOOP_API_BASE}/activity/sleep",
            headers=headers,
            params={"limit": 5},
        )
        if slp_resp.status_code == 200:
            for slp in slp_resp.json().get("records", []):
                if slp.get("nap"):
                    continue
                if slp.get("score_state") == "SCORED" and slp.get("start") and slp.get("end"):
                    start = datetime.fromisoformat(slp["start"].replace("Z", "+00:00"))
                    end = datetime.fromisoformat(slp["end"].replace("Z", "+00:00"))
                    sleep_duration_hrs = (end - start).total_seconds() / 3600
                    if slp.get("score"):
                        sleep_efficiency_pct = slp["score"].get(
                            "sleep_efficiency_percentage", sleep_efficiency_pct
                        )
                    break

    return WhoopData(
        rmssd_ms=round(rmssd_ms, 1),
        sleep_duration_hrs=round(sleep_duration_hrs, 2),
        sleep_efficiency_pct=round(sleep_efficiency_pct, 1),
        resting_heart_rate=resting_hr,
        recovery_score=recovery_score_val,
        connected=True,
    )


@router.get("/status")
def whoop_status():
    """Check if WHOOP is connected."""
    connected = bool(_token_store.get("access_token"))
    expired = connected and time.time() > _token_store.get("expires_at", 0)
    return {"connected": connected and not expired}


@router.delete("/disconnect")
def whoop_disconnect():
    """Clear stored tokens."""
    _token_store.clear()
    return {"disconnected": True}


@router.get("/probe")
async def whoop_probe():
    """Test all possible WHOOP API paths and return full responses."""
    token = _token_store.get("access_token")
    if not token:
        return {"error": "no token"}

    headers = {"Authorization": f"Bearer {token}"}
    results = {}
    paths = [
        "/developer/v1/cycle",
        "/developer/v1/cycle/1397891595/recovery",
        "/developer/v1/cycle/1397891595/sleep",
        "/developer/v1/recovery",
        "/developer/v1/activity/sleep",
        "/developer/v1/activity/workout",
        "/developer/v1/user/measurement/body",
        "/developer/v2/recovery",
        "/developer/v2/activity/sleep",
        "/developer/v2/cycle",
        "/developer/v2/cycle/1397891595/recovery",
        "/developer/v2/cycle/1397891595/sleep",
        "/v2/recovery",
        "/v2/activity/sleep",
        "/v2/cycle",
    ]
    async with httpx.AsyncClient() as client:
        for p in paths:
            url = f"https://api.prod.whoop.com{p}"
            r = await client.get(url, headers=headers, params={"limit": 1})
            results[p] = {
                "status": r.status_code,
                "body": r.text[:500] if r.status_code == 200 else r.text[:100],
            }
    return results
