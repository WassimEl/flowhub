// ===== TRIP PLANNER MODULE =====
export const TripPlanner = {
  trips: [],
  currentTrip: null,

  render(container) {
    if (!container) return;
    container.innerHTML = `
      <div class="tool-panel">
        <div class="tool-panel-header">
          <div class="icon">✈️</div>
          <h3>Trip Planner</h3>
          <p>Planifie tes voyages avec itineraire, budget, checklist et compte a rebours.</p>
        </div>
        <div class="trip-toolbar">
          <button class="btn btn-primary" onclick="TripPlanner.newTrip()">+ Nouveau voyage</button>
          <button class="btn" onclick="TripPlanner.loadExample()">📋 Exemple</button>
        </div>
        <div class="trip-list" id="trip-list"></div>
        <div class="trip-detail" id="trip-detail" style="display:none;">
          <div class="trip-header">
            <h3 id="trip-detail-name"></h3>
            <div class="trip-countdown" id="trip-countdown"></div>
          </div>
          <div class="trip-tabs">
            <button class="tool-tab active" onclick="TripPlanner.showTab('itinerary')" data-tab="itinerary">🗺 Itineraire</button>
            <button class="tool-tab" onclick="TripPlanner.showTab('budget')" data-tab="budget">💰 Budget</button>
            <button class="tool-tab" onclick="TripPlanner.showTab('checklist')" data-tab="checklist">✅ Checklist</button>
          </div>
          <div class="trip-tab-content active" id="trip-tab-itinerary">
            <div class="trip-itinerary" id="trip-itinerary"></div>
            <button class="btn" onclick="TripPlanner.addStep()" style="width:100%;margin-top:12px;">+ Ajouter une etape</button>
          </div>
          <div class="trip-tab-content" id="trip-tab-budget">
            <div class="trip-budget" id="trip-budget"></div>
            <button class="btn" onclick="TripPlanner.addExpense()" style="width:100%;margin-top:12px;">+ Ajouter une depense</button>
          </div>
          <div class="trip-tab-content" id="trip-tab-checklist">
            <div class="trip-checklist" id="trip-checklist"></div>
            <button class="btn" onclick="TripPlanner.addCheckItem()" style="width:100%;margin-top:12px;">+ Ajouter un item</button>
          </div>
          <div class="trip-actions">
            <button class="btn btn-primary" onclick="TripPlanner.exportPDF()">📄 Export PDF</button>
            <button class="btn btn-danger" onclick="TripPlanner.deleteTrip()">🗑 Supprimer</button>
          </div>
        </div>
      </div>
    `;
    this.loadFromStorage();
    this.renderTripList();
  },

  newTrip() {
    const name = prompt('Nom du voyage:') || 'Nouveau voyage';
    const destination = prompt('Destination:') || 'Destination';
    const startDate = prompt('Date de depart (YYYY-MM-DD):') || new Date().toISOString().split('T')[0];
    const endDate = prompt('Date de retour (YYYY-MM-DD):') || startDate;

    const trip = {
      id: Date.now().toString(),
      name,
      destination,
      startDate,
      endDate,
      steps: [],
      budget: { total: 0, categories: {} },
      checklist: []
    };

    this.trips.push(trip);
    this.currentTrip = trip;
    this.saveToStorage();
    this.renderTripList();
    this.renderTripDetail();
    if (window.App) window.App.showToast('Voyage cree', 'success');
  },

  loadExample() {
    const trip = {
      id: 'example-' + Date.now(),
      name: 'Week-end a Amsterdam',
      destination: 'Amsterdam, Pays-Bas',
      startDate: '2026-06-15',
      endDate: '2026-06-17',
      steps: [
        { day: 1, title: 'Arrivee & Check-in', description: 'Vol AF1234, check-in hotel Centrum' },
        { day: 1, title: 'Visite du centre', description: 'Dam Square, Royal Palace' },
        { day: 2, title: 'Musee Van Gogh', description: 'Reservation 10h' },
        { day: 2, title: 'Croisiere canaux', description: 'Depart 15h, quai Prinsengracht' },
        { day: 3, title: 'Marche aux puces', description: 'Waterlooplein' },
        { day: 3, title: 'Depart', description: 'Vol retour AF1235' }
      ],
      budget: {
        total: 850,
        categories: {
          'Transport': { planned: 300, actual: 320 },
          'Logement': { planned: 250, actual: 250 },
          'Nourriture': { planned: 150, actual: 180 },
          'Activites': { planned: 100, actual: 100 },
          'Autres': { planned: 50, actual: 0 }
        }
      },
      checklist: [
        { item: 'Passeport / CNI', done: true },
        { item: 'Billets avion', done: true },
        { item: 'Reservation hotel', done: true },
        { item: 'Assurance voyage', done: false },
        { item: 'Adaptateur prise', done: false },
        { item: 'Chargeur telephone', done: false },
        { item: 'Medicaments', done: false },
        { item: 'Appareil photo', done: false }
      ]
    };

    this.trips.push(trip);
    this.currentTrip = trip;
    this.saveToStorage();
    this.renderTripList();
    this.renderTripDetail();
    if (window.App) window.App.showToast('Exemple charge', 'success');
  },

  renderTripList() {
    const list = document.getElementById('trip-list');
    if (!list) return;

    if (this.trips.length === 0) {
      list.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);">Aucun voyage planifie. Cree ton premier voyage !</div>';
      return;
    }

    list.innerHTML = this.trips.map(t => {
      const daysLeft = Math.ceil((new Date(t.startDate) - new Date()) / 86400000);
      return `
        <div class="trip-card ${this.currentTrip?.id === t.id ? 'active' : ''}" onclick="TripPlanner.selectTrip('${t.id}')">
          <div class="trip-card-destination">${t.destination}</div>
          <div class="trip-card-name">${t.name}</div>
          <div class="trip-card-dates">${new Date(t.startDate).toLocaleDateString('fr-FR')} → ${new Date(t.endDate).toLocaleDateString('fr-FR')}</div>
          <div class="trip-card-countdown">${daysLeft > 0 ? '⏰ ' + daysLeft + ' jours' : daysLeft === 0 ? '🎉 C\'est aujourd\'hui !' : '✅ Termine'}</div>
        </div>
      `;
    }).join('');
  },

  selectTrip(id) {
    this.currentTrip = this.trips.find(t => t.id === id);
    this.renderTripList();
    this.renderTripDetail();
  },

  renderTripDetail() {
    const detail = document.getElementById('trip-detail');
    if (!detail || !this.currentTrip) return;

    detail.style.display = 'block';
    document.getElementById('trip-detail-name').textContent = this.currentTrip.name;

    // Countdown
    const daysLeft = Math.ceil((new Date(this.currentTrip.startDate) - new Date()) / 86400000);
    document.getElementById('trip-countdown').textContent = daysLeft > 0 ? `Dans ${daysLeft} jours` : daysLeft === 0 ? 'C\'est aujourd\'hui ! 🎉' : 'Voyage termine';

    this.renderItinerary();
    this.renderBudget();
    this.renderChecklist();
  },

  renderItinerary() {
    const container = document.getElementById('trip-itinerary');
    if (!container || !this.currentTrip) return;

    if (this.currentTrip.steps.length === 0) {
      container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-muted);">Aucune etape definie</div>';
      return;
    }

    container.innerHTML = this.currentTrip.steps.map((s, i) => `
      <div class="trip-step">
        <div class="trip-step-day">Jour ${s.day}</div>
        <div class="trip-step-content">
          <div class="trip-step-title">${s.title}</div>
          <div class="trip-step-desc">${s.description}</div>
        </div>
        <button class="btn btn-icon" onclick="TripPlanner.removeStep(${i})">🗑</button>
      </div>
    `).join('');
  },

  renderBudget() {
    const container = document.getElementById('trip-budget');
    if (!container || !this.currentTrip) return;

    const budget = this.currentTrip.budget;
    const categories = Object.entries(budget.categories || {});
    const totalPlanned = categories.reduce((s, [,v]) => s + (v.planned || 0), 0);
    const totalActual = categories.reduce((s, [,v]) => s + (v.actual || 0), 0);

    container.innerHTML = `
      <div class="trip-budget-summary">
        <div class="trip-budget-stat">
          <div class="trip-budget-value">${totalPlanned.toFixed(0)} €</div>
          <div class="trip-budget-label">Prevu</div>
        </div>
        <div class="trip-budget-stat">
          <div class="trip-budget-value" style="color:${totalActual > totalPlanned ? 'var(--red)' : 'var(--green)'}">${totalActual.toFixed(0)} €</div>
          <div class="trip-budget-label">Depense</div>
        </div>
        <div class="trip-budget-stat">
          <div class="trip-budget-value">${(totalPlanned - totalActual).toFixed(0)} €</div>
          <div class="trip-budget-label">Restant</div>
        </div>
      </div>
      <div class="trip-budget-categories">
        ${categories.map(([cat, val]) => `
          <div class="trip-budget-cat">
            <div class="trip-budget-cat-name">${cat}</div>
            <div class="trip-budget-cat-bar">
              <div class="trip-budget-cat-fill" style="width:${Math.min((val.actual / val.planned) * 100, 100)}%;background:${val.actual > val.planned ? 'var(--red)' : 'var(--green)'}"></div>
            </div>
            <div class="trip-budget-cat-amount">${val.actual} / ${val.planned} €</div>
          </div>
        `).join('')}
      </div>
    `;
  },

  renderChecklist() {
    const container = document.getElementById('trip-checklist');
    if (!container || !this.currentTrip) return;

    if (this.currentTrip.checklist.length === 0) {
      container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-muted);">Checklist vide</div>';
      return;
    }

    const done = this.currentTrip.checklist.filter(c => c.done).length;
    const total = this.currentTrip.checklist.length;

    container.innerHTML = `
      <div class="trip-check-progress">${done}/${total} items (${Math.round((done/total)*100)}%)</div>
      <div class="trip-check-items">
        ${this.currentTrip.checklist.map((c, i) => `
          <div class="trip-check-item ${c.done ? 'done' : ''}" onclick="TripPlanner.toggleCheck(${i})">
            <span class="trip-check-box">${c.done ? '✅' : '⬜'}</span>
            <span class="trip-check-text">${c.item}</span>
          </div>
        `).join('')}
      </div>
    `;
  },

  addStep() {
    if (!this.currentTrip) return;
    const day = parseInt(prompt('Jour numero:')) || 1;
    const title = prompt('Titre de l\'etape:') || 'Nouvelle etape';
    const description = prompt('Description:') || '';
    this.currentTrip.steps.push({ day, title, description });
    this.saveToStorage();
    this.renderItinerary();
  },

  removeStep(index) {
    if (!this.currentTrip) return;
    this.currentTrip.steps.splice(index, 1);
    this.saveToStorage();
    this.renderItinerary();
  },

  addExpense() {
    if (!this.currentTrip) return;
    const category = prompt('Categorie (Transport, Logement, Nourriture, Activites, Autres):') || 'Autres';
    const planned = parseFloat(prompt('Budget prevu (€):')) || 0;
    const actual = parseFloat(prompt('Depense actuelle (€):')) || 0;

    if (!this.currentTrip.budget.categories[category]) {
      this.currentTrip.budget.categories[category] = { planned: 0, actual: 0 };
    }
    this.currentTrip.budget.categories[category].planned += planned;
    this.currentTrip.budget.categories[category].actual += actual;
    this.saveToStorage();
    this.renderBudget();
  },

  addCheckItem() {
    if (!this.currentTrip) return;
    const item = prompt('Item a ajouter:') || 'Nouvel item';
    this.currentTrip.checklist.push({ item, done: false });
    this.saveToStorage();
    this.renderChecklist();
  },

  toggleCheck(index) {
    if (!this.currentTrip) return;
    this.currentTrip.checklist[index].done = !this.currentTrip.checklist[index].done;
    this.saveToStorage();
    this.renderChecklist();
  },

  showTab(tab) {
    document.querySelectorAll('.trip-tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.trip-tabs .tool-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('trip-tab-' + tab)?.classList.add('active');
    document.querySelector(`.trip-tabs [data-tab="${tab}"]`)?.classList.add('active');
  },

  exportPDF() {
    if (!this.currentTrip) return;
    const t = this.currentTrip;

    let content = `
      <html><head><style>
        body { font-family: Arial, sans-serif; background: #fff; color: #333; padding: 40px; }
        h1 { color: #818cf8; }
        .meta { margin-bottom: 30px; }
        .section { margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f5f5f5; }
      </style></head><body>
      <h1>✈️ ${t.name}</h1>
      <div class="meta">
        <p><strong>Destination:</strong> ${t.destination}</p>
        <p><strong>Dates:</strong> ${t.startDate} → ${t.endDate}</p>
      </div>
      <div class="section">
        <h2>🗺 Itineraire</h2>
        <table><tr><th>Jour</th><th>Activite</th><th>Details</th></tr>
        ${t.steps.map(s => `<tr><td>Jour ${s.day}</td><td>${s.title}</td><td>${s.description}</td></tr>`).join('')}
        </table>
      </div>
      <div class="section">
        <h2>✅ Checklist</h2>
        <ul>${t.checklist.map(c => `<li>${c.done ? '✅' : '⬜'} ${c.item}</li>`).join('')}</ul>
      </div>
      </body></html>
    `;

    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trip-${t.name.replace(/\s+/g, '-').toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
    if (window.App) window.App.showToast('Itineraire exporte', 'success');
  },

  deleteTrip() {
    if (!this.currentTrip || !confirm('Supprimer ce voyage ?')) return;
    this.trips = this.trips.filter(t => t.id !== this.currentTrip.id);
    this.currentTrip = null;
    this.saveToStorage();
    document.getElementById('trip-detail').style.display = 'none';
    this.renderTripList();
  },

  saveToStorage() {
    const key = window.App?.getStorageKey('trips');
    if (key) localStorage.setItem(key, JSON.stringify({ trips: this.trips }));
  },

  loadFromStorage() {
    const key = window.App?.getStorageKey('trips');
    if (key) {
      const saved = localStorage.getItem(key);
      if (saved) {
        try { this.trips = JSON.parse(saved).trips || []; } catch(e) { this.trips = []; }
      }
    }
  }
};
