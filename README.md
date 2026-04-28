# 🍜 FoodFinder

**Discover top-rated restaurants and eateries powered by Google Maps via SerpAPI.**

FoodFinder is a full-stack web application built with FastAPI that lets you search for food places in any city, filter by minimum rating, save favourites, and review your search history — all from a polished dark-themed UI.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔍 Smart Search | Search any food in any city with Google Maps results |
| ⭐ Rating Filter | Adjustable minimum rating slider (1–5 stars) |
| 💾 DB Storage | All searches and places saved to SQLite automatically |
| ❤️ Favourites | Bookmark places and view them anytime |
| 🕘 Search History | Full history with one-click re-run |
| 📱 Responsive UI | Works on desktop and mobile |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | [FastAPI](https://fastapi.tiangolo.com/) — async Python web framework |
| **Database** | [SQLite](https://www.sqlite.org/) via [SQLAlchemy](https://www.sqlalchemy.org/) ORM |
| **Scraping** | [SerpAPI](https://serpapi.com/) — Google Maps search engine |
| **Templating** | [Jinja2](https://jinja.palletsprojects.com/) server-rendered HTML |
| **Frontend** | Vanilla JS + CSS (no build step required) |
| **Server** | [Uvicorn](https://www.uvicorn.org/) ASGI server |
| **Validation** | [Pydantic v2](https://docs.pydantic.dev/latest/) schemas |

---
## 📸 Screenshots

<p align="center">
  <img src="screenshots/search.png" width="45%" />
  <img src="screenshots/resultspage.png" width="45%" />
</p>

## 📁 Project Structure

```
food-finder/
├── app/
│   ├── __init__.py
│   ├── main.py               # FastAPI app, routes, lifespan
│   ├── api/
│   │   ├── search.py         # POST /api/search/
│   │   ├── history.py        # GET/DELETE /api/history/
│   │   └── favorites.py      # GET/POST/DELETE /api/favorites/
│   ├── db/
│   │   └── database.py       # SQLAlchemy engine, session, base
│   ├── models/
│   │   ├── place.py          # Place ORM model
│   │   ├── search_history.py # SearchHistory ORM model
│   │   └── schemas.py        # Pydantic request/response schemas
│   └── services/
│       └── serpapi_service.py # SerpAPI Google Maps integration
├── static/
│   ├── css/style.css         # Full UI stylesheet
│   └── js/app.js             # Frontend logic
├── templates/
│   └── index.html            # Main HTML template
├── .env.example              # Environment variable template
├── requirements.txt
├── run.py                    # Local dev server entry point
└── README.md
```

---

## ⚙️ Setup & Installation

### 1. Prerequisites

- Python **3.10+**
- Python 3.11 (Recommended)
- A free [SerpAPI](https://serpapi.com/) account (100 free searches/month)

### 2. Clone / Download

```bash
# If using git
git clone <https://github.com/Thenaveen-hub/Food_Finder_Webscrapping>
cd food-finder

# Or unzip the downloaded archive
unzip food-finder.zip
cd food-finder
```

### 3. Create a virtual environment

```bash
py -3.11 -m venv venv
python -m venv venv


# Activate on Windows
venv\Scripts\activate
```

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

### 5. Configure your API key

```bash
# Create the .env file
cp .env

# Open .env and add your SerpAPI key
SERPAPI_KEY=your_actual_key_here
```

> **Get your free SerpAPI key at:** https://serpapi.com/manage-api-key

### 6. Run the application

```bash
python run.py
```

The app will start at **http://localhost:8000**

---

## 🚀 API Reference

Once running, full interactive docs are available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Endpoints

#### `POST /api/search/`
Search for food places.
```json
{
  "city": "Hyderabad",
  "food_query": "biryani",
  "min_rating": 4.0,
  "limit": 10
}
```

#### `GET /api/history/`
Retrieve the last N searches (default 20).

#### `DELETE /api/history/`
Clear all search history.

#### `GET /api/favorites/`
Get all bookmarked places.

#### `POST /api/favorites/{place_id}`
Toggle a place's favourite status.

---

## 🗄️ Database

The app uses **SQLite** by default — a `foodfinder.db` file is created automatically on first run in the project root. No setup needed.

To use **PostgreSQL** instead, set:
```env
DATABASE_URL=postgresql://user:password@localhost/foodfinder
```
And install: `pip install psycopg2-binary`

---

## 🔑 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `SERPAPI_KEY` | ✅ Yes | Your SerpAPI key |
| `DATABASE_URL` | ❌ No | DB connection string (defaults to SQLite) |

---

## 📝 Notes

- SerpAPI free plan: **250 searches/month**. Results are stored in the DB so re-running the same search won't fetch duplicate place records.
- The app stores all returned places in SQLite; toggling favourites works on stored places.
- The `place_id` field comes from Google Maps' internal IDs via SerpAPI.
