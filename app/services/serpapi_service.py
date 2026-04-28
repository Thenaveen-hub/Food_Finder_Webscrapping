from serpapi import GoogleSearch
from typing import List, Optional
import os

from app.models.schemas import PlaceSchema


SERPAPI_KEY = os.getenv("SERPAPI_KEY", "")


def search_food_places(
    city: str,
    food_query: str,
    min_rating: float = 4.0,
    limit: int = 10,
) -> List[PlaceSchema]:
    """
    Search for food places using SerpAPI Google Maps engine.
    Filters results by minimum rating and returns up to `limit` results.
    """
    if not SERPAPI_KEY:
        raise ValueError("SERPAPI_KEY environment variable is not set.")

    params = {
        "engine": "google_maps",
        "q": f"{food_query} in {city}",
        "type": "search",
        "api_key": SERPAPI_KEY,
    }

    search = GoogleSearch(params)
    results = search.get_dict()

    places: List[PlaceSchema] = []

    if "local_results" not in results:
        return places

    for place in results["local_results"]:
        rating = place.get("rating", 0)
        if rating < min_rating:
            continue

        gps = place.get("gps_coordinates", {})

        places.append(
            PlaceSchema(
                place_id=place.get("place_id") or place.get("data_id", ""),
                title=place.get("title", "Unknown"),
                rating=rating,
                reviews=place.get("reviews", 0),
                address=place.get("address"),
                phone=place.get("phone"),
                website=place.get("website"),
                category=place.get("type"),
                thumbnail=place.get("thumbnail"),
                latitude=gps.get("latitude"),
                longitude=gps.get("longitude"),
                city=city,
                food_query=food_query,
            )
        )

        if len(places) >= limit:
            break

    return places
