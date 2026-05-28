// ===== DAILY NOTE MODULE =====
export const DailyNote = {
  template: `# {{date}}

## 🌤 Meteo
{{weather}}

## 📋 Taches du jour
{{tasks}}

## 🎮 Jeux
{{games}}

## 🎬 Films/Series
{{movies}}

## 🎯 Objectif du jour
{{goal}}

## 📝 Notes
{{notes}}

---
*Genere avec FlowBoard Daily Note*`,

  customTemplate: '',

  render(container) {
    if (!container) return;
    container.innerHTML = `
      <div class="tool-panel">
        <div class="tool-panel-header">
          <div class="icon">📓</div>
          <h3>Daily Note Generator</h3>
          <p>Template quotidien Obsidian-compatible avec taches Kanban, tracking et objectifs.</p>
        </div>
        <div class="dailynote-actions">
          <button class="btn btn-primary" onclick="DailyNote.generate()">✨ Generer la note du jour</button>
          <button class="btn" onclick="DailyNote.copy()">📋 Copier</button>
          <button class="btn" onclick="DailyNote.download()">💾 Telecharger .md</button>
        </div>
        <div class="dailynote-preview-section">
          <h4 style="font-family:'Space Grotesk',sans-serif;margin-bottom:12px;">📝 Apercu</h4>
          <pre class="dailynote-preview" id="dailynote-preview"></pre>
        </div>
        <div class="dailynote-template">
          <h4 style="font-family:'Space Grotesk',sans-serif;margin-bottom:12px;">⚙️ Template personnalise</h4>
          <textarea class="form-textarea" id="dailynote-template" placeholder="Ton template ici..." style="min-height:200px;font-family:'JetBrains Mono',monospace;font-size:12px;">${this.customTemplate || this.template}</textarea>
          <button class="btn" onclick="DailyNote.saveTemplate()" style="margin-top:8px;">💾 Sauvegarder le template</button>
          <div class="dailynote-variables">
            <h5 style="margin:12px 0 8px;color:var(--accent)">Variables disponibles:</h5>
            <code>{{date}}</code> — Date du jour<br>
            <code>{{weather}}</code> — Meteo (manuel)<br>
            <code>{{tasks}}</code> — Taches Kanban en cours<br>
            <code>{{games}}</code> — Jeux joues (tracking)<br>
            <code>{{movies}}</code> — Films/Series vus<br>
            <code>{{goal}}</code> — Objectif du jour<br>
            <code>{{notes}}</code> — Notes libres
          </div>
        </div>
      </div>
    `;
    this.loadFromStorage();
    this.generate();
  },

  generate() {
    const template = document.getElementById('dailynote-template')?.value || this.template;
    const now = new Date();
    const dateStr = now.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // Get Kanban tasks
    const tasks = window.Kanban?.tasks || [];
    const inProgress = tasks.filter(t => t.status === 'progress');
    const todo = tasks.filter(t => t.status === 'todo');
    let tasksStr = '';
    if (inProgress.length > 0) {
      tasksStr += '### En cours\n';
      inProgress.forEach(t => tasksStr += `- [ ] ${t.title}\n`);
    }
    if (todo.length > 0) {
      tasksStr += '### A faire\n';
      todo.forEach(t => tasksStr += `- [ ] ${t.title}\n`);
    }
    if (tasksStr === '') tasksStr = '_Aucune tache en cours_\n';

    // Games (placeholder - could integrate with actual game tracking)
    const gamesStr = '_Aucun jeu enregistre aujourd\'hui_\n';

    // Movies (from history)
    const history = window.MoviePicker?.history || [];
    const todayMovies = history.filter(h => new Date(h.date).toDateString() === now.toDateString());
    let moviesStr = '';
    if (todayMovies.length > 0) {
      todayMovies.forEach(h => moviesStr += `- ${h.movie.title}\n`);
    } else {
      moviesStr = '_Aucun film vu aujourd\'hui_\n';
    }

    let note = template
      .replace(/{{date}}/g, dateStr)
      .replace(/{{weather}}/g, '_Meteo a remplir_')
      .replace(/{{tasks}}/g, tasksStr)
      .replace(/{{games}}/g, gamesStr)
      .replace(/{{movies}}/g, moviesStr)
      .replace(/{{goal}}/g, '_Objectif du jour a definir_')
      .replace(/{{notes}}/g, '_Notes libres..._');

    document.getElementById('dailynote-preview').textContent = note;
    return note;
  },

  copy() {
    const note = this.generate();
    navigator.clipboard.writeText(note).then(() => {
      if (window.App) window.App.showToast('Note copiee', 'success');
    });
  },

  download() {
    const note = this.generate();
    const blob = new Blob([note], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-note-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
    if (window.App) window.App.showToast('Note telechargee', 'success');
  },

  saveTemplate() {
    this.customTemplate = document.getElementById('dailynote-template').value;
    this.saveToStorage();
    if (window.App) window.App.showToast('Template sauvegarde', 'success');
  },

  saveToStorage() {
    const key = window.App?.getStorageKey('dailynote');
    if (key) {
      localStorage.setItem(key, JSON.stringify({ template: this.customTemplate }));
    }
  },

  loadFromStorage() {
    const key = window.App?.getStorageKey('dailynote');
    if (key) {
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          this.customTemplate = data.template || '';
        } catch(e) {}
      }
    }
  }
};
