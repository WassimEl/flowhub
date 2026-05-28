// ===== FAVICON GENERATOR MODULE =====
export const FaviconGen = {
  svgContent: null,
  generatedImages: {},

  render(container) {
    if (!container) return;
    container.innerHTML = `
      <div class="tool-panel">
        <div class="tool-panel-header">
          <div class="icon">🎨</div>
          <h3>Generateur de Favicon & App Icons</h3>
          <p>Upload un SVG et genere toutes les tailles necessaires + manifest.json</p>
        </div>
        <div class="favicon-upload-zone" id="favicon-dropzone" ondragover="event.preventDefault()" ondrop="FaviconGen.handleDrop(event)">
          <div class="favicon-upload-icon">📁</div>
          <div class="favicon-upload-text">Glisse un fichier SVG ici ou clique pour selectionner</div>
          <input type="file" id="favicon-file" accept=".svg" style="display:none" onchange="FaviconGen.handleFile(this.files[0])">
          <button class="btn" onclick="document.getElementById('favicon-file').click()">Selectionner un SVG</button>
        </div>
        <div class="favicon-preview-area" id="favicon-preview" style="display:none;">
          <h4 style="font-family:'Space Grotesk',sans-serif;margin-bottom:16px;">📐 Previsualisation</h4>
          <div class="favicon-sizes-grid" id="favicon-sizes"></div>
          <div class="favicon-manifest-preview">
            <h4 style="font-family:'Space Grotesk',sans-serif;margin-bottom:12px;">📄 manifest.json</h4>
            <pre class="favicon-code" id="favicon-manifest"></pre>
            <button class="btn" onclick="FaviconGen.copyManifest()">📋 Copier manifest.json</button>
          </div>
          <div class="favicon-actions">
            <button class="btn btn-primary" onclick="FaviconGen.downloadAll()">💾 Telecharger tout (ZIP)</button>
          </div>
        </div>
      </div>
    `;
  },

  handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.svg')) this.handleFile(file);
    else if (window.App) window.App.showToast('Veuillez deposer un fichier SVG', 'error');
  },

  handleFile(file) {
    if (!file || !file.name.endsWith('.svg')) {
      if (window.App) window.App.showToast('Veuillez selectionner un fichier SVG', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      this.svgContent = e.target.result;
      this.generateAll();
    };
    reader.readAsText(file);
  },

  generateAll() {
    const sizes = [
      { name: 'favicon-16x16', size: 16, label: '16x16 (Favicon)' },
      { name: 'favicon-32x32', size: 32, label: '32x32 (Favicon Retina)' },
      { name: 'apple-touch-icon', size: 180, label: '180x180 (Apple Touch)' },
      { name: 'android-chrome-192x192', size: 192, label: '192x192 (Android)' },
      { name: 'android-chrome-512x512', size: 512, label: '512x512 (Android Large)' },
    ];

    this.generatedImages = {};
    const previewArea = document.getElementById('favicon-preview');
    const sizesGrid = document.getElementById('favicon-sizes');
    if (!previewArea || !sizesGrid) return;

    sizesGrid.innerHTML = sizes.map(s => `
      <div class="favicon-size-card">
        <div class="favicon-size-label">${s.label}</div>
        <div class="favicon-size-canvas" id="favicon-canvas-${s.name}"></div>
        <button class="btn" style="font-size:11px;padding:4px 8px;" onclick="FaviconGen.downloadSingle('${s.name}')">💾 ${s.size}x${s.size}</button>
      </div>
    `).join('');

    sizes.forEach(s => {
      this.renderSvgToCanvas(s.size, s.name);
    });

    this.generateManifest();
    previewArea.style.display = 'block';
    if (window.App) window.App.showToast('Favicons generes !', 'success');
  },

  renderSvgToCanvas(size, name) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    const svgBlob = new Blob([this.svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url);
      this.generatedImages[name] = canvas.toDataURL('image/png');

      const container = document.getElementById(`favicon-canvas-${name}`);
      if (container) {
        canvas.style.maxWidth = '100%';
        canvas.style.maxHeight = '120px';
        canvas.style.borderRadius = '8px';
        container.appendChild(canvas);
      }
    };
    img.src = url;
  },

  generateManifest() {
    const manifest = {
      name: 'Mon Application',
      short_name: 'App',
      icons: [
        { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' }
      ],
      theme_color: '#0a0b14',
      background_color: '#0a0b14',
      display: 'standalone'
    };

    const manifestEl = document.getElementById('favicon-manifest');
    if (manifestEl) manifestEl.textContent = JSON.stringify(manifest, null, 2);
  },

  downloadSingle(name) {
    const dataUrl = this.generatedImages[name];
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${name}.png`;
    a.click();
  },

  downloadAll() {
    // Simple sequential download
    Object.entries(this.generatedImages).forEach(([name, dataUrl]) => {
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `${name}.png`;
        a.click();
      }, 200);
    });

    // Also download manifest
    const manifest = document.getElementById('favicon-manifest')?.textContent;
    if (manifest) {
      setTimeout(() => {
        const blob = new Blob([manifest], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'manifest.json';
        a.click();
        URL.revokeObjectURL(url);
      }, 1200);
    }

    if (window.App) window.App.showToast('Telechargement lance !', 'success');
  },

  copyManifest() {
    const manifest = document.getElementById('favicon-manifest')?.textContent;
    if (manifest) {
      navigator.clipboard.writeText(manifest).then(() => {
        if (window.App) window.App.showToast('Manifest copie', 'success');
      });
    }
  }
};
