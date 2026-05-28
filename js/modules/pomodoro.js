// ===== POMODORO TIMER MODULE =====
export const PomodoroTimer = {
  timer: null,
  timeLeft: 25 * 60,
  isRunning: false,
  isBreak: false,
  currentTask: null,
  sessions: [],
  workTime: 25,
  breakTime: 5,
  longBreakTime: 15,
  sessionsBeforeLongBreak: 4,
  sessionCount: 0,

  render(container) {
    if (!container) return;
    container.innerHTML = `
      <div class="tool-panel">
        <div class="tool-panel-header">
          <div class="icon">⏱️</div>
          <h3>Pomodoro Timer</h3>
          <p>Timer productif lie a tes taches Kanban. Focus sur une tache a la fois.</p>
        </div>
        <div class="pomodoro-container">
          <div class="pomodoro-display">
            <div class="pomodoro-mode" id="pomo-mode">Focus</div>
            <div class="pomodoro-time" id="pomo-time">25:00</div>
            <div class="pomodoro-progress">
              <div class="pomodoro-progress-bar" id="pomo-progress" style="width:0%"></div>
            </div>
            <div class="pomodoro-session-count" id="pomo-sessions">Session 0/4</div>
          </div>
          <div class="pomodoro-controls">
            <button class="btn btn-primary pomodoro-btn" id="pomo-start" onclick="PomodoroTimer.toggle()">▶️ Demarrer</button>
            <button class="btn pomodoro-btn" onclick="PomodoroTimer.reset()">🔄 Reset</button>
            <button class="btn pomodoro-btn" onclick="PomodoroTimer.skip()">⏭️ Skip</button>
          </div>
          <div class="pomodoro-task-select">
            <label class="form-label">Tache Kanban associee</label>
            <select class="form-select" id="pomo-task-select" onchange="PomodoroTimer.selectTask(this.value)">
              <option value="">-- Selectionner une tache --</option>
            </select>
          </div>
          <div class="pomodoro-settings">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Focus (min)</label>
                <input type="number" class="form-input" id="pomo-work" value="25" min="1" max="60" onchange="PomodoroTimer.updateSettings()">
              </div>
              <div class="form-group">
                <label class="form-label">Pause (min)</label>
                <input type="number" class="form-input" id="pomo-break" value="5" min="1" max="30" onchange="PomodoroTimer.updateSettings()">
              </div>
              <div class="form-group">
                <label class="form-label">Pause longue (min)</label>
                <input type="number" class="form-input" id="pomo-longbreak" value="15" min="1" max="60" onchange="PomodoroTimer.updateSettings()">
              </div>
            </div>
          </div>
          <div class="pomodoro-stats" id="pomo-stats">
            <h4 style="font-family:'Space Grotesk',sans-serif;margin-bottom:16px;">📊 Statistiques</h4>
            <div class="pomodoro-stats-grid" id="pomo-stats-grid"></div>
          </div>
          <div class="pomodoro-history" id="pomo-history">
            <h4 style="font-family:'Space Grotesk',sans-serif;margin-bottom:16px;">🕐 Historique des sessions</h4>
            <div class="pomodoro-history-list" id="pomo-history-list"></div>
          </div>
        </div>
      </div>
    `;
    this.loadFromStorage();
    this.populateTaskSelect();
    this.renderStats();
    this.renderHistory();
    this.updateDisplay();
  },

  populateTaskSelect() {
    const select = document.getElementById('pomo-task-select');
    if (!select || !window.Kanban) return;
    const tasks = window.Kanban.tasks || [];
    const currentVal = select.value;
    select.innerHTML = '<option value="">-- Selectionner une tache --</option>' +
      tasks.map(t => `<option value="${t.id}" ${t.id === currentVal ? 'selected' : ''}>${t.title} (${t.status === 'done' ? '✓' : t.status === 'progress' ? '▶' : '○'})</option>`).join('');
  },

  selectTask(taskId) {
    if (!taskId) { this.currentTask = null; return; }
    const task = (window.Kanban?.tasks || []).find(t => t.id === taskId);
    this.currentTask = task || null;
  },

  toggle() {
    if (this.isRunning) this.pause();
    else this.start();
  },

  start() {
    this.isRunning = true;
    document.getElementById('pomo-start').innerHTML = '⏸️ Pause';
    this.timer = setInterval(() => {
      this.timeLeft--;
      this.updateDisplay();
      if (this.timeLeft <= 0) this.complete();
    }, 1000);
  },

  pause() {
    this.isRunning = false;
    clearInterval(this.timer);
    document.getElementById('pomo-start').innerHTML = '▶️ Reprendre';
  },

  reset() {
    this.isRunning = false;
    clearInterval(this.timer);
    const totalTime = this.isBreak ? (this.sessionCount % this.sessionsBeforeLongBreak === 0 && this.sessionCount > 0 ? this.longBreakTime : this.breakTime) : this.workTime;
    this.timeLeft = totalTime * 60;
    this.updateDisplay();
    document.getElementById('pomo-start').innerHTML = '▶️ Demarrer';
  },

  skip() { this.complete(); },

  complete() {
    this.isRunning = false;
    clearInterval(this.timer);
    this.playSound();

    if (!this.isBreak) {
      this.sessionCount++;
      const session = {
        id: Date.now().toString(),
        taskId: this.currentTask?.id,
        taskTitle: this.currentTask?.title,
        duration: this.workTime,
        date: new Date().toISOString(),
        type: 'work'
      };
      this.sessions.push(session);

      if (this.currentTask && window.Kanban) {
        const task = window.Kanban.tasks.find(t => t.id === this.currentTask.id);
        if (task) {
          task.progress = Math.min((task.progress || 0) + 10, 100);
          if (task.status === 'todo') task.status = 'progress';
          window.Kanban.render();
          window.App?.updateHomeStats();
        }
      }

      this.isBreak = true;
      const isLongBreak = this.sessionCount % this.sessionsBeforeLongBreak === 0;
      this.timeLeft = (isLongBreak ? this.longBreakTime : this.breakTime) * 60;
      document.getElementById('pomo-mode').textContent = isLongBreak ? '☕ Pause longue' : '☕ Pause';
    } else {
      this.isBreak = false;
      this.timeLeft = this.workTime * 60;
      document.getElementById('pomo-mode').textContent = '🔥 Focus';
    }

    this.saveToStorage();
    this.updateDisplay();
    this.renderStats();
    this.renderHistory();
    document.getElementById('pomo-start').innerHTML = '▶️ Demarrer';
    if (window.App) window.App.showToast(this.isBreak ? 'Session terminee ! Pause meritee.' : 'Pause terminee ! Au travail.', 'success');
  },

  playSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      gain.gain.value = 0.1;
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.frequency.value = 1000;
        gain2.gain.value = 0.1;
        osc2.start();
        osc2.stop(ctx.currentTime + 0.3);
      }, 350);
    } catch(e) {}
  },

  updateDisplay() {
    const mins = Math.floor(this.timeLeft / 60);
    const secs = this.timeLeft % 60;
    document.getElementById('pomo-time').textContent = `${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;

    const totalTime = this.isBreak ? (this.sessionCount % this.sessionsBeforeLongBreak === 0 && this.sessionCount > 0 ? this.longBreakTime : this.breakTime) : this.workTime;
    const progress = ((totalTime * 60 - this.timeLeft) / (totalTime * 60)) * 100;
    document.getElementById('pomo-progress').style.width = progress + '%';
    document.getElementById('pomo-sessions').textContent = `Session ${this.sessionCount}/${this.sessionsBeforeLongBreak}`;

    document.title = this.isRunning ? `(${mins}:${secs.toString().padStart(2,'0')}) FlowBoard` : 'FlowBoard';
  },

  updateSettings() {
    this.workTime = parseInt(document.getElementById('pomo-work').value) || 25;
    this.breakTime = parseInt(document.getElementById('pomo-break').value) || 5;
    this.longBreakTime = parseInt(document.getElementById('pomo-longbreak').value) || 15;
    if (!this.isRunning) {
      this.timeLeft = (this.isBreak ? this.breakTime : this.workTime) * 60;
      this.updateDisplay();
    }
    this.saveToStorage();
  },

  renderStats() {
    const grid = document.getElementById('pomo-stats-grid');
    if (!grid) return;

    const today = new Date().toDateString();
    const todaySessions = this.sessions.filter(s => new Date(s.date).toDateString() === today);
    const totalMinutes = todaySessions.reduce((sum, s) => sum + s.duration, 0);
    const totalSessions = this.sessions.length;
    const taskTime = {};
    this.sessions.forEach(s => {
      if (s.taskId) taskTime[s.taskId] = (taskTime[s.taskId] || 0) + s.duration;
    });
    const topTask = Object.entries(taskTime).sort((a,b) => b[1] - a[1])[0];
    const topTaskName = topTask ? (window.Kanban?.tasks?.find(t => t.id === topTask[0])?.title || 'Inconnu') : 'Aucune';

    grid.innerHTML = `
      <div class="pomodoro-stat-card"><div class="pomodoro-stat-value">${todaySessions.length}</div><div class="pomodoro-stat-label">Sessions aujourd'hui</div></div>
      <div class="pomodoro-stat-card"><div class="pomodoro-stat-value">${totalMinutes}</div><div class="pomodoro-stat-label">Minutes aujourd'hui</div></div>
      <div class="pomodoro-stat-card"><div class="pomodoro-stat-value">${totalSessions}</div><div class="pomodoro-stat-label">Total sessions</div></div>
      <div class="pomodoro-stat-card"><div class="pomodoro-stat-value" style="font-size:14px">${topTaskName}</div><div class="pomodoro-stat-label">Tache la plus travaillee</div></div>
    `;
  },

  renderHistory() {
    const list = document.getElementById('pomo-history-list');
    if (!list) return;

    if (this.sessions.length === 0) {
      list.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-muted);font-size:13px;">Aucune session enregistree</div>';
      return;
    }

    const recent = [...this.sessions].reverse().slice(0, 20);
    list.innerHTML = recent.map(s => {
      const date = new Date(s.date);
      const timeStr = date.toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'});
      return `
        <div class="pomodoro-history-item">
          <div class="pomodoro-history-time">${timeStr}</div>
          <div class="pomodoro-history-task">${s.taskTitle || 'Sans tache'}</div>
          <div class="pomodoro-history-duration">${s.duration} min</div>
        </div>
      `;
    }).join('');
  },

  saveToStorage() {
    const key = window.App?.getStorageKey('pomodoro');
    if (key) {
      localStorage.setItem(key, JSON.stringify({
        sessions: this.sessions,
        workTime: this.workTime,
        breakTime: this.breakTime,
        longBreakTime: this.longBreakTime,
        sessionCount: this.sessionCount
      }));
    }
  },

  loadFromStorage() {
    const key = window.App?.getStorageKey('pomodoro');
    if (key) {
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          this.sessions = data.sessions || [];
          this.workTime = data.workTime || 25;
          this.breakTime = data.breakTime || 5;
          this.longBreakTime = data.longBreakTime || 15;
          this.sessionCount = data.sessionCount || 0;
          this.timeLeft = this.workTime * 60;
        } catch(e) {}
      }
    }
  }
};
