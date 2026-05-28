// ===== MARKDOWN EXPORTER MODULE =====
export const MarkdownExporter = {
  render(container) {
    if (!container) return;
    container.innerHTML = `
      <div class="tool-panel">
        <div class="tool-panel-header">
          <div class="icon">📄</div>
          <h3>Markdown Exporter</h3>
          <p>Exporte n'importe quel contenu FlowBoard en Markdown propre, pret pour Obsidian.</p>
        </div>
        <div class="mdexport-tools">
          <h4 style="font-family:'Space Grotesk',sans-serif;margin-bottom:12px;">📤 Exporter depuis un outil</h4>
          <div class="mdexport-grid">
            <button class="mdexport-btn" onclick="MarkdownExporter.exportKanban()">📋 Kanban</button>
            <button class="mdexport-btn" onclick="MarkdownExporter.exportLoL()">⚔️ LoL Hub</button>
            <button class="mdexport-btn" onclick="MarkdownExporter.exportMacHub()">🖥️ MacHub</button>
            <button class="mdexport-btn" onclick="MarkdownExporter.exportTierList()">📊 Tier List</button>
            <button class="mdexport-btn" onclick="MarkdownExporter.exportMatches()">🏅 Match Formatter</button>
            <button class="mdexport-btn" onclick="MarkdownExporter.exportDeals()">🎮 Deal Tracker</button>
            <button class="mdexport-btn" onclick="MarkdownExporter.exportMovies()">🎬 Movie Picker</button>
            <button class="mdexport-btn" onclick="MarkdownExporter.exportHabits()">🔥 Habit Tracker</button>
            <button class="mdexport-btn" onclick="MarkdownExporter.exportTrip()">✈️ Trip Planner</button>
            <button class="mdexport-btn" onclick="MarkdownExporter.exportNotes()">📝 Scratchpad</button>
            <button class="mdexport-btn" onclick="MarkdownExporter.exportZen()">🧘 Zen Editor</button>
            <button class="mdexport-btn" onclick="MarkdownExporter.exportAll()">🌍 Tout exporter</button>
          </div>
        </div>
        <div class="mdexport-output">
          <h4 style="font-family:'Space Grotesk',sans-serif;margin-bottom:12px;">📝 Resultat</h4>
          <textarea class="mdexport-textarea" id="mdexport-output" readonly placeholder="Selectionne un outil pour generer le Markdown..."></textarea>
          <div class="mdexport-actions">
            <button class="btn btn-primary" onclick="MarkdownExporter.copy()">📋 Copier</button>
            <button class="btn" onclick="MarkdownExporter.download()">💾 Telecharger .md</button>
          </div>
        </div>
      </div>
    `;
  },

  setOutput(content) {
    const output = document.getElementById('mdexport-output');
    if (output) output.value = content;
  },

  exportKanban() {
    const tasks = window.Kanban?.tasks || [];
    let md = `# 📋 Kanban Board\n\n`;
    md += `*Genere le ${new Date().toLocaleDateString('fr-FR')}*\n\n`;

    const statuses = { todo: '## 📋 A faire', progress: '## 🔄 En cours', done: '## ✅ Termine' };
    Object.entries(statuses).forEach(([status, title]) => {
      md += `${title}\n\n`;
      const statusTasks = tasks.filter(t => t.status === status);
      if (statusTasks.length === 0) {
        md += `_Aucune tache_\n\n`;
      } else {
        statusTasks.forEach(t => {
          const priority = t.priority === 'high' ? '🔴' : t.priority === 'medium' ? '🟡' : '🔵';
          const check = status === 'done' ? '- [x]' : '- [ ]';
          md += `${check} **${t.title}** ${priority}\n`;
          if (t.desc) md += `  - ${t.desc}\n`;
          if (t.tags?.length) md += `  - Tags: ${t.tags.join(', ')}\n`;
          if (t.date) md += `  - Echeance: ${t.date}\n`;
          if (t.progress) md += `  - Progression: ${t.progress}%\n`;
          md += `\n`;
        });
      }
    });

    const total = tasks.length;
    const done = tasks.filter(t => t.status === 'done').length;
    md += `---\n**Stats:** ${done}/${total} taches terminees (${total > 0 ? Math.round((done/total)*100) : 0}%)\n`;
    this.setOutput(md);
    if (window.App) window.App.showToast('Kanban exporte', 'success');
  },

  exportLoL() {
    let md = `# ⚔️ LoL Hub\n\n`;
    md += `*Genere le ${new Date().toLocaleDateString('fr-FR')}*\n\n`;
    md += `## 👥 Team Builder\n\n`;
    md += `_Utilise l'outil Team Builder pour generer des equipes_\n\n`;
    md += `## 🏆 Tournoi\n\n`;
    md += `_Utilise l'outil Tournoi pour generer des brackets_\n\n`;
    this.setOutput(md);
    if (window.App) window.App.showToast('LoL Hub exporte', 'success');
  },

  exportMacHub() {
    let md = `# 🖥️ Mac mini M4 Hub\n\n`;
    md += `*Genere le ${new Date().toLocaleDateString('fr-FR')}*\n\n`;
    md += `## 📊 Comparatif\n\n`;
    md += `| Modele | Chip | RAM Max | Prix |\n`;
    md += `|--------|------|---------|------|\n`;
    md += `| Mac mini M4 Pro | M4 Pro (14c) | 64 Go | 1 599€ - 4 199€ |\n`;
    md += `| Mac mini M4 | M4 (10c) | 32 Go | 699€ - 1 599€ |\n`;
    md += `| Mac mini M2 Pro | M2 Pro (12c) | 32 Go | 1 499€ - 3 899€ |\n`;
    md += `| Mac mini M2 | M2 (8c) | 24 Go | 699€ - 1 399€ |\n`;
    md += `| Mac mini M1 | M1 (8c) | 16 Go | 799€ - 1 299€ |\n\n`;
    md += `## 🚀 Projets Serveur Selectionnes\n\n`;
    const projects = window.MacHub?.selectedProjects;
    if (projects && projects.size > 0) {
      projects.forEach(pid => {
        const p = window.MacHub.PROJECTS.find(x => x.id === pid);
        if (p) md += `- **${p.name}** (${p.icon}) — ${p.desc} — ~${p.ram} Go RAM\n`;
      });
    } else {
      md += `_Aucun projet selectionne_\n`;
    }
    this.setOutput(md);
    if (window.App) window.App.showToast('MacHub exporte', 'success');
  },

  exportTierList() {
    let md = `# 📊 Tier List\n\n`;
    md += `*Genere le ${new Date().toLocaleDateString('fr-FR')}*\n\n`;
    const tiers = window.TierList?.tiers || [];
    tiers.forEach(t => {
      md += `## ${t.label} Tier\n\n`;
      if (t.items.length === 0) {
        md += `_Vide_\n\n`;
      } else {
        t.items.forEach(item => {
          md += `- ${item}\n`;
        });
        md += `\n`;
      }
    });
    this.setOutput(md);
    if (window.App) window.App.showToast('Tier List exportee', 'success');
  },

  exportMatches() {
    const matches = window.MatchFormatter?.matches || [];
    let md = `# 🏅 Match History\n\n`;
    md += `*Genere le ${new Date().toLocaleDateString('fr-FR')}*\n\n`;

    if (matches.length === 0) {
      md += `_Aucun match enregistre_\n`;
    } else {
      const stats = window.MatchFormatter.calculateStats();
      md += `## 📊 Stats\n\n`;
      md += `- **Matchs:** ${stats.total}\n`;
      md += `- **Victoires:** ${stats.wins}\n`;
      md += `- **Defaites:** ${stats.losses}\n`;
      md += `- **Winrate:** ${stats.winrate}%\n`;
      md += `- **KDA Moyen:** ${stats.avgKDA}\n\n`;
      md += `## 🎮 Matchs\n\n`;
      md += `| Champion | KDA | Resultat | Duree |\n`;
      md += `|----------|-----|----------|-------|\n`;
      matches.forEach(m => {
        const kda = ((m.kills + m.assists) / Math.max(m.deaths, 1)).toFixed(2);
        md += `| ${m.champion} | ${m.kills}/${m.deaths}/${m.assists} (${kda}) | ${m.result === 'W' ? '✅ WIN' : '❌ LOSS'} | ${Math.floor(m.duration/60)}:${(m.duration%60).toString().padStart(2,'0')} |\n`;
      });
    }
    this.setOutput(md);
    if (window.App) window.App.showToast('Matchs exportes', 'success');
  },

  exportDeals() {
    let md = `# 🎮 Game Deals\n\n`;
    md += `*Genere le ${new Date().toLocaleDateString('fr-FR')}*\n\n`;
    const deals = window.DealTracker?.deals || [];
    if (deals.length === 0) {
      md += `_Aucune promo en cours_\n`;
    } else {
      md += `| Jeu | Plateforme | Prix | Reduction |\n`;
      md += `|-----|------------|------|-----------|\n`;
      deals.forEach(d => {
        md += `| ${d.game} | ${d.platform} | ${d.price.toFixed(2)}€ | -${d.discount}% |\n`;
      });
    }
    this.setOutput(md);
    if (window.App) window.App.showToast('Deals exportes', 'success');
  },

  exportMovies() {
    let md = `# 🎬 Movie Watchlist\n\n`;
    md += `*Genere le ${new Date().toLocaleDateString('fr-FR')}*\n\n`;
    const watchlist = window.MoviePicker?.watchlist || [];
    if (watchlist.length === 0) {
      md += `_Watchlist vide_\n`;
    } else {
      md += `| Film | Annee | Genre | Duree | Note |\n`;
      md += `|------|-------|-------|-------|------|\n`;
      watchlist.forEach(m => {
        md += `| ${m.title} | ${m.year} | ${m.genre} | ${m.duration}min | ${m.rating} |\n`;
      });
    }
    this.setOutput(md);
    if (window.App) window.App.showToast('Movies exportes', 'success');
  },

  exportHabits() {
    let md = `# 🔥 Habit Tracker\n\n`;
    md += `*Genere le ${new Date().toLocaleDateString('fr-FR')}*\n\n`;
    const habits = window.HabitTracker?.habits || [];
    if (habits.length === 0) {
      md += `_Aucune habitude definie_\n`;
    } else {
      habits.forEach(h => {
        md += `## ${h.name} ${h.icon}\n\n`;
        md += `- **Couleur:** ${h.color}\n`;
        md += `- **Meilleure serie:** ${h.streak} jours\n`;
        md += `- **Total:** ${h.entries?.length || 0} jours\n\n`;
      });
    }
    this.setOutput(md);
    if (window.App) window.App.showToast('Habitudes exportees', 'success');
  },

  exportTrip() {
    let md = `# ✈️ Trip Planner\n\n`;
    md += `*Genere le ${new Date().toLocaleDateString('fr-FR')}*\n\n`;
    const trips = window.TripPlanner?.trips || [];
    if (trips.length === 0) {
      md += `_Aucun voyage planifie_\n`;
    } else {
      trips.forEach(t => {
        md += `## ${t.name}\n\n`;
        md += `- **Destination:** ${t.destination}\n`;
        md += `- **Date:** ${t.startDate} → ${t.endDate}\n`;
        md += `- **Budget total:** ${t.budget?.total || 0}€\n\n`;
      });
    }
    this.setOutput(md);
    if (window.App) window.App.showToast('Voyages exportes', 'success');
  },

  exportNotes() {
    const notes = window.Scratchpad?.notes || [];
    let md = `# 📝 Notes\n\n`;
    md += `*Genere le ${new Date().toLocaleDateString('fr-FR')}*\n\n`;
    notes.forEach(n => {
      md += `## ${n.title}\n\n`;
      md += `${n.content}\n\n`;
      md += `---\n\n`;
    });
    this.setOutput(md);
    if (window.App) window.App.showToast('Notes exportees', 'success');
  },

  exportZen() {
    const content = window.ZenEditor?.content || '';
    let md = `# 🧘 Zen Editor\n\n`;
    md += `*Genere le ${new Date().toLocaleDateString('fr-FR')}*\n\n`;
    md += content;
    md += `\n\n---\n_${window.ZenEditor?.currentWords || 0} mots_`;
    this.setOutput(md);
    if (window.App) window.App.showToast('Zen Editor exporte', 'success');
  },

  exportAll() {
    let md = `# 🌍 FlowBoard Export Complet\n\n`;
    md += `*Genere le ${new Date().toLocaleDateString('fr-FR')}*\n\n`;
    md += `---\n\n`;

    // Kanban
    const tasks = window.Kanban?.tasks || [];
    md += `# 📋 Kanban (${tasks.length} taches)\n\n`;
    tasks.forEach(t => {
      const check = t.status === 'done' ? '- [x]' : '- [ ]';
      md += `${check} **${t.title}** (${t.status})\n`;
    });
    md += `\n---\n\n`;

    // Notes
    const notes = window.Scratchpad?.notes || [];
    md += `# 📝 Notes (${notes.length})\n\n`;
    notes.forEach(n => {
      md += `## ${n.title}\n\n${n.content}\n\n`;
    });
    md += `\n---\n\n`;

    // Passwords (without actual passwords)
    const vault = window.PasswordVault?.vault || [];
    md += `# 🔐 Coffre MDP (${vault.length} entrees)\n\n`;
    vault.forEach(v => {
      md += `- **${v.service}** — ${v.username || 'N/A'}\n`;
    });
    md += `\n---\n\n`;

    md += `_Export complet FlowBoard_`;
    this.setOutput(md);
    if (window.App) window.App.showToast('Export complet genere', 'success');
  },

  copy() {
    const output = document.getElementById('mdexport-output');
    if (!output || !output.value) {
      if (window.App) window.App.showToast('Rien a copier', 'error');
      return;
    }
    navigator.clipboard.writeText(output.value).then(() => {
      if (window.App) window.App.showToast('Markdown copie', 'success');
    });
  },

  download() {
    const output = document.getElementById('mdexport-output');
    if (!output || !output.value) {
      if (window.App) window.App.showToast('Rien a telecharger', 'error');
      return;
    }
    const blob = new Blob([output.value], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flowboard-export-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
    if (window.App) window.App.showToast('Fichier .md telecharge', 'success');
  }
};
