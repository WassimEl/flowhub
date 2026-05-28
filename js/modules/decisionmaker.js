// ===== DECISION MAKER MODULE =====
export const DecisionMaker = {
  options: [],
  isSpinning: false,
  rotation: 0,
  history: [],
  currentMode: 'wheel',

  TEMPLATES: {
    game: { name: '🎮 Choix de jeu', options: ['Elden Ring', 'Baldur\'s Gate 3', 'Helldivers 2', 'Lies of P', 'Cyberpunk 2077', 'Spider-Man 2'] },
    movie: { name: '🎬 Choix de film', options: ['Dune 2', 'Oppenheimer', 'Barbie', 'Poor Things', 'Spider-Verse', 'The Zone of Interest'] },
    food: { name: '🍕 Choix de restaurant', options: ['Pizza', 'Sushi', 'Burger', 'Tacos', 'Pates', 'Salade', 'Kebab', 'Indien'] },
    project: { name: '💻 Choix de projet', options: ['Nouveau site web', 'App mobile', 'Script Python', 'Design UI', 'Blog', 'Portfolio'] },
    yesno: { name: '👍 Pile ou Face', options: ['Oui', 'Non'] },
  },

  render(container) {
    if (!container) return;
    container.innerHTML = `
      <div class="tool-panel">
        <div class="tool-panel-header">
          <div class="icon">🎯</div>
          <h3>Decision Maker</h3>
          <p>Roue de la fortune, tirages ponderes et mode Pile ou Face elabore.</p>
        </div>
        <div class="decision-modes">
          <button class="btn ${this.currentMode === 'wheel' ? 'active' : ''}" onclick="DecisionMaker.setMode('wheel')">🎡 Roue</button>
          <button class="btn ${this.currentMode === 'weighted' ? 'active' : ''}" onclick="DecisionMaker.setMode('weighted')">⚖️ Pondere</button>
          <button class="btn ${this.currentMode === 'procon' ? 'active' : ''}" onclick="DecisionMaker.setMode('procon')">📊 Pro/Con</button>
        </div>
        <div class="decision-templates">
          <span class="form-label" style="margin-right:8px;">Templates:</span>
          ${Object.entries(this.TEMPLATES).map(([k, t]) => `<button class="filter-chip" onclick="DecisionMaker.loadTemplate('${k}')">${t.name}</button>`).join('')}
        </div>
        <div class="decision-options-section">
          <h4 style="font-family:'Space Grotesk',sans-serif;margin-bottom:12px;">📝 Options</h4>
          <div class="decision-options-list" id="decision-options"></div>
          <div class="decision-add-option">
            <input type="text" class="form-input" id="decision-new-option" placeholder="Ajouter une option..." onkeydown="if(event.key==='Enter')DecisionMaker.addOption()">
            <input type="number" class="form-input" id="decision-new-weight" placeholder="Poids" value="1" min="1" style="width:80px;display:${this.currentMode === 'weighted' ? 'block' : 'none'}" id="decision-weight-input">
            <button class="btn btn-primary" onclick="DecisionMaker.addOption()">+ Ajouter</button>
          </div>
        </div>
        <div class="decision-wheel-section" id="decision-wheel-section">
          <canvas id="decision-wheel" width="400" height="400" class="decision-wheel"></canvas>
          <div class="decision-pointer">▼</div>
          <button class="btn btn-primary decision-spin-btn" onclick="DecisionMaker.spin()" id="decision-spin-btn">🎲 Tourner la roue</button>
        </div>
        <div class="decision-result" id="decision-result" style="display:none;">
          <div class="decision-result-text" id="decision-result-text"></div>
        </div>
        <div class="decision-history">
          <h4 style="font-family:'Space Grotesk',sans-serif;margin-bottom:12px;">🕐 Historique</h4>
          <div class="decision-history-list" id="decision-history"></div>
        </div>
      </div>
    `;
    this.loadFromStorage();
    this.renderOptions();
    this.renderHistory();
    if (this.options.length > 0) this.drawWheel();
  },

  setMode(mode) {
    this.currentMode = mode;
    document.querySelectorAll('.decision-modes .btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById('decision-weight-input').style.display = mode === 'weighted' ? 'block' : 'none';
  },

  loadTemplate(templateId) {
    const template = this.TEMPLATES[templateId];
    if (!template) return;
    this.options = template.options.map((o, i) => ({ id: 'opt-' + i, text: o, weight: 1 }));
    this.renderOptions();
    this.drawWheel();
    if (window.App) window.App.showToast('Template charge : ' + template.name, 'success');
  },

  renderOptions() {
    const list = document.getElementById('decision-options');
    if (!list) return;

    if (this.options.length === 0) {
      list.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-muted);">Ajoute des options pour commencer</div>';
      return;
    }

    list.innerHTML = this.options.map((o, i) => `
      <div class="decision-option-item">
        <span class="decision-option-color" style="background:${this.getColor(i)}"></span>
        <span class="decision-option-text">${o.text}</span>
        ${this.currentMode === 'weighted' ? `<span class="decision-option-weight">x${o.weight}</span>` : ''}
        <button class="btn btn-icon" onclick="DecisionMaker.removeOption('${o.id}')">🗑</button>
      </div>
    `).join('');
  },

  addOption() {
    const input = document.getElementById('decision-new-option');
    const weightInput = document.getElementById('decision-new-weight');
    const text = input.value.trim();
    if (!text) return;

    this.options.push({
      id: Date.now().toString(),
      text,
      weight: parseInt(weightInput?.value) || 1
    });
    input.value = '';
    this.saveToStorage();
    this.renderOptions();
    this.drawWheel();
  },

  removeOption(id) {
    this.options = this.options.filter(o => o.id !== id);
    this.saveToStorage();
    this.renderOptions();
    this.drawWheel();
  },

  getColor(index) {
    const colors = ['#818cf8', '#34d399', '#fbbf24', '#f87171', '#c084fc', '#2dd4bf', '#fb923c', '#f472b6', '#60a5fa', '#a78bfa'];
    return colors[index % colors.length];
  },

  drawWheel() {
    const canvas = document.getElementById('decision-wheel');
    if (!canvas || this.options.length === 0) return;
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 180;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const totalWeight = this.options.reduce((s, o) => s + o.weight, 0);
    let currentAngle = -Math.PI / 2 + (this.rotation * Math.PI / 180);

    this.options.forEach((o, i) => {
      const sliceAngle = (o.weight / totalWeight) * Math.PI * 2;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = this.getColor(i) + '40';
      ctx.fill();
      ctx.strokeStyle = this.getColor(i);
      ctx.lineWidth = 2;
      ctx.stroke();

      // Text
      const textAngle = currentAngle + sliceAngle / 2;
      const textX = centerX + Math.cos(textAngle) * (radius * 0.65);
      const textY = centerY + Math.sin(textAngle) * (radius * 0.65);
      ctx.fillStyle = '#e8e9f0';
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(o.text.substring(0, 12), textX, textY);

      currentAngle += sliceAngle;
    });

    // Center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1b2e';
    ctx.fill();
    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 3;
    ctx.stroke();
  },

  spin() {
    if (this.isSpinning || this.options.length === 0) return;
    this.isSpinning = true;
    document.getElementById('decision-spin-btn').disabled = true;
    document.getElementById('decision-result').style.display = 'none';

    const spins = 5 + Math.random() * 5;
    const finalRotation = this.rotation + spins * 360 + Math.random() * 360;
    const duration = 4000;
    const start = Date.now();
    const startRotation = this.rotation;

    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);

      this.rotation = startRotation + (finalRotation - startRotation) * easeOut;
      this.drawWheel();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.isSpinning = false;
        document.getElementById('decision-spin-btn').disabled = false;
        this.showResult();
      }
    };

    requestAnimationFrame(animate);
  },

  showResult() {
    const totalWeight = this.options.reduce((s, o) => s + o.weight, 0);
    const normalizedRotation = ((this.rotation % 360) + 360) % 360;
    const pointerAngle = (360 - normalizedRotation + 90) % 360;

    let currentAngle = 0;
    let winner = this.options[0];

    for (const o of this.options) {
      const sliceAngle = (o.weight / totalWeight) * 360;
      if (pointerAngle >= currentAngle && pointerAngle < currentAngle + sliceAngle) {
        winner = o;
        break;
      }
      currentAngle += sliceAngle;
    }

    this.history.unshift({ option: winner.text, date: new Date().toISOString() });
    if (this.history.length > 20) this.history.pop();
    this.saveToStorage();
    this.renderHistory();

    const result = document.getElementById('decision-result');
    const text = document.getElementById('decision-result-text');
    result.style.display = 'block';
    text.innerHTML = `🎉 <span style="color:var(--accent);font-size:28px;font-weight:700">${winner.text}</span>`;

    if (window.App) window.App.showToast('Resultat : ' + winner.text, 'success');
  },

  renderHistory() {
    const list = document.getElementById('decision-history');
    if (!list) return;

    if (this.history.length === 0) {
      list.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-muted);font-size:13px;">Aucun tirage enregistre</div>';
      return;
    }

    list.innerHTML = this.history.slice(0, 10).map(h => `
      <div class="decision-history-item">
        <span class="decision-history-result">${h.option}</span>
        <span class="decision-history-time">${new Date(h.date).toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'})}</span>
      </div>
    `).join('');
  },

  saveToStorage() {
    const key = window.App?.getStorageKey('decision');
    if (key) {
      localStorage.setItem(key, JSON.stringify({ options: this.options, history: this.history }));
    }
  },

  loadFromStorage() {
    const key = window.App?.getStorageKey('decision');
    if (key) {
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          this.options = data.options || [];
          this.history = data.history || [];
        } catch(e) {}
      }
    }
  }
};
