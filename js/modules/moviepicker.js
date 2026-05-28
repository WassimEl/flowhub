// ===== MOVIE PICKER MODULE =====
export const MoviePicker = {
  watchlist: [],
  pickedMovie: null,
  history: [],
  filters: { genres: [], maxDuration: 180, minRating: 0, mood: 'any' },

  GENRES: ['Action', 'Aventure', 'Animation', 'Comedie', 'Crime', 'Documentaire', 'Drame', 'Fantastique', 'Horreur', 'Mystere', 'Romance', 'SF', 'Thriller'],
  MOODS: [
    { id: 'any', label: 'Peu importe', emoji: '🎲' },
    { id: 'chill', label: 'Detente', emoji: '😌' },
    { id: 'excited', label: 'Excitation', emoji: '🤩' },
    { id: 'romantic', label: 'Romantique', emoji: '💕' },
    { id: 'scary', label: 'Frissons', emoji: '😱' },
    { id: 'think', label: 'Reflexion', emoji: '🤔' },
  ],

  MOCK_MOVIES: [
    { title: 'Dune: Part Two', year: 2024, genre: 'SF', duration: 167, rating: 8.5, mood: 'excited', poster: '🌅' },
    { title: 'Oppenheimer', year: 2023, genre: 'Drame', duration: 180, rating: 8.4, mood: 'think', poster: '☢️' },
    { title: 'Poor Things', year: 2023, genre: 'Comedie', duration: 141, rating: 7.9, mood: 'think', poster: '🧠' },
    { title: 'The Zone of Interest', year: 2023, genre: 'Drame', duration: 105, rating: 7.4, mood: 'think', poster: '🏠' },
    { title: 'Anatomy of a Fall', year: 2023, genre: 'Crime', duration: 152, rating: 7.6, mood: 'think', poster: '⚖️' },
    { title: 'Spider-Man: Across the Spider-Verse', year: 2023, genre: 'Animation', duration: 140, rating: 8.6, mood: 'excited', poster: '🕷️' },
    { title: 'Barbie', year: 2023, genre: 'Comedie', duration: 114, rating: 6.9, mood: 'chill', poster: '💅' },
    { title: 'Killers of the Flower Moon', year: 2023, genre: 'Crime', duration: 206, rating: 7.6, mood: 'think', poster: '🌙' },
    { title: 'Past Lives', year: 2023, genre: 'Romance', duration: 105, rating: 7.9, mood: 'romantic', poster: '💫' },
    { title: 'The Holdovers', year: 2023, genre: 'Comedie', duration: 133, rating: 7.9, mood: 'chill', poster: '🎓' },
    { title: 'Anora', year: 2024, genre: 'Romance', duration: 139, rating: 8.1, mood: 'romantic', poster: '💍' },
    { title: 'Nosferatu', year: 2024, genre: 'Horreur', duration: 132, rating: 7.5, mood: 'scary', poster: '🧛' },
    { title: 'Wicked', year: 2024, genre: 'Aventure', duration: 160, rating: 7.7, mood: 'excited', poster: '🧙' },
    { title: 'Furiosa', year: 2024, genre: 'Action', duration: 148, rating: 7.5, mood: 'excited', poster: '🏜️' },
    { title: 'Inside Out 2', year: 2024, genre: 'Animation', duration: 96, rating: 7.6, mood: 'chill', poster: '😊' },
  ],

  render(container) {
    if (!container) return;
    container.innerHTML = `
      <div class="tool-panel">
        <div class="tool-panel-header">
          <div class="icon">🎬</div>
          <h3>Movie Night Picker</h3>
          <p>Tire au sort un film depuis ta watchlist avec filtres intelligents.</p>
        </div>
        <div class="movie-import-section">
          <h4 style="font-family:'Space Grotesk',sans-serif;margin-bottom:12px;">📥 Import Watchlist</h4>
          <div class="movie-import-options">
            <div class="movie-import-option">
              <div class="movie-import-icon">📁</div>
              <div class="movie-import-text">
                <div class="movie-import-title">Upload CSV Letterboxd</div>
                <div class="movie-import-desc">Exporte ta watchlist depuis Letterboxd Settings > Export Data</div>
              </div>
              <input type="file" id="movie-csv" accept=".csv" style="display:none" onchange="MoviePicker.handleCSV(this)">
              <button class="btn" onclick="document.getElementById('movie-csv').click()">Uploader</button>
            </div>
            <div class="movie-import-option">
              <div class="movie-import-icon">🌐</div>
              <div class="movie-import-text">
                <div class="movie-import-title">Profil Letterboxd</div>
                <div class="movie-import-desc">Entre ton nom d'utilisateur Letterboxd</div>
              </div>
              <div style="display:flex;gap:8px;">
                <input type="text" class="form-input" id="movie-username" placeholder="username" style="width:150px;">
                <button class="btn" onclick="MoviePicker.loadFromLetterboxd()">Charger</button>
              </div>
            </div>
            <div class="movie-import-option">
              <div class="movie-import-icon">🎲</div>
              <div class="movie-import-text">
                <div class="movie-import-title">Demo Movies</div>
                <div class="movie-import-desc">Charge une liste de films exemple</div>
              </div>
              <button class="btn" onclick="MoviePicker.loadDemo()">Charger Demo</button>
            </div>
          </div>
        </div>
        <div class="movie-filters">
          <h4 style="font-family:'Space Grotesk',sans-serif;margin-bottom:12px;">🎛️ Filtres</h4>
          <div class="movie-filter-row">
            <div class="movie-filter-group">
              <label class="form-label">Genres</label>
              <div class="movie-genre-chips">
                ${this.GENRES.map(g => `<button class="filter-chip" onclick="MoviePicker.toggleGenre('${g}',this)">${g}</button>`).join('')}
              </div>
            </div>
            <div class="movie-filter-group">
              <label class="form-label">Humeur</label>
              <select class="form-select" id="movie-mood" onchange="MoviePicker.setMood(this.value)">
                ${this.MOODS.map(m => `<option value="${m.id}">${m.emoji} ${m.label}</option>`).join('')}
              </select>
            </div>
            <div class="movie-filter-group">
              <label class="form-label">Duree max (min)</label>
              <input type="range" class="form-input" id="movie-duration" min="60" max="240" value="180" oninput="document.getElementById('movie-dur-val').textContent=this.value+' min'">
              <span id="movie-dur-val" style="color:var(--text-muted);font-size:12px;">180 min</span>
            </div>
            <div class="movie-filter-group">
              <label class="form-label">Note min</label>
              <input type="range" class="form-input" id="movie-rating" min="0" max="10" step="0.1" value="0" oninput="document.getElementById('movie-rat-val').textContent=this.value">
              <span id="movie-rat-val" style="color:var(--text-muted);font-size:12px;">0</span>
            </div>
          </div>
        </div>
        <div class="movie-picker-action">
          <button class="btn btn-primary movie-pick-btn" onclick="MoviePicker.pickMovie()">🎲 Tirer au sort</button>
        </div>
        <div class="movie-result" id="movie-result" style="display:none;">
          <div class="movie-card" id="movie-card"></div>
        </div>
        <div class="movie-watchlist">
          <h4 style="font-family:'Space Grotesk',sans-serif;margin-bottom:12px;">📋 Ma Watchlist (${this.watchlist.length})</h4>
          <div class="movie-list" id="movie-list"></div>
        </div>
        <div class="movie-history">
          <h4 style="font-family:'Space Grotesk',sans-serif;margin-bottom:12px;">🕐 Historique des soirees</h4>
          <div class="movie-history-list" id="movie-history-list"></div>
        </div>
      </div>
    `;
    this.loadFromStorage();
    this.renderWatchlist();
    this.renderHistory();
  },

  handleCSV(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const lines = e.target.result.split('\n').slice(1);
      lines.forEach(line => {
        const cols = line.split(',');
        if (cols[1]) {
          this.watchlist.push({
            id: Date.now().toString() + Math.random(),
            title: cols[1].replace(/"/g, '').trim(),
            year: parseInt(cols[2]) || 2024,
            genre: cols[5]?.replace(/"/g, '').trim() || 'Inconnu',
            duration: parseInt(cols[4]) || 120,
            rating: parseFloat(cols[6]) || 7.0,
            mood: 'any',
            poster: '🎬'
          });
        }
      });
      this.saveToStorage();
      this.renderWatchlist();
      if (window.App) window.App.showToast(`${this.watchlist.length} films importes`, 'success');
    };
    reader.readAsText(file);
  },

  loadFromLetterboxd() {
    const username = document.getElementById('movie-username').value.trim();
    if (!username) {
      if (window.App) window.App.showToast('Entre un nom d\'utilisateur', 'error');
      return;
    }
    // Simulate loading from Letterboxd
    if (window.App) window.App.showToast('Chargement depuis Letterboxd... (demo)', 'info');
    this.loadDemo();
  },

  loadDemo() {
    this.watchlist = [...this.MOCK_MOVIES.map(m => ({ ...m, id: Date.now().toString() + Math.random() }))];
    this.saveToStorage();
    this.renderWatchlist();
    if (window.App) window.App.showToast('Demo chargee : 15 films', 'success');
  },

  toggleGenre(genre, btn) {
    btn.classList.toggle('active');
    if (this.filters.genres.includes(genre)) {
      this.filters.genres = this.filters.genres.filter(g => g !== genre);
    } else {
      this.filters.genres.push(genre);
    }
  },

  setMood(mood) {
    this.filters.mood = mood;
  },

  pickMovie() {
    if (this.watchlist.length === 0) {
      if (window.App) window.App.showToast('Ta watchlist est vide. Importe des films d\'abord.', 'error');
      return;
    }

    const maxDuration = parseInt(document.getElementById('movie-duration')?.value) || 180;
    const minRating = parseFloat(document.getElementById('movie-rating')?.value) || 0;

    let candidates = this.watchlist.filter(m => {
      if (m.duration > maxDuration) return false;
      if (m.rating < minRating) return false;
      if (this.filters.genres.length > 0 && !this.filters.genres.includes(m.genre)) return false;
      if (this.filters.mood !== 'any' && m.mood !== this.filters.mood && m.mood !== 'any') return false;
      return true;
    });

    if (candidates.length === 0) {
      candidates = this.watchlist;
    }

    // Weighted random (higher rating = more chance)
    const totalWeight = candidates.reduce((sum, m) => sum + m.rating, 0);
    let random = Math.random() * totalWeight;
    let picked = candidates[0];
    for (const m of candidates) {
      random -= m.rating;
      if (random <= 0) { picked = m; break; }
    }

    this.pickedMovie = picked;
    this.history.unshift({ movie: picked, date: new Date().toISOString() });
    if (this.history.length > 20) this.history.pop();
    this.saveToStorage();
    this.renderResult(picked);
    this.renderHistory();
  },

  renderResult(movie) {
    const result = document.getElementById('movie-result');
    const card = document.getElementById('movie-card');
    if (!result || !card) return;

    result.style.display = 'block';
    card.innerHTML = `
      <div class="movie-poster">${movie.poster}</div>
      <div class="movie-info">
        <div class="movie-title">${movie.title}</div>
        <div class="movie-meta">
          <span class="movie-year">${movie.year}</span>
          <span class="movie-genre">${movie.genre}</span>
          <span class="movie-duration">⏱ ${movie.duration} min</span>
          <span class="movie-rating">⭐ ${movie.rating}</span>
        </div>
        <div class="movie-actions">
          <button class="btn btn-primary" onclick="MoviePicker.watchMovie()">✅ Marquer comme vu</button>
          <button class="btn" onclick="MoviePicker.pickMovie()">🎲 Re-tirer</button>
        </div>
      </div>
    `;

    // Scroll to result
    result.scrollIntoView({ behavior: 'smooth' });
  },

  watchMovie() {
    if (!this.pickedMovie) return;
    this.watchlist = this.watchlist.filter(m => m.id !== this.pickedMovie.id);
    this.saveToStorage();
    this.renderWatchlist();
    if (window.App) window.App.showToast('Film marque comme vu', 'success');
  },

  renderWatchlist() {
    const list = document.getElementById('movie-list');
    if (!list) return;

    const count = document.querySelector('.movie-watchlist h4');
    if (count) count.textContent = `📋 Ma Watchlist (${this.watchlist.length})`;

    if (this.watchlist.length === 0) {
      list.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text-muted);">Ta watchlist est vide</div>';
      return;
    }

    list.innerHTML = this.watchlist.map(m => `
      <div class="movie-list-item">
        <span class="movie-list-poster">${m.poster}</span>
        <span class="movie-list-title">${m.title}</span>
        <span class="movie-list-meta">${m.year} • ${m.genre} • ${m.duration}min • ⭐${m.rating}</span>
        <button class="btn btn-icon" onclick="MoviePicker.removeMovie('${m.id}')">🗑</button>
      </div>
    `).join('');
  },

  removeMovie(id) {
    this.watchlist = this.watchlist.filter(m => m.id !== id);
    this.saveToStorage();
    this.renderWatchlist();
  },

  renderHistory() {
    const list = document.getElementById('movie-history-list');
    if (!list) return;

    if (this.history.length === 0) {
      list.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-muted);font-size:13px;">Aucune soiree enregistree</div>';
      return;
    }

    list.innerHTML = this.history.slice(0, 10).map(h => `
      <div class="movie-history-item">
        <span class="movie-history-poster">${h.movie.poster}</span>
        <div class="movie-history-info">
          <div class="movie-history-title">${h.movie.title}</div>
          <div class="movie-history-date">${new Date(h.date).toLocaleDateString('fr-FR')}</div>
        </div>
      </div>
    `).join('');
  },

  saveToStorage() {
    const key = window.App?.getStorageKey('movies');
    if (key) {
      localStorage.setItem(key, JSON.stringify({
        watchlist: this.watchlist,
        history: this.history
      }));
    }
  },

  loadFromStorage() {
    const key = window.App?.getStorageKey('movies');
    if (key) {
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          this.watchlist = data.watchlist || [];
          this.history = data.history || [];
        } catch(e) {}
      }
    }
  }
};
