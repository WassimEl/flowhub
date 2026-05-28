// ===== MIND MAP MODULE =====
export const MindMap = {
  nodes: [],
  connections: [],
  selectedNode: null,
  isDragging: false,
  dragNode: null,
  dragOffset: { x: 0, y: 0 },
  scale: 1,
  panX: 0,
  panY: 0,
  nextId: 1,

  render(container) {
    if (!container) return;
    container.innerHTML = `
      <div class="tool-panel" style="max-width:100%;padding:0;overflow:hidden;">
        <div style="padding:20px 32px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">
          <div>
            <h3 style="font-family:'Space Grotesk',sans-serif;font-size:20px;">🧠 Mind Map Maker</h3>
            <p style="color:var(--text-secondary);font-size:13px;">Double-clique pour créer un node. Clique pour éditer. Drag pour déplacer.</p>
          </div>
          <div style="display:flex;gap:8px;">
            <button class="btn" onclick="MindMap.addNode()">+ Node</button>
            <button class="btn" onclick="MindMap.connectNodes()">🔗 Connecter</button>
            <button class="btn" onclick="MindMap.clear()">🗑 Vider</button>
            <button class="btn" onclick="MindMap.exportPNG()">💾 PNG</button>
          </div>
        </div>
        <div id="mindmap-canvas-container" style="position:relative;width:100%;height:600px;overflow:hidden;background:var(--bg-primary);cursor:grab;">
          <svg id="mindmap-svg" style="width:100%;height:100%;"></svg>
        </div>
        <div id="mindmap-toolbar" style="padding:12px 32px;border-top:1px solid var(--border);display:flex;gap:12px;align-items:center;">
          <span style="font-size:12px;color:var(--text-muted);">Couleur :</span>
          <button class="btn btn-icon" style="background:var(--accent);width:24px;height:24px;" onclick="MindMap.setColor('#818cf8')"></button>
          <button class="btn btn-icon" style="background:var(--green);width:24px;height:24px;" onclick="MindMap.setColor('#34d399')"></button>
          <button class="btn btn-icon" style="background:var(--red);width:24px;height:24px;" onclick="MindMap.setColor('#f87171')"></button>
          <button class="btn btn-icon" style="background:var(--yellow);width:24px;height:24px;" onclick="MindMap.setColor('#fbbf24')"></button>
          <button class="btn btn-icon" style="background:var(--purple);width:24px;height:24px;" onclick="MindMap.setColor('#c084fc')"></button>
          <button class="btn btn-icon" style="background:var(--teal);width:24px;height:24px;" onclick="MindMap.setColor('#2dd4bf')"></button>
          <span style="font-size:12px;color:var(--text-muted);margin-left:12px;">Node sélectionné : <span id="mindmap-selected">Aucun</span></span>
        </div>
      </div>
    `;

    this.setupCanvas();
    this.loadMap();
    if (this.nodes.length === 0) {
      this.nodes.push({ id: 0, x: 400, y: 300, text: 'Idée centrale', color: '#818cf8', width: 120, height: 40 });
    }
    this.renderCanvas();
  },

  setupCanvas() {
    const container = document.getElementById('mindmap-canvas-container');
    const svg = document.getElementById('mindmap-svg');
    if (!container || !svg) return;

    container.addEventListener('dblclick', (e) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left - this.panX) / this.scale;
      const y = (e.clientY - rect.top - this.panY) / this.scale;
      this.addNode(x, y);
    });

    container.addEventListener('mousedown', (e) => {
      if (e.target.tagName === 'rect' || e.target.tagName === 'text') {
        const nodeId = parseInt(e.target.dataset.nodeId);
        this.startDrag(e, nodeId);
      }
    });

    container.addEventListener('mousemove', (e) => this.drag(e));
    container.addEventListener('mouseup', () => this.endDrag());
    container.addEventListener('mouseleave', () => this.endDrag());
  },

  addNode(x, y) {
    if (x === undefined) {
      x = 200 + Math.random() * 400;
      y = 150 + Math.random() * 300;
    }
    const node = {
      id: this.nextId++,
      x, y,
      text: 'Nouveau',
      color: '#818cf8',
      width: 100,
      height: 36
    };
    this.nodes.push(node);
    this.selectedNode = node.id;
    this.renderCanvas();
    this.saveMap();

    // Inline edit
    setTimeout(() => this.editNode(node.id), 50);
  },

  editNode(id) {
    const node = this.nodes.find(n => n.id === id);
    if (!node) return;
    const newText = prompt('Texte du node:', node.text);
    if (newText !== null) {
      node.text = newText;
      node.width = Math.max(100, newText.length * 8 + 20);
      this.renderCanvas();
      this.saveMap();
    }
  },

  setColor(color) {
    if (this.selectedNode === null) return;
    const node = this.nodes.find(n => n.id === this.selectedNode);
    if (node) {
      node.color = color;
      this.renderCanvas();
      this.saveMap();
    }
  },

  connectNodes() {
    if (this.nodes.length < 2) {
      if (window.App) window.App.showToast('Il faut au moins 2 nodes', 'error');
      return;
    }
    const from = prompt('ID node source:');
    const to = prompt('ID node destination:');
    if (from && to) {
      this.connections.push({ from: parseInt(from), to: parseInt(to) });
      this.renderCanvas();
      this.saveMap();
    }
  },

  startDrag(e, nodeId) {
    this.isDragging = true;
    this.dragNode = this.nodes.find(n => n.id === nodeId);
    this.selectedNode = nodeId;
    const rect = document.getElementById('mindmap-canvas-container').getBoundingClientRect();
    this.dragOffset = {
      x: (e.clientX - rect.left - this.panX) / this.scale - this.dragNode.x,
      y: (e.clientY - rect.top - this.panY) / this.scale - this.dragNode.y
    };
    document.getElementById('mindmap-selected').textContent = this.dragNode.text;
    this.renderCanvas();
  },

  drag(e) {
    if (!this.isDragging || !this.dragNode) return;
    const rect = document.getElementById('mindmap-canvas-container').getBoundingClientRect();
    this.dragNode.x = (e.clientX - rect.left - this.panX) / this.scale - this.dragOffset.x;
    this.dragNode.y = (e.clientY - rect.top - this.panY) / this.scale - this.dragOffset.y;
    this.renderCanvas();
  },

  endDrag() {
    if (this.isDragging) {
      this.isDragging = false;
      this.dragNode = null;
      this.saveMap();
    }
  },

  renderCanvas() {
    const svg = document.getElementById('mindmap-svg');
    if (!svg) return;

    let svgContent = `<g transform="translate(${this.panX},${this.panY}) scale(${this.scale})">`;

    // Connections
    this.connections.forEach(conn => {
      const from = this.nodes.find(n => n.id === conn.from);
      const to = this.nodes.find(n => n.id === conn.to);
      if (from && to) {
        svgContent += `<line x1="${from.x + from.width/2}" y1="${from.y + from.height/2}" x2="${to.x + to.width/2}" y2="${to.y + to.height/2}" stroke="var(--text-muted)" stroke-width="2" opacity="0.5"/>`;
      }
    });

    // Nodes
    this.nodes.forEach(node => {
      const isSelected = node.id === this.selectedNode;
      svgContent += `
        <g data-node-id="${node.id}">
          <rect data-node-id="${node.id}" x="${node.x}" y="${node.y}" width="${node.width}" height="${node.height}" rx="8" 
            fill="${node.color}" opacity="0.2" stroke="${node.color}" stroke-width="${isSelected ? 3 : 1}"
            style="cursor:pointer;"/>
          <text data-node-id="${node.id}" x="${node.x + node.width/2}" y="${node.y + node.height/2 + 5}" 
            text-anchor="middle" fill="var(--text-primary)" font-size="13" font-family="Inter,sans-serif"
            style="pointer-events:none;">${window.App?.escapeHtml(node.text) || node.text}</text>
        </g>
      `;
    });

    svgContent += '</g>';
    svg.innerHTML = svgContent;
  },

  clear() {
    if (!confirm('Vider la mind map ?')) return;
    this.nodes = [{ id: 0, x: 400, y: 300, text: 'Idée centrale', color: '#818cf8', width: 120, height: 40 }];
    this.connections = [];
    this.selectedNode = null;
    this.nextId = 1;
    this.renderCanvas();
    this.saveMap();
  },

  exportPNG() {
    const svg = document.getElementById('mindmap-svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0a0b14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      const link = document.createElement('a');
      link.download = 'mindmap.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      if (window.App) window.App.showToast('Mind map exportée !', 'success');
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  },

  saveMap() {
    if (window.App) {
      localStorage.setItem(window.App.getStorageKey('mindmap'), JSON.stringify({
        nodes: this.nodes,
        connections: this.connections,
        nextId: this.nextId
      }));
    }
  },

  loadMap() {
    if (window.App) {
      const saved = localStorage.getItem(window.App.getStorageKey('mindmap'));
      if (saved) {
        try {
          const data = JSON.parse(saved);
          this.nodes = data.nodes || [];
          this.connections = data.connections || [];
          this.nextId = data.nextId || 1;
        } catch(e) {}
      }
    }
  }
};
