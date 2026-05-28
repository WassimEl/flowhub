// ===== SCRATCHPAD MODULE =====
export const Scratchpad = {
  notes: [],
  currentNoteId: null,

  render(container) {
    if (!container) return;
    container.innerHTML = `
      <div class="tool-panel" style="max-width:100%;padding:0;background:transparent;border:none;">
        <div class="scratchpad-container">
          <div class="scratchpad-sidebar">
            <div class="scratchpad-sidebar-header">
              <h3 style="font-family:'Space Grotesk',sans-serif;font-size:18px;">📝 Notes</h3>
              <button class="btn btn-primary" onclick="Scratchpad.createNote()" style="padding:6px 12px;font-size:12px;">+ Nouvelle</button>
            </div>
            <div class="scratchpad-search">
              <input type="text" class="form-input" id="scratch-search" placeholder="🔍 Rechercher..." oninput="Scratchpad.searchNotes(this.value)" style="font-size:13px;">
            </div>
            <div class="scratchpad-notes-list" id="scratch-notes-list"></div>
          </div>
          <div class="scratchpad-editor-area">
            <div class="scratchpad-editor-header">
              <input type="text" class="scratchpad-title-input" id="scratch-title" placeholder="Titre de la note..." oninput="Scratchpad.updateTitle()">
              <div class="scratchpad-editor-actions">
                <button class="btn btn-icon" onclick="Scratchpad.pinNote()" title="Epingler" id="scratch-pin-btn">📌</button>
                <button class="btn btn-icon" onclick="Scratchpad.deleteNote()" title="Supprimer">🗑</button>
                <button class="btn btn-icon" onclick="Scratchpad.copyNote()" title="Copier">📋</button>
              </div>
            </div>
            <div class="scratchpad-toolbar">
              <button class="scratchpad-tool-btn" onclick="Scratchpad.insertMarkdown('**','**')" title="Gras"><b>B</b></button>
              <button class="scratchpad-tool-btn" onclick="Scratchpad.insertMarkdown('*','*')" title="Italique"><i>I</i></button>
              <button class="scratchpad-tool-btn" onclick="Scratchpad.insertMarkdown('## ','')" title="Titre">H2</button>
              <button class="scratchpad-tool-btn" onclick="Scratchpad.insertMarkdown('- ','')" title="Liste">•</button>
              <button class="scratchpad-tool-btn" onclick="Scratchpad.insertMarkdown('> ','')" title="Citation">"</button>
              <button class="scratchpad-tool-btn" onclick="Scratchpad.insertMarkdown('```\n','\n```')" title="Code">{ }</button>
            </div>
            <textarea class="scratchpad-textarea" id="scratch-content" placeholder="Commence a ecrire..." oninput="Scratchpad.updateContent()"></textarea>
            <div class="scratchpad-preview-toggle">
              <button class="btn" onclick="Scratchpad.togglePreview()" id="scratch-preview-btn">👁 Apercu Markdown</button>
            </div>
            <div class="scratchpad-preview" id="scratch-preview" style="display:none;"></div>
            <div class="scratchpad-footer">
              <span id="scratch-word-count">0 mots</span>
              <span id="scratch-save-status" style="color:var(--text-muted)">Sauvegarde auto</span>
            </div>
          </div>
        </div>
      </div>
    `;
    this.loadFromStorage();
    if (this.notes.length === 0) {
      this.createNote('Bienvenue', '# Bienvenue sur Scratchpad\n\nCeci est un editeur de notes avec support Markdown basique.\n\n## Fonctionnalites\n- Plusieurs notes avec onglets\n- Recherche rapide\n- Epinglage des notes importantes\n- Apercu Markdown\n- Sauvegarde automatique\n\n**Commence a ecrire !**');
    }
    this.renderNotesList();
    if (this.notes.length > 0) this.selectNote(this.notes[0].id);
  },

  createNote(title, content) {
    const note = {
      id: Date.now().toString(),
      title: title || 'Nouvelle note',
      content: content || '',
      pinned: false,
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    };
    this.notes.unshift(note);
    this.saveToStorage();
    this.renderNotesList();
    this.selectNote(note.id);
  },

  selectNote(id) {
    this.currentNoteId = id;
    const note = this.notes.find(n => n.id === id);
    if (!note) return;

    const titleInput = document.getElementById('scratch-title');
    const contentArea = document.getElementById('scratch-content');
    const pinBtn = document.getElementById('scratch-pin-btn');

    if (titleInput) titleInput.value = note.title;
    if (contentArea) contentArea.value = note.content;
    if (pinBtn) pinBtn.style.opacity = note.pinned ? '1' : '0.5';

    this.updateWordCount();
    this.renderNotesList();
    document.getElementById('scratch-preview').style.display = 'none';
    document.getElementById('scratch-preview-btn').textContent = '👁 Apercu Markdown';
  },

  updateTitle() {
    const note = this.notes.find(n => n.id === this.currentNoteId);
    if (!note) return;
    note.title = document.getElementById('scratch-title').value;
    note.updated = new Date().toISOString();
    this.saveToStorage();
    this.renderNotesList();
  },

  updateContent() {
    const note = this.notes.find(n => n.id === this.currentNoteId);
    if (!note) return;
    note.content = document.getElementById('scratch-content').value;
    note.updated = new Date().toISOString();
    this.saveToStorage();
    this.updateWordCount();
    document.getElementById('scratch-save-status').textContent = 'Sauvegarde auto ✓';
    setTimeout(() => {
      const el = document.getElementById('scratch-save-status');
      if (el) el.textContent = 'Sauvegarde auto';
    }, 1500);
  },

  updateWordCount() {
    const content = document.getElementById('scratch-content')?.value || '';
    const words = content.trim().split(/\s+/).filter(w => w.length > 0).length;
    const el = document.getElementById('scratch-word-count');
    if (el) el.textContent = `${words} mot${words !== 1 ? 's' : ''}`;
  },

  renderNotesList() {
    const list = document.getElementById('scratch-notes-list');
    if (!list) return;

    const searchTerm = (document.getElementById('scratch-search')?.value || '').toLowerCase();
    let filtered = this.notes;
    if (searchTerm) {
      filtered = this.notes.filter(n => 
        n.title.toLowerCase().includes(searchTerm) || 
        n.content.toLowerCase().includes(searchTerm)
      );
    }

    const sorted = [...filtered].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updated) - new Date(a.updated);
    });

    if (sorted.length === 0) {
      list.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:13px;">Aucune note trouvee</div>';
      return;
    }

    list.innerHTML = sorted.map(n => {
      const isActive = n.id === this.currentNoteId;
      const preview = n.content.substring(0, 60).replace(/[#*_>`-]/g, '') + (n.content.length > 60 ? '...' : '');
      return `
        <div class="scratchpad-note-item ${isActive ? 'active' : ''} ${n.pinned ? 'pinned' : ''}" onclick="Scratchpad.selectNote('${n.id}')">
          <div class="scratchpad-note-title">
            ${n.pinned ? '📌 ' : ''}${n.title || 'Sans titre'}
          </div>
          <div class="scratchpad-note-preview">${preview || 'Vide'}</div>
          <div class="scratchpad-note-date">${new Date(n.updated).toLocaleDateString('fr-FR')}</div>
        </div>
      `;
    }).join('');
  },

  searchNotes(term) {
    this.renderNotesList();
  },

  pinNote() {
    const note = this.notes.find(n => n.id === this.currentNoteId);
    if (!note) return;
    note.pinned = !note.pinned;
    this.saveToStorage();
    this.renderNotesList();
    document.getElementById('scratch-pin-btn').style.opacity = note.pinned ? '1' : '0.5';
    if (window.App) window.App.showToast(note.pinned ? 'Note epinglee' : 'Note desepinglee', 'success');
  },

  deleteNote() {
    if (this.notes.length <= 1) {
      if (window.App) window.App.showToast('Impossible de supprimer la derniere note', 'error');
      return;
    }
    if (!confirm('Supprimer cette note ?')) return;
    this.notes = this.notes.filter(n => n.id !== this.currentNoteId);
    this.saveToStorage();
    this.renderNotesList();
    if (this.notes.length > 0) this.selectNote(this.notes[0].id);
    if (window.App) window.App.showToast('Note supprimee', 'info');
  },

  copyNote() {
    const note = this.notes.find(n => n.id === this.currentNoteId);
    if (!note) return;
    navigator.clipboard.writeText(note.content).then(() => {
      if (window.App) window.App.showToast('Contenu copie', 'success');
    });
  },

  insertMarkdown(before, after) {
    const textarea = document.getElementById('scratch-content');
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = before + selected + after;
    textarea.value = text.substring(0, start) + replacement + text.substring(end);
    textarea.selectionStart = start + before.length;
    textarea.selectionEnd = start + before.length + selected.length;
    textarea.focus();
    this.updateContent();
  },

  togglePreview() {
    const preview = document.getElementById('scratch-preview');
    const btn = document.getElementById('scratch-preview-btn');
    const note = this.notes.find(n => n.id === this.currentNoteId);
    if (!preview || !note) return;

    if (preview.style.display === 'none') {
      preview.innerHTML = this.markdownToHtml(note.content);
      preview.style.display = 'block';
      btn.textContent = '✏️ Editer';
    } else {
      preview.style.display = 'none';
      btn.textContent = '👁 Apercu Markdown';
    }
  },

  markdownToHtml(md) {
    return md
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/gim, '<b>$1</b>')
      .replace(/\*(.*?)\*/gim, '<i>$1</i>')
      .replace(/`([^`]+)`/gim, '<code>$1</code>')
      .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      .replace(/\n/gim, '<br>');
  },

  saveToStorage() {
    if (window.App) window.App.saveToStorage();
  },

  loadFromStorage() {
    const key = window.App?.getStorageKey('notes');
    if (key) {
      const saved = localStorage.getItem(key);
      if (saved) {
        try { this.notes = JSON.parse(saved); } catch(e) { this.notes = []; }
      }
    }
  }
};
