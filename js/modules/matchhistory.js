// ===== MATCH HISTORY FORMATTER MODULE =====
export const MatchHistory = {
  matches: [],
  theme: 'default',

  THEMES: {
    default: { bg: 'var(--bg-card)', accent: 'var(--accent)', border: 'var(--border)' },
    dark: { bg: '#0f0f23', accent: '#ff6b6b', border: '#333' },
    ocean: { bg: '#0a1628', accent: '#00d4ff', border: '#1a3a5c' },
    forest: { bg: '#0a1f0a', accent: '#00ff88', border: '#1a3a1a' },
  },

  render(container) {
    if (!container) return;
    container.innerHTML = `
      <div class="tool-panel">
        <div class="tool-panel-header">
          <div class="icon">📈</div>
          <h3>Match History Formatter</h3>
          <p>Colle ton historique de matchs LoL et génère un résumé stylisé.</p>
        </div>
        <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;">
          <select class="form-select" id="match-theme" onchange="MatchHistory.setTheme(this.value)" style="max-width:180px;">
            <option value="default">🎨 Défaut</option>
            <option value="dark">🌑 Dark</option>
            <option value="ocean">🌊 Ocean</option>
            <option value="forest">🌲 Forest</option>
          </select>
          <button class="btn btn-primary" onclick="MatchHistory.generate()">⚡ Générer le résumé</button>
          <button class="btn" onclick="MatchHistory.copy()">📋 Copier</button>
        </div>
        <div class="form-group">
          <label class="form-label">Colle ton historique (format : Champion K/D/A Victoire/Défaite Durée)</label>
          <textarea class="form-textarea" id="match-input" placeholder="Yasuo 12/3/5 Victoire 28m\nZed 8/7/2 Défaite 32m\nAhri 15/1/9 Victoire 24m" style="min-height:150px;font-family:'JetBrains Mono',monospace;"></textarea>
        </div>
        <div id="match-result" style="display:none;margin-top:24px;">
          <h4 style="font-family:'Space Grotesk',sans-serif;font-size:16px;margin-bottom:12px;">📊 Résumé</h4>
          <div id="match-summary" style="background:var(--bg-primary);border:1px solid var(--border);border-radius:var(--radius-sm);padding:20px;font-family:'JetBrains Mono',monospace;font-size:13px;line-height:1.8;"></div>
        </div>
      </div>
    `;
  },

  setTheme(theme) {
    this.theme = theme;
  },

  generate() {
    const input = document.getElementById('match-input').value.trim();
    if (!input) {
      if (window.App) window.App.showToast('Colle d\'abord ton historique', 'error');
      return;
    }

    const lines = input.split('\n').filter(l => l.trim());
    this.matches = [];

    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 4) {
        const champion = parts[0];
        const kda = parts[1];
        const result = parts[2];
        const duration = parts[3];
        this.matches.push({ champion, kda, result: result.toLowerCase(), duration });
      }
    });

    if (this.matches.length === 0) {
      if (window.App) window.App.showToast('Format invalide', 'error');
      return;
    }

    this.renderSummary();
  },

  renderSummary() {
    const total = this.matches.length;
    const wins = this.matches.filter(m => m.result.includes('vict') || m.result === 'win' || m.result === 'v').length;
    const losses = total - wins;
    const winrate = Math.round((wins / total) * 100);

    // Parse KDA
    let totalK = 0, totalD = 0, totalA = 0;
    const champStats = {};

    this.matches.forEach(m => {
      const kdaParts = m.kda.split('/');
      if (kdaParts.length === 3) {
        const k = parseInt(kdaParts[0]) || 0;
        const d = parseInt(kdaParts[1]) || 0;
        const a = parseInt(kdaParts[2]) || 0;
        totalK += k; totalD += d; totalA += a;

        if (!champStats[m.champion]) champStats[m.champion] = { games: 0, wins: 0, k: 0, d: 0, a: 0 };
        champStats[m.champion].games++;
        champStats[m.champion].wins += (m.result.includes('vict') || m.result === 'win') ? 1 : 0;
        champStats[m.champion].k += k;
        champStats[m.champion].d += d;
        champStats[m.champion].a += a;
      }
    });

    const avgK = (totalK / total).toFixed(1);
    const avgD = (totalD / total).toFixed(1);
    const avgA = (totalA / total).toFixed(1);
    const kdaRatio = totalD > 0 ? ((totalK + totalA) / totalD).toFixed(2) : '∞';

    const theme = this.THEMES[this.theme];

    let html = `
╔══════════════════════════════════════════════════════════════╗
║              📊 RÉSUMÉ MATCH HISTORY - LOL                   ║
╠══════════════════════════════════════════════════════════════╣
║  Parties jouées : ${String(total).padStart(3)}  │  Winrate : ${String(winrate).padStart(3)}%              ║
║  ✅ Victoires : ${String(wins).padStart(3)}    │  ❌ Défaites : ${String(losses).padStart(3)}            ║
╠══════════════════════════════════════════════════════════════╣
║  KDA Moyen : ${avgK}/${avgD}/${avgA}  │  Ratio : ${kdaRatio}                      ║
╠══════════════════════════════════════════════════════════════╣
║  Champions joués :                                           ║
`;

    Object.entries(champStats).forEach(([champ, stats]) => {
      const cWinrate = Math.round((stats.wins / stats.games) * 100);
      const cKda = stats.d > 0 ? ((stats.k + stats.a) / stats.d).toFixed(2) : '∞';
      html += `║  • ${champ.padEnd(12)} ${String(stats.games).padStart(2)}j  ${String(cWinrate).padStart(3)}% WR  KDA ${cKda.padStart(5)}      ║
`;
    });

    html += `╚══════════════════════════════════════════════════════════════╝`;

    const resultDiv = document.getElementById('match-result');
    const summaryDiv = document.getElementById('match-summary');
    if (resultDiv) resultDiv.style.display = 'block';
    if (summaryDiv) summaryDiv.innerHTML = `<pre style="margin:0;white-space:pre-wrap;word-break:break-all;">${html}</pre>`;

    if (window.App) window.App.showToast('Résumé généré !', 'success');
  },

  copy() {
    const summary = document.getElementById('match-summary');
    if (!summary) return;
    const text = summary.textContent;
    navigator.clipboard.writeText(text).then(() => {
      if (window.App) window.App.showToast('Résumé copié', 'success');
    });
  }
};
