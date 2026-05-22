from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import datetime, timedelta
import models

CACHE_TTL_HOURS = 6

def get_events_from_db(db: Session, game_id: str) -> list[models.Event] | None:
    """Returns events from DB if they exist and are fresh, otherwise None."""
    sample = db.execute(
        select(models.Event)
        .where(models.Event.game == game_id)
        .limit(1)
    ).scalar_one_or_none()

    if sample is None:
        return None

    age = datetime.utcnow() - sample.last_scraped
    if age > timedelta(hours=CACHE_TTL_HOURS):
        return None

    events = db.execute(
        select(models.Event).where(models.Event.game == game_id)
    ).scalars().all()

    return list(events)


def save_events_to_db(db: Session, game_id: str, events: list[dict]):
    """Deletes old events for the game and saves fresh ones."""
    # Delete stale events for this game
    db.query(models.Event).filter(models.Event.game == game_id).delete()

    # Insert fresh events
    for e in events:
        db_event = models.Event(
            id=e["id"],
            title=e["title"],
            game=e["game"],
            start=datetime.fromisoformat(e["start"]),
            end=datetime.fromisoformat(e["end"]),
            url=e.get("url", ""),
            type=e.get("type", "event"),
            last_scraped=datetime.utcnow(),
        )
        db.add(db_event)

    db.commit()


def events_to_dict(events: list[models.Event]) -> list[dict]:
    """Converts SQLAlchemy Event objects to dicts matching our API format."""
    return [
        {
            "id": e.id,
            "title": e.title,
            "game": e.game,
            "start": e.start.isoformat(),
            "end": e.end.isoformat(),
            "url": e.url,
            "type": e.type,
        }
        for e in events
    ]