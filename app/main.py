from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

from app.db.database import create_tables
from app.api import search, history, favorites


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    yield


app = FastAPI(
    title="FoodFinder API",
    description="Discover top-rated food places powered by Google Maps",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

app.include_router(search.router, prefix="/api/search", tags=["Search"])
app.include_router(history.router, prefix="/api/history", tags=["History"])
app.include_router(favorites.router, prefix="/api/favorites", tags=["Favorites"])


@app.get("/")
async def root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})
