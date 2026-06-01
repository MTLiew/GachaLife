from sqlalchemy.orm import Session
from sqlalchemy import select, func
from datetime import datetime, timedelta
import models

CACHE_TTL_HOURS = 6

VALID_TAGS = {
    'Challenge', 'Story', 'Login', 'Login (Limited)', 'Time-Gated', 'Mini-Game',
    'Casual', 'Relaxed', 'Focused', 'Intense', 'Memento', 'Permanent',
    'Permanent (Limited)', 'Recurring'
}

# ── existing event functions ──────────────────────────────────────────────────

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
    db.query(models.Event).filter(models.Event.game == game_id).delete()

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


# ── vote functions ────────────────────────────────────────────────────────────

def get_votes_for_event(db: Session, event_id: str) -> dict[str, int]:
    """Returns a dict of tag -> vote count for a given event."""
    rows = db.execute(
        select(models.Vote.tag, func.count(models.Vote.id).label("count"))
        .where(models.Vote.event_id == event_id)
        .group_by(models.Vote.tag)
    ).all()

    return {row.tag: row.count for row in rows}


def get_user_votes_for_event(db: Session, user_id: str, event_id: str) -> set[str]:
    """Returns the set of tags this user has voted on for a given event."""
    rows = db.execute(
        select(models.Vote.tag)
        .where(models.Vote.user_id == user_id)
        .where(models.Vote.event_id == event_id)
    ).scalars().all()

    return set(rows)


def cast_vote(db: Session, user_id: str, event_id: str, tag: str) -> None:
    """Inserts a vote. Silently does nothing if the vote already exists."""
    existing = db.execute(
        select(models.Vote)
        .where(models.Vote.user_id == user_id)
        .where(models.Vote.event_id == event_id)
        .where(models.Vote.tag == tag)
    ).scalar_one_or_none()

    if existing:
        return

    db.add(models.Vote(user_id=user_id, event_id=event_id, tag=tag))
    db.commit()


def remove_vote(db: Session, user_id: str, event_id: str, tag: str) -> None:
    """Deletes a vote. Silently does nothing if it doesn't exist."""
    db.query(models.Vote).filter(
        models.Vote.user_id == user_id,
        models.Vote.event_id == event_id,
        models.Vote.tag == tag,
    ).delete()
    db.commit()