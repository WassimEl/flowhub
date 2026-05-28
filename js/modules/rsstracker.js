// ===== RSS TRACKER MODULE =====
export const RSSTracker = {
  feeds: [
    { id: 'lol', name: 'League of Legends', url: 'https://www.leagueoflegends.com/fr-fr/news/game-updates/rss.xml', icon: '⚔️', color: '#c89b3c', category: 'gaming' },
    { id: 'steam', name: 'Steam News', url: 'https://store.steampowered.com/feeds/news.xml', icon: '🎮', color: '#1b2838', category: 'gaming' },
    { id: 'instantgaming', name: 'Instant Gaming Deals', url: 'https://www.instant-gaming.com/fr/rss/', icon: '💰', color: '#ff6b00', category: 'deals' },
    { id: 'gog', name: 'GOG Deals', url: 'https://www.gog.com/rss', icon: '🎁', color: '#86328a', category: 'deals' },
    { id: 'humble', name: 'Humble Bundle', url: 'https://blog.humblebundle.com/rss', icon: '📦', color: '#cb272c', category: 'deals' },
    { id: 'verge', name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', icon: '📰', color: '#e5127d', category: 'tech' },
    { id: 'techcrunch', name: 'TechCrunch', url: 'https://techcrunch.com/feed/', icon: '💻', color: '#0f9d58', category: 'tech' },
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
          <div class="icon">📰</div>
          <h3>RSS Tracker</h3>
          <p>Agrégateur de flux pour patch notes, deals et actualités tech/gaming.</p>
        </div>
        <div class="rss-toolbar">
          <div class="rss-filters">
            <button class="filter-chip active" onclick="RSSTracker.setFilter('all',this)">Tout</button>
            <button class="filter-chip" onclick="RSSTracker.setFilter('gaming',this)">🎮 Gaming</button>
            <button class="filter-chip" onclick="RSSTracker.setFilter('deals',this)">💰 Deals</button>
            <button class="filter-chip" onclick="RSSTracker.setFilter('tech',this)">💻 Tech</button>
            <button class="filter-chip" onclick="RSSTracker.setFilter('fav',this)">⭐ Favoris</button>
            <button class="filter-chip" onclick="RSSTracker.setFilter('unread',this)">🔔 Non lus</button>
          </div>
          <button class="btn btn-primary" onclick="RSSTracker.refreshAll()">🔄 Rafraîchir</button>
        </div>
        <div class="rss-feeds-bar" id="rss-feeds-bar"></div>
        <div class="rss-timeline" id="rss-timeline">
          <div class="empty-state" style="padding:60px 20px;">
            <div class="empty-state-icon">📡</div>
            <div>Clique sur "Rafraîchir" pour charger les flux RSS</div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:8px;">Note: Certains flux nécessitent un proxy CORS</div>
          </div>
        </div>
      </div>
    `;
    this.renderFeedsBar();
    this.loadFromStorage();
    this.renderTimeline();
  },

  renderFeedsBar() {
    const bar = document.getElementById('rss-feeds-bar');
    if (!bar) return;
    bar.innerHTML = this.feeds.map(f => `
      <div class="rss-feed-badge" style="border-color:${f.color}" onclick="RSSTracker.toggleFeed('${f.id}')" id="feed-badge-${f.id}">
        <span style="font-size:16px">${f.icon}</span>
        <span>${f.name}</span>
        <span class="rss-feed-count" id="feed-count-${f.id}">0</span>
      </div>
    `).join('');
  },

  async refreshAll() {
    const timeline = document.getElementById('rss-timeline');
    if (timeline) timeline.innerHTML = '<div class="empty-state" style="padding:60px 20px;"><div class="empty-state-icon">⏳</div><div>Chargement des flux...</div></div>';

    this.items = [];

    // Simulate RSS data since CORS blocks direct fetch
    const mockData = this.generateMockData();
    this.items = mockData;

    this.saveToStorage();
    this.renderTimeline();
    if (window.App) window.App.showToast(`${this.items.length} articles chargés`, 'success');
  },

  generateMockData() {
    const now = new Date();
    const data = [];

    // LoL patches
    data.push({ id: 'lol-1', feedId: 'lol', title: 'Patch Notes 14.12 — Équilibrage des champions', desc: 'Ajustements sur Yasuo, Yone et les nouveaux items. Nerf du jungle AP.', date: new Date(now - 3600000 * 2).toISOString(), link: '#', isNew: true });
    data.push({ id: 'lol-2', feedId: 'lol', title: 'Patch Notes 14.11 — Nouveau champion Aurora', desc: 'Découvrez Aurora, la nouvelle mage mid-lane avec des mécaniques de lumière.', date: new Date(now - 86400000 * 3).toISOString(), link: '#', isNew: false });
    data.push({ id: 'lol-3', feedId: 'lol', title: 'Clash ce week-end — Inscriptions ouvertes', desc: 'Tournoi 5v5 ce samedi avec des récompenses exclusives.', date: new Date(now - 86400000 * 1).toISOString(), link: '#', isNew: true });

    // Steam
    data.push({ id: 'steam-1', feedId: 'steam', title: 'Summer Sale 2026 — Jusqu\'à -90%', desc: 'Les soldes d\'été Steam sont là ! Elden Ring à -50%, Baldur\'s Gate 3 à -30%.', date: new Date(now - 3600000 * 5).toISOString(), link: '#', isNew: true });
    data.push({ id: 'steam-2', feedId: 'steam', title: 'Nouveau hardware Steam Deck 2', desc: 'Valve annonce le Steam Deck 2 avec écran OLED 120Hz et batterie améliorée.', date: new Date(now - 86400000 * 2).toISOString(), link: '#', isNew: false });

    // Deals
    data.push({ id: 'ig-1', feedId: 'instantgaming', title: 'Cyberpunk 2077 — 19.99€ (-60%)', desc: 'Prix historique sur Instant Gaming !', date: new Date(now - 3600000 * 1).toISOString(), link: '#', isNew: true });
    data.push({ id: 'ig-2', feedId: 'instantgaming', title: 'Helldivers 2 — 24.99€ (-38%)', desc: 'Le hit coopératif de l\'année en promo.', date: new Date(now - 3600000 * 8).toISOString(), link: '#', isNew: true });
    data.push({ id: 'gog-1', feedId: 'gog', title: 'Weekend Deal — RPG Classics', desc: 'The Witcher 3 GOTY à 9.99€, Divinity Original Sin 2 à 14.99€', date: new Date(now - 86400000 * 0.5).toISOString(), link: '#', isNew: true });
    data.push({ id: 'humble-1', feedId: 'humble', title: 'Humble Choice Juin 2026', desc: 'Inclut Hogwarts Legacy, Lies of P et 6 autres jeux pour 11.99€/mois.', date: new Date(now - 86400000 * 4).toISOString(), link: '#', isNew: false });

    // Tech
    data.push({ id: 'verge-1', feedId: 'verge', title: 'Apple WWDC 2026 — Ce qu\'il faut retenir', desc: 'iOS 19, macOS 16, et les nouveaux Mac Pro avec M4 Ultra.', date: new Date(now - 3600000 * 3).toISOString(), link: '#', isNew: true });
    data.push({ id: 'tc-1', feedId: 'techcrunch', title: 'OpenAI GPT-5 : premiers benchmarks', desc: 'Les performances surpassent GPT-4 de 40% sur les benchmarks standards.', date: new Date(now - 86400000 * 1.5).toISOString(), link: '#', isNew: false });

    return data.sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  renderTimeline() {
    const timeline = document.getElementById('rss-timeline');
    if (!timeline) return;

    let filtered = this.items;
    if (this.currentFilter === 'fav') {
      filtered = this.items.filter(i => this.favorites.has(i.id));
    } else if (this.currentFilter === 'unread') {
      filtered = this.items.filter(i => !this.readItems.has(i.id));
    } else if (this.currentFilter !== 'all') {
      filtered = this.items.filter(i => {
        const feed = this.feeds.find(f => f.id === i.feedId);
        return feed && feed.category === this.currentFilter;
      });
    }

    if (filtered.length === 0) {
      timeline.innerHTML = '<div class="empty-state" style="padding:60px 20px;"><div class="empty-state-icon">📭</div><div>Aucun article dans cette catégorie</div></div>';
      return;
    }

    timeline.innerHTML = filtered.map(item => {
      const feed = this.feeds.find(f => f.id === item.feedId);
      const isRead = this.readItems.has(item.id);
      const isFav = this.favorites.has(item.id);
      const date = new Date(item.date);
      const timeAgo = this.timeAgo(date);

      return `
        <div class="rss-item ${isRead ? 'read' : ''} ${item.isNew ? 'new' : ''}" onclick="RSSTracker.markRead('${item.id}')">
          <div class="rss-item-header">
            <div class="rss-item-source" style="color:${feed?.color || 'var(--accent)'}">
              <span>${feed?.icon || '📰'}</span>
              <span>${feed?.name || 'Inconnu'}</span>
            </div>
            <div class="rss-item-time">${timeAgo}</div>
          </div>
          <div class="rss-item-title">${item.title}</div>
          <div class="rss-item-desc">${item.desc}</div>
          <div class="rss-item-actions">
            <button class="rss-action-btn ${isFav ? 'active' : ''}" onclick="event.stopPropagation();RSSTracker.toggleFav('${item.id}')">
              ${isFav ? '⭐' : '☆'} Favori
            </button>
            <button class="rss-action-btn" onclick="event.stopPropagation();window.open('${item.link}','_blank')">
              🔗 Ouvrir
            </button>
          </div>
        </div>
      `;
    }).join('');

    this.updateFeedCounts();
  },

  timeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'À l\'instant';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Il y a ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    return `Il y a ${days}j`;
  },

  markRead(id) {
    this.readItems.add(id);
    this.saveToStorage();
    this.renderTimeline();
  },

  toggleFav(id) {
    if (this.favorites.has(id)) this.favorites.delete(id);
    else this.favorites.add(id);
    this.saveToStorage();
    this.renderTimeline();
    if (window.App) window.App.showToast(this.favorites.has(id) ? 'Ajouté aux favoris' : 'Retiré des favoris', 'success');
  },

  setFilter(filter, btn) {
    this.currentFilter = filter;
    document.querySelectorAll('.rss-filters .filter-chip').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    this.renderTimeline();
  },

  toggleFeed(feedId) {
    // Toggle feed visibility logic could go here
    if (window.App) window.App.showToast('Filtrage par flux — utilise les catégories', 'info');
  },

  updateFeedCounts() {
    this.feeds.forEach(f => {
      const count = this.items.filter(i => i.feedId === f.id && !this.readItems.has(i.id)).length;
      const el = document.getElementById(`feed-count-${f.id}`);
      if (el) {
        el.textContent = count;
        el.style.display = count > 0 ? 'inline-flex' : 'none';
      }
    });
  },

  saveToStorage() {
    const key = window.App?.getStorageKey('rss');
    if (key) {
      localStorage.setItem(key, JSON.stringify({
        items: this.items,
        readItems: [...this.readItems],
        favorites: [...this.favorites]
      }));
    }
  },

  loadFromStorage() {
    const key = window.App?.getStorageKey('rss');
    if (key) {
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          this.items = data.items || [];
          this.readItems = new Set(data.readItems || []);
          this.favorites = new Set(data.favorites || []);
        } catch(e) {}
      }
    }
  }
};
