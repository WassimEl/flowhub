// ===== ZEN EDITOR MODULE =====
export const ZenEditor = {
  content: '',
  wordGoal: 500,
  currentWords: 0,
  isFullscreen: false,
  isDark: true,
  autoSaveInterval: null,

  render(container) {
    if (!container) return;
    container.innerHTML = `
      <div class="zen-container ${this.isFullscreen ? 'fullscreen' : ''} ${this.isDark ? 'dark' : 'light'}" id="zen-container">
        <div class="zen-toolbar">
          <button class="btn btn-icon" onclick="ZenEditor.toggleFullscreen()" title="Plein ecran">${this.isFullscreen ? '⛶' : '⛶'}</button>
          <button class="btn btn-icon" onclick="ZenEditor.toggleTheme()" title="Theme">${this.isDark ? '☀️' : '🌙'}</button>
          <div class="zen-goal-setting">
            <span class="form-label" style="margin:0;font-size:11px;">Objectif:</span>
            <input type="number" class="form-input" id="zen-goal" value="${this.wordGoal}" min="100" max="10000" step="100" onchange="ZenEditor.setGoal(this.value)" style="width:80px;padding:4px 8px;font-size:12px;">
            <span style="font-size:11px;color:var(--text-muted)">mots</span>
          </div>
          <button class="btn" onclick="ZenEditor.exportTxt()">📄 .txt</button>
          <button class="btn" onclick="ZenEditor.exportMd()">📝 .md</button>
        </div>
        <div class="zen-editor-wrapper">
          <textarea class="zen-textarea" id="zen-textarea" placeholder="Commence a ecrire... L'ecran se vide de toute distraction." oninput="ZenEditor.onInput()">${this.content}</textarea>
          <div class="zen-word-counter" id="zen-counter">
            <div class="zen-counter-value" id="zen-word-count">0</div>
            <div class="zen-counter-label">mots</div>
          </div>
          <div class="zen-goal-progress" id="zen-goal-progress">
            <div class="zen-goal-bar" id="zen-goal-bar" style="width:0%"></div>
          </div>
          <div class="zen-goal-text" id="zen-goal-text">0 / ${this.wordGoal} mots</div>
        </div>
        <div class="zen-focus-indicator" id="zen-focus">Focus Mode Active</div>
      </div>
    `;
    this.loadFromStorage();
    this.onInput();
    this.startAutoSave();
  },

  onInput() {
    const textarea = document.getElementById('zen-textarea');
    if (!textarea) return;
    this.content = textarea.value;
    this.currentWords = this.content.trim().split(/\s+/).filter(w => w.length > 0).length;

    document.getElementById('zen-word-count').textContent = this.currentWords;
    document.getElementById('zen-goal-text').textContent = `${this.currentWords} / ${this.wordGoal} mots`;

    const progress = Math.min((this.currentWords / this.wordGoal) * 100, 100);
    document.getElementById('zen-goal-bar').style.width = progress + '%';

    if (this.currentWords >= this.wordGoal) {
      document.getElementById('zen-goal-bar').style.background = 'var(--green)';
      if (this.currentWords === this.wordGoal) {
        if (window.App) window.App.showToast('🎉 Objectif atteint !', 'success');
      }
    } else {
      document.getElementById('zen-goal-bar').style.background = 'var(--accent)';
    }

    // Hide UI after 3s of typing
    const focus = document.getElementById('zen-focus');
    if (focus) {
      focus.style.opacity = '0';
      clearTimeout(this._focusTimeout);
      this._focusTimeout = setTimeout(() => {
        if (focus) focus.style.opacity = '1';
      }, 3000);
    }
  },

  toggleFullscreen() {
    this.isFullscreen = !this.isFullscreen;
    const container = document.getElementById('zen-container');
    if (container) {
      container.classList.toggle('fullscreen', this.isFullscreen);
    }
    if (this.isFullscreen) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  },

  toggleTheme() {
    this.isDark = !this.isDark;
    const container = document.getElementById('zen-container');
    if (container) {
      container.classList.toggle('dark', this.isDark);
      container.classList.toggle('light', !this.isDark);
    }
  },

  setGoal(val) {
    this.wordGoal = parseInt(val) || 500;
    this.onInput();
    this.saveToStorage();
  },

  startAutoSave() {
    if (this.autoSaveInterval) clearInterval(this.autoSaveInterval);
    this.autoSaveInterval = setInterval(() => {
      this.saveToStorage();
    }, 5000);
  },

  exportTxt() {
    const blob = new Blob([this.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zen-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    if (window.App) window.App.showToast('Export .txt reussi', 'success');
  },

  exportMd() {
    const mdContent = `# Note du ${new Date().toLocaleDateString('fr-FR')}\n\n${this.content}\n\n---\n*${this.currentWords} mots - Genere avec FlowBoard Zen Editor*`;
    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zen-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
    if (window.App) window.App.showToast('Export .md reussi', 'success');
  },

  saveToStorage() {
    if (window.App) window.App.saveToStorage();
  },

  loadFromStorage() {
    const key = window.App?.getStorageKey('zen');
    if (key) {
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          this.content = data || '';
          const textarea = document.getElementById('zen-textarea');
          if (textarea) textarea.value = this.content;
        } catch(e) { this.content = saved || ''; }
      }
    }
  }
};
