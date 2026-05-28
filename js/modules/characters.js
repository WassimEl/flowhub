// ===== CHARACTER GENERATOR MODULE =====
export const CharacterGen = {
  selectedChar: null,

  render(container) {
    if (!container) return;
    container.innerHTML = `
      <div class="tool-panel">
        <div class="tool-panel-header">
          <div class="icon">🎭</div>
          <h3>Générateur de Personnages</h3>
          <p>Génère des personnages aléatoires avec nom et avatar. Parfait pour tes parties LoL ou tes projets créatifs.</p>
        </div>
        <div style="display:flex;gap:12px;justify-content:center;margin-bottom:24px;flex-wrap:wrap;">
          <button class="btn btn-primary" onclick="CharacterGen.generate(4)">🎲 Générer 4 personnages</button>
          <button class="btn" onclick="CharacterGen.generate(8)">🎲 Générer 8 personnages</button>
          <button class="btn" onclick="CharacterGen.generate(10)">🎲 Générer 10 personnages</button>
        </div>
        <div class="char-grid" id="char-grid"></div>
        <div id="char-selected-info" style="margin-top:24px;padding:20px;background:var(--bg-primary);border-radius:var(--radius-sm);border:1px solid var(--border);display:none;">
          <h4 style="font-family:'Space Grotesk',sans-serif;margin-bottom:12px;">🎯 Personnage sélectionné</h4>
          <div id="char-selected-details"></div>
        </div>
      </div>
    `;
  },

  async generate(count) {
    const grid = document.getElementById('char-grid');
    if (!grid) return;
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted);">Chargement...</div>';

    try {
      const response = await fetch(`https://randomuser.me/api/?results=${count}&nat=fr,us,gb,de,es,it`);
      const data = await response.json();

      grid.innerHTML = '';
      data.results.forEach((user, index) => {
        const card = document.createElement('div');
        card.className = 'char-card';
        card.dataset.index = index;
        card.dataset.name = `${user.name.first} ${user.name.last}`;
        card.dataset.email = user.email;
        card.dataset.phone = user.phone;
        card.dataset.location = `${user.location.city}, ${user.location.country}`;
        card.dataset.avatar = user.picture.large;

        card.innerHTML = `
          <img src="${user.picture.large}" alt="${user.name.first}" loading="lazy">
          <div class="char-name">${user.name.first} ${user.name.last}</div>
          <div class="char-detail">${user.location.city}, ${user.location.country}</div>
          <div class="char-detail" style="font-size:11px;color:var(--text-muted);margin-top:4px;">${user.email}</div>
        `;

        card.onclick = () => this.select(card);
        grid.appendChild(card);
      });

      if (window.App) window.App.showToast(`${count} personnages générés !`, 'success');
    } catch (err) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--red);">Erreur de chargement. Réessaie.</div>';
      if (window.App) window.App.showToast('Erreur lors de la génération', 'error');
    }
  },

  select(card) {
    document.querySelectorAll('.char-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    this.selectedChar = {
      name: card.dataset.name,
      email: card.dataset.email,
      phone: card.dataset.phone,
      location: card.dataset.location,
      avatar: card.dataset.avatar
    };

    const info = document.getElementById('char-selected-info');
    const details = document.getElementById('char-selected-details');
    if (info) info.style.display = 'block';
    if (details) {
      details.innerHTML = `
        <div style="display:flex;align-items:center;gap:16px;">
          <img src="${this.selectedChar.avatar}" style="width:64px;height:64px;border-radius:50%;border:2px solid var(--accent);">
          <div>
            <div style="font-weight:600;font-size:16px;margin-bottom:4px;">${this.selectedChar.name}</div>
            <div style="font-size:13px;color:var(--text-secondary);">📍 ${this.selectedChar.location}</div>
            <div style="font-size:13px;color:var(--text-secondary);">📧 ${this.selectedChar.email}</div>
            <div style="font-size:13px;color:var(--text-secondary);">📱 ${this.selectedChar.phone}</div>
          </div>
        </div>
        <div style="margin-top:12px;display:flex;gap:8px;">
          <button class="btn btn-primary" onclick="CharacterGen.copyInfo()">📋 Copier les infos</button>
          <button class="btn" onclick="CharacterGen.useAsPlayer()">⚔️ Utiliser comme joueur LoL</button>
        </div>
      `;
    }
  },

  copyInfo() {
    if (!this.selectedChar) return;
    const text = `${this.selectedChar.name}\n${this.selectedChar.location}\n${this.selectedChar.email}\n${this.selectedChar.phone}`;
    navigator.clipboard.writeText(text).then(() => {
      if (window.App) window.App.showToast('Infos copiées', 'success');
    });
  },

  useAsPlayer() {
    if (!this.selectedChar) return;
    if (window.App) window.App.showToast(`${this.selectedChar.name} ajouté aux joueurs LoL !`, 'success');
  }
};
