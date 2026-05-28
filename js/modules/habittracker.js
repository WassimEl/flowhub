// ===== HABIT TRACKER MODULE =====
export const HabitTracker = {
  habits: [],
  currentYear: new Date().getFullYear(),
  currentMonth: new Date().getMonth(),

  DEFAULT_HABITS: [
    { id: 'sport', name: 'Sport', icon: '💪', color: '#f87171' },
    { id: 'read', name: 'Lecture', icon: '📚', color: '#34d399' },
    { id: 'code', name: 'Code', icon: '💻', color: '#818cf8' },
    { id: 'game', name: 'Gaming', icon: '🎮', color: '#c084fc' },
    { id: 'meditate', name: 'Meditation', icon: '🧘', color: '#2dd4bf' },
  ],

  render(container) {
    if (!container) return;
    container.innerHTML = `
      <div class="tool-panel">
        <div class="tool-panel-header">
          <div class="icon">🔥</div>
          <h3>Habit Tracker</h3>
          <p>Suivi visuel de tes habitudes style GitHub contributions graph.</p>
        </div>
        <div class="habit-toolbar">
          <button class="btn btn-primary" onclick="HabitTracker.addHabit()">+ Nouvelle habitude</button>
          <div class="habit-nav">
            <button class="btn btn-icon" onclick="HabitTracker.prevMonth()">◀</button>
            <span class="habit-month-label" id="habit-month-label">${this.getMonthName()}</span>
            <button class="btn btn-icon" onclick="HabitTracker.nextMonth()">▶</button>
          </div>
        </div>
        <div class="habit-list" id="habit-list"></div>
        <div class="habit-legend">
          <span style="color:var(--text-muted);font-size:12px;">Moins</span>
          <div class="habit-legend-box" style="background:var(--bg-tertiary)"></div>
          <div class="habit-legend-box" style="background:rgba(129,140,248,0.3)"></div>
          <div class="habit-legend-box" style="background:rgba(129,140,248,0.5)"></div>
          <div class="habit-legend-box" style="background:rgba(129,140,248,0.7)"></div>
          <div class="habit-legend-box" style="background:rgba(129,140,248,1)"></div>
          <span style="color:var(--text-muted);font-size:12px;">Plus</span>
        </div>
      </div>
    `;
    this.loadFromStorage();
    if (this.habits.length === 0) {
      this.habits = this.DEFAULT_HABITS.map(h => ({ ...h, entries: [], streak: 0, bestStreak: 0 }));
    }
    this.renderHabits();
  },

  getMonthName() {
    const months = ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'];
    return months[this.currentMonth] + ' ' + this.currentYear;
  },

  renderHabits() {
    const list = document.getElementById('habit-list');
    if (!list) return;

    document.getElementById('habit-month-label').textContent = this.getMonthName();

    list.innerHTML = this.habits.map(h => {
      const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
      const entries = h.entries.filter(e => {
        const d = new Date(e);
        return d.getFullYear() === this.currentYear && d.getMonth() === this.currentMonth;
      });

      // Calculate streak
      let streak = 0;
      let bestStreak = h.bestStreak || 0;
      const today = new Date();
      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];
        if (h.entries.includes(dateStr)) streak++;
        else if (i > 0) break;
      }

      const completionRate = daysInMonth > 0 ? Math.round((entries.length / daysInMonth) * 100) : 0;

      return `
        <div class="habit-row">
          <div class="habit-info">
            <span class="habit-icon">${h.icon}</span>
            <div class="habit-details">
              <div class="habit-name">${h.name}</div>
              <div class="habit-stats">
                <span>🔥 ${streak}j serie</span>
                <span>🏆 ${bestStreak}j record</span>
                <span>${completionRate}% ce mois</span>
              </div>
            </div>
            <button class="btn btn-icon" onclick="HabitTracker.deleteHabit('${h.id}')">🗑</button>
          </div>
          <div class="habit-grid">
            ${Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dateStr = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isDone = entries.includes(dateStr);
              const isToday = dateStr === new Date().toISOString().split('T')[0];
              return `<div class="habit-day ${isDone ? 'done' : ''} ${isToday ? 'today' : ''}" 
                style="${isDone ? 'background:' + h.color : ''}" 
                onclick="HabitTracker.toggleDay('${h.id}', '${dateStr}')"
                title="${day} ${this.getMonthName().split(' ')[0]}">
                ${day}
              </div>`;
            }).join('')}
          </div>
        </div>
      `;
    }).join('');
  },

  toggleDay(habitId, dateStr) {
    const habit = this.habits.find(h => h.id === habitId);
    if (!habit) return;

    if (habit.entries.includes(dateStr)) {
      habit.entries = habit.entries.filter(e => e !== dateStr);
    } else {
      habit.entries.push(dateStr);
    }

    // Update best streak
    let currentStreak = 0;
    let maxStreak = 0;
    const sorted = [...habit.entries].sort();
    for (let i = 0; i < sorted.length; i++) {
      if (i === 0) { currentStreak = 1; }
      else {
        const prev = new Date(sorted[i - 1]);
        const curr = new Date(sorted[i]);
        const diff = (curr - prev) / 86400000;
        if (diff === 1) currentStreak++;
        else { maxStreak = Math.max(maxStreak, currentStreak); currentStreak = 1; }
      }
    }
    habit.bestStreak = Math.max(maxStreak, currentStreak, habit.bestStreak || 0);

    this.saveToStorage();
    this.renderHabits();
  },

  addHabit() {
    const name = prompt('Nom de l\'habitude:');
    if (!name) return;
    const icon = prompt('Emoji (optionnel):') || '✨';
    const colors = ['#f87171', '#34d399', '#818cf8', '#c084fc', '#2dd4bf', '#fbbf24', '#fb923c', '#f472b6'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    this.habits.push({
      id: Date.now().toString(),
      name,
      icon,
      color,
      entries: [],
      streak: 0,
      bestStreak: 0
    });
    this.saveToStorage();
    this.renderHabits();
    if (window.App) window.App.showToast('Habitude ajoutee', 'success');
  },

  deleteHabit(id) {
    if (!confirm('Supprimer cette habitude ?')) return;
    this.habits = this.habits.filter(h => h.id !== id);
    this.saveToStorage();
    this.renderHabits();
  },

  prevMonth() {
    this.currentMonth--;
    if (this.currentMonth < 0) { this.currentMonth = 11; this.currentYear--; }
    this.renderHabits();
  },

  nextMonth() {
    this.currentMonth++;
    if (this.currentMonth > 11) { this.currentMonth = 0; this.currentYear++; }
    this.renderHabits();
  },

  saveToStorage() {
    if (window.App) window.App.saveToStorage();
  },

  loadFromStorage() {
    const key = window.App?.getStorageKey('habits');
    if (key) {
      const saved = localStorage.getItem(key);
      if (saved) {
        try { this.habits = JSON.parse(saved); } catch(e) { this.habits = []; }
      }
    }
  }
};
