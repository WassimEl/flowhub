// ===== POMODORO TIMER MODULE =====
export const Pomodoro = {
  timer: null,
  timeLeft: 25 * 60,
  isRunning: false,
  mode: 'work', // work, short, long
  sessions: [],
  currentTask: null,

  MODES: {
    work: { time: 25 * 60, label: 'Travail', color: 'var(--accent)' },
    short: { time: 5 * 60, label: 'Pause courte', color: 'var(--green)' },
    long: { time: 15 * 60, label: 'Pause longue', color: 'var(--teal)' }
  },

  render(container) {
    if (!container) return;
    container.innerHTML = `
      <div class="tool-panel">
        <div class="tool-panel-header">
          <div class="icon">⏱️</div>
          <h3>Pomodoro Timer</h3>
          <p>Timer intégré au Kanban. Sélectionne une tâche et concentre-toi.</p>
        </div>
        <div style="text-align:center;margin-bottom:32px;">
          <div style="font-size:72px;font-family:'JetBrains Mono',monospace;font-weight:700;color:var(--accent);margin-bottom:16px;" id="pomo-display">25:00</div>
          <div style="display:flex;gap:8px;justify-content:center;margin-bottom:20px;">
            <button class="btn ${this.mode === 'work' ? 'active' : ''}" onclick="Pomodoro.setMode('work')">💼 Travail (25m)</button>
            <button class="btn ${this.mode === 'short' ? 'active' : ''}" onclick="Pomodoro.setMode('short')">☕ Pause (5m)</button>
            <button class="btn ${this.mode === 'long' ? 'active' : ''}" onclick="Pomodoro.setMode('long')">🌴 Longue (15m)</button>
          </div>
          <div style="display:flex;gap:8px;justify-content:center;">
            <button class="btn btn-primary" id="pomo-start" onclick="Pomodoro.toggle()" style="padding:12px 32px;font-size:16px;">▶️ Démarrer</button>
            <button class="btn" onclick="Pomodoro.reset()">🔄 Reset</button>
          </div>
        </div>
        <div style="background:var(--bg-primary);border:1px solid var(--border);border-radius:var(--radius-sm);padding:20px;margin-bottom:20px;">
          <label class="form-label">Tâche liée (optionnel)</label>
          <select class="form-select" id="pomo-task-select" onchange="Pomodoro.selectTask(this.value)">
            <option value="">Aucune tâche</option>
          </select>
        </div>
        <div style="background:var(--bg-primary);border:1px solid var(--border);border-radius:var(--radius-sm);padding:20px;">
          <h4 style="font-family:'Space Grotesk',sans-serif;font-size:16px;margin-bottom:12px;">📊 Historique des sessions</h4>
          <div id="pomo-history" style="display:flex;flex-direction:column;gap:8px;">
            <div style="text-align:center;color:var(--text-muted);font-size:13px;padding:16px;">Aucune session encore</div>
          </div>
        </div>
      </div>
    `;
    this.populateTasks();
    this.loadHistory();
  },

  populateTasks() {
    const select = document.getElementById('pomo-task-select');
    if (!select || !window.Kanban) return;
    const tasks = window.Kanban.tasks.filter(t => t.status !== 'done');
    select.innerHTML = '<option value="">Aucune tâche</option>' + 
      tasks.map(t => `<option value="${t.id}">${t.title}</option>`).join('');
  },

  selectTask(taskId) {
    if (!taskId) { this.currentTask = null; return; }
    if (window.Kanban) {
      this.currentTask = window.Kanban.tasks.find(t => t.id === taskId);
    }
  },

  setMode(mode) {
    this.mode = mode;
    this.timeLeft = this.MODES[mode].time;
    this.isRunning = false;
    this.clearTimer();
    this.updateDisplay();
    // Re-render to update button states
    this.render(document.getElementById('tool-pomodoro'));
  },

  toggle() {
    if (this.isRunning) {
      this.pause();
    } else {
      this.start();
    }
  },

  start() {
    this.isRunning = true;
    const btn = document.getElementById('pomo-start');
    if (btn) btn.innerHTML = '⏸️ Pause';

    this.timer = setInterval(() => {
      this.timeLeft--;
      this.updateDisplay();
      if (this.timeLeft <= 0) {
        this.complete();
      }
    }, 1000);
  },

  pause() {
    this.isRunning = false;
    this.clearTimer();
    const btn = document.getElementById('pomo-start');
    if (btn) btn.innerHTML = '▶️ Reprendre';
  },

  reset() {
    this.isRunning = false;
    this.clearTimer();
    this.timeLeft = this.MODES[this.mode].time;
    this.updateDisplay();
    const btn = document.getElementById('pomo-start');
    if (btn) btn.innerHTML = '▶️ Démarrer';
  },

  clearTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },

  complete() {
    this.isRunning = false;
    this.clearTimer();

    // Play notification sound
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmFgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
      audio.play();
    } catch(e) {}

    const session = {
      id: Date.now().toString(),
      mode: this.mode,
      duration: this.MODES[this.mode].time,
      taskId: this.currentTask?.id || null,
      taskTitle: this.currentTask?.title || null,
      date: new Date().toISOString()
    };
    this.sessions.push(session);
    this.saveHistory();

    if (window.App) window.App.showToast(`Session ${this.MODES[this.mode].label} terminée !`, 'success');
    this.renderHistory();

    const btn = document.getElementById('pomo-start');
    if (btn) btn.innerHTML = '▶️ Démarrer';
    this.timeLeft = this.MODES[this.mode].time;
    this.updateDisplay();
  },

  updateDisplay() {
    const display = document.getElementById('pomo-display');
    if (!display) return;
    const mins = Math.floor(this.timeLeft / 60);
    const secs = this.timeLeft % 60;
    display.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    display.style.color = this.MODES[this.mode].color;
    document.title = this.isRunning ? `(${mins}:${String(secs).padStart(2, '0')}) FlowBoard` : 'FlowBoard';
  },

  saveHistory() {
    if (window.App) {
      localStorage.setItem(window.App.getStorageKey('pomo_sessions'), JSON.stringify(this.sessions));
    }
  },

  loadHistory() {
    if (window.App) {
      const saved = localStorage.getItem(window.App.getStorageKey('pomo_sessions'));
      if (saved) {
        try { this.sessions = JSON.parse(saved); } catch(e) {}
      }
    }
    this.renderHistory();
  },

  renderHistory() {
    const container = document.getElementById('pomo-history');
    if (!container) return;

    if (this.sessions.length === 0) {
      container.innerHTML = '<div style="text-align:center;color:var(--text-muted);font-size:13px;padding:16px;">Aucune session encore</div>';
      return;
    }

    const reversed = [...this.sessions].reverse();
    container.innerHTML = reversed.map(s => {
      const modeLabel = this.MODES[s.mode].label;
      const modeColor = this.MODES[s.mode].color;
      const date = new Date(s.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
      const duration = Math.floor(s.duration / 60) + 'm';
      return `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:var(--bg-card);border-radius:8px;border:1px solid var(--border);">
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="width:8px;height:8px;border-radius:50%;background:${modeColor};"></span>
            <div>
              <div style="font-weight:500;font-size:13px;">${modeLabel}</div>
              ${s.taskTitle ? `<div style="font-size:11px;color:var(--text-muted);">📋 ${s.taskTitle}</div>` : ''}
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:12px;color:var(--text-secondary);font-family:'JetBrains Mono',monospace;">${duration}</div>
            <div style="font-size:11px;color:var(--text-muted);">${date}</div>
          </div>
        </div>
      `;
    }).join('');
  }
};
