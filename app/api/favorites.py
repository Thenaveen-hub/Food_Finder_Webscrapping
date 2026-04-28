from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.schemas import PlaceSchema
from app.models.place import Place

router = APIRouter()


@router.get("/", response_model=List[PlaceSchema])
def get_favorites(db: Session = Depends(get_db)):
    return db.query(Place).filter(Place.is_favorite == True).order_by(Place.saved_at.desc()).all()


@router.post("/{place_id}", response_model=PlaceSchema)
def toggle_favorite(place_id: str, db: Session = Depends(get_db)):
    place = db.query(Place).filter(Place.place_id == place_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
    place.is_favorite = not place.is_favorite
    db.commit()
    db.refresh(place)
    return place


@router.delete("/{place_id}")
def remove_favorite(place_id: str, db: Session = Depends(get_db)):
    place = db.query(Place).filter(Place.place_id == place_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
    place.is_favorite = False
    db.commit()
    return {"detail": "Removed from favorites"}
