// ===== MATCH HISTORY FORMATTER MODULE =====
export const MatchFormatter = {
  matches: [],
  currentTheme: 'dark',

  THEMES: {
    dark: { bg: '#1a1b2e', text: '#e8e9f0', accent: '#818cf8', win: '#34d399', loss: '#f87171' },
    lol: { bg: '#0a1428', text: '#c9aa6e', accent: '#c89b3c', win: '#0ac8b9', loss: '#e84057' },
    minimal: { bg: '#0a0b14', text: '#e8e9f0', accent: '#818cf8', win: '#34d399', loss: '#f87171' },
    neon: { bg: '#0a0a0a', text: '#00ff88', accent: '#ff00ff', win: '#00ff88', loss: '#ff0066' }
  },

  render(container) {
    if (!container) return;
    container.innerHTML = `
      <div class="tool-panel">
        <div class="tool-panel-header">
          <div class="icon">🏅</div>
          <h3>Match History Formatter</h3>
          <p>Formate ton historique LoL pour Discord, Reddit ou les reseaux sociaux.</p>
        </div>
        <div class="matchfmt-toolbar">
          <div class="matchfmt-themes">
            <span class="form-label" style="margin-bottom:0;margin-right:8px;">Theme:</span>
            <button class="btn ${this.currentTheme === 'dark' ? 'active' : ''}" onclick="MatchFormatter.setTheme('dark')">🌙 Dark</button>
            <button class="btn ${this.currentTheme === 'lol' ? 'active' : ''}" onclick="MatchFormatter.setTheme('lol')">⚔️ LoL</button>
            <button class="btn ${this.currentTheme === 'minimal' ? 'active' : ''}" onclick="MatchFormatter.setTheme('minimal')">⚪ Minimal</button>
            <button class="btn ${this.currentTheme === 'neon' ? 'active' : ''}" onclick="MatchFormatter.setTheme('neon')">🌈 Neon</button>
          </div>
          <div class="matchfmt-actions">
            <button class="btn" onclick="MatchFormatter.loadExample()">📋 Exemple</button>
            <button class="btn btn-primary" onclick="MatchFormatter.generate()">✨ Generer</button>
            <button class="btn" onclick="MatchFormatter.copyOutput()">📋 Copier</button>
          </div>
        </div>
        <div class="matchfmt-input-section">
          <label class="form-label">Colle ton historique de matchs (format: Champion K/D/A Resultat Duree)</label>
          <textarea class="form-textarea matchfmt-input" id="matchfmt-input" placeholder="Exemple:
Yasuo 12/3/7 W 28:45
Lee Sin 4/8/15 L 35:20
Ahri 8/2/10 W 22:15
Jinx 15/5/8 W 31:40
Thresh 2/6/22 L 42:10"></textarea>
          <div class="matchfmt-paste-hint">
            Format supporte: <code>Champion K/D/A W/L MM:SS</code> ou <code>Champion | KDA | Result | Duree</code>
          </div>
        </div>
        <div class="matchfmt-output-section">
          <h4 style="font-family:'Space Grotesk',sans-serif;margin-bottom:16px;">📊 Resultat formate</h4>
          <div class="matchfmt-preview" id="matchfmt-preview"></div>
          <pre class="matchfmt-code" id="matchfmt-code"></pre>
        </div>
      </div>
    `;
  },

  setTheme(theme) {
    this.currentTheme = theme;
    document.querySelectorAll('.matchfmt-themes .btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    if (this.matches.length > 0) this.renderOutput();
  },

  loadExample() {
    const example = `Yasuo 12/3/7 W 28:45
Lee Sin 4/8/15 L 35:20
Ahri 8/2/10 W 22:15
Jinx 15/5/8 W 31:40
Thresh 2/6/22 L 42:10
Zed 9/4/6 W 26:30
Lux 3/7/18 L 38:15
Vayne 18/2/5 W 29:50`;
    document.getElementById('matchfmt-input').value = example;
    this.generate();
  },

  parseInput(text) {
    const lines = text.trim().split('\n').filter(l => l.trim());
    const matches = [];

    lines.forEach(line => {
      // Try different formats
      // Format: Champion K/D/A W/L MM:SS
      let match = line.match(/^([\w\s']+)\s+(\d+)\/(\d+)\/(\d+)\s+([WL])\s+(\d+):(\d+)$/i);
      if (match) {
        matches.push({
          champion: match[1].trim(),
          kills: parseInt(match[2]),
          deaths: parseInt(match[3]),
          assists: parseInt(match[4]),
          result: match[5].toUpperCase(),
          duration: parseInt(match[5]) * 60 + parseInt(match[6])
        });
        return;
      }

      // Format: Champion | KDA | Result | Duration
      match = line.match(/^([^|]+)\|\s*(\d+)\/(\d+)\/(\d+)\s*\|\s*([WL])\s*\|\s*(\d+):(\d+)$/i);
      if (match) {
        matches.push({
          champion: match[1].trim(),
          kills: parseInt(match[2]),
          deaths: parseInt(match[3]),
          assists: parseInt(match[4]),
          result: match[5].toUpperCase(),
          duration: parseInt(match[6]) * 60 + parseInt(match[7])
        });
      }
    });

    return matches;
  },

  generate() {
    const input = document.getElementById('matchfmt-input').value;
    this.matches = this.parseInput(input);

    if (this.matches.length === 0) {
      if (window.App) window.App.showToast('Aucun match valide trouve. Verifie le format.', 'error');
      return;
    }

    this.renderOutput();
    if (window.App) window.App.showToast(`${this.matches.length} matches formates`, 'success');
  },

  renderOutput() {
    const preview = document.getElementById('matchfmt-preview');
    const code = document.getElementById('matchfmt-code');
    if (!preview || !code) return;

    const stats = this.calculateStats();
    const theme = this.THEMES[this.currentTheme];

    // HTML Preview
    preview.innerHTML = `
      <div class="matchfmt-card" style="background:${theme.bg};border-color:${theme.accent}30">
        <div class="matchfmt-header" style="color:${theme.accent}">
          <span>🏆</span>
          <span>Resume des matchs</span>
          <span class="matchfmt-winrate ${stats.winrate >= 50 ? 'positive' : 'negative'}" style="color:${stats.winrate >= 50 ? theme.win : theme.loss}">${stats.winrate}% WR</span>
        </div>
        <div class="matchfmt-stats-row">
          <div class="matchfmt-stat">
            <div class="matchfmt-stat-value" style="color:${theme.text}">${stats.total}</div>
            <div class="matchfmt-stat-label">Matchs</div>
          </div>
          <div class="matchfmt-stat">
            <div class="matchfmt-stat-value" style="color:${theme.win}">${stats.wins}</div>
            <div class="matchfmt-stat-label">Victoires</div>
          </div>
          <div class="matchfmt-stat">
            <div class="matchfmt-stat-value" style="color:${theme.loss}">${stats.losses}</div>
            <div class="matchfmt-stat-label">Defaites</div>
          </div>
          <div class="matchfmt-stat">
            <div class="matchfmt-stat-value" style="color:${theme.text}">${stats.avgKDA}</div>
            <div class="matchfmt-stat-label">KDA Moyen</div>
          </div>
        </div>
        <div class="matchfmt-matches">
          ${this.matches.map(m => `
            <div class="matchfmt-match ${m.result === 'W' ? 'win' : 'loss'}" style="border-color:${m.result === 'W' ? theme.win + '30' : theme.loss + '30'}">
              <div class="matchfmt-champ">${m.champion}</div>
              <div class="matchfmt-kda" style="color:${theme.text}">${m.kills}/${m.deaths}/${m.assists}</div>
              <div class="matchfmt-result" style="color:${m.result === 'W' ? theme.win : theme.loss}">${m.result === 'W' ? '✅ WIN' : '❌ LOSS'}</div>
              <div class="matchfmt-duration">${Math.floor(m.duration / 60)}:${(m.duration % 60).toString().padStart(2, '0')}</div>
            </div>
          `).join('')}
        </div>
        <div class="matchfmt-footer" style="color:${theme.accent}">
          Genere avec FlowBoard Match Formatter
        </div>
      </div>
    `;

    // Text output for copy
    let textOutput = `🏆 **Resume des matchs LoL**\n\n`;
    textOutput += `📊 **Stats:** ${stats.total} matchs | ${stats.wins}W/${stats.losses}L | ${stats.winrate}% WR | KDA: ${stats.avgKDA}\n\n`;
    textOutput += `**Matchs:**\n`;
    this.matches.forEach(m => {
      const kda = ((m.kills + m.assists) / Math.max(m.deaths, 1)).toFixed(2);
      const emoji = m.result === 'W' ? '✅' : '❌';
      textOutput += `${emoji} **${m.champion}** ${m.kills}/${m.deaths}/${m.assists} (KDA: ${kda}) | ${m.result === 'W' ? 'WIN' : 'LOSS'} | ${Math.floor(m.duration / 60)}:${(m.duration % 60).toString().padStart(2, '0')}\n`;
    });
    textOutput += `\n_Genere avec FlowBoard_`;

    code.textContent = textOutput;
  },

  calculateStats() {
    const total = this.matches.length;
    const wins = this.matches.filter(m => m.result === 'W').length;
    const losses = total - wins;
    const winrate = total > 0 ? Math.round((wins / total) * 100) : 0;

    const totalKills = this.matches.reduce((s, m) => s + m.kills, 0);
    const totalDeaths = this.matches.reduce((s, m) => s + m.deaths, 0);
    const totalAssists = this.matches.reduce((s, m) => s + m.assists, 0);
    const avgKDA = totalDeaths > 0 ? ((totalKills + totalAssists) / totalDeaths).toFixed(2) : '∞';

    return { total, wins, losses, winrate, avgKDA };
  },

  copyOutput() {
    const code = document.getElementById('matchfmt-code').textContent;
    if (!code) {
      if (window.App) window.App.showToast('Genere d\'abord un resume', 'error');
      return;
    }
    navigator.clipboard.writeText(code).then(() => {
      if (window.App) window.App.showToast('Format copie pour Discord/Reddit', 'success');
    });
  }
};
