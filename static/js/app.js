/* ── FoodFinder App JS ── */

// Tab navigation
const navBtns = document.querySelectorAll('.nav-btn');
const tabContents = document.querySelectorAll('.tab-content');

navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;
    navBtns.forEach(b => b.classList.remove('active'));
    tabContents.forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`tab-${target}`).classList.add('active');

    if (target === 'favorites') loadFavorites();
    if (target === 'history') loadHistory();
  });
});

// Rating slider
const slider = document.getElementById('rating-slider');
const ratingDisplay = document.getElementById('rating-display');
slider.addEventListener('input', () => {
  ratingDisplay.textContent = parseFloat(slider.value).toFixed(1);
});

// Search
const searchBtn = document.getElementById('search-btn');
const btnLabel = searchBtn.querySelector('.btn-label');
const btnSpinner = searchBtn.querySelector('.btn-spinner');
const errorBox = document.getElementById('error-box');

// ✅ FIX: wrap in arrow function so MouseEvent is never passed as 'city'
searchBtn.addEventListener('click', () => runSearch());

document.getElementById('food-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') runSearch();
});
document.getElementById('city-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') runSearch();
});

async function runSearch(city, food, minRating) {
  // ✅ FIX: typeof checks so MouseEvent / undefined don't leak in
  const cityVal = (typeof city === 'string' && city) ? city : document.getElementById('city-input').value.trim();
  const foodVal = (typeof food === 'string' && food) ? food : document.getElementById('food-input').value.trim();
  const ratingVal = (typeof minRating === 'number') ? minRating : parseFloat(slider.value);
  const limitVal = parseInt(document.getElementById('limit-select').value);

  if (!cityVal || !foodVal) {
    showError('Please enter both a city and food type.');
    return;
  }

  setLoading(true);
  hideError();

  try {
    const res = await fetch('/api/search/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        city: cityVal,
        food_query: foodVal,
        min_rating: ratingVal,
        limit: limitVal,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      // ✅ FIX: FastAPI 422 returns detail as array of objects, not a plain string
      let msg = 'Search failed.';
      if (err.detail) {
        if (typeof err.detail === 'string') {
          msg = err.detail;
        } else if (Array.isArray(err.detail)) {
          msg = err.detail.map(e => (e.loc ? e.loc.slice(-1)[0] + ': ' : '') + e.msg).join(', ');
        }
      }
      throw new Error(msg);
    }

    const data = await res.json();
    renderResults(data);

    document.getElementById('tab-search').classList.add('active');
    navBtns.forEach(b => b.classList.remove('active'));
    document.querySelector('[data-tab="search"]').classList.add('active');
  } catch (e) {
    showError(e.message);
  } finally {
    setLoading(false);
  }
}

function setLoading(loading) {
  searchBtn.disabled = loading;
  btnLabel.classList.toggle('hidden', loading);
  btnSpinner.classList.toggle('hidden', !loading);
}

function showError(msg) {
  errorBox.textContent = `⚠️  ${msg}`;
  errorBox.classList.remove('hidden');
}

function hideError() {
  errorBox.classList.add('hidden');
}

// Render search results
function renderResults(data) {
  const section = document.getElementById('results-section');
  const title = document.getElementById('results-title');
  const count = document.getElementById('results-count');
  const grid = document.getElementById('cards-grid');

  title.textContent = `${data.food_query || data.query} in ${data.city}`;
  count.textContent = `${data.total_results} result${data.total_results !== 1 ? 's' : ''}`;
  section.style.display = 'block';

  if (data.places.length === 0) {
    grid.innerHTML = '<div class="empty-state">No places found matching your criteria. Try lowering the minimum rating.</div>';
    return;
  }

  grid.innerHTML = data.places.map((p, i) => buildCard(p, i)).join('');
  attachFavListeners(grid);
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function buildCard(place, index) {
  const delay = index * 0.06;
  const thumb = place.thumbnail
    ? `<img class="card-thumb" src="${esc(place.thumbnail)}" alt="${esc(place.title)}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" /><div class="card-thumb-placeholder" style="display:none">🍽️</div>`
    : `<div class="card-thumb-placeholder">🍽️</div>`;

  const favIcon = place.is_favorite ? '❤️' : '🤍';

  return `
  <div class="place-card" style="animation-delay:${delay}s">
    ${thumb}
    <div class="card-body">
      <div class="card-title-row">
        <div class="card-name">${esc(place.title)}</div>
        <button class="fav-btn" data-place-id="${esc(place.place_id || '')}" data-fav="${place.is_favorite ? 'true' : 'false'}" title="Save to favourites">${favIcon}</button>
      </div>
      <div class="card-rating">
        <span class="rating-badge">⭐ ${place.rating}</span>
        ${place.reviews ? `<span class="reviews-text">${place.reviews.toLocaleString()} reviews</span>` : ''}
      </div>
      <div class="card-meta">
        ${place.address ? `<div class="meta-row"><span class="meta-icon">📍</span><span>${esc(place.address)}</span></div>` : ''}
        ${place.phone ? `<div class="meta-row"><span class="meta-icon">📞</span><span>${esc(place.phone)}</span></div>` : ''}
      </div>
      ${place.category ? `<span class="card-category">${esc(place.category)}</span>` : ''}
      ${place.website ? `<a class="card-link" href="${esc(place.website)}" target="_blank" rel="noopener">🌐 Visit website ↗</a>` : ''}
    </div>
  </div>`;
}

function attachFavListeners(container) {
  container.querySelectorAll('.fav-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const placeId = btn.dataset.placeId;
      if (!placeId) return;
      try {
        const res = await fetch(`/api/favorites/${encodeURIComponent(placeId)}`, { method: 'POST' });
        if (!res.ok) throw new Error();
        const updated = await res.json();
        btn.textContent = updated.is_favorite ? '❤️' : '🤍';
        btn.dataset.fav = updated.is_favorite ? 'true' : 'false';
      } catch {
        console.error('Could not toggle favorite');
      }
    });
  });
}

// Favorites
async function loadFavorites() {
  const grid = document.getElementById('favorites-grid');
  grid.innerHTML = '<div class="empty-state">Loading...</div>';
  try {
    const res = await fetch('/api/favorites/');
    const data = await res.json();
    if (data.length === 0) {
      grid.innerHTML = '<div class="empty-state">No favourites yet. Search and bookmark places! 🔖</div>';
      return;
    }
    grid.innerHTML = data.map((p, i) => buildCard(p, i)).join('');
    attachFavListeners(grid);
  } catch {
    grid.innerHTML = '<div class="empty-state">Failed to load favourites.</div>';
  }
}

// History
async function loadHistory() {
  const list = document.getElementById('history-list');
  list.innerHTML = '<div class="empty-state">Loading...</div>';
  try {
    const res = await fetch('/api/history/');
    const data = await res.json();
    if (data.length === 0) {
      list.innerHTML = '<div class="empty-state">No searches yet. Start exploring!</div>';
      return;
    }
    list.innerHTML = data.map(h => buildHistoryItem(h)).join('');
    list.querySelectorAll('.history-rerun').forEach(btn => {
      btn.addEventListener('click', e => {
        const item = e.target.closest('.history-item');
        const city = item.dataset.city;
        const food = item.dataset.food;
        const rating = parseFloat(item.dataset.rating);
        navBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(t => t.classList.remove('active'));
        document.querySelector('[data-tab="search"]').classList.add('active');
        document.getElementById('tab-search').classList.add('active');
        document.getElementById('city-input').value = city;
        document.getElementById('food-input').value = food;
        slider.value = rating;
        ratingDisplay.textContent = rating.toFixed(1);
        runSearch(city, food, rating);
      });
    });
  } catch {
    list.innerHTML = '<div class="empty-state">Failed to load history.</div>';
  }
}

function buildHistoryItem(h) {
  const date = new Date(h.searched_at).toLocaleString();
  return `
  <div class="history-item" data-city="${esc(h.city)}" data-food="${esc(h.food_query)}" data-rating="${h.min_rating}">
    <div class="history-main">
      <div class="history-query">${esc(h.food_query)} in ${esc(h.city)}</div>
      <div class="history-meta">
        <span>⭐ ${h.min_rating}+ rating</span>
        <span>${h.results_count} results</span>
        <span>${date}</span>
      </div>
    </div>
    <button class="history-rerun">Search again</button>
  </div>`;
}

document.getElementById('clear-history-btn').addEventListener('click', async () => {
  if (!confirm('Clear all search history?')) return;
  try {
    await fetch('/api/history/', { method: 'DELETE' });
    loadHistory();
  } catch {
    alert('Failed to clear history.');
  }
});

// Utility
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}