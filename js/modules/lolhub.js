// ===== LOL HUB MODULE =====
export const LoLHub = {
  render(container) {
    if (!container) return;
    container.innerHTML = `
      <div class="tool-panel">
        <div class="tool-panel-header">
          <div class="icon">⚔️</div>
          <h3>LoL Hub</h3>
          <p>Team Builder aléatoire et Tournoi 1v1 avec bracket.</p>
        </div>
        <div class="tool-tabs">
          <button class="tool-tab active" onclick="LoLHub.showTab('team')" data-tab="team">👥 Team Builder</button>
          <button class="tool-tab" onclick="LoLHub.showTab('tournament')" data-tab="tournament">🏆 Tournoi 1v1</button>
        </div>
        <div class="tool-tab-content active" id="lol-tab-team">
          <div class="form-group">
            <label class="form-label">Joueurs (un par ligne)</label>
            <div class="lol-players" id="lol-players">
              <input type="text" class="lol-player-input" placeholder="Joueur 1" value="Anas">
              <input type="text" class="lol-player-input" placeholder="Joueur 2" value="Abdallah">
              <input type="text" class="lol-player-input" placeholder="Joueur 3" value="Taha">
              <input type="text" class="lol-player-input" placeholder="Joueur 4" value="Youssef">
              <input type="text" class="lol-player-input" placeholder="Joueur 5" value="Wassim">
              <input type="text" class="lol-player-input" placeholder="Joueur 6" value="Momo">
              <input type="text" class="lol-player-input" placeholder="Joueur 7" value="Kissi">
              <input type="text" class="lol-player-input" placeholder="Joueur 8" value="Rayane">
              <input type="text" class="lol-player-input" placeholder="Joueur 9" value="Attilio">
              <input type="text" class="lol-player-input" placeholder="Joueur 10" value="Hichem">
            </div>
            <button class="btn btn-primary" onclick="LoLHub.generateTeams()" style="width:100%;justify-content:center;">🎲 Générer les équipes</button>
          </div>
          <div id="lol-teams-result" style="display:none;">
            <div class="lol-teams">
              <div class="lol-team lol-team-blue"><h4>🔵 Équipe Bleue</h4><ul id="team-blue" style="list-style:none;color:var(--text-secondary);font-size:14px;line-height:2;"></ul></div>
              <div class="lol-team lol-team-red"><h4>🔴 Équipe Rouge</h4><ul id="team-red" style="list-style:none;color:var(--text-secondary);font-size:14px;line-height:2;"></ul></div>
            </div>
          </div>
        </div>
        <div class="tool-tab-content" id="lol-tab-tournament">
          <div class="form-group">
            <label class="form-label">Participants du tournoi (un par ligne)</label>
            <div class="lol-players" id="tournament-players">
              <input type="text" class="lol-player-input" placeholder="Joueur 1" value="Anas">
              <input type="text" class="lol-player-input" placeholder="Joueur 2" value="Abdallah">
              <input type="text" class="lol-player-input" placeholder="Joueur 3" value="Taha">
              <input type="text" class="lol-player-input" placeholder="Joueur 4" value="Youssef">
              <input type="text" class="lol-player-input" placeholder="Joueur 5" value="Wassim">
              <input type="text" class="lol-player-input" placeholder="Joueur 6" value="Momo">
              <input type="text" class="lol-player-input" placeholder="Joueur 7" value="Kissi">
              <input type="text" class="lol-player-input" placeholder="Joueur 8" value="Rayane">
            </div>
            <button class="btn btn-primary" onclick="LoLHub.generateTournament()" style="width:100%;justify-content:center;">🏆 Générer le bracket</button>
          </div>
          <div id="tournament-bracket" style="display:none;margin-top:24px;"></div>
        </div>
      </div>
    `;
  },

  showTab(tabId) {
    document.querySelectorAll('#tool-lol .tool-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('#tool-lol .tool-tab-content').forEach(c => c.classList.remove('active'));
    document.querySelector(`#tool-lol [data-tab="${tabId}"]`)?.classList.add('active');
    document.getElementById('lol-tab-' + tabId)?.classList.add('active');
  },

  generateTeams() {
    const inputs = document.querySelectorAll('#lol-players .lol-player-input');
    const players = Array.from(inputs).map(i => i.value.trim()).filter(v => v);
    if (players.length < 2) { 
      if (window.App) window.App.showToast('Ajoute au moins 2 joueurs', 'error'); 
      return; 
    }
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    const mid = Math.ceil(shuffled.length / 2);
    const team1 = shuffled.slice(0, mid);
    const team2 = shuffled.slice(mid);

    const blue = document.getElementById('team-blue');
    const red = document.getElementById('team-red');
    if (blue) blue.innerHTML = team1.map(p => `<li>👤 ${window.App?.escapeHtml(p) || p}</li>`).join('');
    if (red) red.innerHTML = team2.map(p => `<li>👤 ${window.App?.escapeHtml(p) || p}</li>`).join('');

    const result = document.getElementById('lol-teams-result');
    if (result) result.style.display = 'block';
    if (window.App) window.App.showToast('Équipes générées !', 'success');
  },

  generateTournament() {
    const inputs = document.querySelectorAll('#tournament-players .lol-player-input');
    const players = Array.from(inputs).map(i => i.value.trim()).filter(v => v);
    if (players.length < 2) { 
      if (window.App) window.App.showToast('Ajoute au moins 2 joueurs', 'error'); 
      return; 
    }
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    const matches = [];
    for (let i = 0; i < shuffled.length; i += 2) {
      if (shuffled[i + 1]) matches.push({ p1: shuffled[i], p2: shuffled[i + 1], round: 1, winner: null });
      else matches.push({ p1: shuffled[i], p2: 'BYE', round: 1, bye: true, winner: shuffled[i] });
    }

    let html = '<div class="bracket-round"><div class="bracket-round-title">Tour 1 — Quarts de finale</div>';
    matches.forEach((m, i) => {
      const p1 = window.App?.escapeHtml(m.p1) || m.p1;
      const p2 = window.App?.escapeHtml(m.p2) || m.p2;
      html += `<div class="bracket-match ${m.bye ? 'winner' : ''}" id="match-r1-${i}">
        <div class="match-players">
          <span style="font-weight:600">${p1}</span>
          <span class="match-vs">vs</span>
          <span style="font-weight:600">${p2}</span>
        </div>
        <div class="match-actions">
          ${m.bye ? '<span style="color:var(--green);font-size:12px">✓ Qualifié</span>' : 
          `<button class="pwd-vault-btn" onclick="LoLHub.setWinner('match-r1-${i}', '${p1.replace(/'/g, "\'")}')">${p1} gagne</button>
          <button class="pwd-vault-btn" onclick="LoLHub.setWinner('match-r1-${i}', '${p2.replace(/'/g, "\'")}')">${p2} gagne</button>`}
        </div>
      </div>`;
    });
    html += '</div>';

    const bracket = document.getElementById('tournament-bracket');
    if (bracket) {
      bracket.innerHTML = html;
      bracket.style.display = 'block';
    }
    if (window.App) window.App.showToast('Bracket généré !', 'success');
  },

  setWinner(matchId, winner) {
    const match = document.getElementById(matchId);
    if (match) {
      match.classList.add('winner');
      const actions = match.querySelector('.match-actions');
      if (actions) actions.innerHTML = `<span style="color:var(--green);font-size:12px;font-weight:600">🏆 ${winner}</span>`;
      if (window.App) window.App.showToast(winner + ' gagne !', 'success');
    }
  }
};
