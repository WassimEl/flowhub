// ===== FAVICON GENERATOR MODULE =====
export const FaviconGen = {
  svgContent: null,

  render(container) {
    if (!container) return;
    container.innerHTML = `
      <div class="tool-panel">
        <div class="tool-panel-header">
          <div class="icon">🎨</div>
          <h3>Générateur de Favicon</h3>
          <p>Upload un SVG et génère toutes les tailles nécessaires + manifest.json.</p>
        </div>
        <div style="display:flex;flex-direction:column;gap:20px;align-items:center;">
          <div id="fav-dropzone" style="width:100%;max-width:400px;height:180px;border:2px dashed var(--border);border-radius:var(--radius);display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;transition:all 0.2s;" ondragover="event.preventDefault();this.style.borderColor='var(--accent)';" ondragleave="this.style.borderColor='var(--border)';" ondrop="FaviconGen.handleDrop(event)">
            <div style="font-size:32px;margin-bottom:8px;">📤</div>
            <div style="font-weight:500;">Glisse un SVG ici</div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:4px;">ou clique pour sélectionner</div>
            <input type="file" id="fav-file-input" accept=".svg" style="display:none;" onchange="FaviconGen.handleFile(this)">
          </div>
          <div id="fav-preview-area" style="display:none;width:100%;">
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:16px;margin-bottom:24px;">
              <div style="text-align:center;"><div id="fav-16" style="width:16px;height:16px;margin:0 auto 8px;background:var(--bg-primary);border:1px solid var(--border);"></div><div style="font-size:11px;color:var(--text-muted);">16x16</div></div>
              <div style="text-align:center;"><div id="fav-32" style="width:32px;height:32px;margin:0 auto 8px;background:var(--bg-primary);border:1px solid var(--border);"></div><div style="font-size:11px;color:var(--text-muted);">32x32</div></div>
              <div style="text-align:center;"><div id="fav-180" style="width:60px;height:60px;margin:0 auto 8px;background:var(--bg-primary);border:1px solid var(--border);"></div><div style="font-size:11px;color:var(--text-muted);">180x180 (Apple)</div></div>
              <div style="text-align:center;"><div id="fav-192" style="width:64px;height:64px;margin:0 auto 8px;background:var(--bg-primary);border:1px solid var(--border);"></div><div style="font-size:11px;color:var(--text-muted);">192x192</div></div>
              <div style="text-align:center;"><div id="fav-512" style="width:80px;height:80px;margin:0 auto 8px;background:var(--bg-primary);border:1px solid var(--border);"></div><div style="font-size:11px;color:var(--text-muted);">512x512</div></div>
            </div>
            <div style="display:flex;gap:8px;justify-content:center;">
              <button class="btn btn-primary" onclick="FaviconGen.downloadAll()">📦 Télécharger ZIP</button>
              <button class="btn" onclick="FaviconGen.downloadManifest()">📄 manifest.json</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('fav-dropzone').addEventListener('click', () => {
      document.getElementById('fav-file-input').click();
    });
  },

  handleDrop(e) {
    e.preventDefault();
    e.currentTarget.style.borderColor = 'var(--border)';
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'image/svg+xml') {
      this.processFile(file);
    } else {
      if (window.App) window.App.showToast('Fichier SVG requis', 'error');
    }
  },

  handleFile(input) {
    const file = input.files[0];
    if (file) this.processFile(file);
  },

  processFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.svgContent = e.target.result;
      this.renderPreviews();
      document.getElementById('fav-preview-area').style.display = 'block';
      if (window.App) window.App.showToast('SVG chargé !', 'success');
    };
    reader.readAsText(file);
  },

  renderPreviews() {
    if (!this.svgContent) return;
    const sizes = [16, 32, 180, 192, 512];
    sizes.forEach(size => {
      const container = document.getElementById(`fav-${size}`);
      if (container) {
        container.innerHTML = this.svgContent;
        const svg = container.querySelector('svg');
        if (svg) {
          svg.setAttribute('width', size > 80 ? 80 : size);
          svg.setAttribute('height', size > 80 ? 80 : size);
        }
      }
    });
  },

  svgToPng(svgString, size) {
    return new Promise((resolve) => {
      const svg = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svg);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, size, size);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = url;
    });
  },

  async downloadAll() {
    if (!this.svgContent) return;
    if (window.App) window.App.showToast('Génération en cours...', 'info');

    const sizes = [16, 32, 180, 192, 512];
    const manifest = {
      name: "FlowBoard",
      short_name: "FlowBoard",
      icons: [],
      theme_color: "#818cf8",
      background_color: "#0a0b14",
      display: "standalone"
    };

    // Use JSZip if available, otherwise download individually
    for (const size of sizes) {
      const png = await this.svgToPng(this.svgContent, size);
      const link = document.createElement('a');
      link.download = `favicon-${size}x${size}.png`;
      link.href = png;
      link.click();

      manifest.icons.push({
        src: `favicon-${size}x${size}.png`,
        sizes: `${size}x${size}`,
        type: "image/png"
      });
    }

    // Download manifest
    const manifestBlob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const manifestUrl = URL.createObjectURL(manifestBlob);
    const manifestLink = document.createElement('a');
    manifestLink.download = 'manifest.json';
    manifestLink.href = manifestUrl;
    manifestLink.click();
    URL.revokeObjectURL(manifestUrl);

    if (window.App) window.App.showToast('Tous les fichiers téléchargés !', 'success');
  },

  downloadManifest() {
    const manifest = {
      name: "FlowBoard",
      short_name: "FlowBoard",
      icons: [
        { src: "favicon-192x192.png", sizes: "192x192", type: "image/png" },
        { src: "favicon-512x512.png", sizes: "512x512", type: "image/png" }
      ],
      theme_color: "#818cf8",
      background_color: "#0a0b14",
      display: "standalone"
    };
    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'manifest.json';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }
};
