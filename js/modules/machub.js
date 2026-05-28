// ===== MACHUB MODULE =====
export const MacHub = {
  selectedProjects: new Set(),

  PROJECTS: [
    {id:'jellyfin',name:'Jellyfin',icon:'🎬',desc:'Serveur média open-source (alternative à Plex)',ram:1.5,link:'https://jellyfin.org/downloads/server',color:'#00a4dc'},
    {id:'emby',name:'Emby',icon:'📺',desc:'Serveur média avec transcodage hardware',ram:2,link:'https://emby.media/download.html',color:'#52b54b'},
    {id:'plex',name:'Plex',icon:'🎞️',desc:'Serveur média avec apps clients',ram:2,link:'https://www.plex.tv/media-server-downloads/',color:'#e5a00d'},
    {id:'nextcloud',name:'Nextcloud',icon:'☁️',desc:'Cloud privé (fichiers, calendrier, contacts)',ram:1,link:'https://nextcloud.com/install/',color:'#0082c9'},
    {id:'vaultwarden',name:'Vaultwarden',icon:'🔐',desc:'Gestionnaire de mots de passe (Bitwarden self-hosted)',ram:0.5,link:'https://github.com/dani-garcia/vaultwarden',color:'#175ddc'},
    {id:'adguard',name:'AdGuard Home',icon:'🛡️',desc:'Bloqueur de pub réseau (Pi-hole alternative)',ram:0.3,link:'https://github.com/AdguardTeam/AdGuardHome',color:'#67b279'},
    {id:'pihole',name:'Pi-hole',icon:'🕳️',desc:'Bloqueur de pub DNS pour tout le réseau',ram:0.5,link:'https://pi-hole.net/',color:'#96060c'},
    {id:'wireguard',name:'WireGuard',icon:'🔒',desc:'VPN ultra-léger et rapide',ram:0.1,link:'https://www.wireguard.com/install/',color:'#88171a'},
    {id:'tailscale',name:'Tailscale',icon:'🔗',desc:'VPN mesh zero-config (accès de partout)',ram:0.2,link:'https://tailscale.com/download',color:'#3f59e4'},
    {id:'ollama',name:'Ollama',icon:'🧠',desc:'LLM en local (Llama, Mistral, etc.)',ram:4,link:'https://ollama.com/download',color:'#ff6b6b'},
    {id:'openwebui',name:'Open WebUI',icon:'💬',desc:'Interface web pour LLM (chatGPT-like)',ram:0.5,link:'https://github.com/open-webui/open-webui',color:'#10b981'},
    {id:'homeassistant',name:'Home Assistant',icon:'🏠',desc:'Domotique open-source',ram:1,link:'https://www.home-assistant.io/installation/',color:'#41bdf5'},
    {id:'photoprism',name:'PhotoPrism',icon:'📸',desc:'Galerie photo auto-tagguée par IA',ram:2,link:'https://www.photoprism.app/',color:'#c4a35a'},
    {id:'immich',name:'Immich',icon:'📷',desc:'Alternative Google Photos self-hosted',ram:1.5,link:'https://immich.app/',color:'#4250af'},
    {id:'navidrome',name:'Navidrome',icon:'🎵',desc:'Serveur musical (Spotify-like)',ram:0.3,link:'https://www.navidrome.org/',color:'#00bcd4'},
    {id:'calibre',name:'Calibre-Web',icon:'📚',desc:'Bibliothèque eBooks en ligne',ram:0.5,link:'https://github.com/janeczku/calibre-web',color:'#78909c'},
    {id:'paperless',name:'Paperless-ngx',icon:'📄',desc:'Gestion de documents numériques',ram:1,link:'https://docs.paperless-ngx.com/',color:'#17541f'},
    {id:'uptime',name:'Uptime Kuma',icon:'📈',desc:'Monitoring de tes services',ram:0.3,link:'https://github.com/louislam/uptime-kuma',color:'#5cdd8b'},
    {id:'n8n',name:'n8n',icon:'⚡',desc:'Automatisation workflows (Zapier self-hosted)',ram:0.5,link:'https://n8n.io/',color:'#ff6d5a'},
    {id:'gitea',name:'Gitea',icon:'🐙',desc:'Git auto-hébergé (GitHub léger)',ram:0.5,link:'https://about.gitea.com/',color:'#609926'},
    {id:'syncthing',name:'Syncthing',icon:'🔄',desc:'Synchronisation fichiers P2P',ram:0.3,link:'https://syncthing.net/',color:'#0891d1'},
    {id:'minecraft',name:'Minecraft Server',icon:'⛏️',desc:'Serveur Minecraft Java',ram:2,link:'https://www.minecraft.net/fr-fr/download/server',color:'#5d8c38'},
    {id:'retroarch',name:'RetroArch Web',icon:'🎮',desc:'Émulateur rétro en réseau',ram:1,link:'https://www.retroarch.com/',color:'#00b0f0'},
    {id:'moonlight',name:'Moonlight',icon:'🌙',desc:'Streaming de jeux depuis le Mac',ram:0.5,link:'https://moonlight-stream.org/',color:'#1a73e8'}
  ],

  render(container) {
    if (!container) return;

    const isAdmin = window.App?.isAdmin || false;

    if (!isAdmin) {
      container.innerHTML = `
        <div class="admin-lock">
          <div class="icon">🔒</div>
          <h3>Accès Restreint</h3>
          <p>Cette section est réservée aux administrateurs. Entre le mot de passe admin pour continuer.</p>
          <input type="password" class="auth-input" id="admin-pwd" placeholder="Mot de passe admin..." 
            style="max-width:280px;margin:0 auto 16px;display:block;" 
            onkeydown="if(event.key==='Enter')MacHub.checkAdmin()">
          <div class="auth-error" id="admin-error" style="max-width:280px;margin:0 auto 16px;">Mot de passe incorrect</div>
          <button class="btn btn-primary" onclick="MacHub.checkAdmin()" style="max-width:280px;width:100%;justify-content:center;">🔓 Déverrouiller</button>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="tool-panel">
        <div class="tool-panel-header">
          <div class="icon">🖥️</div>
          <h3>Mac mini M4 Hub</h3>
          <p>Comparatif complet, sélecteur de projets serveur interactif et calculateur de ressources.</p>
        </div>
        <div class="tool-tabs">
          <button class="tool-tab active" onclick="MacHub.showTab('compare')" data-tab="compare">📊 Comparatif</button>
          <button class="tool-tab" onclick="MacHub.showTab('projects')" data-tab="projects">🚀 Projets Serveur</button>
          <button class="tool-tab" onclick="MacHub.showTab('ram')" data-tab="ram">🧮 Calculateur RAM</button>
        </div>
        <div class="tool-tab-content active" id="mac-tab-compare">
          <p style="color:var(--text-secondary);font-size:13px;margin-bottom:16px;">Classement du plus performant au moins performant. Prix indicatifs selon la configuration.</p>
          <div style="overflow-x:auto;">
            <table class="mac-table">
              <thead><tr><th>Modèle</th><th>Chip</th><th>CPU</th><th>GPU</th><th>RAM Max</th><th>SSD Max</th><th>Conso Max</th><th>Conso Idle</th><th>Prix (base→max)</th></tr></thead>
              <tbody>
                <tr><td><div class="mac-model-name"><span class="mac-chip chip-m4pro">M4 PRO</span><a href="https://www.apple.com/fr/shop/buy-mac/mac-mini" target="_blank" class="mac-link">Mac mini M4 Pro</a></div></td><td>M4 Pro (14c)</td><td>14 cœurs<br><small style="color:var(--text-muted)">10P+4E</small></td><td>20 cœurs</td><td>64 Go</td><td>8 To</td><td><span style="color:var(--red)">~65W</span></td><td><span style="color:var(--green)">~8W</span></td><td class="mac-price">1 599€ → 4 199€</td></tr>
                <tr><td><div class="mac-model-name"><span class="mac-chip chip-m4">M4</span><a href="https://www.apple.com/fr/shop/buy-mac/mac-mini" target="_blank" class="mac-link">Mac mini M4</a></div></td><td>M4 (10c)</td><td>10 cœurs<br><small style="color:var(--text-muted)">4P+6E</small></td><td>10 cœurs</td><td>32 Go</td><td>2 To</td><td><span style="color:var(--yellow)">~35W</span></td><td><span style="color:var(--green)">~5W</span></td><td class="mac-price">699€ → 1 599€</td></tr>
                <tr><td><div class="mac-model-name"><span class="mac-chip chip-m2pro">M2 PRO</span><a href="https://www.apple.com/fr/mac-mini/" target="_blank" class="mac-link">Mac mini M2 Pro</a></div></td><td>M2 Pro (12c)</td><td>12 cœurs<br><small style="color:var(--text-muted)">8P+4E</small></td><td>19 cœurs</td><td>32 Go</td><td>8 To</td><td><span style="color:var(--red)">~55W</span></td><td><span style="color:var(--green)">~7W</span></td><td class="mac-price">1 499€ → 3 899€</td></tr>
                <tr><td><div class="mac-model-name"><span class="mac-chip chip-m2">M2</span><a href="https://www.apple.com/fr/mac-mini/" target="_blank" class="mac-link">Mac mini M2</a></div></td><td>M2 (8c)</td><td>8 cœurs<br><small style="color:var(--text-muted)">4P+4E</small></td><td>10 cœurs</td><td>24 Go</td><td>2 To</td><td><span style="color:var(--yellow)">~30W</span></td><td><span style="color:var(--green)">~5W</span></td><td class="mac-price">699€ → 1 399€</td></tr>
                <tr><td><div class="mac-model-name"><span class="mac-chip chip-m1">M1</span>Mac mini M1 (2020)</div></td><td>M1 (8c)</td><td>8 cœurs<br><small style="color:var(--text-muted)">4P+4E</small></td><td>8 cœurs</td><td>16 Go</td><td>2 To</td><td><span style="color:var(--yellow)">~39W</span></td><td><span style="color:var(--green)">~7W</span></td><td class="mac-price">799€ → 1 299€ <small style="color:var(--text-muted)">(occasion)</small></td></tr>
              </tbody>
            </table>
          </div>
          <div style="background:var(--bg-primary);border-radius:var(--radius-sm);padding:20px;margin-top:16px;">
            <h4 style="font-size:14px;margin-bottom:12px;color:var(--accent)">💡 Notre recommandation</h4>
            <p style="color:var(--text-secondary);font-size:13px;line-height:1.7;">Pour un usage serveur polyvalent (media + LLM + VPN + dev), le <strong style="color:var(--text-primary)">Mac mini M4 avec 16 Go de RAM</strong> offre le meilleur rapport performance/prix/consommation. Le M4 Pro n'est utile que si tu fais du montage vidéo 4K+ ou que tu veux héberger plusieurs LLM lourds en parallèle.</p>
          </div>
        </div>
        <div class="tool-tab-content" id="mac-tab-projects">
          <p style="color:var(--text-secondary);font-size:13px;margin-bottom:16px;">Sélectionne les projets que tu veux héberger sur ton Mac mini M4. Les liens te mènent vers les repos officiels ou les guides d'installation.</p>
          <div class="project-grid" id="project-grid"></div>
          <div class="ram-meter">
            <h4>📊 Consommation estimée des projets sélectionnés</h4>
            <div class="ram-bar-container" id="ram-bar"></div>
            <div class="ram-legend" id="ram-legend"></div>
            <div class="ram-stats">
              <div class="ram-stat"><div class="ram-stat-value" id="ram-total">16 Go</div><div class="ram-stat-label">RAM totale</div></div>
              <div class="ram-stat"><div class="ram-stat-value" id="ram-allocated">0 Go</div><div class="ram-stat-label">Allouée</div></div>
              <div class="ram-stat"><div class="ram-stat-value" id="ram-remaining">16 Go</div><div class="ram-stat-label">Disponible</div></div>
            </div>
            <div class="ram-warning" id="ram-warning">⚠️ Attention : tu dépasses la capacité RAM de 16 Go. macOS utilisera le swap (SSD) ce qui réduira les performances. Pense à passer à 24 Go ou 32 Go.</div>
          </div>
          <div class="compatibility-check">
            <h4>🎨 Compatibilité Photoshop & Apps Pro</h4>
            <div class="compat-item"><span class="compat-ok">✓</span> Photoshop 2025 — Parfaitement compatible, accélération Metal native</div>
            <div class="compat-item"><span class="compat-ok">✓</span> Illustrator — Fonctionne sans problème</div>
            <div class="compat-item"><span class="compat-ok">✓</span> Final Cut Pro — Excellent, encode HEVC/H.264 accéléré hardware</div>
            <div class="compat-item"><span class="compat-ok">✓</span> Xcode — Compilation ultra-rapide</div>
            <div class="compat-item"><span class="compat-warn">⚠</span> After Effects — Fonctionne mais 16 Go peut être juste pour les gros projets</div>
            <div class="compat-item"><span class="compat-ok">✓</span> Blender — Support Metal 3, rendu accéléré</div>
            <div class="compat-item"><span class="compat-ok">✓</span> DaVinci Resolve — Accélération complète via Metal</div>
          </div>
        </div>
        <div class="tool-tab-content" id="mac-tab-ram">
          <p style="color:var(--text-secondary);font-size:13px;margin-bottom:16px;">Simule différentes configurations de RAM et vois l'impact sur tes projets.</p>
          <div class="form-group" style="max-width:300px;">
            <label class="form-label">Configuration RAM</label>
            <select class="form-select" id="ram-config" onchange="MacHub.updateRamCalc()">
              <option value="8">8 Go (base)</option>
              <option value="16" selected>16 Go (+200€)</option>
              <option value="24">24 Go (+400€)</option>
              <option value="32">32 Go (+600€)</option>
            </select>
          </div>
          <div id="ram-calc-result" style="margin-top:20px;"></div>
        </div>
      </div>
    `;

    this.renderProjectGrid();
    this.updateRamCalc();
  },

  checkAdmin() {
    const input = document.getElementById('admin-pwd').value;
    if (input === '1980') {
      window.App.isAdmin = true;
      localStorage.setItem(window.App.getStorageKey('admin'), 'true');
      window.App.showToast('Accès admin accordé', 'success');
      const container = document.getElementById('tool-machub');
      if (container) this.render(container);
    } else {
      const err = document.getElementById('admin-error');
      if (err) err.classList.add('show');
      setTimeout(() => { if (err) err.classList.remove('show'); }, 3000);
    }
  },

  showTab(tabId) {
    document.querySelectorAll('#tool-machub .tool-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('#tool-machub .tool-tab-content').forEach(c => c.classList.remove('active'));
    document.querySelector(`#tool-machub [data-tab="${tabId}"]`)?.classList.add('active');
    document.getElementById('mac-tab-' + tabId)?.classList.add('active');
    if (tabId === 'projects') this.renderProjectGrid();
  },

  renderProjectGrid() {
    const grid = document.getElementById('project-grid');
    if (!grid) return;
    grid.innerHTML = '';
    this.PROJECTS.forEach(p => {
      const card = document.createElement('div');
      card.className = 'project-card' + (this.selectedProjects.has(p.id) ? ' selected' : '');
      card.innerHTML = `<div class="project-icon">${p.icon}</div><div class="project-name">${p.name}</div><div class="project-desc">${p.desc}</div><div class="project-ram">💾 ~${p.ram} Go RAM</div>`;
      card.onclick = () => this.toggleProject(p.id);
      grid.appendChild(card);
    });
    this.updateRamMeter();
  },

  toggleProject(id) {
    if (this.selectedProjects.has(id)) this.selectedProjects.delete(id);
    else this.selectedProjects.add(id);
    if (window.App) window.App.saveToStorage();
    this.renderProjectGrid();
  },

  updateRamMeter() {
    const totalRam = 16;
    let usedRam = 0;
    const segments = [];
    this.selectedProjects.forEach(pid => { 
      const p = this.PROJECTS.find(x => x.id === pid); 
      if (p) { usedRam += p.ram; segments.push({ name: p.name, ram: p.ram, color: p.color }); } 
    });
    const usedPct = Math.min((usedRam / totalRam) * 100, 100);
    const freeRam = Math.max(totalRam - usedRam, 0);
    const freePct = 100 - usedPct;

    const bar = document.getElementById('ram-bar');
    const legend = document.getElementById('ram-legend');

    if (bar) {
      let barHtml = '';
      segments.forEach(s => { 
        const pct = (s.ram / totalRam) * 100; 
        barHtml += `<div class="ram-bar-segment" style="width:${pct}%;background:${s.color}" title="${s.name}: ${s.ram} Go">${s.name}</div>`; 
      });
      if (freeRam > 0) barHtml += `<div class="ram-bar-segment" style="width:${freePct}%;background:var(--bg-tertiary);color:var(--text-muted)">${freeRam.toFixed(1)} Go libres</div>`;
      bar.innerHTML = barHtml;
    }
    if (legend) legend.innerHTML = segments.map(s => `<div class="ram-legend-item"><div class="ram-legend-dot" style="background:${s.color}"></div><span>${s.name} — ${s.ram} Go</span></div>`).join('');

    const alloc = document.getElementById('ram-allocated');
    const remain = document.getElementById('ram-remaining');
    if (alloc) alloc.textContent = usedRam.toFixed(1) + ' Go';
    if (remain) remain.textContent = freeRam.toFixed(1) + ' Go';

    const warning = document.getElementById('ram-warning');
    if (warning) warning.classList.toggle('show', usedRam > totalRam);
  },

  updateRamCalc() {
    const config = parseInt(document.getElementById('ram-config').value);
    const container = document.getElementById('ram-calc-result');
    if (!container) return;
    let rec = '';
    if (config === 8) rec = "❌ Trop juste. Tu ne pourras faire tourner qu'un seul service léger. Photoshop sera très lent.";
    else if (config === 16) rec = "✅ Parfait pour 4-6 services + Photoshop. Le sweet spot qualité/prix.";
    else if (config === 24) rec = "✅ Idéal pour 8-10 services + usage pro confortable. Marge de manoeuvre.";
    else if (config === 32) rec = "✅ Overkill pour la plupart des usages. Utile si tu fais du montage vidéo 4K ou héberges 15+ services.";
    container.innerHTML = `<div style="background:var(--bg-primary);border:1px solid var(--border);border-radius:8px;padding:20px;"><h4 style="margin-bottom:12px;font-family:'Space Grotesk',sans-serif;">Configuration ${config} Go</h4><p style="color:var(--text-secondary);font-size:13px;line-height:1.7;margin-bottom:12px;">${rec}</p><div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;font-size:12px;color:var(--text-muted);"><div>🎬 Jellyfin: OK</div><div>🧠 Ollama (7B): ${config >= 16 ? 'OK' : 'Trop juste'}</div><div>🧠 Ollama (13B): ${config >= 24 ? 'OK' : 'Non'}</div><div>🎨 Photoshop: ${config >= 16 ? 'OK' : 'Lent'}</div><div>☁️ Nextcloud: OK</div><div>🏠 Home Assistant: OK</div></div></div>`;
  }
};
