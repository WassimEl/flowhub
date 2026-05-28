// ===== DEAL TRACKER MODULE =====
export const DealTracker = {
  wishlist: [],
  deals: [],
  priceHistory: {},

  PLATFORMS: [
    { id: 'steam', name: 'Steam', color: '#1b2838', icon: '🎮' },
    { id: 'gog', name: 'GOG', color: '#86328a', icon: '🎁' },
    { id: 'humble', name: 'Humble', color: '#cb272c', icon: '📦' },
    { id: 'instantgaming', name: 'Instant Gaming', color: '#ff6b00', icon: '💰' },
    { id: 'epic', name: 'Epic Games', color: '#ffffff', icon: '🎯' },
  ],

  MOCK_DEALS: [
    { game: 'Cyberpunk 2077', platform: 'steam', price: 29.99, original: 59.99, discount: 50, endDate: '2026-06-15' },
    { game: 'Elden Ring', platform: 'instantgaming', price: 34.99, original: 59.99, discount: 42, endDate: '2026-06-10' },
    { game: 'Baldur\'s Gate 3', platform: 'gog', price: 44.99, original: 59.99, discount: 25, endDate: '2026-06-20' },
    { game: 'Hogwarts Legacy', platform: 'humble', price: 24.99, original: 49.99, discount: 50, endDate: '2026-06-12' },
    { game: 'Helldivers 2', platform: 'steam', price: 27.99, original: 39.99, discount: 30, endDate: '2026-06-08' },
    { game: 'Lies of P', platform: 'instantgaming', price: 29.99, original: 49.99, discount: 40, endDate: '2026-06-18' },
    { game: 'Spider-Man 2', platform: 'epic', price: 39.99, original: 69.99, discount: 43, endDate: '2026-06-25' },
    { game: 'Alan Wake 2', platform: 'epic', price: 24.99, original: 49.99, discount: 50, endDate: '2026-06-14' },
  ],

  render(container) {
    if (!container) return;
    container.innerHTML = `
      <div class="tool-panel">
        <div class="tool-panel-header">
          <div class="icon">🎮</div>
          <h3>Game Deal Tracker</h3>
          <p>Suivi des promos sur Steam, GOG, Humble Bundle, Instant Gaming et Epic Games.</p>
        </div>
        <div class="deal-toolbar">
          <div class="deal-search">
            <input type="text" class="form-input" id="deal-search" placeholder="🔍 Rechercher un jeu..." oninput="DealTracker.filterDeals()">
          </div>
          <div class="deal-filters">
            <button class="filter-chip active" onclick="DealTracker.setPlatformFilter('all',this)">Tout</button>
            ${this.PLATFORMS.map(p => `<button class="filter-chip" onclick="DealTracker.setPlatformFilter('${p.id}',this)">${p.icon} ${p.name}</button>`).join('')}
          </div>
        </div>
        <div class="deal-section">
          <h4 style="font-family:'Space Grotesk',sans-serif;margin-bottom:16px;">🔥 Promos en cours</h4>
          <div class="deal-grid" id="deal-grid"></div>
        </div>
        <div class="deal-wishlist-section">
          <h4 style="font-family:'Space Grotesk',sans-serif;margin-bottom:16px;">⭐ Ma Wishlist</h4>
          <div class="deal-wishlist-add">
            <input type="text" class="form-input" id="deal-wish-input" placeholder="Ajouter un jeu a surveiller..." onkeydown="if(event.key==='Enter')DealTracker.addToWishlist()">
            <input type="number" class="form-input" id="deal-wish-price" placeholder="Prix max (€)" style="width:120px;" min="0" step="0.01">
            <button class="btn btn-primary" onclick="DealTracker.addToWishlist()">+ Ajouter</button>
          </div>
          <div class="deal-wishlist" id="deal-wishlist"></div>
        </div>
      </div>
    `;
    this.loadFromStorage();
    this.deals = [...this.MOCK_DEALS];
    this.renderDeals();
    this.renderWishlist();
  },

  renderDeals() {
    const grid = document.getElementById('deal-grid');
    if (!grid) return;

    const search = (document.getElementById('deal-search')?.value || '').toLowerCase();
    let filtered = this.deals;
    if (search) filtered = filtered.filter(d => d.game.toLowerCase().includes(search));

    if (filtered.length === 0) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted);">Aucune promo trouvee</div>';
      return;
    }

    grid.innerHTML = filtered.map(d => {
      const platform = this.PLATFORMS.find(p => p.id === d.platform);
      const daysLeft = Math.ceil((new Date(d.endDate) - new Date()) / 86400000);
      return `
        <div class="deal-card">
          <div class="deal-discount">-${d.discount}%</div>
          <div class="deal-game">${d.game}</div>
          <div class="deal-platform" style="color:${platform?.color || 'var(--text-muted)'}">${platform?.icon || '🎮'} ${platform?.name || d.platform}</div>
          <div class="deal-prices">
            <span class="deal-original">${d.original.toFixed(2)}€</span>
            <span class="deal-price">${d.price.toFixed(2)}€</span>
          </div>
          <div class="deal-meta">
            <span class="deal-timer">⏰ ${daysLeft > 0 ? daysLeft + 'j restants' : 'Expire bientot'}</span>
            <button class="btn" style="font-size:11px;padding:4px 10px;" onclick="DealTracker.trackGame('${d.game.replace(/'/g, "\\'")}', ${d.price})">⭐ Suivre</button>
          </div>
        </div>
      `;
    }).join('');
  },

  renderWishlist() {
    const list = document.getElementById('deal-wishlist');
    if (!list) return;

    if (this.wishlist.length === 0) {
      list.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text-muted);font-size:13px;">Ta wishlist est vide. Ajoute des jeux a surveiller !</div>';
      return;
    }

    list.innerHTML = this.wishlist.map(w => {
      const deal = this.deals.find(d => d.game.toLowerCase() === w.game.toLowerCase());
      const isOnSale = deal && deal.price <= w.maxPrice;
      return `
        <div class="deal-wishlist-item ${isOnSale ? 'onsale' : ''}">
          <div class="deal-wishlist-info">
            <div class="deal-wishlist-game">${w.game}</div>
            <div class="deal-wishlist-price">Prix max: ${w.maxPrice.toFixed(2)}€ ${deal ? '| Actuel: ' + deal.price.toFixed(2) + '€' : ''}</div>
          </div>
          <div class="deal-wishlist-status">
            ${isOnSale ? '<span class="deal-alert">🔥 En promo !</span>' : '<span style="color:var(--text-muted)">En attente...</span>'}
            <button class="btn btn-icon" onclick="DealTracker.removeFromWishlist('${w.id}')">🗑</button>
          </div>
        </div>
      `;
    }).join('');
  },

  filterDeals() {
    this.renderDeals();
  },

  setPlatformFilter(platform, btn) {
    document.querySelectorAll('.deal-filters .filter-chip').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    if (platform === 'all') {
      this.deals = [...this.MOCK_DEALS];
    } else {
      this.deals = this.MOCK_DEALS.filter(d => d.platform === platform);
    }
    this.renderDeals();
  },

  addToWishlist() {
    const gameInput = document.getElementById('deal-wish-input');
    const priceInput = document.getElementById('deal-wish-price');
    const game = gameInput.value.trim();
    const maxPrice = parseFloat(priceInput.value);

    if (!game) {
      if (window.App) window.App.showToast('Entre un nom de jeu', 'error');
      return;
    }

    this.wishlist.push({
      id: Date.now().toString(),
      game: game,
      maxPrice: maxPrice || 20,
      added: new Date().toISOString()
    });

    gameInput.value = '';
    priceInput.value = '';
    this.saveToStorage();
    this.renderWishlist();
    if (window.App) window.App.showToast('Jeu ajoute a la wishlist', 'success');
  },

  trackGame(game, currentPrice) {
    const existing = this.wishlist.find(w => w.game.toLowerCase() === game.toLowerCase());
    if (existing) {
      if (window.App) window.App.showToast('Ce jeu est deja dans ta wishlist', 'info');
      return;
    }
    this.wishlist.push({
      id: Date.now().toString(),
      game: game,
      maxPrice: currentPrice,
      added: new Date().toISOString()
    });
    this.saveToStorage();
    this.renderWishlist();
    if (window.App) window.App.showToast('Jeu ajoute a la wishlist', 'success');
  },

  removeFromWishlist(id) {
    this.wishlist = this.wishlist.filter(w => w.id !== id);
    this.saveToStorage();
    this.renderWishlist();
  },

  saveToStorage() {
    const key = window.App?.getStorageKey('deals');
    if (key) localStorage.setItem(key, JSON.stringify({ wishlist: this.wishlist }));
  },

  loadFromStorage() {
    const key = window.App?.getStorageKey('deals');
    if (key) {
      const saved = localStorage.getItem(key);
      if (saved) {
        try { this.wishlist = JSON.parse(saved).wishlist || []; } catch(e) { this.wishlist = []; }
      }
    }
  }
};
