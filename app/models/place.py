from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text
from sqlalchemy.sql import func
from app.db.database import Base


class Place(Base):
    __tablename__ = "places"

    id = Column(Integer, primary_key=True, index=True)
    place_id = Column(String, unique=True, index=True)
    title = Column(String, nullable=False)
    rating = Column(Float, default=0.0)
    reviews = Column(Integer, default=0)
    address = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    website = Column(String, nullable=True)
    category = Column(String, nullable=True)
    thumbnail = Column(Text, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    city = Column(String, nullable=True)
    food_query = Column(String, nullable=True)
    is_favorite = Column(Boolean, default=False)
    saved_at = Column(DateTime(timezone=True), server_default=func.now())
