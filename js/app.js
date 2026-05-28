// ===== FLOWBOARD — Core Application =====
import { Kanban } from './modules/kanban.js';
import { MacHub } from './modules/machub.js';
import { LoLHub } from './modules/lolhub.js';
import { QRCodeTool } from './modules/qrcode.js';
import { PasswordVault } from './modules/password.js';
import { CharacterGen } from './modules/characters.js';
import { RSSTracker } from './modules/rsstracker.js';
import { PomodoroTimer } from './modules/pomodoro.js';
import { Scratchpad } from './modules/scratchpad.js';
import { FaviconGen } from './modules/favicongen.js';
import { MindMap } from './modules/mindmap.js';
import { NameGen } from './modules/namegen.js';
import { TierList } from './modules/tierlist.js';
import { MatchFormatter } from './modules/matchformatter.js';
import { ZenEditor } from './modules/zeneditor.js';
import { DealTracker } from './modules/dealtracker.js';
import { MoviePicker } from './modules/moviepicker.js';
import { MarkdownExporter } from './modules/markdownexporter.js';
import { DailyNote } from './modules/dailynote.js';
import { GGBuild } from './modules/ggbuild.js';
import { HabitTracker } from './modules/habittracker.js';
import { TripPlanner } from './modules/tripplanner.js';
import { DecisionMaker } from './modules/decisionmaker.js';

// --- Tool Registry ---
const TOOLS = [
  { id: 'machub', name: '🖥️ MacHub', module: MacHub },
  { id: 'lol', name: '⚔️ LoL Hub', module: LoLHub },
  { id: 'qr', name: '📱 QR Code', module: QRCodeTool },
  { id: 'pwd', name: '🔐 Coffre MDP', module: PasswordVault },
  { id: 'char', name: '🎭 Personnages', module: CharacterGen },
  { id: 'rss', name: '📰 RSS Tracker', module: RSSTracker },
  { id: 'pomodoro', name: '⏱️ Pomodoro', module: PomodoroTimer },
  { id: 'scratchpad', name: '📝 Scratchpad', module: Scratchpad },
  { id: 'favicon', name: '🎨 Favicon Gen', module: FaviconGen },
  { id: 'mindmap', name: '🧠 Mind Map', module: MindMap },
  { id: 'namegen', name: '✨ Name Gen', module: NameGen },
  { id: 'tierlist', name: '📊 Tier List', module: TierList },
  { id: 'matchfmt', name: '🏅 Match Formatter', module: MatchFormatter },
  { id: 'zen', name: '🧘 Zen Editor', module: ZenEditor },
  { id: 'deals', name: '🎮 Deal Tracker', module: DealTracker },
  { id: 'movie', name: '🎬 Movie Picker', module: MoviePicker },
  { id: 'mdexport', name: '📄 Markdown Exporter', module: MarkdownExporter },
  { id: 'dailynote', name: '📓 Daily Note', module: DailyNote },
  { id: 'ggbuild', name: '🛠️ GGBuild', module: GGBuild },
  { id: 'habits', name: '🔥 Habit Tracker', module: HabitTracker },
  { id: 'trip', name: '✈️ Trip Planner', module: TripPlanner },
  { id: 'decision', name: '🎯 Decision Maker', module: DecisionMaker },
];

// --- Global State ---
const App = {
  currentUser: null,
  isAdmin: false,
  ADMIN_PASSWORD: '1980',
  currentPage: 'home',
  currentTool: 'rss',
  modules: {},

  // ===== AUTH =====
  login() {
    const username = document.getElementById('auth-username').value.trim();
    if (username.length < 2) {
      document.getElementById('auth-error').classList.add('show');
      return;
    }
    document.getElementById('auth-error').classList.remove('show');
    this.currentUser = username;
    localStorage.setItem('flowboard_user', username);
    document.getElementById('auth-overlay').style.display = 'none';
    document.getElementById('user-badge').style.display = 'flex';
    document.getElementById('user-name').textContent = username;
    document.getElementById('user-avatar').textContent = username.substring(0, 2).toUpperCase();
    this.loadUserData();
    this.showToast('Bienvenue ' + username + ' !', 'success');
  },

  switchUser() {
    document.getElementById('dropdown-menu').classList.remove('active');
    localStorage.removeItem('flowboard_user');
    this.currentUser = null;
    this.isAdmin = false;
    document.getElementById('auth-overlay').style.display = 'flex';
    document.getElementById('user-badge').style.display = 'none';
    document.getElementById('auth-username').value = '';
  },

  getStorageKey(key) {
    return this.currentUser ? 'flowboard_' + this.currentUser + '_' + key : 'flowboard_' + key;
  },

  // ===== DATA PERSISTENCE (Per-User) =====
  loadUserData() {
    if (!this.currentUser) return;

    // Tasks
    const savedTasks = localStorage.getItem(this.getStorageKey('tasks'));
    if (savedTasks) {
      try { Kanban.tasks = JSON.parse(savedTasks); } catch(e) {}
    } else {
      Kanban.tasks = [
        {id:'1',title:'Configurer Vercel',desc:'Déployer FlowBoard sur Vercel',priority:'high',status:'todo',tags:['devops','urgent'],date:'2026-06-05',progress:0,assignees:['JD']},
        {id:'2',title:'Setup GitHub Gist',desc:'Configurer la synchro cloud',priority:'high',status:'progress',tags:['devops'],date:'2026-06-03',progress:45,assignees:['JD','AL']},
        {id:'3',title:'Intégrer MacHub',desc:'Ajouter le sélecteur Mac mini',priority:'medium',status:'done',tags:['feature'],date:'2026-05-25',progress:100,assignees:[]},
        {id:'4',title:'Ajouter LoL Team Builder',desc:"Intégrer le générateur d'équipes",priority:'medium',status:'todo',tags:['gaming','fun'],date:'2026-06-10',progress:10,assignees:['MK']}
      ];
    }

    // Password Vault
    const savedVault = localStorage.getItem(this.getStorageKey('vault'));
    if (savedVault) {
      try { PasswordVault.vault = JSON.parse(savedVault); } catch(e) { PasswordVault.vault = []; }
    } else {
      PasswordVault.vault = [];
    }

    // Projects
    const savedProjects = localStorage.getItem(this.getStorageKey('projects'));
    if (savedProjects) {
      try { MacHub.selectedProjects = new Set(JSON.parse(savedProjects)); } catch(e) { MacHub.selectedProjects = new Set(); }
    } else {
      MacHub.selectedProjects = new Set();
    }

    // Scratchpad
    const savedNotes = localStorage.getItem(this.getStorageKey('notes'));
    if (savedNotes) {
      try { Scratchpad.notes = JSON.parse(savedNotes); } catch(e) { Scratchpad.notes = []; }
    }

    // Habits
    const savedHabits = localStorage.getItem(this.getStorageKey('habits'));
    if (savedHabits) {
      try { HabitTracker.habits = JSON.parse(savedHabits); } catch(e) { HabitTracker.habits = []; }
    }

    // Zen Editor content
    const savedZen = localStorage.getItem(this.getStorageKey('zen'));
    if (savedZen) {
      try { ZenEditor.content = JSON.parse(savedZen); } catch(e) { ZenEditor.content = ''; }
    }

    // Admin
    this.isAdmin = localStorage.getItem(this.getStorageKey('admin')) === 'true';

    Kanban.render();
    this.updateHomeStats();
    PasswordVault.render();
  },

  saveToStorage() {
    if (!this.currentUser) return;
    localStorage.setItem(this.getStorageKey('tasks'), JSON.stringify(Kanban.tasks));
    localStorage.setItem(this.getStorageKey('vault'), JSON.stringify(PasswordVault.vault));
    localStorage.setItem(this.getStorageKey('projects'), JSON.stringify([...MacHub.selectedProjects]));
    localStorage.setItem(this.getStorageKey('notes'), JSON.stringify(Scratchpad.notes || []));
    localStorage.setItem(this.getStorageKey('habits'), JSON.stringify(HabitTracker.habits || []));
    localStorage.setItem(this.getStorageKey('zen'), JSON.stringify(ZenEditor.content || ''));
  },

  // ===== NAVIGATION =====
  showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.getElementById('page-' + pageId).classList.add('active');
    document.querySelector(`[data-page="${pageId}"]`)?.classList.add('active');
    this.currentPage = pageId;
    if (pageId === 'home') this.updateHomeStats();
    if (pageId === 'kanban') Kanban.render();
    if (pageId === 'tools') this.renderTools();
  },

  // ===== TOOLS SYSTEM =====
  renderTools() {
    const nav = document.getElementById('tools-nav');
    const content = document.getElementById('tools-content');
    if (!nav || !content) return;

    // Render nav
    nav.innerHTML = TOOLS.map(t => 
      `<button class="btn ${this.currentTool === t.id ? 'active' : ''}" id="btn-tool-${t.id}" onclick="App.activateTool('${t.id}')">${t.name}</button>`
    ).join('');

    // Render content containers
    content.innerHTML = TOOLS.map(t => 
      `<div id="tool-${t.id}" class="tool-view ${this.currentTool === t.id ? 'active' : ''}"></div>`
    ).join('');

    // Initialize current tool
    this.activateTool(this.currentTool);
  },

  activateTool(toolId) {
    this.currentTool = toolId;
    document.querySelectorAll('.tool-view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('[id^="btn-tool-"]').forEach(b => b.classList.remove('active'));

    const view = document.getElementById('tool-' + toolId);
    const btn = document.getElementById('btn-tool-' + toolId);
    if (view) view.classList.add('active');
    if (btn) btn.classList.add('active');

    const tool = TOOLS.find(t => t.id === toolId);
    if (tool && tool.module && tool.module.render) {
      tool.module.render(view);
    }
  },

  // ===== HOME STATS =====
  updateHomeStats() {
    const total = Kanban.tasks.length;
    const done = Kanban.tasks.filter(t => t.status === 'done').length;
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;
    document.getElementById('home-task-count').textContent = total;
    document.getElementById('home-done-count').textContent = done;
    document.getElementById('home-tool-count').textContent = TOOLS.length;
    document.getElementById('home-progress').textContent = progress + '%';
  },

  // ===== MODULES GRID =====
  renderModules() {
    const grid = document.getElementById('modules-grid');
    if (!grid) return;
    const modules = [
      { icon: '📋', name: 'Gestionnaire de Projets', desc: 'Kanban board avec drag & drop, priorités, tags et assignation. Intégration Pomodoro.', badges: ['Kanban','Productivité'], page: 'kanban' },
      { icon: '🖥️', name: 'Mac mini M4 Hub', desc: 'Sélecteur interactif de projets serveur, comparatif complet des modèles Apple Silicon.', badges: ['Serveur','Comparatif'], page: 'tools', tool: 'machub' },
      { icon: '⚔️', name: 'LoL Hub', desc: 'Team Builder, Tournament Bracket et Match History Formatter pour League of Legends.', badges: ['Gaming','LoL'], page: 'tools', tool: 'lol' },
      { icon: '📰', name: 'RSS Tracker', desc: 'Agrégateur de flux RSS pour patch notes, deals et promos gaming.', badges: ['News','Gaming'], page: 'tools', tool: 'rss' },
      { icon: '⏱️', name: 'Pomodoro Timer', desc: 'Timer productif lié aux tâches Kanban avec historique de sessions.', badges: ['Productivité','Focus'], page: 'tools', tool: 'pomodoro' },
      { icon: '📝', name: 'Scratchpad', desc: 'Notes rapides avec Markdown, onglets multiples et recherche.', badges: ['Notes','Markdown'], page: 'tools', tool: 'scratchpad' },
      { icon: '🎨', name: 'Favicon Generator', desc: 'Génère favicons multi-tailles et manifest.json depuis un SVG.', badges: ['Dev','Design'], page: 'tools', tool: 'favicon' },
      { icon: '🧠', name: 'Mind Map Maker', desc: 'Cartes mentales interactives avec export PNG/SVG.', badges: ['Brainstorm','Design'], page: 'tools', tool: 'mindmap' },
      { icon: '✨', name: 'Name Generator', desc: 'Génère des noms de projets, variables et équipes esport.', badges: ['Dev','Gaming'], page: 'tools', tool: 'namegen' },
      { icon: '📊', name: 'Tier List Maker', desc: 'Crée des tier lists avec drag & drop et templates.', badges: ['Gaming','Fun'], page: 'tools', tool: 'tierlist' },
      { icon: '🏅', name: 'Match Formatter', desc: 'Formate ton historique LoL pour Discord/Reddit.', badges: ['LoL','Social'], page: 'tools', tool: 'matchfmt' },
      { icon: '🧘', name: 'Zen Editor', desc: 'Éditeur plein écran sans distraction avec objectifs de mots.', badges: ['Writing','Focus'], page: 'tools', tool: 'zen' },
      { icon: '🎮', name: 'Deal Tracker', desc: 'Suivi des promos jeux vidéo avec alertes de prix.', badges: ['Gaming','Deals'], page: 'tools', tool: 'deals' },
      { icon: '🎬', name: 'Movie Picker', desc: 'Tirage au sort depuis ta watchlist Letterboxd.', badges: ['Movies','Social'], page: 'tools', tool: 'movie' },
      { icon: '📄', name: 'Markdown Exporter', desc: 'Exporte n\'importe quel outil en Markdown propre.', badges: ['Export','Obsidian'], page: 'tools', tool: 'mdexport' },
      { icon: '📓', name: 'Daily Note', desc: 'Template quotidien Obsidian-compatible avec tâches et tracking.', badges: ['Productivité','Obsidian'], page: 'tools', tool: 'dailynote' },
      { icon: '🛠️', name: 'GGBuild', desc: 'PC Part Picker & Devis pour ta société de montage PC.', badges: ['PC','Business'], page: 'tools', tool: 'ggbuild' },
      { icon: '🔥', name: 'Habit Tracker', desc: 'Suivi visuel de tes habitudes style GitHub contributions.', badges: ['Productivité','Health'], page: 'tools', tool: 'habits' },
      { icon: '✈️', name: 'Trip Planner', desc: 'Planifie tes voyages avec budget, checklist et itinéraire.', badges: ['Travel','Planning'], page: 'tools', tool: 'trip' },
      { icon: '🎯', name: 'Decision Maker', desc: 'Roue de la fortune et tirages pondérés pour décider.', badges: ['Fun','Utility'], page: 'tools', tool: 'decision' },
      { icon: '📱', name: 'Générateur QR Code', desc: 'Génère des QR codes pour WiFi, URLs, vCard. Partage rapide sans taper.', badges: ['QR','Partage'], page: 'tools', tool: 'qr' },
      { icon: '🔐', name: 'Coffre Mots de Passe', desc: 'Génère et sauvegarde tes mots de passe localement. Chaque utilisateur a son propre coffre.', badges: ['Sécurité','Local'], page: 'tools', tool: 'pwd' },
      { icon: '🎭', name: 'Générateur de Personnages', desc: 'Génère des personnages aléatoires avec nom et avatar pour tes parties LoL.', badges: ['Gaming','Fun'], page: 'tools', tool: 'char' },
    ];
    grid.innerHTML = modules.map(m => `
      <div class="module-card" onclick="App.showPage('${m.page}')${m.tool ? `;App.activateTool('${m.tool}')` : ''}">
        <div class="module-icon">${m.icon}</div>
        <div class="module-name">${m.name}</div>
        <div class="module-desc">${m.desc}</div>
        <div class="module-meta">${m.badges.map(b => `<span class="module-badge">${b}</span>`).join('')}</div>
      </div>
    `).join('');
  },

  // ===== EXPORT / IMPORT =====
  exportJSON() {
    document.getElementById('dropdown-menu').classList.remove('active');
    const data = JSON.stringify({ 
      tasks: Kanban.tasks, 
      passwordVault: PasswordVault.vault, 
      selectedProjects: [...MacHub.selectedProjects],
      notes: Scratchpad.notes || [],
      habits: HabitTracker.habits || [],
      zenContent: ZenEditor.content || ''
    }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flowboard-export-${this.currentUser || 'anonymous'}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('Export réussi', 'success');
  },

  importJSON() {
    document.getElementById('dropdown-menu').classList.remove('active');
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (data.tasks) Kanban.tasks = data.tasks;
          if (data.passwordVault) PasswordVault.vault = data.passwordVault;
          if (data.selectedProjects) MacHub.selectedProjects = new Set(data.selectedProjects);
          if (data.notes) Scratchpad.notes = data.notes;
          if (data.habits) HabitTracker.habits = data.habits;
          if (data.zenContent) ZenEditor.content = data.zenContent;
          Kanban.render();
          this.updateHomeStats();
          PasswordVault.render();
          this.saveToStorage();
          this.showToast('Import réussi', 'success');
        } catch (err) { this.showToast('Fichier invalide', 'error'); }
      };
      reader.readAsText(file);
    };
    input.click();
  },

  resetData() {
    document.getElementById('dropdown-menu').classList.remove('active');
    if (confirm('Réinitialiser toutes les données ?')) {
      localStorage.removeItem(this.getStorageKey('tasks'));
      localStorage.removeItem(this.getStorageKey('vault'));
      localStorage.removeItem(this.getStorageKey('projects'));
      localStorage.removeItem(this.getStorageKey('notes'));
      localStorage.removeItem(this.getStorageKey('habits'));
      localStorage.removeItem(this.getStorageKey('zen'));
      Kanban.tasks = [];
      PasswordVault.vault = [];
      MacHub.selectedProjects = new Set();
      Scratchpad.notes = [];
      HabitTracker.habits = [];
      ZenEditor.content = '';
      Kanban.render();
      this.updateHomeStats();
      PasswordVault.render();
      this.showToast('Données réinitialisées', 'info');
    }
  },

  // ===== CLOUD SYNC =====
  configureCloud() {
    document.getElementById('dropdown-menu').classList.remove('active');
    const token = prompt('Entre ton token GitHub Gist (laisse vide pour désactiver):');
    if (token === null) return;
    if (token === '') { 
      localStorage.removeItem('flowboard_gist_token'); 
      localStorage.removeItem('flowboard_gist_id'); 
      this.updateSyncStatus('local'); 
      this.showToast('Synchro cloud désactivée', 'info'); 
      return; 
    }
    localStorage.setItem('flowboard_gist_token', token);
    this.syncToGist();
  },

  async syncToGist() {
    const token = localStorage.getItem('flowboard_gist_token');
    if (!token) return;
    this.updateSyncStatus('syncing');
    try {
      let gistId = localStorage.getItem('flowboard_gist_id');
      const data = JSON.stringify({ 
        tasks: Kanban.tasks, 
        passwordVault: PasswordVault.vault, 
        selectedProjects: [...MacHub.selectedProjects],
        notes: Scratchpad.notes || [],
        habits: HabitTracker.habits || [],
        zenContent: ZenEditor.content || ''
      }, null, 2);
      if (gistId) {
        await fetch(`https://api.github.com/gists/${gistId}`, { 
          method: 'PATCH', 
          headers: { 'Authorization': `token ${token}`, 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ files: { 'flowboard-data.json': { content: data } }, description: 'FlowBoard - Données de synchronisation' }) 
        });
      } else {
        const res = await fetch('https://api.github.com/gists', { 
          method: 'POST', 
          headers: { 'Authorization': `token ${token}`, 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ public: false, description: 'FlowBoard - Données de synchronisation', files: { 'flowboard-data.json': { content: data } } }) 
        });
        const json = await res.json();
        if (json.id) localStorage.setItem('flowboard_gist_id', json.id);
      }
      this.updateSyncStatus('synced');
      this.showToast('Synchronisé sur GitHub Gist', 'success');
    } catch (err) { 
      this.updateSyncStatus('error'); 
      this.showToast('Erreur de synchro cloud', 'error'); 
    }
  },

  async loadFromGist() {
    const token = localStorage.getItem('flowboard_gist_token');
    const gistId = localStorage.getItem('flowboard_gist_id');
    if (!token || !gistId) return;
    try {
      const res = await fetch(`https://api.github.com/gists/${gistId}`, { headers: { 'Authorization': `token ${token}` } });
      const json = await res.json();
      const content = json.files['flowboard-data.json']?.content;
      if (content) {
        const data = JSON.parse(content);
        if (data.tasks) Kanban.tasks = data.tasks;
        if (data.passwordVault) PasswordVault.vault = data.passwordVault;
        if (data.selectedProjects) MacHub.selectedProjects = new Set(data.selectedProjects);
        if (data.notes) Scratchpad.notes = data.notes;
        if (data.habits) HabitTracker.habits = data.habits;
        if (data.zenContent) ZenEditor.content = data.zenContent;
        Kanban.render();
        this.updateHomeStats();
        PasswordVault.render();
        this.updateSyncStatus('synced');
      }
    } catch (err) { this.updateSyncStatus('error'); }
  },

  updateSyncStatus(state) {
    const el = document.getElementById('sync-status');
    const txt = document.getElementById('sync-text');
    el.className = 'sync-status ' + state;
    const labels = { local: 'Local', syncing: 'Sync...', synced: 'Cloud ✓', error: 'Erreur' };
    txt.textContent = labels[state] || 'Local';
  },

  // ===== UTILS =====
  toggleDropdown() {
    document.getElementById('dropdown-menu').classList.toggle('active');
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icons = { success: '✓', error: '✕', info: 'ℹ' };
    toast.innerHTML = `<span>${icons[type]}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  },
};

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  App.renderModules();
  Kanban.setupDragAndDrop();

  // Check existing session
  const savedUser = localStorage.getItem('flowboard_user');
  if (savedUser) {
    App.currentUser = savedUser;
    document.getElementById('auth-overlay').style.display = 'none';
    document.getElementById('user-badge').style.display = 'flex';
    document.getElementById('user-name').textContent = savedUser;
    document.getElementById('user-avatar').textContent = savedUser.substring(0, 2).toUpperCase();
    App.loadUserData();
  }

  App.loadFromGist();
  setInterval(() => { 
    if (localStorage.getItem('flowboard_gist_token')) App.syncToGist(); 
  }, 30000);

  // Close dropdown on outside click
  document.addEventListener('click', (e) => { 
    if (!e.target.closest('.dropdown')) document.getElementById('dropdown-menu')?.classList.remove('active'); 
  });

  // Modal close on escape/click outside
  document.getElementById('task-modal').addEventListener('click', (e) => { 
    if (e.target === e.currentTarget) Kanban.closeTaskModal(); 
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') Kanban.closeTaskModal();
    if (e.key === 'n' && e.ctrlKey) { e.preventDefault(); Kanban.openTaskModal(); }
  });

  // Auth enter key
  document.getElementById('auth-username').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') App.login();
  });
});

// Expose globally for HTML onclick handlers
window.App = App;
window.Kanban = Kanban;
window.MacHub = MacHub;
window.LoLHub = LoLHub;
window.QRCodeTool = QRCodeTool;
window.PasswordVault = PasswordVault;
window.CharacterGen = CharacterGen;
window.RSSTracker = RSSTracker;
window.PomodoroTimer = PomodoroTimer;
window.Scratchpad = Scratchpad;
window.FaviconGen = FaviconGen;
window.MindMap = MindMap;
window.NameGen = NameGen;
window.TierList = TierList;
window.MatchFormatter = MatchFormatter;
window.ZenEditor = ZenEditor;
window.DealTracker = DealTracker;
window.MoviePicker = MoviePicker;
window.MarkdownExporter = MarkdownExporter;
window.DailyNote = DailyNote;
window.GGBuild = GGBuild;
window.HabitTracker = HabitTracker;
window.TripPlanner = TripPlanner;
window.DecisionMaker = DecisionMaker;


// ===== EVENT LISTENERS FOR STATIC HTML =====
function setupEventListeners() {
  // Auth
  const authBtn = document.getElementById('auth-btn');
  const authInput = document.getElementById('auth-username');
  if (authBtn) authBtn.addEventListener('click', () => App.login());
  if (authInput) authInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') App.login(); });

  // Navigation
  const navHome = document.getElementById('nav-home');
  const navKanban = document.getElementById('nav-kanban');
  const navTools = document.getElementById('nav-tools');
  const navBrand = document.getElementById('nav-brand');
  if (navHome) navHome.addEventListener('click', () => App.showPage('home'));
  if (navKanban) navKanban.addEventListener('click', () => App.showPage('kanban'));
  if (navTools) navTools.addEventListener('click', () => App.showPage('tools'));
  if (navBrand) navBrand.addEventListener('click', () => App.showPage('home'));

  // CTA buttons
  const ctaKanban = document.getElementById('cta-kanban');
  const ctaTools = document.getElementById('cta-tools');
  if (ctaKanban) ctaKanban.addEventListener('click', () => App.showPage('kanban'));
  if (ctaTools) ctaTools.addEventListener('click', () => App.showPage('tools'));

  // Dropdown
  const dropdownBtn = document.getElementById('dropdown-btn');
  if (dropdownBtn) dropdownBtn.addEventListener('click', () => App.toggleDropdown());

  // Dropdown items
  document.getElementById('export-json')?.addEventListener('click', () => App.exportJSON());
  document.getElementById('import-json')?.addEventListener('click', () => App.importJSON());
  document.getElementById('config-cloud')?.addEventListener('click', () => App.configureCloud());
  document.getElementById('switch-user')?.addEventListener('click', () => App.switchUser());
  document.getElementById('reset-data')?.addEventListener('click', () => App.resetData());

  // New task button
  const newTaskBtn = document.getElementById('new-task-btn');
  if (newTaskBtn) newTaskBtn.addEventListener('click', () => Kanban.openTaskModal());

  // Modal
  const modalClose = document.getElementById('modal-close');
  const modalCancel = document.getElementById('modal-cancel');
  const taskModal = document.getElementById('task-modal');
  if (modalClose) modalClose.addEventListener('click', () => Kanban.closeTaskModal());
  if (modalCancel) modalCancel.addEventListener('click', () => Kanban.closeTaskModal());
  if (taskModal) taskModal.addEventListener('click', (e) => { if (e.target === taskModal) Kanban.closeTaskModal(); });

  // Task form
  const taskForm = document.getElementById('task-form');
  if (taskForm) taskForm.addEventListener('submit', (e) => Kanban.saveTask(e));

  // Search
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.addEventListener('input', () => Kanban.filter());

  // Filter chips
  document.getElementById('filter-all')?.addEventListener('click', function() { Kanban.setFilter('all', this); });
  document.getElementById('filter-high')?.addEventListener('click', function() { Kanban.setFilter('high', this); });
  document.getElementById('filter-medium')?.addEventListener('click', function() { Kanban.setFilter('medium', this); });
  document.getElementById('filter-low')?.addEventListener('click', function() { Kanban.setFilter('low', this); });

  // Progress slider
  const progressSlider = document.getElementById('task-progress');
  if (progressSlider) {
    progressSlider.addEventListener('input', function() {
      document.getElementById('progress-val').textContent = this.value + '%';
    });
  }

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown')) {
      document.getElementById('dropdown-menu')?.classList.remove('active');
    }
  });

  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') Kanban.closeTaskModal();
    if (e.key === 'n' && e.ctrlKey) { e.preventDefault(); Kanban.openTaskModal(); }
  });
}

// Run setup after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupEventListeners);
} else {
  setupEventListeners(); // DOM already ready, run immediately
}