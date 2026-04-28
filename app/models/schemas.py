from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class SearchRequest(BaseModel):
    city: str
    food_query: str
    min_rating: float = 4.0
    limit: int = 10


class PlaceSchema(BaseModel):
    id: Optional[int] = None
    place_id: Optional[str] = None
    title: str
    rating: float
    reviews: Optional[int] = 0
    address: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    category: Optional[str] = None
    thumbnail: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    city: Optional[str] = None
    food_query: Optional[str] = None
    is_favorite: Optional[bool] = False
    saved_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SearchHistorySchema(BaseModel):
    id: int
    city: str
    food_query: str
    results_count: int
    min_rating: float
    searched_at: datetime

    class Config:
        from_attributes = True


class SearchResponse(BaseModel):
    query: str
    city: str
    total_results: int
    places: List[PlaceSchema]
    cached: bool = False
