from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.schemas import SearchHistorySchema
from app.models.search_history import SearchHistory

router = APIRouter()


@router.get("/", response_model=List[SearchHistorySchema])
def get_history(
    limit: int = Query(default=20, le=100),
    db: Session = Depends(get_db),
):
    return (
        db.query(SearchHistory)
        .order_by(SearchHistory.searched_at.desc())
        .limit(limit)
        .all()
    )


@router.delete("/{history_id}")
def delete_history(history_id: int, db: Session = Depends(get_db)):
    entry = db.query(SearchHistory).filter(SearchHistory.id == history_id).first()
    if not entry:
        return {"detail": "Not found"}
    db.delete(entry)
    db.commit()
    return {"detail": "Deleted"}


@router.delete("/")
def clear_history(db: Session = Depends(get_db)):
    db.query(SearchHistory).delete()
    db.commit()
    return {"detail": "History cleared"}
