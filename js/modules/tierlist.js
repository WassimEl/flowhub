// ===== TIER LIST MODULE =====
export const TierList = {
  tiers: [
    { id: 's', label: 'S', color: '#ff6b6b', items: [] },
    { id: 'a', label: 'A', color: '#ffa94d', items: [] },
    { id: 'b', label: 'B', color: '#ffd43b', items: [] },
    { id: 'c', label: 'C', color: '#69db7c', items: [] },
    { id: 'd', label: 'D', color: '#4dabf7', items: [] },
  ],
  poolItems: [],
  draggedItem: null,
  currentTemplate: 'custom',

  TEMPLATES: {
    lol: { name: 'Champions LoL', items: ['Yasuo', 'Yone', 'Lee Sin', 'Ahri', 'Jinx', 'Thresh', 'Zed', 'Lux', 'Darius', 'Garen', 'Ezreal', 'Vayne', 'Riven', 'Akali', 'Senna'] },
    dev: { name: 'Outils Dev', items: ['VS Code', 'GitHub', 'Docker', 'Figma', 'Vercel', 'Node.js', 'React', 'Tailwind', 'TypeScript', 'PostgreSQL', 'Redis', 'Linux', 'Neovim', 'Postman', 'Jest'] },
    movies: { name: 'Films 2024', items: ['Dune 2', 'Oppenheimer', 'Poor Things', 'Anatomy of a Fall', 'The Zone of Interest', 'Past Lives', 'Spider-Verse', 'Barbie', 'Killers of the Flower Moon', 'Maestro', 'American Fiction', 'The Holdovers', 'Anora', 'Nosferatu', 'Wicked'] },
    games: { name: 'Jeux Video', items: ['Elden Ring', 'Baldur\'s Gate 3', 'Zelda TOTK', 'Hogwarts Legacy', 'Starfield', 'Spider-Man 2', 'Alan Wake 2', 'Lies of P', 'Cyberpunk 2077', 'Hades 2', 'Helldivers 2', 'Palworld', 'Tekken 8', 'FF7 Rebirth', 'Stellar Blade'] },
  },

  render(container) {
    if (!container) return;
    container.innerHTML = `
      <div class="tool-panel" style="max-width:100%;">
        <div class="tool-panel-header">
          <div class="icon">📊</div>
          <h3>Tier List Maker</h3>
          <p>Cree des tier lists avec drag & drop. Templates predefinis disponibles.</p>
        </div>
        <div class="tierlist-toolbar">
          <select class="form-select" id="tierlist-template" onchange="TierList.loadTemplate(this.value)" style="max-width:250px;">
            <option value="custom">📝 Custom</option>
            <option value="lol">⚔️ Champions LoL</option>
            <option value="dev">💻 Outils Dev</option>
            <option value="movies">🎬 Films 2024</option>
            <option value="games">🎮 Jeux Video</option>
          </select>
          <button class="btn" onclick="TierList.addTier()">+ Tier</button>
          <button class="btn" onclick="TierList.reset()">🔄 Reset</button>
          <button class="btn" onclick="TierList.exportPNG()">💾 Export PNG</button>
          <button class="btn" onclick="TierList.share()">🔗 Partager</button>
        </div>
        <div class="tierlist-container" id="tierlist-container"></div>
        <div class="tierlist-pool">
          <h4 style="font-family:'Space Grotesk',sans-serif;margin-bottom:12px;">📦 Elements a classer</h4>
          <div class="tierlist-pool-items" id="tierlist-pool"></div>
          <div class="tierlist-add-item">
            <input type="text" class="form-input" id="tierlist-new-item" placeholder="Ajouter un element..." onkeydown="if(event.key==='Enter')TierList.addItem()">
            <button class="btn btn-primary" onclick="TierList.addItem()">+ Ajouter</button>
          </div>
        </div>
      </div>
    `;
    this.loadFromStorage();
    this.renderTiers();
    this.renderPool();
  },

  renderTiers() {
    const container = document.getElementById('tierlist-container');
    if (!container) return;
    container.innerHTML = this.tiers.map(tier => `
      <div class="tierlist-row" data-tier="${tier.id}">
        <div class="tierlist-label" style="background:${tier.color}20;color:${tier.color};border-color:${tier.color}40">
          <span>${tier.label}</span>
        </div>
        <div class="tierlist-items" data-tier="${tier.id}" ondragover="event.preventDefault()" ondrop="TierList.handleDrop(event, '${tier.id}')">
          ${tier.items.map(item => `
            <div class="tierlist-item" draggable="true" ondragstart="TierList.handleDragStart(event, '${item}', '${tier.id}')" ondragend="TierList.handleDragEnd(event)">
              ${item}
              <button class="tierlist-item-delete" onclick="event.stopPropagation();TierList.removeItem('${item}', '${tier.id}')">×</button>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  },

  renderPool() {
    const pool = document.getElementById('tierlist-pool');
    if (!pool) return;
    pool.innerHTML = this.poolItems.map(item => `
      <div class="tierlist-item tierlist-pool-item" draggable="true" ondragstart="TierList.handleDragStart(event, '${item.replace(/'/g, "\\'")}', 'pool')" ondragend="TierList.handleDragEnd(event)">
        ${item}
        <button class="tierlist-item-delete" onclick="event.stopPropagation();TierList.removeFromPool('${item.replace(/'/g, "\\'")}')">×</button>
      </div>
    `).join('');
  },

  handleDragStart(e, item, source) {
    this.draggedItem = { item, source };
    e.dataTransfer.effectAllowed = 'move';
    e.target.style.opacity = '0.5';
  },

  handleDragEnd(e) {
    e.target.style.opacity = '1';
    this.draggedItem = null;
  },

  handleDrop(e, targetTier) {
    e.preventDefault();
    if (!this.draggedItem) return;
    const { item, source } = this.draggedItem;

    // Remove from source
    if (source === 'pool') {
      this.poolItems = this.poolItems.filter(i => i !== item);
    } else {
      const tier = this.tiers.find(t => t.id === source);
      if (tier) tier.items = tier.items.filter(i => i !== item);
    }

    // Add to target
    if (targetTier === 'pool') {
      this.poolItems.push(item);
    } else {
      const tier = this.tiers.find(t => t.id === targetTier);
      if (tier) tier.items.push(item);
    }

    this.saveToStorage();
    this.renderTiers();
    this.renderPool();
  },

  addItem() {
    const input = document.getElementById('tierlist-new-item');
    const value = input.value.trim();
    if (!value) return;
    this.poolItems.push(value);
    input.value = '';
    this.saveToStorage();
    this.renderPool();
  },

  removeItem(item, tierId) {
    const tier = this.tiers.find(t => t.id === tierId);
    if (tier) {
      tier.items = tier.items.filter(i => i !== item);
      this.poolItems.push(item);
      this.saveToStorage();
      this.renderTiers();
      this.renderPool();
    }
  },

  removeFromPool(item) {
    this.poolItems = this.poolItems.filter(i => i !== item);
    this.saveToStorage();
    this.renderPool();
  },

  addTier() {
    const labels = ['S', 'A', 'B', 'C', 'D', 'E', 'F'];
    const colors = ['#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#4dabf7', '#9775fa', '#f06595'];
    const existing = this.tiers.map(t => t.label);
    const nextLabel = labels.find(l => !existing.includes(l)) || String.fromCharCode(70 + this.tiers.length);
    const nextColor = colors[this.tiers.length % colors.length];
    this.tiers.push({ id: 'tier-' + Date.now(), label: nextLabel, color: nextColor, items: [] });
    this.saveToStorage();
    this.renderTiers();
  },

  loadTemplate(templateId) {
    this.currentTemplate = templateId;
    if (templateId === 'custom') {
      this.poolItems = [];
      this.tiers.forEach(t => t.items = []);
    } else {
      const template = this.TEMPLATES[templateId];
      if (template) {
        this.poolItems = [...template.items];
        this.tiers.forEach(t => t.items = []);
      }
    }
    this.saveToStorage();
    this.renderTiers();
    this.renderPool();
    if (window.App) window.App.showToast('Template charge', 'success');
  },

  reset() {
    if (!confirm('Reinitialiser la tier list ?')) return;
    this.tiers = [
      { id: 's', label: 'S', color: '#ff6b6b', items: [] },
      { id: 'a', label: 'A', color: '#ffa94d', items: [] },
      { id: 'b', label: 'B', color: '#ffd43b', items: [] },
      { id: 'c', label: 'C', color: '#69db7c', items: [] },
      { id: 'd', label: 'D', color: '#4dabf7', items: [] },
    ];
    this.poolItems = [];
    this.saveToStorage();
    this.renderTiers();
    this.renderPool();
  },

  exportPNG() {
    const container = document.getElementById('tierlist-container');
    if (!container) return;
    // Simple text-based export as fallback
    let text = '📊 **Tier List**\n\n';
    this.tiers.forEach(t => {
      text += `**${t.label} Tier:** ${t.items.join(', ') || 'Vide'}\n`;
    });

    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 100 + this.tiers.length * 80;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0a0b14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#e8e9f0';
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.fillText('📊 Tier List', 20, 40);

    let y = 70;
    this.tiers.forEach(tier => {
      ctx.fillStyle = tier.color + '30';
      ctx.fillRect(20, y, 60, 60);
      ctx.fillStyle = tier.color;
      ctx.font = 'bold 28px Inter, sans-serif';
      ctx.fillText(tier.label, 35, y + 42);

      ctx.fillStyle = '#8b8da3';
      ctx.font = '14px Inter, sans-serif';
      const itemsText = tier.items.join(', ') || 'Vide';
      ctx.fillText(itemsText, 100, y + 35);
      y += 80;
    });

    const link = document.createElement('a');
    link.download = 'tierlist.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    if (window.App) window.App.showToast('Tier list exportee', 'success');
  },

  share() {
    const data = btoa(JSON.stringify({ tiers: this.tiers, pool: this.poolItems }));
    const url = window.location.origin + window.location.pathname + '?tierlist=' + data;
    navigator.clipboard.writeText(url).then(() => {
      if (window.App) window.App.showToast('Lien copie dans le presse-papiers', 'success');
    });
  },

  saveToStorage() {
    const key = window.App?.getStorageKey('tierlist');
    if (key) {
      localStorage.setItem(key, JSON.stringify({ tiers: this.tiers, poolItems: this.poolItems, template: this.currentTemplate }));
    }
  },

  loadFromStorage() {
    const key = window.App?.getStorageKey('tierlist');
    if (key) {
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          this.tiers = data.tiers || this.tiers;
          this.poolItems = data.poolItems || [];
          this.currentTemplate = data.template || 'custom';
        } catch(e) {}
      }
    }
  }
};
