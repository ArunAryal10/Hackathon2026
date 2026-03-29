from __future__ import annotations

import os
import json
import re

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api", tags=["voice"])


class VoiceAnalyzeRequest(BaseModel):
    transcript: str
    duration_seconds: float = 0


class VoiceAnalyzeResponse(BaseModel):
    stress_score: float       # 0–10
    sentiment: str            # "calm" | "neutral" | "stressed"
    reasoning: str
    keywords: list[str]
    used_llm: bool


def _keyword_fallback(transcript: str) -> VoiceAnalyzeResponse:
    """Fallback when Gemini key is missing or call fails."""
    STRESS_WORDS = [
        'stressed', 'stress', 'anxious', 'anxiety', 'worried', 'overwhelmed',
        'exhausted', 'tired', 'drained', 'depressed', 'sad', 'angry', 'scared',
        'nervous', 'struggling', 'bad', 'terrible', 'awful', "can't", 'cannot',
        'problem', 'pressure', 'no sleep', 'insomnia', 'behind',
    ]
    CALM_WORDS = [
        'good', 'great', 'fine', 'okay', 'well', 'happy', 'calm', 'relaxed',
        'rested', 'positive', 'better', 'excellent', 'peaceful', 'motivated',
    ]
    lower = transcript.lower()
    stress_hits = [w for w in STRESS_WORDS if w in lower]
    calm_hits = [w for w in CALM_WORDS if w in lower]
    total = len(stress_hits) + len(calm_hits)
    ratio = len(stress_hits) / total if total > 0 else 0.5
    score = round(ratio * 10, 1)
    sentiment = 'stressed' if score >= 6 else 'calm' if score <= 3 else 'neutral'
    return VoiceAnalyzeResponse(
        stress_score=score,
        sentiment=sentiment,
        reasoning='Keyword-based analysis (Gemini key not configured).',
        keywords=stress_hits[:5],
        used_llm=False,
    )


@router.post("/voice-analyze", response_model=VoiceAnalyzeResponse)
async def voice_analyze(req: VoiceAnalyzeRequest) -> VoiceAnalyzeResponse:
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key or not req.transcript.strip():
        return _keyword_fallback(req.transcript)

    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")

        prompt = f"""You are analyzing a voice journal entry from someone who may be experiencing stress related to financial pressures (remittances, debt), work, sleep, or general wellbeing.

Transcript: "{req.transcript}"

Return ONLY a JSON object with these exact fields:
{{
  "stress_score": <float 0-10, where 0=completely calm, 10=extremely stressed>,
  "sentiment": <"calm" | "neutral" | "stressed">,
  "reasoning": <one sentence explaining what signals indicate the stress level>,
  "keywords": <array of up to 5 words/phrases from the transcript that most influenced the score>
}}

Be nuanced — consider context, not just keywords. Someone saying "I can't sleep because I'm worried about money I sent home" should score higher than someone saying "I feel a bit tired but otherwise okay"."""

        response = model.generate_content(prompt)
        text = response.text.strip()

        # Strip markdown code fences if present
        text = re.sub(r'^```(?:json)?\s*', '', text)
        text = re.sub(r'\s*```$', '', text)

        data = json.loads(text)
        return VoiceAnalyzeResponse(
            stress_score=float(data['stress_score']),
            sentiment=data['sentiment'],
            reasoning=data['reasoning'],
            keywords=data.get('keywords', []),
            used_llm=True,
        )

    except Exception:
        return _keyword_fallback(req.transcript)
