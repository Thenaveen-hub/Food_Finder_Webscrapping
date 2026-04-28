from sqlalchemy import Column, Integer, String, DateTime, Float
from sqlalchemy.sql import func
from app.db.database import Base


class SearchHistory(Base):
    __tablename__ = "search_history"

    id = Column(Integer, primary_key=True, index=True)
    city = Column(String, nullable=False)
    food_query = Column(String, nullable=False)
    results_count = Column(Integer, default=0)
    min_rating = Column(Float, default=4.0)
    searched_at = Column(DateTime(timezone=True), server_default=func.now())
