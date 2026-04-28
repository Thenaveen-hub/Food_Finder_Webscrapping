from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.schemas import SearchRequest, SearchResponse, PlaceSchema
from app.models.search_history import SearchHistory
from app.models.place import Place
from app.services.serpapi_service import search_food_places

router = APIRouter()


@router.post("/", response_model=SearchResponse)
def search(request: SearchRequest, db: Session = Depends(get_db)):
    try:
        places = search_food_places(
            city=request.city,
            food_query=request.food_query,
            min_rating=request.min_rating,
            limit=request.limit,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

    # Save search to history
    history_entry = SearchHistory(
        city=request.city,
        food_query=request.food_query,
        results_count=len(places),
        min_rating=request.min_rating,
    )
    db.add(history_entry)

    # Upsert places into DB
    for place_data in places:
        if place_data.place_id:
            existing = db.query(Place).filter(Place.place_id == place_data.place_id).first()
            if not existing:
                db_place = Place(**place_data.model_dump(exclude={"id", "saved_at", "is_favorite"}))
                db.add(db_place)

    db.commit()

    return SearchResponse(
        query=request.food_query,
        city=request.city,
        total_results=len(places),
        places=places,
    )
