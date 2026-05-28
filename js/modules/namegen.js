// ===== NAME GENERATOR MODULE =====
export const NameGen = {
  history: [],
  currentType: 'project',

  PREFIXES: {
    tech: ['Neo', 'Cyber', 'Data', 'Cloud', 'Net', 'Web', 'App', 'Code', 'Dev', 'Sys', 'Tech', 'Digi', 'Meta', 'Hyper', 'Ultra'],
    gaming: ['Shadow', 'Dark', 'Fire', 'Ice', 'Thunder', 'Dragon', 'Phoenix', 'Viper', 'Wolf', 'Raven', 'Ghost', 'Steel', 'Blood', 'Night', 'Storm'],
    fun: ['Mega', 'Super', 'Hyper', 'Ultra', 'Epic', 'Pro', 'Max', 'Plus', 'Go', 'Flow', 'Zen', 'Chill', 'Vibe', 'Pulse', 'Wave']
  },

  SUFFIXES: {
    tech: ['Hub', 'Lab', 'Stack', 'Flow', 'Kit', 'Box', 'Base', 'Port', 'Link', 'Sync', 'Grid', 'Node', 'Core', 'Bit', 'Byte'],
    gaming: ['Gaming', 'Esports', 'Clan', 'Squad', 'Team', 'Legion', 'Army', 'Crew', 'Unit', 'Force', 'Elite', 'Pro', 'Ace', 'King', 'Boss'],
    fun: ['ify', 'ly', 'io', 'us', 'er', 'ly', 'fy', 'za', 'go', 'ly', 'ify', 'us', 'io', 'fy', 'ly']
  },

  WORDS: {
    tech: ['server', 'client', 'api', 'database', 'cache', 'proxy', 'router', 'switch', 'bridge', 'gateway', 'firewall', 'loadbalancer', 'container', 'cluster', 'pipeline'],
    gaming: ['carry', 'jungle', 'mid', 'top', 'support', 'adc', 'tank', 'assassin', 'mage', 'fighter', 'marksman', 'roam', 'gank', 'farm', 'push'],
    fun: ['spark', 'blaze', 'frost', 'mist', 'dusk', 'dawn', 'nova', 'comet', 'nebula', 'quasar', 'pulsar', 'aurora', 'zenith', 'nadir', 'apex']
  },

  render(container) {
    if (!container) return;
    container.innerHTML = `
      <div class="tool-panel">
        <div class="tool-panel-header">
          <div class="icon">✨</div>
          <h3>Generateur de Noms</h3>
          <p>Cree des noms uniques pour tes projets, variables et equipes esport.</p>
        </div>
        <div class="namegen-types">
          <button class="btn ${this.currentType === 'project' ? 'active' : ''}" onclick="NameGen.setType('project')">💻 Projets Tech</button>
          <button class="btn ${this.currentType === 'variable' ? 'active' : ''}" onclick="NameGen.setType('variable')">🔤 Variables Code</button>
          <button class="btn ${this.currentType === 'team' ? 'active' : ''}" onclick="NameGen.setType('team')">⚔️ Equipes Esport</button>
        </div>
        <div class="namegen-options">
          <div class="namegen-option-row">
            <label class="form-label">Style</label>
            <select class="form-select" id="namegen-style">
              <option value="fusion">Fusion de mots</option>
              <option value="prefix">Prefix + Suffix</option>
              <option value="random">Aleatoire complet</option>
              <option value="alliterative">Alliteration</option>
            </select>
          </div>
          <div class="namegen-option-row">
            <label class="form-label">Nombre de resultats</label>
            <input type="range" class="form-input" id="namegen-count" min="3" max="20" value="8" oninput="document.getElementById('namegen-count-val').textContent=this.value">
            <span id="namegen-count-val" style="color:var(--text-muted);font-size:12px;">8</span>
          </div>
        </div>
        <button class="btn btn-primary" onclick="NameGen.generate()" style="width:100%;justify-content:center;margin-bottom:20px;">🎲 Generer</button>
        <div class="namegen-results" id="namegen-results"></div>
        <div class="namegen-history" id="namegen-history">
          <h4 style="font-family:'Space Grotesk',sans-serif;margin-bottom:12px;">🕐 Historique</h4>
          <div class="namegen-history-list" id="namegen-history-list"></div>
        </div>
      </div>
    `;
    this.loadFromStorage();
    this.renderHistory();
  },

  setType(type) {
    this.currentType = type;
    document.querySelectorAll('.namegen-types .btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
  },

  generate() {
    const style = document.getElementById('namegen-style').value;
    const count = parseInt(document.getElementById('namegen-count').value);
    const results = [];

    for (let i = 0; i < count; i++) {
      let name = '';
      if (this.currentType === 'project') {
        name = this.generateProjectName(style);
      } else if (this.currentType === 'variable') {
        name = this.generateVariableName(style);
      } else {
        name = this.generateTeamName(style);
      }
      results.push(name);
    }

    this.history.unshift({ names: results, type: this.currentType, date: new Date().toISOString() });
    if (this.history.length > 20) this.history.pop();
    this.saveToStorage();
    this.renderResults(results);
    this.renderHistory();
  },

  generateProjectName(style) {
    const prefixes = this.PREFIXES.tech;
    const suffixes = this.SUFFIXES.tech;
    const words = this.WORDS.tech;

    if (style === 'fusion') {
      const w1 = words[Math.floor(Math.random() * words.length)];
      const w2 = words[Math.floor(Math.random() * words.length)];
      return this.capitalize(w1) + this.capitalize(w2);
    } else if (style === 'prefix') {
      return prefixes[Math.floor(Math.random() * prefixes.length)] + suffixes[Math.floor(Math.random() * suffixes.length)];
    } else if (style === 'alliterative') {
      const letter = 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
      const p = prefixes.filter(p => p.toLowerCase().startsWith(letter))[0] || prefixes[0];
      const s = suffixes.filter(s => s.toLowerCase().startsWith(letter))[0] || suffixes[0];
      return p + s;
    } else {
      const p = prefixes[Math.floor(Math.random() * prefixes.length)];
      const w = words[Math.floor(Math.random() * words.length)];
      return p + this.capitalize(w);
    }
  },

  generateVariableName(style) {
    const words = this.WORDS.tech;
    const w1 = words[Math.floor(Math.random() * words.length)];
    const w2 = words[Math.floor(Math.random() * words.length)];
    const w3 = words[Math.floor(Math.random() * words.length)];

    if (style === 'fusion') {
      return w1 + '_' + w2 + '_' + w3;
    } else if (style === 'prefix') {
      const prefixes = ['get', 'set', 'is', 'has', 'can', 'should', 'will', 'create', 'delete', 'update'];
      return prefixes[Math.floor(Math.random() * prefixes.length)] + this.capitalize(w1) + this.capitalize(w2);
    } else if (style === 'alliterative') {
      const letter = w1[0];
      const matching = words.filter(w => w.startsWith(letter));
      const w2m = matching[Math.floor(Math.random() * matching.length)] || words[0];
      return w1 + '_' + w2m + '_handler';
    } else {
      return 'const_' + w1 + '_' + w2 + '_v' + Math.floor(Math.random() * 100);
    }
  },

  generateTeamName(style) {
    const prefixes = this.PREFIXES.gaming;
    const suffixes = this.SUFFIXES.gaming;
    const words = this.WORDS.gaming;

    if (style === 'fusion') {
      const w1 = words[Math.floor(Math.random() * words.length)];
      const w2 = words[Math.floor(Math.random() * words.length)];
      return this.capitalize(w1) + this.capitalize(w2);
    } else if (style === 'prefix') {
      return prefixes[Math.floor(Math.random() * prefixes.length)] + ' ' + suffixes[Math.floor(Math.random() * suffixes.length)];
    } else if (style === 'alliterative') {
      const letter = 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
      const p = prefixes.filter(p => p.toLowerCase().startsWith(letter))[0] || prefixes[0];
      const w = words.filter(w => w.startsWith(letter))[0] || words[0];
      return p + ' ' + this.capitalize(w);
    } else {
      const adjectives = ['Elite', 'Pro', 'Ultimate', 'Supreme', 'Grand', 'Royal', 'Dark', 'Mystic', 'Savage', 'Toxic'];
      return adjectives[Math.floor(Math.random() * adjectives.length)] + ' ' + this.capitalize(words[Math.floor(Math.random() * words.length)]);
    }
  },

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  renderResults(results) {
    const container = document.getElementById('namegen-results');
    if (!container) return;
    container.innerHTML = results.map((name, i) => `
      <div class="namegen-result-item" style="animation-delay:${i * 0.05}s">
        <span class="namegen-result-name">${name}</span>
        <button class="btn btn-icon" onclick="NameGen.copyName('${name.replace(/'/g, "\\'")}')" title="Copier">📋</button>
      </div>
    `).join('');
  },

  renderHistory() {
    const list = document.getElementById('namegen-history-list');
    if (!list) return;
    if (this.history.length === 0) {
      list.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-muted);font-size:13px;">Aucun historique</div>';
      return;
    }
    list.innerHTML = this.history.slice(0, 10).map((h, i) => `
      <div class="namegen-history-item">
        <div class="namegen-history-meta">
          <span class="namegen-history-type">${h.type === 'project' ? '💻' : h.type === 'variable' ? '🔤' : '⚔️'}</span>
          <span class="namegen-history-date">${new Date(h.date).toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'})}</span>
        </div>
        <div class="namegen-history-names">${h.names.slice(0, 3).join(', ')}${h.names.length > 3 ? '...' : ''}</div>
      </div>
    `).join('');
  },

  copyName(name) {
    navigator.clipboard.writeText(name).then(() => {
      if (window.App) window.App.showToast('Nom copie : ' + name, 'success');
    });
  },

  saveToStorage() {
    const key = window.App?.getStorageKey('namegen');
    if (key) localStorage.setItem(key, JSON.stringify({ history: this.history }));
  },

  loadFromStorage() {
    const key = window.App?.getStorageKey('namegen');
    if (key) {
      const saved = localStorage.getItem(key);
      if (saved) {
        try { this.history = JSON.parse(saved).history || []; } catch(e) { this.history = []; }
      }
    }
  }
};
