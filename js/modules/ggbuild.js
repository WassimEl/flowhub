// ===== GGBUILD MODULE =====
export const GGBuild = {
  builds: [],
  currentBuild: null,
  margin: 15,

  MOCK_PARTS: [
    { category: 'CPU', name: 'AMD Ryzen 7 7800X3D', price: 449, specs: '8 cœurs / 16 threads, 4.2GHz' },
    { category: 'GPU', name: 'NVIDIA RTX 4070 Ti SUPER', price: 899, specs: '16 Go GDDR6X, DLSS 3.5' },
    { category: 'RAM', name: 'Corsair Vengeance RGB 32 Go', price: 129, specs: 'DDR5 6000MHz, CL30' },
    { category: 'SSD', name: 'Samsung 990 Pro 2 To', price: 179, specs: 'PCIe 4.0, 7450 Mo/s' },
    { category: 'Motherboard', name: 'MSI B650 Gaming Plus', price: 189, specs: 'AM5, PCIe 4.0, WiFi 6E' },
    { category: 'PSU', name: 'Corsair RM850x', price: 149, specs: '850W, 80+ Gold, modulaire' },
    { category: 'Case', name: 'NZXT H7 Flow RGB', price: 159, specs: 'Mid-tower, airflow optimise' },
    { category: 'Cooler', name: 'NZXT Kraken 360 RGB', price: 279, specs: 'AIO 360mm, ecran LCD' },
  ],

  render(container) {
    if (!container) return;
    container.innerHTML = `
      <div class="tool-panel">
        <div class="tool-panel-header">
          <div class="icon">🛠️</div>
          <h3>GGBuild — PC Part Picker</h3>
          <p>Cree des devis de montage PC stylises pour ta societe GGBuild.</p>
        </div>
        <div class="ggbuild-branding">
          <div class="ggbuild-logo">⚡ GGBuild</div>
          <div class="ggbuild-tagline">Montage PC sur mesure — Performance & Style</div>
        </div>
        <div class="ggbuild-toolbar">
          <button class="btn btn-primary" onclick="GGBuild.newBuild()">+ Nouveau devis</button>
          <button class="btn" onclick="GGBuild.loadExample()">📋 Exemple</button>
          <button class="btn" onclick="GGBuild.exportPDF()">📄 Export PDF</button>
        </div>
        <div class="ggbuild-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Nom du client</label>
              <input type="text" class="form-input" id="ggbuild-client" placeholder="Nom du client...">
            </div>
            <div class="form-group">
              <label class="form-label">Nom du build</label>
              <input type="text" class="form-input" id="ggbuild-name" placeholder="Ex: PC Gaming Ultimate">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Marge beneficiaire (%)</label>
            <input type="range" class="form-input" id="ggbuild-margin" min="0" max="50" value="15" oninput="document.getElementById('ggbuild-margin-val').textContent=this.value+'%';GGBuild.calculateTotal()">
            <span id="ggbuild-margin-val" style="color:var(--text-muted);font-size:12px;">15%</span>
          </div>
        </div>
        <div class="ggbuild-parts">
          <h4 style="font-family:'Space Grotesk',sans-serif;margin-bottom:12px;">🧩 Composants</h4>
          <div class="ggbuild-parts-list" id="ggbuild-parts-list"></div>
          <button class="btn" onclick="GGBuild.addPart()" style="width:100%;margin-top:12px;">+ Ajouter un composant</button>
        </div>
        <div class="ggbuild-total">
          <div class="ggbuild-total-row">
            <span>Total composants (HT)</span>
            <span id="ggbuild-subtotal">0.00 €</span>
          </div>
          <div class="ggbuild-total-row">
            <span>Marge GGBuild</span>
            <span id="ggbuild-margin-amount">0.00 €</span>
          </div>
          <div class="ggbuild-total-row ggbuild-total-final">
            <span>Total TTC</span>
            <span id="ggbuild-total">0.00 €</span>
          </div>
        </div>
        <div class="ggbuild-history">
          <h4 style="font-family:'Space Grotesk',sans-serif;margin-bottom:12px;">🕐 Historique des devis</h4>
          <div class="ggbuild-history-list" id="ggbuild-history"></div>
        </div>
      </div>
    `;
    this.loadFromStorage();
    this.currentBuild = { parts: [], client: '', name: '', margin: 15 };
    this.renderParts();
    this.renderHistory();
  },

  newBuild() {
    this.currentBuild = { parts: [], client: '', name: '', margin: 15 };
    document.getElementById('ggbuild-client').value = '';
    document.getElementById('ggbuild-name').value = '';
    document.getElementById('ggbuild-margin').value = 15;
    document.getElementById('ggbuild-margin-val').textContent = '15%';
    this.renderParts();
    this.calculateTotal();
  },

  loadExample() {
    document.getElementById('ggbuild-client').value = 'Jean Dupont';
    document.getElementById('ggbuild-name').value = 'PC Gaming RTX 4070 Ti';
    this.currentBuild = {
      parts: [...this.MOCK_PARTS.map((p, i) => ({ ...p, id: 'part-' + i }))],
      client: 'Jean Dupont',
      name: 'PC Gaming RTX 4070 Ti',
      margin: 15
    };
    this.renderParts();
    this.calculateTotal();
    if (window.App) window.App.showToast('Exemple charge', 'success');
  },

  addPart() {
    const categories = ['CPU', 'GPU', 'RAM', 'SSD', 'Motherboard', 'PSU', 'Case', 'Cooler', 'Fans', 'OS', 'Autre'];
    const category = prompt('Categorie (' + categories.join(', ') + '):') || 'Autre';
    const name = prompt('Nom du composant:') || 'Nouveau composant';
    const price = parseFloat(prompt('Prix (€):')) || 0;
    const specs = prompt('Specifications:') || '';

    this.currentBuild.parts.push({
      id: Date.now().toString(),
      category,
      name,
      price,
      specs
    });
    this.renderParts();
    this.calculateTotal();
  },

  removePart(id) {
    this.currentBuild.parts = this.currentBuild.parts.filter(p => p.id !== id);
    this.renderParts();
    this.calculateTotal();
  },

  renderParts() {
    const list = document.getElementById('ggbuild-parts-list');
    if (!list) return;

    if (this.currentBuild.parts.length === 0) {
      list.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-muted);">Aucun composant. Ajoute-en un !</div>';
      return;
    }

    list.innerHTML = this.currentBuild.parts.map(p => `
      <div class="ggbuild-part-row">
        <div class="ggbuild-part-info">
          <span class="ggbuild-part-cat">${p.category}</span>
          <span class="ggbuild-part-name">${p.name}</span>
          <span class="ggbuild-part-specs">${p.specs}</span>
        </div>
        <div class="ggbuild-part-price">${p.price.toFixed(2)} €</div>
        <button class="btn btn-icon" onclick="GGBuild.removePart('${p.id}')">🗑</button>
      </div>
    `).join('');
  },

  calculateTotal() {
    const margin = parseInt(document.getElementById('ggbuild-margin')?.value) || 15;
    const subtotal = this.currentBuild.parts.reduce((sum, p) => sum + p.price, 0);
    const marginAmount = subtotal * (margin / 100);
    const total = subtotal + marginAmount;

    document.getElementById('ggbuild-subtotal').textContent = subtotal.toFixed(2) + ' €';
    document.getElementById('ggbuild-margin-amount').textContent = marginAmount.toFixed(2) + ' € (' + margin + '%)';
    document.getElementById('ggbuild-total').textContent = total.toFixed(2) + ' €';
  },

  exportPDF() {
    const client = document.getElementById('ggbuild-client').value || 'Client';
    const name = document.getElementById('ggbuild-name').value || 'Build';
    const margin = parseInt(document.getElementById('ggbuild-margin')?.value) || 15;

    let content = `
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #0a0b14; color: #e8e9f0; padding: 40px; }
          .header { text-align: center; margin-bottom: 40px; }
          .logo { font-size: 32px; font-weight: bold; color: #818cf8; }
          .tagline { color: #8b8da3; margin-top: 8px; }
          .info { margin-bottom: 30px; }
          .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #1a1b2e; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { text-align: left; padding: 12px; background: #1a1b2e; color: #818cf8; }
          td { padding: 12px; border-bottom: 1px solid #1a1b2e; }
          .total { text-align: right; margin-top: 30px; font-size: 24px; color: #34d399; }
          .footer { text-align: center; margin-top: 40px; color: #4a4d6a; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">⚡ GGBuild</div>
          <div class="tagline">Montage PC sur mesure — Performance & Style</div>
        </div>
        <div class="info">
          <div class="info-row"><span>Devis pour:</span> <strong>${client}</strong></div>
          <div class="info-row"><span>Configuration:</span> <strong>${name}</strong></div>
          <div class="info-row"><span>Date:</span> <strong>${new Date().toLocaleDateString('fr-FR')}</strong></div>
        </div>
        <table>
          <tr><th>Categorie</th><th>Composant</th><th>Specifications</th><th style="text-align:right">Prix</th></tr>
          ${this.currentBuild.parts.map(p => `<tr><td>${p.category}</td><td>${p.name}</td><td>${p.specs}</td><td style="text-align:right">${p.price.toFixed(2)} €</td></tr>`).join('')}
        </table>
        <div class="total">
          Total TTC: ${document.getElementById('ggbuild-total')?.textContent || '0.00 €'}
        </div>
        <div class="footer">
          GGBuild — Devis genere le ${new Date().toLocaleDateString('fr-FR')}<br>
          Ce devis est valable 30 jours.
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ggbuild-devis-${client.replace(/\s+/g, '-').toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);

    // Save to history
    this.builds.push({
      id: Date.now().toString(),
      client,
      name,
      parts: [...this.currentBuild.parts],
      total: parseFloat(document.getElementById('ggbuild-total')?.textContent) || 0,
      date: new Date().toISOString()
    });
    this.saveToStorage();
    this.renderHistory();

    if (window.App) window.App.showToast('Devis exporte', 'success');
  },

  renderHistory() {
    const list = document.getElementById('ggbuild-history');
    if (!list) return;

    if (this.builds.length === 0) {
      list.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-muted);font-size:13px;">Aucun devis cree</div>';
      return;
    }

    list.innerHTML = this.builds.slice(0, 10).map(b => `
      <div class="ggbuild-history-item">
        <div class="ggbuild-history-info">
          <div class="ggbuild-history-name">${b.name}</div>
          <div class="ggbuild-history-client">${b.client} — ${new Date(b.date).toLocaleDateString('fr-FR')}</div>
        </div>
        <div class="ggbuild-history-total">${b.total.toFixed(2)} €</div>
      </div>
    `).join('');
  },

  saveToStorage() {
    const key = window.App?.getStorageKey('ggbuild');
    if (key) localStorage.setItem(key, JSON.stringify({ builds: this.builds }));
  },

  loadFromStorage() {
    const key = window.App?.getStorageKey('ggbuild');
    if (key) {
      const saved = localStorage.getItem(key);
      if (saved) {
        try { this.builds = JSON.parse(saved).builds || []; } catch(e) { this.builds = []; }
      }
    }
  }
};
