// ===== KANBAN MODULE =====
export const Kanban = {
  tasks: [],
  currentFilter: 'all',
  draggedTask: null,
  selectedAssignees: new Set(),

  // ===== RENDER =====
  render() {
    const columns = { 
      todo: document.getElementById('todo-list'), 
      progress: document.getElementById('progress-list'), 
      done: document.getElementById('done-list') 
    };
    Object.values(columns).forEach(col => { if (col) col.innerHTML = ''; });

    const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
    const filtered = this.tasks.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchTerm) || 
                           t.desc.toLowerCase().includes(searchTerm) || 
                           t.tags.some(tag => tag.toLowerCase().includes(searchTerm));
      const matchesFilter = this.currentFilter === 'all' || t.priority === this.currentFilter;
      return matchesSearch && matchesFilter;
    });

    filtered.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) return priorityOrder[a.priority] - priorityOrder[b.priority];
      return new Date(a.date) - new Date(b.date);
    });

    filtered.forEach(task => { 
      const card = this.createTaskCard(task); 
      if (columns[task.status]) columns[task.status].appendChild(card); 
    });

    Object.entries(columns).forEach(([status, col]) => { 
      if (col && col.children.length === 0) col.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📋</div><div>Aucune tâche</div></div>'; 
    });

    this.updateStats();
    if (window.App) window.App.saveToStorage();
  },

  createTaskCard(task) {
    const div = document.createElement('div');
    div.className = 'task-card';
    div.draggable = true;
    div.dataset.id = task.id;

    const priorityLabels = { high: 'Haute', medium: 'Moyenne', low: 'Basse' };
    const priorityClasses = { high: 'priority-high', medium: 'priority-medium', low: 'priority-low' };
    const tagsHtml = task.tags.map(tag => `<span class="tag">${window.App?.escapeHtml(tag) || tag}</span>`).join('');

    const today = new Date();
    const dueDate = task.date ? new Date(task.date) : null;
    let dateClass = ''; let dateIcon = '📅';
    if (dueDate) { 
      const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24)); 
      if (diffDays < 0) { dateClass = 'overdue'; dateIcon = '⚠️'; } 
      else if (diffDays <= 2) { dateClass = 'soon'; dateIcon = '⏰'; } 
    }

    const progress = task.progress || 0;
    const assigneesHtml = (task.assignees || []).map(aid => { 
      const member = this.MEMBERS.find(m => m.id === aid); 
      if (!member) return ''; 
      return `<div class="assignee" style="background:${member.color}" title="${member.name}">${member.initials}</div>`; 
    }).join('');

    div.innerHTML = `
      <div class="task-priority ${priorityClasses[task.priority]}">${priorityLabels[task.priority]}</div>
      <div class="task-title">${window.App?.escapeHtml(task.title) || task.title}</div>
      ${task.desc ? `<div class="task-desc">${window.App?.escapeHtml(task.desc) || task.desc}</div>` : ''}
      <div class="task-meta">
        <div class="task-tags">${tagsHtml}</div>
        <div class="task-date ${dateClass}">${dateIcon} ${window.App?.formatDate(task.date) || task.date}</div>
      </div>
      ${assigneesHtml ? `<div class="task-assignees">${assigneesHtml}</div>` : ''}
      ${progress > 0 ? `<div class="task-progress"><div class="task-progress-bar" style="width:${progress}%"></div></div>` : ''}
      <div class="task-actions">
        <button class="task-btn" onclick="Kanban.editTask('${task.id}')" title="Modifier">✎</button>
        <button class="task-btn" onclick="Kanban.deleteTask('${task.id}')" title="Supprimer">🗑</button>
      </div>
    `;

    div.addEventListener('dragstart', (e) => this.handleDragStart(e, div));
    div.addEventListener('dragend', (e) => this.handleDragEnd(e, div));
    return div;
  },

  updateStats() {
    const counts = { todo: 0, progress: 0, done: 0 };
    this.tasks.forEach(t => counts[t.status]++);
    const badgeTodo = document.getElementById('badge-todo');
    const badgeProgress = document.getElementById('badge-progress');
    const badgeDone = document.getElementById('badge-done');
    if (badgeTodo) badgeTodo.textContent = counts.todo;
    if (badgeProgress) badgeProgress.textContent = counts.progress;
    if (badgeDone) badgeDone.textContent = counts.done;
  },

  // ===== DRAG & DROP =====
  setupDragAndDrop() {
    document.querySelectorAll('.kanban-column').forEach(col => {
      col.addEventListener('dragover', (e) => this.handleDragOver(e, col));
      col.addEventListener('dragleave', (e) => this.handleDragLeave(e, col));
      col.addEventListener('drop', (e) => this.handleDrop(e, col));
    });
  },

  handleDragStart(e, el) { 
    this.draggedTask = el; 
    el.classList.add('dragging'); 
    e.dataTransfer.effectAllowed = 'move'; 
  },

  handleDragEnd(e, el) { 
    el.classList.remove('dragging'); 
    this.draggedTask = null; 
    document.querySelectorAll('.kanban-column').forEach(col => col.classList.remove('drag-over')); 
  },

  handleDragOver(e, col) { e.preventDefault(); col.classList.add('drag-over'); },
  handleDragLeave(e, col) { col.classList.remove('drag-over'); },

  handleDrop(e, col) {
    e.preventDefault();
    col.classList.remove('drag-over');
    if (!this.draggedTask) return;
    const taskId = this.draggedTask.dataset.id;
    const newStatus = col.dataset.status;
    const task = this.tasks.find(t => t.id === taskId);
    if (task && task.status !== newStatus) {
      task.status = newStatus;
      if (newStatus === 'done') task.progress = 100;
      if (newStatus === 'todo') task.progress = 0;
      this.render();
      if (window.App) window.App.showToast('Tâche déplacée', 'success');
    }
  },

  // ===== MODAL =====
  openTaskModal(taskId = null) {
    const modal = document.getElementById('task-modal');
    const title = document.getElementById('modal-title');
    this.selectedAssignees.clear();

    const selector = document.getElementById('assignee-selector');
    if (selector) {
      selector.innerHTML = '';
      this.MEMBERS.forEach(m => {
        const div = document.createElement('div');
        div.className = 'assignee-option';
        div.style.background = m.color;
        div.textContent = m.initials;
        div.title = m.name;
        div.onclick = () => { 
          div.classList.toggle('selected'); 
          if (this.selectedAssignees.has(m.id)) this.selectedAssignees.delete(m.id); 
          else this.selectedAssignees.add(m.id); 
        };
        selector.appendChild(div);
      });
    }

    if (taskId) {
      const task = this.tasks.find(t => t.id === taskId);
      if (!task) return;
      title.textContent = 'Modifier la tâche';
      document.getElementById('task-id').value = task.id;
      document.getElementById('task-title').value = task.title;
      document.getElementById('task-desc').value = task.desc || '';
      document.getElementById('task-priority').value = task.priority;
      document.getElementById('task-status').value = task.status;
      document.getElementById('task-progress').value = task.progress || 0;
      document.getElementById('progress-val').textContent = (task.progress || 0) + '%';
      document.getElementById('task-tags').value = task.tags.join(', ');
      document.getElementById('task-date').value = task.date;
      (task.assignees || []).forEach(aid => { 
        this.selectedAssignees.add(aid); 
        const member = this.MEMBERS.find(m => m.id === aid); 
        if (member && selector) { 
          const opt = Array.from(selector.children).find(el => el.title === member.name); 
          if (opt) opt.classList.add('selected'); 
        } 
      });
    } else {
      title.textContent = 'Nouvelle tâche';
      document.getElementById('task-form').reset();
      document.getElementById('task-id').value = '';
      document.getElementById('task-date').value = new Date().toISOString().split('T')[0];
      document.getElementById('progress-val').textContent = '0%';
    }
    modal.classList.add('active');
  },

  closeTaskModal() { 
    document.getElementById('task-modal').classList.remove('active'); 
  },

  saveTask(e) {
    e.preventDefault();
    const id = document.getElementById('task-id').value;
    const title = document.getElementById('task-title').value;
    const desc = document.getElementById('task-desc').value;
    const priority = document.getElementById('task-priority').value;
    const status = document.getElementById('task-status').value;
    const progress = parseInt(document.getElementById('task-progress').value);
    const tags = document.getElementById('task-tags').value.split(',').map(t => t.trim()).filter(t => t);
    const date = document.getElementById('task-date').value;

    if (id) {
      const task = this.tasks.find(t => t.id === id);
      if (task) Object.assign(task, { title, desc, priority, status, progress, tags, date, assignees: [...this.selectedAssignees] });
    } else {
      this.tasks.push({ 
        id: Date.now().toString(), 
        title, 
        desc, 
        priority, 
        status, 
        progress, 
        tags, 
        date, 
        assignees: [...this.selectedAssignees] 
      });
    }
    this.closeTaskModal();
    this.render();
    if (window.App) {
      window.App.updateHomeStats();
      window.App.showToast(id ? 'Tâche mise à jour' : 'Tâche créée', 'success');
    }
  },

  editTask(id) { this.openTaskModal(id); },

  deleteTask(id) {
    if (confirm('Supprimer cette tâche ?')) {
      this.tasks = this.tasks.filter(t => t.id !== id);
      this.render();
      if (window.App) {
        window.App.updateHomeStats();
        window.App.showToast('Tâche supprimée', 'info');
      }
    }
  },

  // ===== FILTERS =====
  filter() { this.render(); },

  setFilter(filter, btn) {
    this.currentFilter = filter;
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    this.render();
  },

  // ===== DATA =====
  MEMBERS: [
    {id:'JD',name:'Jean Dupont',color:'#818cf8',initials:'JD'},
    {id:'AL',name:'Alice Lefebvre',color:'#34d399',initials:'AL'},
    {id:'MK',name:'Marie Klein',color:'#f472b6',initials:'MK'},
    {id:'TB',name:'Thomas Bernard',color:'#fb923c',initials:'TB'}
  ],
};

// Setup drag & drop after DOM ready
document.addEventListener('DOMContentLoaded', () => {
  Kanban.setupDragAndDrop();
});
