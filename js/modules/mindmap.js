// ===== MIND MAP MODULE =====
export const MindMap = {
  nodes: [],
  connections: [],
  selectedNode: null,
  isDragging: false,
  dragOffset: { x: 0, y: 0 },
  canvas: null,
  ctx: null,
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  colors: ['#818cf8', '#34d399', '#fbbf24', '#f87171', '#c084fc', '#2dd4bf', '#fb923c', '#f472b6'],

  render(container) {
    if (!container) return;
    container.innerHTML = `
      <div class="tool-panel" style="max-width:100%;padding:0;background:transparent;border:none;">
        <div class="mindmap-toolbar">
          <button class="btn btn-primary" onclick="MindMap.addNode()">+ Ajouter un noeud</button>
          <button class="btn" onclick="MindMap.connectNodes()">🔗 Connecter</button>
          <button class="btn" onclick="MindMap.deleteNode()">🗑 Supprimer</button>
          <button class="btn" onclick="MindMap.changeColor()">🎨 Couleur</button>
          <button class="btn" onclick="MindMap.clearAll()">🧹 Tout effacer</button>
          <button class="btn" onclick="MindMap.exportPNG()">💾 Export PNG</button>
          <button class="btn" onclick="MindMap.saveMap()">💾 Sauvegarder</button>
          <button class="btn" onclick="MindMap.loadMap()">📂 Charger</button>
        </div>
        <div class="mindmap-canvas-container">
          <canvas id="mindmap-canvas" class="mindmap-canvas"></canvas>
          <div class="mindmap-hint">Double-clique sur un noeud pour editer le texte. Glisse pour deplacer.</div>
        </div>
      </div>
    `;
    this.initCanvas();
    this.loadFromStorage();
    if (this.nodes.length === 0) {
      this.nodes.push({ id: 'root', x: 400, y: 300, text: 'Idee centrale', color: this.colors[0], width: 140, height: 40 });
    }
    this.draw();
  },

  initCanvas() {
    this.canvas = document.getElementById('mindmap-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    const container = this.canvas.parentElement;
    this.canvas.width = container.clientWidth;
    this.canvas.height = 600;

    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
    this.canvas.addEventListener('dblclick', (e) => this.handleDoubleClick(e));

    window.addEventListener('resize', () => {
      if (this.canvas) {
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.draw();
      }
    });
  },

  draw() {
    if (!this.ctx || !this.canvas) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw connections
    this.connections.forEach(conn => {
      const from = this.nodes.find(n => n.id === conn.from);
      const to = this.nodes.find(n => n.id === conn.to);
      if (from && to) {
        this.ctx.beginPath();
        this.ctx.moveTo(from.x, from.y);
        this.ctx.lineTo(to.x, to.y);
        this.ctx.strokeStyle = 'rgba(129,140,248,0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
      }
    });

    // Draw nodes
    this.nodes.forEach(node => {
      const isSelected = node.id === this.selectedNode;

      // Shadow
      this.ctx.shadowColor = node.color + '40';
      this.ctx.shadowBlur = isSelected ? 20 : 10;

      // Node background
      this.ctx.fillStyle = node.color + '20';
      this.ctx.strokeStyle = isSelected ? '#fff' : node.color;
      this.ctx.lineWidth = isSelected ? 3 : 2;

      this.ctx.beginPath();
      this.roundRect(node.x - node.width/2, node.y - node.height/2, node.width, node.height, 10);
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.shadowBlur = 0;

      // Text
      this.ctx.fillStyle = '#e8e9f0';
      this.ctx.font = '13px Inter, sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      const maxWidth = node.width - 20;
      const words = node.text.split(' ');
      let line = '';
      let y = node.y - ((words.length > 2 ? 1 : 0) * 8);

      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = this.ctx.measureText(testLine);
        if (metrics.width > maxWidth && i > 0) {
          this.ctx.fillText(line, node.x, y);
          line = words[i] + ' ';
          y += 16;
        } else {
          line = testLine;
        }
      }
      this.ctx.fillText(line, node.x, y);
    });
  },

  roundRect(x, y, w, h, r) {
    this.ctx.moveTo(x + r, y);
    this.ctx.lineTo(x + w - r, y);
    this.ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    this.ctx.lineTo(x + w, y + h - r);
    this.ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    this.ctx.lineTo(x + r, y + h);
    this.ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    this.ctx.lineTo(x, y + r);
    this.ctx.quadraticCurveTo(x, y, x + r, y);
    this.ctx.closePath();
  },

  getMousePos(e) {
    const rect = this.canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  },

  getNodeAt(pos) {
    return this.nodes.find(n => 
      pos.x >= n.x - n.width/2 && pos.x <= n.x + n.width/2 &&
      pos.y >= n.y - n.height/2 && pos.y <= n.y + n.height/2
    );
  },

  handleMouseDown(e) {
    const pos = this.getMousePos(e);
    const node = this.getNodeAt(pos);
    if (node) {
      this.selectedNode = node.id;
      this.isDragging = true;
      this.dragOffset = { x: pos.x - node.x, y: pos.y - node.y };
      this.draw();
    } else {
      this.selectedNode = null;
      this.draw();
    }
  },

  handleMouseMove(e) {
    if (!this.isDragging || !this.selectedNode) return;
    const pos = this.getMousePos(e);
    const node = this.nodes.find(n => n.id === this.selectedNode);
    if (node) {
      node.x = pos.x - this.dragOffset.x;
      node.y = pos.y - this.dragOffset.y;
      this.draw();
    }
  },

  handleMouseUp() {
    this.isDragging = false;
    if (this.selectedNode) this.saveToStorage();
  },

  handleDoubleClick(e) {
    const pos = this.getMousePos(e);
    const node = this.getNodeAt(pos);
    if (node) {
      const newText = prompt('Texte du noeud:', node.text);
      if (newText !== null) {
        node.text = newText;
        node.width = Math.max(140, Math.min(300, newText.length * 8 + 40));
        this.draw();
        this.saveToStorage();
      }
    }
  },

  addNode() {
    const parent = this.selectedNode ? this.nodes.find(n => n.id === this.selectedNode) : this.nodes[0];
    const angle = Math.random() * Math.PI * 2;
    const distance = 150;
    const newNode = {
      id: Date.now().toString(),
      x: (parent ? parent.x : 400) + Math.cos(angle) * distance,
      y: (parent ? parent.y : 300) + Math.sin(angle) * distance,
      text: 'Nouvelle idee',
      color: this.colors[Math.floor(Math.random() * this.colors.length)],
      width: 140,
      height: 40
    };
    this.nodes.push(newNode);
    if (parent) {
      this.connections.push({ from: parent.id, to: newNode.id });
    }
    this.selectedNode = newNode.id;
    this.draw();
    this.saveToStorage();
    if (window.App) window.App.showToast('Noeud ajoute', 'success');
  },

  connectNodes() {
    if (!this.selectedNode) {
      if (window.App) window.App.showToast('Selectionne un noeud d\'abord', 'error');
      return;
    }
    const targetId = prompt('ID du noeud cible (clique sur un noeud pour voir son ID dans la console):');
    if (targetId && targetId !== this.selectedNode) {
      const exists = this.connections.find(c => 
        (c.from === this.selectedNode && c.to === targetId) ||
        (c.from === targetId && c.to === this.selectedNode)
      );
      if (!exists) {
        this.connections.push({ from: this.selectedNode, to: targetId });
        this.draw();
        this.saveToStorage();
        if (window.App) window.App.showToast('Connexion creee', 'success');
      }
    }
  },

  deleteNode() {
    if (!this.selectedNode) {
      if (window.App) window.App.showToast('Selectionne un noeud a supprimer', 'error');
      return;
    }
    if (this.selectedNode === 'root') {
      if (window.App) window.App.showToast('Impossible de supprimer le noeud racine', 'error');
      return;
    }
    this.nodes = this.nodes.filter(n => n.id !== this.selectedNode);
    this.connections = this.connections.filter(c => c.from !== this.selectedNode && c.to !== this.selectedNode);
    this.selectedNode = null;
    this.draw();
    this.saveToStorage();
    if (window.App) window.App.showToast('Noeud supprime', 'info');
  },

  changeColor() {
    if (!this.selectedNode) {
      if (window.App) window.App.showToast('Selectionne un noeud', 'error');
      return;
    }
    const node = this.nodes.find(n => n.id === this.selectedNode);
    if (node) {
      const currentIndex = this.colors.indexOf(node.color);
      node.color = this.colors[(currentIndex + 1) % this.colors.length];
      this.draw();
      this.saveToStorage();
    }
  },

  clearAll() {
    if (!confirm('Tout effacer ?')) return;
    this.nodes = [{ id: 'root', x: 400, y: 300, text: 'Idee centrale', color: this.colors[0], width: 140, height: 40 }];
    this.connections = [];
    this.selectedNode = null;
    this.draw();
    this.saveToStorage();
  },

  exportPNG() {
    if (!this.canvas) return;
    const link = document.createElement('a');
    link.download = 'mindmap.png';
    link.href = this.canvas.toDataURL('image/png');
    link.click();
    if (window.App) window.App.showToast('Mind map exportee', 'success');
  },

  saveMap() {
    const data = JSON.stringify({ nodes: this.nodes, connections: this.connections });
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mindmap.json';
    a.click();
    URL.revokeObjectURL(url);
    if (window.App) window.App.showToast('Mind map sauvegardee', 'success');
  },

  loadMap() {
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
          if (data.nodes) this.nodes = data.nodes;
          if (data.connections) this.connections = data.connections;
          this.draw();
          this.saveToStorage();
          if (window.App) window.App.showToast('Mind map chargee', 'success');
        } catch(err) {
          if (window.App) window.App.showToast('Fichier invalide', 'error');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  },

  saveToStorage() {
    const key = window.App?.getStorageKey('mindmap');
    if (key) {
      localStorage.setItem(key, JSON.stringify({ nodes: this.nodes, connections: this.connections }));
    }
  },

  loadFromStorage() {
    const key = window.App?.getStorageKey('mindmap');
    if (key) {
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          this.nodes = data.nodes || [];
          this.connections = data.connections || [];
        } catch(e) {}
      }
    }
  }
};
