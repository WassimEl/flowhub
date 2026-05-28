// ===== TIER LIST MAKER MODULE =====
export const TierList = {
  tiers: [
    { id: 'S', label: 'S', color: '#ff7f7f' },
    { id: 'A', label: 'A', color: '#ffbf7f' },
    { id: 'B', label: 'B', color: '#ffff7f' },
    { id: 'C', label: 'C', color: '#7fff7f' },
    { id: 'D', label: 'D', color: '#7fbfff' },
  ],
  items: [],
  draggedItem: null,
  currentTemplate: 'custom',

  TEMPLATES: {
    lol: ['Aatrox', 'Ahri', 'Akali', 'Akshan', 'Alistar', 'Amumu', 'Anivia', 'Annie', 'Aphelios', 'Ashe'],
    devtools: ['VS Code', 'IntelliJ', 'Vim', 'Neovim', 'Sublime', 'Atom', 'WebStorm', 'Eclipse', 'NetBeans', 'Notepad++'],
    movies: ['Inception', 'Interstellar', 'The Dark Knight', 'Pulp Fiction', 'Fight Club', 'Forrest Gump', 'The Matrix', 'Gladiator', 'Avatar', 'Titanic'],
  },

  render(container) {
    if (!container) return;
    container.innerHTML = `
      <div class="tool-panel">
        <div class="tool-panel-header">
          <div class="icon">📊</div>
          <h3>Tier List Maker</h3>
          <p>Crée des tier lists personnalisées. Drag & drop d'éléments dans les tiers.</p>
        </div>
        <div style="display:flex;gap:12px;margin-bottom:24px;flex-wrap:wrap;">
          <select class="form-select" id="tier-template" onchange="TierList.loadTemplate()" style="max-width:200px;">
            <option value="custom">📝 Custom</option>
            <option value="lol">⚔️ Champions LoL</option>
            <option value="devtools">💻 Outils Dev</option>
            <option value="movies">🎬 Films</option>
          </select>
          <button class="btn" onclick="TierList.addItem()">+ Ajouter</button>
          <button class="btn" onclick="TierList.clear()">🗑 Vider</button>
          <button class="btn btn-primary" onclick="TierList.export()">💾 Exporter PNG</button>
        </div>
        <div id="tierlist-container" style="display:flex;flex-direction:column;gap:8px;margin-bottom:24px;">
          ${this.tiers.map(t => `
            <div class="tier-row" data-tier="${t.id}" style="display:flex;min-height:80px;background:var(--bg-primary);border:1px solid var(--border);border-radius:var(--radius-sm);overflow:hidden;" ondragover="event.preventDefault();this.style.borderColor='var(--accent)';" ondragleave="this.style.borderColor='var(--border)';" ondrop="TierList.handleDrop(event, '${t.id}')">
              <div style="width:60px;background:${t.color};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:24px;color:#000;text-shadow:0 0 2px rgba(255,255,255,0.5);font-family:'Space Grotesk',sans-serif;">${t.label}</div>
              <div class="tier-items" data-tier="${t.id}" style="flex:1;padding:8px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;"></div>
            </div>
          `).join('')}
        </div>
        <div style="background:var(--bg-primary);border:1px solid var(--border);border-radius:var(--radius-sm);padding:16px;min-height:100px;">
          <div style="font-size:12px;color:var(--text-muted);margin-bottom:12px;font-family:'JetBrains Mono',monospace;">🗳️ Éléments non classés (drag ici →)</div>
          <div id="tier-pool" style="display:flex;gap:8px;flex-wrap:wrap;" ondragover="event.preventDefault();" ondrop="TierList.handleDrop(event, 'pool')">
          </div>
        </div>
      </div>
    `;
    this.renderItems();
  },

  loadTemplate() {
    const template = document.getElementById('tier-template').value;
    this.currentTemplate = template;
    this.items = [];

    if (template !== 'custom' && this.TEMPLATES[template]) {
      this.TEMPLATES[template].forEach((name, i) => {
        this.items.push({ id: 'item-' + i, text: name, tier: 'pool', image: null });
      });
    }
    this.renderItems();
  },

  addItem() {
    const text = prompt('Nom de l\'élément:');
    if (text) {
      this.items.push({ id: 'item-' + Date.now(), text, tier: 'pool', image: null });
      this.renderItems();
    }
  },

  clear() {
    if (!confirm('Vider la tier list ?')) return;
    this.items = [];
    this.renderItems();
  },

  renderItems() {
    // Clear all tier items
    document.querySelectorAll('.tier-items').forEach(el => el.innerHTML = '');
    document.getElementById('tier-pool').innerHTML = '';

    this.items.forEach(item => {
      const el = document.createElement('div');
      el.className = 'tier-item';
      el.draggable = true;
      el.dataset.id = item.id;
      el.innerHTML = `
        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:8px;padding:8px 12px;cursor:grab;font-size:13px;font-weight:500;min-width:80px;text-align:center;transition:all 0.2s;" 
          ondragstart="TierList.handleDragStart(event, '${item.id}')" 
          ondragend="TierList.handleDragEnd(event)">
          ${item.text}
        </div>
      `;

      if (item.tier === 'pool') {
        document.getElementById('tier-pool').appendChild(el);
      } else {
        const tierContainer = document.querySelector(`.tier-items[data-tier="${item.tier}"]`);
        if (tierContainer) tierContainer.appendChild(el);
      }
    });
  },

  handleDragStart(e, id) {
    this.draggedItem = this.items.find(i => i.id === id);
    e.target.style.opacity = '0.5';
  },

  handleDragEnd(e) {
    e.target.style.opacity = '1';
    this.draggedItem = null;
  },

  handleDrop(e, tier) {
    e.preventDefault();
    e.currentTarget.style.borderColor = 'var(--border)';
    if (!this.draggedItem) return;
    this.draggedItem.tier = tier;
    this.renderItems();
    if (window.App) window.App.showToast('Élément déplacé', 'success');
  },

  export() {
    const container = document.getElementById('tierlist-container');
    if (!container) return;

    // Simple text export for now
    let text = '# Tier List\n\n';
    this.tiers.forEach(t => {
      const tierItems = this.items.filter(i => i.tier === t.id);
      if (tierItems.length > 0) {
        text += `## Tier ${t.label}\n`;
        tierItems.forEach(i => text += `- ${i.text}\n`);
        text += '\n';
      }
    });

    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'tierlist.md';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    if (window.App) window.App.showToast('Tier list exportée !', 'success');
  }
};
