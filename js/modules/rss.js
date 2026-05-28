// ===== RSS TRACKER MODULE =====
export const RSSTracker = {
  feeds: [
    { id: 'lol', name: 'League of Legends', url: 'https://www.leagueoflegends.com/fr-fr/news/game-updates/rss.xml', icon: '⚔️', category: 'gaming' },
    { id: 'steam', name: 'Steam Updates', url: 'https://store.steampowered.com/feeds/news.xml', icon: '🎮', category: 'gaming' },
    { id: 'instantgaming', name: 'Instant Gaming Deals', url: 'https://www.instant-gaming.com/fr/rss/', icon: '💰', category: 'deals' },
    { id: 'gog', name: 'GOG Deals', url: 'https://www.gog.com/rss', icon: '💿', category: 'deals' },
    { id: 'humble', name: 'Humble Bundle', url: 'https://blog.humblebundle.com/rss', icon: '📦', category: 'deals' },
  ],
  items: [],
  readItems: new Set(),
  favorites: new Set(),
  currentFilter: 'all',

  render(container) {
    if (!container) return;
    container.innerHTML = `
      <div class="tool-panel">
        <div class="tool-panel-header">
          <div class="icon">📡</div>
          <h3>RSS Tracker</h3>
          <p>Agrégateur de flux RSS personnalisable. Patch notes, deals et promos en temps réel.</p>
        </div>
        <div style="display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap;">
          <button class="btn ${this.currentFilter === 'all' ? 'active' : ''}" onclick="RSSTracker.setFilter('all')">Tout</button>
          <button class="btn ${this.currentFilter === 'gaming' ? 'active' : ''}" onclick="RSSTracker.setFilter('gaming')">🎮 Gaming</button>
          <button class="btn ${this.currentFilter === 'deals' ? 'active' : ''}" onclick="RSSTracker.setFilter('deals')">💰 Deals</button>
          <button class="btn ${this.currentFilter === 'favorites' ? 'active' : ''}" onclick="RSSTracker.setFilter('favorites')">⭐ Favoris</button>
          <button class="btn ${this.currentFilter === 'unread' ? 'active' : ''}" onclick="RSSTracker.setFilter('unread')">🔔 Non lus</button>
        </div>
        <div id="rss-feed-list" style="display:flex;flex-direction:column;gap:12px;">
          <div class="empty-state"><div class="empty-state-icon">📡</div><div>Chargement des flux RSS...</div></div>
        </div>
      </div>
    `;
    this.loadFeeds();
  },

  async loadFeeds() {
    const list = document.getElementById('rss-feed-list');
    if (!list) return;

    const savedRead = localStorage.getItem('flowboard_rss_read');
    const savedFav = localStorage.getItem('flowboard_rss_favorites');
    if (savedRead) this.readItems = new Set(JSON.parse(savedRead));
    if (savedFav) this.favorites = new Set(JSON.parse(savedFav));

    const demoItems = [
      { id: '1', title: 'Patch 14.10 — Équilibrage des champions', source: 'League of Legends', date: new Date().toISOString(), category: 'gaming', url: '#', isNew: true },
      { id: '2', title: 'Steam Summer Sale 2026 — Jusqu'à -90%', source: 'Steam Updates', date: new Date(Date.now() - 86400000).toISOString(), category: 'deals', url: '#', isNew: true },
      { id: '3', title: 'Elden Ring à -50% sur Instant Gaming', source: 'Instant Gaming Deals', date: new Date(Date.now() - 172800000).toISOString(), category: 'deals', url: '#', isNew: false },
      { id: '4', title: 'Nouveau champion : Aurora, la Sorcière du Nord', source: 'League of Legends', date: new Date(Date.now() - 259200000).toISOString(), category: 'gaming', url: '#', isNew: false },
      { id: '5', title: 'Humble Choice Juin 2026 disponible', source: 'Humble Bundle', date: new Date(Date.now() - 345600000).toISOString(), category: 'deals', url: '#', isNew: false },
    ];

    this.items = demoItems;
    this.renderItems();
  },

  renderItems() {
    const list = document.getElementById('rss-feed-list');
    if (!list) return;

    let filtered = this.items;
    if (this.currentFilter === 'gaming') filtered = this.items.filter(i => i.category === 'gaming');
    else if (this.currentFilter === 'deals') filtered = this.items.filter(i => i.category === 'deals');
    else if (this.currentFilter === 'favorites') filtered = this.items.filter(i => this.favorites.has(i.id));
    else if (this.currentFilter === 'unread') filtered = this.items.filter(i => !this.readItems.has(i.id));

    if (filtered.length === 0) {
      list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📭</div><div>Aucun article dans cette catégorie</div></div>';
      return;
    }

    list.innerHTML = filtered.map(item => {
      const isRead = this.readItems.has(item.id);
      const isFav = this.favorites.has(item.id);
      const dateStr = new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

      return `
        <div class="rss-item ${isRead ? 'read' : ''}" id="rss-item-${item.id}" style="background:var(--bg-primary);border:1px solid var(--border);border-radius:var(--radius-sm);padding:14px;transition:all 0.2s;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
            <div style="flex:1;">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                ${item.isNew && !isRead ? '<span style="background:var(--red);color:white;font-size:10px;padding:2px 6px;border-radius:4px;font-weight:600;">NEW</span>' : ''}
                <span style="font-size:11px;color:var(--text-muted);font-family:'JetBrains Mono',monospace;">${item.source}</span>
                <span style="font-size:11px;color:var(--text-muted);">• ${dateStr}</span>
              </div>
              <div style="font-weight:600;font-size:14px;${isRead ? 'color:var(--text-muted);' : ''}">${item.title}</div>
            </div>
            <div style="display:flex;gap:4px;flex-shrink:0;">
              <button class="task-btn" onclick="RSSTracker.toggleFavorite('${item.id}')" title="${isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}">${isFav ? '⭐' : '☆'}</button>
              <button class="task-btn" onclick="RSSTracker.markRead('${item.id}')" title="Marquer comme lu">${isRead ? '👁' : '👁‍🗨'}</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  setFilter(filter) {
    this.currentFilter = filter;
    this.render(document.getElementById('tool-rss'));
  },

  markRead(id) {
    if (this.readItems.has(id)) this.readItems.delete(id);
    else this.readItems.add(id);
    localStorage.setItem('flowboard_rss_read', JSON.stringify([...this.readItems]));
    this.renderItems();
  },

  toggleFavorite(id) {
    if (this.favorites.has(id)) this.favorites.delete(id);
    else this.favorites.add(id);
    localStorage.setItem('flowboard_rss_favorites', JSON.stringify([...this.favorites]));
    this.renderItems();
  }
};
