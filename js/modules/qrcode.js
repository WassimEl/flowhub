// ===== QR CODE MODULE =====
export const QRCodeTool = {
  qrCodeObj: null,

  render(container) {
    if (!container) return;
    container.innerHTML = `
      <div class="tool-panel">
        <div class="tool-panel-header">
          <div class="icon">📱</div>
          <h3>Générateur de QR Code</h3>
          <p><strong style="color:var(--accent)">Usage pratique :</strong> partage le WiFi du Mac mini avec tes invités, envoie l'URL de ton serveur Jellyfin sur téléphone, ou crée un vCard pour tes contacts pro.</p>
        </div>
        <div class="qr-options">
          <select class="form-select" id="qr-type" onchange="QRCodeTool.updateForm()">
            <option value="url">🔗 URL / Lien</option>
            <option value="wifi">📶 WiFi</option>
            <option value="vcard">👤 vCard (Contact)</option>
            <option value="text">📝 Texte libre</option>
          </select>
          <select class="form-select" id="qr-size">
            <option value="200">200x200 px</option>
            <option value="400" selected>400x400 px</option>
            <option value="600">600x600 px</option>
          </select>
        </div>
        <div id="qr-form-url"><input type="text" class="qr-input" id="qr-url" placeholder="https://..." value="https://flowboard.vercel.app"></div>
        <div id="qr-form-wifi" style="display:none;">
          <input type="text" class="qr-input" id="qr-ssid" placeholder="Nom du réseau (SSID)">
          <input type="password" class="qr-input" id="qr-password" placeholder="Mot de passe">
          <select class="form-select" style="margin-bottom:16px;" id="qr-encryption"><option value="WPA">WPA/WPA2</option><option value="WEP">WEP</option><option value="nopass">Sans mot de passe</option></select>
        </div>
        <div id="qr-form-vcard" style="display:none;">
          <input type="text" class="qr-input" id="qr-name" placeholder="Nom complet">
          <input type="tel" class="qr-input" id="qr-phone" placeholder="Téléphone">
          <input type="email" class="qr-input" id="qr-email" placeholder="Email">
        </div>
        <div id="qr-form-text" style="display:none;"><textarea class="form-textarea" id="qr-text" placeholder="Ton texte ici..." style="margin-bottom:16px;"></textarea></div>
        <button class="btn btn-primary" onclick="QRCodeTool.generate()" style="width:100%;justify-content:center;margin-bottom:20px;">⚡ Générer le QR Code</button>
        <div class="qr-result" id="qr-result" style="display:none;">
          <div id="qr-canvas"></div>
          <div style="display:flex;gap:8px;">
            <button class="btn" onclick="QRCodeTool.download()">💾 Télécharger PNG</button>
            <button class="btn" onclick="QRCodeTool.copyText()">📋 Copier le contenu</button>
          </div>
        </div>
      </div>
    `;
  },

  updateForm() {
    const type = document.getElementById('qr-type').value;
    document.getElementById('qr-form-url').style.display = type === 'url' ? 'block' : 'none';
    document.getElementById('qr-form-wifi').style.display = type === 'wifi' ? 'block' : 'none';
    document.getElementById('qr-form-vcard').style.display = type === 'vcard' ? 'block' : 'none';
    document.getElementById('qr-form-text').style.display = type === 'text' ? 'block' : 'none';
    document.getElementById('qr-result').style.display = 'none';
  },

  generate() {
    const type = document.getElementById('qr-type').value;
    let text = '';
    if (type === 'url') text = document.getElementById('qr-url').value;
    else if (type === 'wifi') { 
      const ssid = document.getElementById('qr-ssid').value; 
      const pwd = document.getElementById('qr-password').value; 
      const enc = document.getElementById('qr-encryption').value; 
      text = `WIFI:T:${enc};S:${ssid};P:${pwd};;`; 
    }
    else if (type === 'vcard') { 
      const name = document.getElementById('qr-name').value; 
      const phone = document.getElementById('qr-phone').value; 
      const email = document.getElementById('qr-email').value; 
      text = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL:${phone}\nEMAIL:${email}\nEND:VCARD`; 
    }
    else text = document.getElementById('qr-text').value;

    if (!text) { 
      if (window.App) window.App.showToast('Entre du contenu', 'error'); 
      return; 
    }

    const canvasDiv = document.getElementById('qr-canvas');
    canvasDiv.innerHTML = '';
    const size = parseInt(document.getElementById('qr-size').value);

    // eslint-disable-next-line no-undef
    this.qrCodeObj = new QRCode(canvasDiv, { 
      text: text, 
      width: size, 
      height: size, 
      colorDark: '#e8e9f0', 
      colorLight: '#0a0b14', 
      correctLevel: QRCode.CorrectLevel.M 
    });

    document.getElementById('qr-result').style.display = 'flex';
    if (window.App) window.App.showToast('QR Code généré !', 'success');
  },

  download() {
    const canvas = document.querySelector('#qr-canvas canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'flowboard-qr.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    if (window.App) window.App.showToast('QR Code téléchargé', 'success');
  },

  copyText() {
    const type = document.getElementById('qr-type').value;
    let text = '';
    if (type === 'url') text = document.getElementById('qr-url').value;
    else if (type === 'wifi') text = `SSID: ${document.getElementById('qr-ssid').value}, MDP: ${document.getElementById('qr-password').value}`;
    else if (type === 'vcard') text = `${document.getElementById('qr-name').value} — ${document.getElementById('qr-phone').value}`;
    else text = document.getElementById('qr-text').value;
    navigator.clipboard.writeText(text).then(() => {
      if (window.App) window.App.showToast('Contenu copié', 'success');
    });
  }
};
