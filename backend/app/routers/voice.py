from __future__ import annotations

import os
import json
import re
import base64
from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api", tags=["voice"])


class VoiceAnalyzeRequest(BaseModel):
    transcript: str
    duration_seconds: float = 0
    audio_base64: Optional[str] = None
    audio_mime_type: Optional[str] = "audio/webm"


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
        from google import genai
        from google.genai import types
        client = genai.Client(api_key=api_key)

        audio_instruction = "Listen to the audio carefully — analyze tone of voice, speech pace, hesitations, emotional quality, and vocal energy." if req.audio_base64 else ""
        transcript_line = f'Transcript for reference: "{req.transcript}"' if req.transcript.strip() else ""
        prompt = f"""You are analyzing a voice journal entry for stress indicators. The speaker may be experiencing stress related to finances, remittances, work, sleep, or general wellbeing.

{audio_instruction}
{transcript_line}

Return ONLY a JSON object:
{{
  "stress_score": <float 0-10, where 0=completely calm, 10=extremely stressed>,
  "sentiment": <"calm" | "neutral" | "stressed">,
  "reasoning": <one sentence about what signals indicate this stress level>,
  "keywords": <up to 5 words/phrases or audio characteristics that most influenced the score>
}}"""

        if req.audio_base64:
            audio_bytes = base64.b64decode(req.audio_base64)
            contents = [
                types.Part(inline_data=types.Blob(mime_type=req.audio_mime_type or "audio/webm", data=audio_bytes)),
                types.Part(text=prompt),
            ]
        else:
            contents = prompt

        response = client.models.generate_content(model="gemini-2.5-flash", contents=contents)
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

    except Exception as e:
        print(f"[voice] Gemini error: {e}")
        return _keyword_fallback(req.transcript)
