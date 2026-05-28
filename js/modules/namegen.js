// ===== NAME GENERATOR MODULE =====
export const NameGen = {
  history: [],

  PREFIXES: {
    tech: ['Cyber', 'Neo', 'Meta', 'Hyper', 'Ultra', 'Quantum', 'Nano', 'Data', 'Cloud', 'Sync', 'Flux', 'Pixel', 'Byte', 'Node', 'Core', 'Stack', 'Dev', 'Code', 'API', 'Web'],
    gaming: ['GG', 'EZ', 'OP', 'AFK', 'Clutch', 'Sniper', 'Ninja', 'Phantom', 'Shadow', 'Toxic', 'Boosted', 'Smurf', 'Feeder', 'Carry', 'Jungle', 'Mid', 'Top', 'Bot', 'Support', 'ADC'],
    suffixes: ['ify', 'ly', 'io', 'hub', 'lab', 'verse', 'zone', 'net', 'base', 'flow', 'wave', 'bit', 'kit', 'pad', 'box', 'grid', 'mesh', 'link', 'port', 'gate']
  },

  render(container) {
    if (!container) return;
    container.innerHTML = `
      <div class="tool-panel">
        <div class="tool-panel-header">
          <div class="icon">✨</div>
          <h3>Name Generator</h3>
          <p>Générateur de noms pour projets tech, variables de code et équipes esport.</p>
        </div>
        <div style="display:flex;gap:12px;margin-bottom:24px;flex-wrap:wrap;">
          <button class="btn btn-primary" onclick="NameGen.generate('tech')">💻 Projet Tech</button>
          <button class="btn" onclick="NameGen.generate('variable')">🔤 Variable Code</button>
          <button class="btn" onclick="NameGen.generate('esport')">🏆 Équipe Esport</button>
          <button class="btn" onclick="NameGen.generate('fusion')">🔗 Fusion Aléatoire</button>
        </div>
        <div id="namegen-result" style="background:var(--bg-primary);border:1px solid var(--border);border-radius:var(--radius-sm);padding:24px;text-align:center;margin-bottom:24px;display:none;">
          <div style="font-family:'JetBrains Mono',monospace;font-size:28px;font-weight:600;color:var(--accent);margin-bottom:12px;" id="namegen-text"></div>
          <div style="display:flex;gap:8px;justify-content:center;">
            <button class="btn btn-primary" onclick="NameGen.copy()">📋 Copier</button>
            <button class="btn" onclick="NameGen.saveToHistory()">💾 Sauvegarder</button>
          </div>
        </div>
        <div style="background:var(--bg-primary);border:1px solid var(--border);border-radius:var(--radius-sm);padding:20px;">
          <h4 style="font-family:'Space Grotesk',sans-serif;font-size:16px;margin-bottom:12px;">📜 Historique</h4>
          <div id="namegen-history" style="display:flex;flex-direction:column;gap:8px;">
            <div style="text-align:center;color:var(--text-muted);font-size:13px;padding:16px;">Aucun nom généré encore</div>
          </div>
        </div>
      </div>
    `;
    this.loadHistory();
  },

  generate(type) {
    let name = '';
    const tech = this.PREFIXES.tech;
    const gaming = this.PREFIXES.gaming;
    const suffixes = this.PREFIXES.suffixes;

    if (type === 'tech') {
      const prefix = tech[Math.floor(Math.random() * tech.length)];
      const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
      name = prefix + suffix;
    } else if (type === 'variable') {
      const prefixes = ['is', 'has', 'can', 'should', 'will', 'get', 'set', 'update', 'create', 'delete'];
      const nouns = ['User', 'Data', 'Item', 'Config', 'Token', 'Session', 'Cache', 'Log', 'Error', 'Result'];
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const noun = nouns[Math.floor(Math.random() * nouns.length)];
      const style = Math.random() > 0.5 ? 'camel' : 'snake';
      if (style === 'camel') name = prefix + noun;
      else name = (prefix + '_' + noun).toLowerCase();
    } else if (type === 'esport') {
      const prefix = gaming[Math.floor(Math.random() * gaming.length)];
      const suffix = gaming[Math.floor(Math.random() * gaming.length)];
      name = prefix + ' ' + suffix;
    } else if (type === 'fusion') {
      const w1 = [...tech, ...gaming][Math.floor(Math.random() * (tech.length + gaming.length))];
      const w2 = [...tech, ...gaming][Math.floor(Math.random() * (tech.length + gaming.length))];
      name = w1 + w2;
    }

    this.currentName = name;
    const result = document.getElementById('namegen-result');
    const text = document.getElementById('namegen-text');
    if (result) result.style.display = 'block';
    if (text) text.textContent = name;
  },

  copy() {
    if (!this.currentName) return;
    navigator.clipboard.writeText(this.currentName).then(() => {
      if (window.App) window.App.showToast('Nom copié', 'success');
    });
  },

  saveToHistory() {
    if (!this.currentName) return;
    this.history.unshift({
      name: this.currentName,
      date: new Date().toISOString(),
      id: Date.now().toString()
    });
    if (this.history.length > 20) this.history = this.history.slice(0, 20);
    this.saveHistory();
    this.renderHistory();
    if (window.App) window.App.showToast('Ajouté à l\'historique', 'success');
  },

  renderHistory() {
    const container = document.getElementById('namegen-history');
    if (!container) return;

    if (this.history.length === 0) {
      container.innerHTML = '<div style="text-align:center;color:var(--text-muted);font-size:13px;padding:16px;">Aucun nom généré encore</div>';
      return;
    }

    container.innerHTML = this.history.map(h => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:var(--bg-card);border-radius:8px;border:1px solid var(--border);">
        <span style="font-family:'JetBrains Mono',monospace;font-size:14px;color:var(--accent);">${h.name}</span>
        <div style="display:flex;gap:6px;">
          <button class="pwd-vault-btn" onclick="navigator.clipboard.writeText('${h.name.replace(/'/g, "\'")}')">📋</button>
          <button class="pwd-vault-btn btn-danger" onclick="NameGen.deleteHistory('${h.id}')">🗑</button>
        </div>
      </div>
    `).join('');
  },

  deleteHistory(id) {
    this.history = this.history.filter(h => h.id !== id);
    this.saveHistory();
    this.renderHistory();
  },

  saveHistory() {
    if (window.App) {
      localStorage.setItem(window.App.getStorageKey('namegen_history'), JSON.stringify(this.history));
    }
  },

  loadHistory() {
    if (window.App) {
      const saved = localStorage.getItem(window.App.getStorageKey('namegen_history'));
      if (saved) {
        try { this.history = JSON.parse(saved); } catch(e) {}
      }
    }
    this.renderHistory();
  }
};
