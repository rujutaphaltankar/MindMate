from collections import Counter
from datetime import datetime, timedelta, timezone

from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.models.mood import list_mood_records
from app.models.wellness import list_history

insights_bp = Blueprint("insights", __name__, url_prefix="/api/insights")


def _avg(values):
    values = [v for v in values if v is not None]
    return round(sum(values) / len(values), 1) if values else None


@insights_bp.get("")
@jwt_required()
def get_insights():
    user_id = get_jwt_identity()
    records = list_mood_records(user_id, limit=90)
    activities = list_history(user_id, limit=200)

    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    week_records = [r for r in records if r["created_at"] >= week_ago]
    week_activity_dates = {
        a["completed_at"].date() for a in activities if a["completed_at"] >= week_ago
    }

    avg_mood = _avg([r["mood"] for r in week_records])
    avg_stress = _avg([r["stress"] for r in week_records])
    avg_energy = _avg([r["energy"] for r in week_records])

    mood_on_activity_days = _avg(
        [r["mood"] for r in week_records if r["created_at"].date() in week_activity_dates]
    )
    mood_on_other_days = _avg(
        [r["mood"] for r in week_records if r["created_at"].date() not in week_activity_dates]
    )

    observations = []
    if mood_on_activity_days is not None and mood_on_other_days is not None:
        if mood_on_activity_days > mood_on_other_days:
            observations.append(
                "Your reported mood has been higher on days when you recorded completing a "
                "wellness activity. This may be worth observing further — it doesn't prove "
                "one causes the other."
            )
    if avg_stress is not None and avg_stress >= 7:
        observations.append(
            "Your entries show elevated stress this week. A short breathing exercise or "
            "breaking tasks into smaller steps might be worth trying."
        )

    trend = [
        {
            "date": r["created_at"].date().isoformat(),
            "mood": r["mood"],
            "stress": r["stress"],
            "energy": r["energy"],
            "sleep_hours": r.get("sleep_hours"),
        }
        for r in reversed(records)
    ]

    return jsonify(
        {
            "summary": {
                "avg_mood_week": avg_mood,
                "avg_stress_week": avg_stress,
                "avg_energy_week": avg_energy,
                "activities_completed_week": len(
                    [a for a in activities if a["completed_at"] >= week_ago]
                ),
            },
            "trend": trend,
            "observations": observations,
        }
    )


@insights_bp.get("/recommendations")
@jwt_required()
def get_recommendations():
    user_id = get_jwt_identity()
    records = list_mood_records(user_id, limit=7)

    recs = []
    if records:
        avg_stress = _avg([r["stress"] for r in records])
        avg_energy = _avg([r["energy"] for r in records])
        avg_sleep = _avg([r.get("sleep_hours") for r in records])

        if avg_stress and avg_stress >= 6:
            recs.append({"title": "5-minute breathing exercise", "reason": "recent stress has been higher"})
            recs.append({"title": "Break today's tasks into smaller steps", "reason": "recent stress has been higher"})
        if avg_energy and avg_energy <= 4:
            recs.append({"title": "Take a short break or short walk", "reason": "recent energy has been lower"})
        if avg_sleep and avg_sleep < 6:
            recs.append({"title": "Try a wind-down routine before bed", "reason": "recent sleep has been shorter"})

    if not recs:
        recs = [
            {"title": "Gratitude journaling", "reason": "a gentle way to start reflecting"},
            {"title": "2-minute meditation", "reason": "a quick reset any time of day"},
        ]

    return jsonify({"recommendations": recs[:5]})
