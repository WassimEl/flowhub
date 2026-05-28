// ===== SCRATCHPAD MODULE =====
export const Scratchpad = {
  notes: [],
  currentNoteId: null,
  pinnedNotes: new Set(),

  render(container) {
    if (!container) return;
    container.innerHTML = `
      <div class="tool-panel">
        <div class="tool-panel-header">
          <div class="icon">📝</div>
          <h3>Notes Rapides</h3>
          <p>Éditeur de texte persistant avec support Markdown basique. Plusieurs notes nommables.</p>
        </div>
        <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;">
          <button class="btn btn-primary" onclick="Scratchpad.createNote()">+ Nouvelle note</button>
          <div class="search-box" style="flex:1;max-width:300px;">
            <input type="text" id="scratch-search" placeholder="Rechercher dans les notes..." oninput="Scratchpad.searchNotes()" style="padding-left:14px;">
          </div>
        </div>
        <div style="display:grid;grid-template-columns:260px 1fr;gap:20px;">
          <div style="background:var(--bg-primary);border:1px solid var(--border);border-radius:var(--radius-sm);padding:12px;max-height:500px;overflow-y:auto;">
            <div style="font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px;font-family:'JetBrains Mono',monospace;">📂 Mes notes</div>
            <div id="scratch-note-list" style="display:flex;flex-direction:column;gap:6px;"></div>
          </div>
          <div>
            <div style="display:flex;gap:8px;margin-bottom:12px;">
              <input type="text" class="form-input" id="scratch-title" placeholder="Titre de la note..." style="flex:1;">
              <button class="btn" onclick="Scratchpad.pinCurrent()" id="scratch-pin-btn">📌</button>
              <button class="btn btn-danger" onclick="Scratchpad.deleteCurrent()">🗑</button>
            </div>
            <textarea class="form-textarea" id="scratch-content" placeholder="Ton markdown ici..." style="min-height:300px;font-family:'JetBrains Mono',monospace;"></textarea>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;">
              <span style="font-size:11px;color:var(--text-muted);" id="scratch-status">Prêt</span>
              <button class="btn btn-primary" onclick="Scratchpad.saveCurrent()">💾 Sauvegarder</button>
            </div>
            <div id="scratch-preview" style="margin-top:20px;padding:16px;background:var(--bg-primary);border:1px solid var(--border);border-radius:var(--radius-sm);display:none;"></div>
          </div>
        </div>
      </div>
    `;
    this.loadNotes();
  },

  loadNotes() {
    if (window.App) {
      const saved = localStorage.getItem(window.App.getStorageKey('scratchpad_notes'));
      const savedPinned = localStorage.getItem(window.App.getStorageKey('scratchpad_pinned'));
      if (saved) {
        try { this.notes = JSON.parse(saved); } catch(e) { this.notes = []; }
      }
      if (savedPinned) {
        try { this.pinnedNotes = new Set(JSON.parse(savedPinned)); } catch(e) { this.pinnedNotes = new Set(); }
      }
    }
    if (this.notes.length === 0) {
      this.notes.push({
        id: Date.now().toString(),
        title: 'Bienvenue',
        content: '# Bienvenue sur Scratchpad\n\nTu peux écrire en **markdown** ici.\n\n- Liste d\'éléments\n- Checklist\n\n> Citation',
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      });
    }
    this.renderNoteList();
    if (this.notes.length > 0 && !this.currentNoteId) {
      this.selectNote(this.notes[0].id);
    }
  },

  createNote() {
    const note = {
      id: Date.now().toString(),
      title: 'Nouvelle note',
      content: '',
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    };
    this.notes.push(note);
    this.saveNotes();
    this.renderNoteList();
    this.selectNote(note.id);
  },

  selectNote(id) {
    this.currentNoteId = id;
    const note = this.notes.find(n => n.id === id);
    if (!note) return;

    const titleInput = document.getElementById('scratch-title');
    const contentInput = document.getElementById('scratch-content');
    const pinBtn = document.getElementById('scratch-pin-btn');

    if (titleInput) titleInput.value = note.title;
    if (contentInput) contentInput.value = note.content;
    if (pinBtn) pinBtn.innerHTML = this.pinnedNotes.has(id) ? '📍' : '📌';

    this.renderNoteList();
  },

  saveCurrent() {
    if (!this.currentNoteId) return;
    const note = this.notes.find(n => n.id === this.currentNoteId);
    if (!note) return;

    const titleInput = document.getElementById('scratch-title');
    const contentInput = document.getElementById('scratch-content');

    note.title = titleInput?.value || 'Sans titre';
    note.content = contentInput?.value || '';
    note.updated = new Date().toISOString();

    this.saveNotes();
    this.renderNoteList();

    const status = document.getElementById('scratch-status');
    if (status) {
      status.textContent = 'Sauvegardé à ' + new Date().toLocaleTimeString('fr-FR');
      setTimeout(() => status.textContent = 'Prêt', 2000);
    }
    if (window.App) window.App.showToast('Note sauvegardée', 'success');
  },

  pinCurrent() {
    if (!this.currentNoteId) return;
    if (this.pinnedNotes.has(this.currentNoteId)) {
      this.pinnedNotes.delete(this.currentNoteId);
    } else {
      this.pinnedNotes.add(this.currentNoteId);
    }
    if (window.App) {
      localStorage.setItem(window.App.getStorageKey('scratchpad_pinned'), JSON.stringify([...this.pinnedNotes]));
    }
    this.renderNoteList();
    const pinBtn = document.getElementById('scratch-pin-btn');
    if (pinBtn) pinBtn.innerHTML = this.pinnedNotes.has(this.currentNoteId) ? '📍' : '📌';
  },

  deleteCurrent() {
    if (!this.currentNoteId) return;
    if (!confirm('Supprimer cette note ?')) return;
    this.notes = this.notes.filter(n => n.id !== this.currentNoteId);
    this.pinnedNotes.delete(this.currentNoteId);
    this.currentNoteId = null;
    this.saveNotes();
    this.renderNoteList();
    if (this.notes.length > 0) {
      this.selectNote(this.notes[0].id);
    } else {
      document.getElementById('scratch-title').value = '';
      document.getElementById('scratch-content').value = '';
    }
    if (window.App) window.App.showToast('Note supprimée', 'info');
  },

  searchNotes() {
    this.renderNoteList();
  },

  renderNoteList() {
    const list = document.getElementById('scratch-note-list');
    if (!list) return;

    const searchTerm = document.getElementById('scratch-search')?.value.toLowerCase() || '';
    let filtered = this.notes;
    if (searchTerm) {
      filtered = this.notes.filter(n => 
        n.title.toLowerCase().includes(searchTerm) || 
        n.content.toLowerCase().includes(searchTerm)
      );
    }

    // Sort: pinned first, then by updated date
    filtered.sort((a, b) => {
      const aPinned = this.pinnedNotes.has(a.id) ? 1 : 0;
      const bPinned = this.pinnedNotes.has(b.id) ? 1 : 0;
      if (aPinned !== bPinned) return bPinned - aPinned;
      return new Date(b.updated) - new Date(a.updated);
    });

    if (filtered.length === 0) {
      list.innerHTML = '<div style="text-align:center;color:var(--text-muted);font-size:12px;padding:16px;">Aucune note</div>';
      return;
    }

    list.innerHTML = filtered.map(n => {
      const isActive = n.id === this.currentNoteId;
      const isPinned = this.pinnedNotes.has(n.id);
      const date = new Date(n.updated).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
      return `
        <div onclick="Scratchpad.selectNote('${n.id}')" style="padding:10px 12px;border-radius:8px;cursor:pointer;transition:all 0.2s;${isActive ? 'background:var(--accent-bg);border:1px solid var(--accent);' : 'background:var(--bg-card);border:1px solid var(--border);'}">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-weight:500;font-size:13px;${isActive ? 'color:var(--accent-light);' : ''}">${isPinned ? '📍 ' : ''}${n.title || 'Sans titre'}</span>
            <span style="font-size:10px;color:var(--text-muted);">${date}</span>
          </div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${n.content.substring(0, 40)}${n.content.length > 40 ? '...' : ''}</div>
        </div>
      `;
    }).join('');
  },

  saveNotes() {
    if (window.App) {
      localStorage.setItem(window.App.getStorageKey('scratchpad_notes'), JSON.stringify(this.notes));
    }
  }
};
