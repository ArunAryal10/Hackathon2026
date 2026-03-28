"""
Nudge generator.

Selects and ranks culturally-adapted nudges based on:
  - dominant stressor category
  - severity band
  - sub-scores (to surface secondary stressors)

Nudges are supportive, not clinical. Izzat (family honor) is respected in
financial nudges — scripts acknowledge obligation while suggesting sustainable limits.
"""

from __future__ import annotations
from app.models.schemas import Nudge

# ---------------------------------------------------------------------------
# Nudge library
# Each entry: (category, priority, message_en, message_ne)
# Priority: 1=high, 2=medium, 3=low
# ---------------------------------------------------------------------------

_NUDGES: dict[str, list[tuple[int, str, str | None]]] = {
    "financial": [
        (
            1,
            "Your remittance burden is above the sustainable threshold. "
            "Consider a family conversation about a temporary reduction — "
            "protecting your health protects your ability to support them long-term.",
            "तपाईंको रेमिट्यान्स दर दिगो सीमाभन्दा माथि छ। परिवारसँग अस्थायी कटौतीबारे कुरा गर्नुहोस्।",
        ),
        (
            2,
            "Track your monthly remittance as a percentage of income. "
            "Aim to keep it under 15% to maintain financial resilience.",
            "आफ्नो मासिक रेमिट्यान्स आम्दानीको प्रतिशतमा ट्र्याक गर्नुहोस्। १५% भित्र राख्ने लक्ष्य राख्नुहोस्।",
        ),
        (
            2,
            "Look into free financial counseling through Nepali community organizations "
            "in your city — many offer remittance planning support.",
            None,
        ),
        (
            3,
            "Small wins: setting up automatic savings before remittance transfers "
            "can reduce financial stress significantly over time.",
            None,
        ),
    ],
    "hrv_sleep": [
        (
            1,
            "Your HRV indicates elevated physiological stress. "
            "Prioritize 7–9 hours of sleep tonight — even one night improves HRV.",
            "तपाईंको HRV उच्च शारीरिक तनाव देखाउँछ। आज रात ७–९ घण्टा सुत्ने प्रयास गर्नुहोस्।",
        ),
        (
            2,
            "Try a 5-minute breathing exercise before bed: "
            "inhale 4 counts, hold 4, exhale 6. This activates your parasympathetic system.",
            "सुत्नुअघि ५ मिनेट श्वास व्यायाम गर्नुहोस्: ४ गन्ती श्वास लिनुस्, ४ रोक्नुस्, ६ मा छाड्नुस्।",
        ),
        (
            3,
            "Consistent sleep and wake times — even on weekends — "
            "are the single most effective way to improve HRV over weeks.",
            None,
        ),
    ],
    "behavioral": [
        (
            1,
            "Your screen time is significantly above average. "
            "Try setting a phone-free hour before bed to improve sleep quality and reduce cortisol.",
            "तपाईंको स्क्रिन समय औसतभन्दा धेरै बढी छ। सुत्नुअघि एक घण्टा फोन नहेर्ने प्रयास गर्नुहोस्।",
        ),
        (
            2,
            "Adding a 15-minute walk after meals can meaningfully improve "
            "your step count and reduce blood glucose spikes.",
            "खाना खाएपछि १५ मिनेट हिँड्नाले तपाईंको कदम संख्या र रगतमा चिनीको मात्रा सुधार गर्छ।",
        ),
        (
            3,
            "Even 20 minutes of moderate exercise 3x per week reduces "
            "cortisol and improves mood measurably within 2 weeks.",
            None,
        ),
    ],
    "self_report": [
        (
            1,
            "You've reported high stress. Reach out to someone you trust today — "
            "social connection is one of the fastest stress regulators.",
            "तपाईंले उच्च तनाव रिपोर्ट गर्नुभएको छ। आज कसैलाई सम्पर्क गर्नुहोस् — सामाजिक सम्बन्ध तनाव घटाउने सबैभन्दा छिटो उपाय हो।",
        ),
        (
            2,
            "Journaling for 5 minutes about what's weighing on you "
            "can reduce the mental load and help identify what's in your control.",
            None,
        ),
        (
            3,
            "Nepali mental health resources: KOSHISH Nepal (koshish.org.np), "
            "Transcultural Psychosocial Organization Nepal (tpo-nepal.org).",
            None,
        ),
    ],
}

# Severe-band escalation nudge appended regardless of category
_SEVERE_ESCALATION = Nudge(
    category="crisis",
    priority=1,
    message_en=(
        "Your overall stress load is in the severe range. Please consider speaking "
        "with a mental health professional. You can contact KOSHISH Nepal helpline: "
        "+977-1-4102030 or the Transcultural Psychosocial Organization Nepal."
    ),
    message_ne="तपाईंको तनाव गम्भीर स्तरमा छ। कृपया मानसिक स्वास्थ्य विशेषज्ञसँग कुरा गर्नुहोस्।",
)


def get_nudges(
    dominant: str,
    band: str,
    sub_scores: dict[str, float],
    max_nudges: int = 4,
) -> list[Nudge]:
    """
    Return a ranked list of nudges.
    Always leads with nudges for the dominant stressor,
    then adds one secondary nudge if a second subscorer is elevated (>50).
    """
    results: list[Nudge] = []

    # Primary: nudges for dominant stressor
    for priority, msg_en, msg_ne in _NUDGES.get(dominant, []):
        results.append(Nudge(category=dominant, priority=priority, message_en=msg_en, message_ne=msg_ne))

    # Secondary: one nudge from the next most stressed category
    secondary_scores = {k: v for k, v in sub_scores.items() if k != dominant and v > 35}
    if secondary_scores:
        secondary = max(secondary_scores, key=secondary_scores.get)
        secondary_nudges = _NUDGES.get(secondary, [])
        if secondary_nudges:
            p, msg_en, msg_ne = secondary_nudges[0]
            results.append(Nudge(category=secondary, priority=p, message_en=msg_en, message_ne=msg_ne))

    # Escalation for severe band
    if band == "severe":
        results.insert(0, _SEVERE_ESCALATION)

    return results[:max_nudges]
