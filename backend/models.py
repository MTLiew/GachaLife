from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)  # Auth0 user ID
    email = Column(String, unique=True, nullable=True)
    display_name = Column(String, nullable=True)
    provider = Column(String, nullable=False)  # "google" or "discord"
    created_at = Column(DateTime, default=datetime.utcnow)

    votes = relationship("Vote", back_populates="user")


class Event(Base):
    __tablename__ = "events"

    id = Column(String, primary_key=True)  # matches our existing event id format
    title = Column(String, nullable=False)
    game = Column(String, nullable=False)
    start = Column(DateTime, nullable=False)
    end = Column(DateTime, nullable=False)
    url = Column(String, nullable=True)
    type = Column(String, nullable=False)
    last_scraped = Column(DateTime, default=datetime.utcnow)

    votes = relationship("Vote", back_populates="event")


class Vote(Base):
    __tablename__ = "votes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    event_id = Column(String, ForeignKey("events.id"), nullable=False)
    tag = Column(String, nullable=False)  # 'Story', 'Challenge', 'Relaxed', 'Time-Gated'
    created_at = Column(DateTime, default=datetime.utcnow)

    # Prevent a user from voting the same tag on the same event twice
    __table_args__ = (
        UniqueConstraint("user_id", "event_id", "tag", name="unique_user_event_tag"),
    )

    user = relationship("User", back_populates="votes")
    event = relationship("Event", back_populates="votes")