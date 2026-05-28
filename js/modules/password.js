// ===== PASSWORD VAULT MODULE =====
export const PasswordVault = {
  vault: [],

  render(container) {
    if (!container) return;
    container.innerHTML = `
      <div class="tool-panel">
        <div class="tool-panel-header">
          <div class="icon">🔐</div>
          <h3>Coffre Mots de Passe</h3>
          <p><strong style="color:var(--yellow)">⚠️ Avertissement sécurité :</strong> Cet outil génère et stocke des mots de passe localement (rien n'est envoyé sur Internet). Chaque utilisateur a son propre coffre lié à son pseudo.</p>
        </div>
        <div class="form-row" style="margin-bottom:20px;">
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label">Nom du service</label>
            <input type="text" class="form-input" id="pwd-service" placeholder="ex: Netflix, GitHub, Discord...">
          </div>
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label">Identifiant / Email</label>
            <input type="text" class="form-input" id="pwd-username" placeholder="ex: mon.email@...">
          </div>
        </div>
        <div class="pwd-display" id="pwd-display">
          Clique sur "Générer" pour créer un mot de passe
          <div class="pwd-strength" id="pwd-strength" style="background:var(--text-muted);"></div>
        </div>
        <div class="pwd-options">
          <div class="pwd-option"><span>Longueur : <span id="pwd-len-val">16</span></span><input type="range" class="pwd-slider" id="pwd-length" min="8" max="64" value="16" oninput="document.getElementById('pwd-len-val').textContent=this.value"></div>
          <div class="pwd-option"><span>Majuscules (A-Z)</span><input type="checkbox" id="pwd-upper" checked></div>
          <div class="pwd-option"><span>Minuscules (a-z)</span><input type="checkbox" id="pwd-lower" checked></div>
          <div class="pwd-option"><span>Chiffres (0-9)</span><input type="checkbox" id="pwd-numbers" checked></div>
          <div class="pwd-option"><span>Symboles (!@#$...)</span><input type="checkbox" id="pwd-symbols" checked></div>
        </div>
        <button class="btn btn-primary" onclick="PasswordVault.generate()" style="width:100%;justify-content:center;margin-bottom:12px;">🎲 Générer</button>
        <button class="btn" onclick="PasswordVault.save()" style="width:100%;justify-content:center;margin-bottom:12px;">💾 Sauvegarder dans le coffre</button>
        <button class="btn" onclick="PasswordVault.copy()" style="width:100%;justify-content:center;">📋 Copier</button>
        <div style="margin-top:24px;">
          <h4 style="font-family:'Space Grotesk',sans-serif;font-size:16px;margin-bottom:12px;">📂 Mon Coffre (<span id="vault-count">0</span>)</h4>
          <div class="pwd-vault-list" id="pwd-vault-list"></div>
        </div>
        <div style="margin-top:20px;padding:16px;background:var(--bg-primary);border-radius:8px;font-size:12px;color:var(--text-muted);">
          <strong>💡 Conseil :</strong> Pour tes services self-hosted (Vaultwarden, Nextcloud), un mot de passe de 20+ caractères avec tous les types est recommandé.
        </div>
      </div>
    `;
    this.renderVault();
  },

  generate() {
    const len = parseInt(document.getElementById('pwd-length').value);
    const upper = document.getElementById('pwd-upper').checked;
    const lower = document.getElementById('pwd-lower').checked;
    const numbers = document.getElementById('pwd-numbers').checked;
    const symbols = document.getElementById('pwd-symbols').checked;

    let chars = '';
    if (upper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (lower) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (numbers) chars += '0123456789';
    if (symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    if (!chars) { 
      if (window.App) window.App.showToast('Sélectionne au moins un type', 'error'); 
      return; 
    }

    let pwd = '';
    const arr = new Uint32Array(len);
    crypto.getRandomValues(arr);
    for (let i = 0; i < len; i++) pwd += chars[arr[i] % chars.length];

    const display = document.getElementById('pwd-display');
    if (display) display.innerHTML = pwd + '<div class="pwd-strength" id="pwd-strength"></div>';

    let strength = 0;
    if (upper) strength++; 
    if (lower) strength++; 
    if (numbers) strength++; 
    if (symbols) strength++;
    if (len >= 16) strength++;

    const bar = document.getElementById('pwd-strength');
    const colors = ['var(--red)', 'var(--orange)', 'var(--yellow)', 'var(--green)', 'var(--green)'];
    const widths = ['20%', '40%', '60%', '80%', '100%'];
    if (bar) {
      bar.style.background = colors[Math.min(strength, 4)];
      bar.style.width = widths[Math.min(strength, 4)];
    }
  },

  copy() {
    const display = document.getElementById('pwd-display');
    const pwd = display?.childNodes[0]?.textContent?.trim();
    if (pwd && pwd !== 'Clique sur "Générer" pour créer un mot de passe') {
      navigator.clipboard.writeText(pwd).then(() => {
        if (window.App) window.App.showToast('Mot de passe copié', 'success');
      });
    }
  },

  save() {
    const service = document.getElementById('pwd-service').value.trim();
    const username = document.getElementById('pwd-username').value.trim();
    const display = document.getElementById('pwd-display');
    const pwd = display?.childNodes[0]?.textContent?.trim();

    if (!service) { 
      if (window.App) window.App.showToast('Entre un nom de service', 'error'); 
      return; 
    }
    if (!pwd || pwd === 'Clique sur "Générer" pour créer un mot de passe') { 
      if (window.App) window.App.showToast('Génère un mot de passe avant tout', 'error'); 
      return; 
    }

    const entry = {
      id: Date.now().toString(),
      service: service,
      username: username,
      password: pwd,
      created: new Date().toISOString()
    };
    this.vault.push(entry);
    if (window.App) window.App.saveToStorage();
    this.renderVault();
    if (window.App) window.App.showToast('Mot de passe sauvegardé', 'success');

    document.getElementById('pwd-service').value = '';
    document.getElementById('pwd-username').value = '';
  },

  renderVault() {
    const list = document.getElementById('pwd-vault-list');
    const count = document.getElementById('vault-count');
    if (!list) return;
    if (count) count.textContent = this.vault.length;

    if (this.vault.length === 0) {
      list.innerHTML = '<div style="text-align:center;padding:24px;color:var(--text-muted);font-size:13px;">Aucun mot de passe sauvegardé</div>';
      return;
    }

    list.innerHTML = this.vault.map(entry => {
      const svc = window.App?.escapeHtml(entry.service) || entry.service;
      const usr = entry.username ? (window.App?.escapeHtml(entry.username) || entry.username) : 'Aucun identifiant';
      return `
        <div class="pwd-vault-item">
          <div class="pwd-vault-info">
            <div class="pwd-vault-name">${svc}</div>
            <div class="pwd-vault-meta">${usr} • ${new Date(entry.created).toLocaleDateString('fr-FR')}</div>
          </div>
          <div class="pwd-vault-actions">
            <button class="pwd-vault-btn" onclick="PasswordVault.copyEntry('${entry.id}')">📋 Copier</button>
            <button class="pwd-vault-btn" onclick="PasswordVault.showEntry('${entry.id}')">👁 Voir</button>
            <button class="pwd-vault-btn btn-danger" onclick="PasswordVault.deleteEntry('${entry.id}')">🗑</button>
          </div>
        </div>
      `;
    }).join('');
  },

  copyEntry(id) {
    const entry = this.vault.find(e => e.id === id);
    if (entry) {
      navigator.clipboard.writeText(entry.password).then(() => {
        if (window.App) window.App.showToast('Mot de passe copié', 'success');
      });
    }
  },

  showEntry(id) {
    const entry = this.vault.find(e => e.id === id);
    if (entry) {
      alert(`Service: ${entry.service}\nIdentifiant: ${entry.username || 'N/A'}\nMot de passe: ${entry.password}`);
    }
  },

  deleteEntry(id) {
    if (confirm('Supprimer ce mot de passe ?')) {
      this.vault = this.vault.filter(e => e.id !== id);
      if (window.App) window.App.saveToStorage();
      this.renderVault();
      if (window.App) window.App.showToast('Mot de passe supprimé', 'info');
    }
  }
};
