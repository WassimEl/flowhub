(function () {

// ── 1. STYLES ────────────────────────────────────────────────
const style = document.createElement('style');
style.textContent = `
  .fb-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.75);backdrop-filter:blur(12px);display:none;align-items:center;justify-content:center;z-index:9999;}
  .fb-modal-overlay.open{display:flex;}
  .fb-modal-box{background:linear-gradient(145deg,#141528,#1a1b2e);border:1px solid rgba(129,140,248,0.2);border-radius:16px;padding:32px;width:90%;max-width:440px;box-shadow:0 25px 60px rgba(0,0,0,0.6);position:relative;}
  .fb-modal-close{position:absolute;top:14px;right:14px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:8px;width:30px;height:30px;color:#8b8da3;cursor:pointer;font-size:15px;display:flex;align-items:center;justify-content:center;transition:all 0.2s;}
  .fb-modal-close:hover{background:rgba(248,113,113,0.15);color:#f87171;}
  .fb-input{width:100%;padding:11px 14px;box-sizing:border-box;background:#0a0b14;border:1px solid rgba(255,255,255,0.08);border-radius:10px;color:#e8e9f0;font-family:'Inter',sans-serif;font-size:13px;outline:none;transition:all 0.2s;}
  .fb-input:focus{border-color:rgba(129,140,248,0.5);box-shadow:0 0 0 3px rgba(129,140,248,0.1);}
  .fb-btn{width:100%;padding:11px;border-radius:10px;border:none;background:linear-gradient(135deg,#818cf8,#c084fc);color:white;font-family:'Inter',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:all 0.2s;box-shadow:0 4px 15px rgba(129,140,248,0.3);}
  .fb-btn:hover{box-shadow:0 6px 25px rgba(129,140,248,0.5);transform:translateY(-1px);}
  .fb-btn:disabled{opacity:0.5;cursor:not-allowed;transform:none;}
  .fb-btn-ghost{width:100%;padding:10px;border-radius:10px;border:1px solid rgba(255,255,255,0.08);background:transparent;color:#8b8da3;font-family:'Inter',sans-serif;font-size:13px;cursor:pointer;transition:all 0.2s;}
  .fb-btn-ghost:hover{background:rgba(255,255,255,0.04);color:#e8e9f0;}
  .fb-label{display:block;font-size:11px;font-weight:600;color:#8b8da3;text-transform:uppercase;letter-spacing:0.05em;font-family:'JetBrains Mono',monospace;margin-bottom:7px;}
  .fb-error{color:#f87171;font-size:12px;padding:8px 12px;background:rgba(248,113,113,0.1);border:1px solid rgba(248,113,113,0.2);border-radius:8px;margin-bottom:12px;display:none;}
  .fb-success-box{background:rgba(52,211,153,0.08);border:1px solid rrgba(8, 7, 7, 0.1)order-radius:10px;padding:14px 16px;margin-bottom:16px;display:none;}
  .fb-feature-list{display:flex;flex-direction:column;gap:8px;margin:16px 0;}
  .fb-feature-item{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:9px;font-size:13px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);}
  .fb-feature-icon{font-size:16px;flex-shrink:0;}
  .fb-feature-text{color:#8b8da3;}
  .fb-feature-text strong{color:#e8e9f0;}
  .fb-divider{border:none;border-top:1px solid rgba(255,255,255,0.06);margin:20px 0;}
  #nav-admin-btn{display:flex;align-items:center;gap:6px;padding:7px 14px;border-radius:8px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.04);color:#8b8da3;font-family:'Inter',sans-serif;font-size:13px;font-weight:500;cursor:pointer;transition:all 0.2s;}
  #nav-admin-btn:hover{background:rgba(129,140,248,0.1);color:#a5b4fc;border-color:rgba(129,140,248,0.25);}
  #nav-admin-btn.is-admin{background:rgba(129,140,248,0.12);color:#a5b4fc;border-color:rgba(129,140,248,0.3);}
`;
document.head.appendChild(style);

// ── 2. HTML MODALS ───────────────────────────────────────────
document.body.insertAdjacentHTML('beforeend', `
<div class="fb-modal-overlay" id="fb-admin-modal">
  <div class="fb-modal-box">
    <button class="fb-modal-close" onclick="fbClose('fb-admin-modal')">✕</button>
    <div style="text-align:center;margin-bottom:24px;">
      <div style="width:52px;height:52px;border-radius:13px;margin:0 auto 14px;background:linear-gradient(135deg,#818cf8,#c084fc);display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:0 8px 24px rgba(129,140,248,0.35);">🔑</div>
      <h3 style="font-family:'Space Grotesk',sans-serif;font-size:19px;color:#e8e9f0;margin:0 0 6px;">Connexion Admin</h3>
      <p style="font-size:13px;color:#8b8da3;margin:0;">Accès complet au Kanban, MacHub et PC Devis.</p>
    </div>
    <div style="margin-bottom:14px;">
      <label class="fb-label">Mot de passe</label>
      <input class="fb-input" type="password" id="fb-admin-pwd" placeholder="••••••••" onkeydown="if(event.key==='Enter')fbAdminLogin()">
    </div>
    <div class="fb-error" id="fb-admin-err">❌ Mot de passe incorrect</div>
    <button class="fb-btn" onclick="fbAdminLogin()">🚀 Se connecter</button>
  </div>
</div>

<div class="fb-modal-overlay" id="fb-cloud-modal">
  <div class="fb-modal-box">
    <button class="fb-modal-close" onclick="fbClose('fb-cloud-modal')">✕</button>
    <div id="fb-cloud-admin" style="display:none;">
      <div style="text-align:center;margin-bottom:22px;">
        <div style="font-size:40px;margin-bottom:10px;">☁️</div>
        <h3 style="font-family:'Space Grotesk',sans-serif;font-size:19px;color:#e8e9f0;margin:0 0 6px;">Cloud Sync — Admin</h3>
        <p style="font-size:13px;color:#8b8da3;margin:0;">Tes modifs Kanban seront visibles par tous tes amis.</p>
      </div>
      <div id="fb-cloud-admin-status" class="fb-success-box">
        <div style="color:#34d399;font-weight:600;font-size:13px;margin-bottom:4px;">✓ Connecté au cloud</div>
        <div style="font-size:12px;color:#8b8da3;">Gist ID : <span id="fb-gist-id-display" style="font-family:'JetBrains Mono',monospace;color:#818cf8;"></span></div>
      </div>
      <div style="margin-bottom:14px;">
        <label class="fb-label">Token GitHub Gist</label>
        <input class="fb-input" type="password" id="fb-admin-token" placeholder="ghp_xxxxxxxxxxxxxxxxxxxx">
        <div style="margin-top:8px;font-size:12px;color:#4a4d6a;line-height:1.6;">
          📍 <a href="https://github.com/settings/tokens" target="_blank" style="color:#818cf8;">github.com/settings/tokens</a>
          → Generate new token → coche <strong style="color:#8b8da3;">gist</strong> → copie
        </div>
      </div>
      <div class="fb-error" id="fb-token-err">❌ Token invalide</div>
      <button class="fb-btn" id="fb-connect-btn" onclick="fbConnectAdmin()">🔗 Connecter & créer le Gist</button>
      <hr class="fb-divider">
      <div style="font-size:12px;color:#4a4d6a;line-height:1.7;">💡 Une fois connecté, tes amis n'ont <strong style="color:#8b8da3;">rien à configurer</strong> — ils cliquent juste "Synchroniser" dans leur menu ⋮.</div>
    </div>
    <div id="fb-cloud-user" style="display:none;">
      <div style="text-align:center;margin-bottom:22px;">
        <div style="font-size:40px;margin-bottom:10px;">🔄</div>
        <h3 style="font-family:'Space Grotesk',sans-serif;font-size:19px;color:#e8e9f0;margin:0 0 6px;">Synchroniser</h3>
        <p style="font-size:13px;color:#8b8da3;margin:0;">Récupère le Kanban partagé en un clic.</p>
      </div>
      <div id="fb-user-unsync">
        <div class="fb-feature-list">
          <div class="fb-feature-item"><span class="fb-feature-icon">📋</span><span class="fb-feature-text"><strong>Kanban partagé</strong> — vois les tâches mises à jour par l'admin</span></div>
          <div class="fb-feature-item"><span class="fb-feature-icon">🔒</span><span class="fb-feature-text"><strong>Tes données restent privées</strong> — mots de passe, notes, habits = que dans ton navigateur</span></div>
          <div class="fb-feature-item"><span class="fb-feature-icon">⚡</span><span class="fb-feature-text"><strong>Zéro configuration</strong> — juste un clic</span></div>
        </div>
        <button class="fb-btn" id="fb-user-sync-btn" onclick="fbUserSync()">⚡ Synchroniser maintenant</button>
        <div class="fb-error" id="fb-user-err" style="margin-top:10px;">❌ Impossible de se connecter. L'admin doit d'abord configurer le cloud.</div>
      </div>
      <div id="fb-user-synced" style="display:none;">
        <div style="background:rgba(52,211,153,0.08);border:1px solid rgba(52,211,153,0.2);border-radius:10px;padding:16px;text-align:center;margin-bottom:16px;">
          <div style="font-size:28px;margin-bottom:8px;">✅</div>
          <div style="color:#34d399;font-weight:600;font-size:14px;margin-bottom:4px;">Synchronisé !</div>
          <div style="font-size:12px;color:#8b8da3;">Le Kanban est maintenant à jour.</div>
        </div>
        <button class="fb-btn-ghost" onclick="fbUserSync()">🔄 Re-synchroniser</button>
      </div>
    </div>
  </div>
</div>
`);

// ── 3. BOUTON ADMIN NAVBAR ───────────────────────────────────
function injectNavBtn() {
  const navActions = document.querySelector('.nav-actions');
  if (!navActions || document.getElementById('nav-admin-btn')) return;
  const btn = document.createElement('button');
  btn.id = 'nav-admin-btn';
  function refreshBtn() {
    if (window.isAdmin) {
      btn.innerHTML = '⚙️ Admin';
      btn.classList.add('is-admin');
      btn.onclick = () => { showPage('admin'); typeof renderAdminKanban==='function'&&renderAdminKanban(); };
    } else {
      btn.innerHTML = '🔑 Admin';
      btn.classList.remove('is-admin');
      btn.onclick = () => fbOpen('fb-admin-modal');
    }
  }
  refreshBtn();
  window._refreshAdminBtn = refreshBtn;
  const syncEl = document.getElementById('sync-status');
  syncEl ? navActions.insertBefore(btn, syncEl) : navActions.prepend(btn);
}

// ── 4. PATCH MENU ⋮ ─────────────────────────────────────────
function patchDropdownMenu() {
  const menu = document.getElementById('dropdown-menu');
  if (!menu) return;
  menu.querySelectorAll('.dropdown-item').forEach(item => {
    if (item.textContent.includes('Cloud Sync') || item.getAttribute('onclick')?.includes('Cloud') || item.getAttribute('onclick')?.includes('cloud')) {
      item.innerHTML = window.isAdmin ? '☁️ Cloud Sync (Admin)' : '🔄 Synchroniser le Kanban';
      item.onclick = () => { document.getElementById('dropdown-menu').classList.remove('active'); fbOpenCloud(); };
    }
  });
}

// ── 5. OPEN / CLOSE ─────────────────────────────────────────
window.fbOpen = function(id) { document.getElementById(id)?.classList.add('open'); };
window.fbClose = function(id) {
  document.getElementById(id)?.classList.remove('open');
  document.querySelectorAll('.fb-error').forEach(e => e.style.display='none');
};

window.fbOpenCloud = function() {
  const adminView = document.getElementById('fb-cloud-admin');
  const userView = document.getElementById('fb-cloud-user');
  if (window.isAdmin) {
    adminView.style.display='block'; userView.style.display='none';
    const saved = localStorage.getItem('flowboard_gist_token');
    if (saved) document.getElementById('fb-admin-token').value = saved;
    const gistId = localStorage.getItem('flowboard_gist_id');
    const statusBox = document.getElementById('fb-cloud-admin-status');
    if (gistId) { statusBox.style.display='block'; document.getElementById('fb-gist-id-display').textContent = gistId.substring(0,10)+'...'; document.getElementById('fb-connect-btn').textContent='🔄 Reconnecter'; }
    else { statusBox.style.display='none'; }
  } else {
    adminView.style.display='none'; userView.style.display='block';
    const alreadySynced = !!localStorage.getItem('flowboard_gist_id');
    document.getElementById('fb-user-unsync').style.display = alreadySynced?'none':'block';
    document.getElementById('fb-user-synced').style.display = alreadySynced?'block':'none';
  }
  fbOpen('fb-cloud-modal');
};
window.openCloudModal = window.fbOpenCloud;

// ── 6. LOGIN ADMIN ───────────────────────────────────────────
window.fbAdminLogin = function() {
  const pwd = document.getElementById('fb-admin-pwd')?.value;
  const err = document.getElementById('fb-admin-err');
  if (pwd === (window.ADMIN_PASSWORD||'1980')) {
    window.isAdmin=true; window.kanbanEditing=true;
    localStorage.setItem('flowboard_admin','true');
    fbClose('fb-admin-modal');
    document.getElementById('fb-admin-pwd').value='';
    window._refreshAdminBtn?.();
    typeof updateAdminNav==='function'&&updateAdminNav();
    showPage('admin');
    typeof renderAdminKanban==='function'&&renderAdminKanban();
    typeof showToast==='function'&&showToast('✓ Connecté en admin','success');
  } else {
    err.style.display='block';
    const inp=document.getElementById('fb-admin-pwd');
    inp.style.borderColor='rgba(248,113,113,0.5)'; inp.value='';
    setTimeout(()=>{inp.style.borderColor='';err.style.display='none';},2000);
  }
};

// ── 7. CONNECT ADMIN → GIST ──────────────────────────────────
window.fbConnectAdmin = async function() {
  const token = document.getElementById('fb-admin-token')?.value?.trim();
  const err = document.getElementById('fb-token-err');
  const btn = document.getElementById('fb-connect-btn');
  if (!token) { err.textContent='❌ Entre ton token GitHub'; err.style.display='block'; return; }
  btn.disabled=true; btn.textContent='⏳ Connexion...'; err.style.display='none';
  try {
    const check = await fetch('https://api.github.com/user',{headers:{'Authorization':`token ${token}`}});
    if(!check.ok) throw new Error('Token invalide');
    localStorage.setItem('flowboard_gist_token', token);
    const data = JSON.stringify({tasks:window.tasks||[],version:1},null,2);
    let gistId = localStorage.getItem('flowboard_gist_id');
    if (gistId) {
      await fetch(`https://api.github.com/gists/${gistId}`,{method:'PATCH',headers:{'Authorization':`token ${token}`,'Content-Type':'application/json'},body:JSON.stringify({files:{'flowboard-kanban.json':{content:data}}})});
    } else {
      const res = await fetch('https://api.github.com/gists',{method:'POST',headers:{'Authorization':`token ${token}`,'Content-Type':'application/json'},body:JSON.stringify({public:true,description:'FlowBoard — Kanban partagé',files:{'flowboard-kanban.json':{content:data}}})});
      const json = await res.json();
      gistId = json.id;
      localStorage.setItem('flowboard_gist_id', gistId);
    }
    document.getElementById('fb-cloud-admin-status').style.display='block';
    document.getElementById('fb-gist-id-display').textContent=gistId.substring(0,10)+'...';
    btn.textContent='✓ Connecté !'; btn.style.background='linear-gradient(135deg,#34d399,#10b981)';
    typeof showToast==='function'&&showToast('☁️ Cloud connecté ! Tes amis peuvent synchroniser.','success');
    startAutoSync();
    setTimeout(()=>{btn.disabled=false;btn.textContent='🔄 Reconnecter';btn.style.background='';},2000);
  } catch(e) {
    err.textContent='❌ '+(e.message||'Erreur réseau'); err.style.display='block';
    btn.disabled=false; btn.textContent='🔗 Connecter & créer le Gist';
  }
};

// ── 8. SYNC USER ─────────────────────────────────────────────
window.fbUserSync = async function() {
  const btn = document.getElementById('fb-user-sync-btn');
  const err = document.getElementById('fb-user-err');
  if(btn){btn.disabled=true;btn.textContent='⏳ Synchronisation...';}
  err.style.display='none';
  const gistId = localStorage.getItem('flowboard_gist_id') || HARDCODED_GIST_ID;
  if (!gistId) { err.style.display='block'; if(btn){btn.disabled=false;btn.textContent='⚡ Synchroniser maintenant';} return; }
  try {
    const res = await fetch(`https://api.github.com/gists/${gistId}`);
    if(!res.ok) throw new Error('Gist introuvable');
    const json = await res.json();
    const content = json.files?.['flowboard-kanban.json']?.content;
    if(!content) throw new Error('Données vides');
    const d = JSON.parse(content);
    if(d.tasks){
      window.tasks=d.tasks;
      localStorage.setItem('flowboard_shared_tasks',JSON.stringify(d.tasks));
      localStorage.setItem('flowboard_gist_id',gistId);
      typeof renderKanban==='function'&&renderKanban();
      typeof updateHomeStats==='function'&&updateHomeStats();
    }
    document.getElementById('fb-user-unsync').style.display='none';
    document.getElementById('fb-user-synced').style.display='block';
    typeof showToast==='function'&&showToast('✓ Kanban synchronisé !','success');
    startUserAutoRefresh(gistId);
  } catch(e) {
    err.style.display='block';
    if(btn){btn.disabled=false;btn.textContent='⚡ Synchroniser maintenant';}
  }
};

// ── 9. AUTO-SYNC ─────────────────────────────────────────────
// ⬇️ ADMIN : colle ton Gist ID ici pour que tes amis se sync sans rien configurer
const HARDCODED_GIST_ID = 'efc2fbf0f71a26056db67cc448c75458';

let autoSyncInterval=null, userRefreshInterval=null;

function startAutoSync() {
  if(autoSyncInterval) clearInterval(autoSyncInterval);
  autoSyncInterval = setInterval(()=>{ if(window.isAdmin&&localStorage.getItem('flowboard_gist_token')) fbPushToGist(); },30000);
}

function startUserAutoRefresh(gistId) {
  if(userRefreshInterval) clearInterval(userRefreshInterval);
  userRefreshInterval = setInterval(async()=>{
    try {
      const res=await fetch(`https://api.github.com/gists/${gistId}`);
      const json=await res.json();
      const content=json.files?.['flowboard-kanban.json']?.content;
      if(content){const d=JSON.parse(content);if(d.tasks){window.tasks=d.tasks;localStorage.setItem('flowboard_shared_tasks',JSON.stringify(d.tasks));typeof renderKanban==='function'&&renderKanban();typeof updateHomeStats==='function'&&updateHomeStats();}}
    } catch(e){}
  },15000);
}

window.fbPushToGist = async function() {
  const token=localStorage.getItem('flowboard_gist_token');
  const gistId=localStorage.getItem('flowboard_gist_id');
  if(!token||!gistId) return;
  const data=JSON.stringify({tasks:window.tasks||[],version:1},null,2);
  try {
    await fetch(`https://api.github.com/gists/${gistId}`,{method:'PATCH',headers:{'Authorization':`token ${token}`,'Content-Type':'application/json'},body:JSON.stringify({files:{'flowboard-kanban.json':{content:data}}})});
    typeof updateSyncStatus==='function'&&updateSyncStatus('synced');
  } catch(e){ typeof updateSyncStatus==='function'&&updateSyncStatus('error'); }
};

// ── 10. FIX saveTask / deleteTask ────────────────────────────
window.saveTask = function() {
  const onAdmin = document.getElementById('page-admin')?.classList.contains('active');
  const orig = window.kanbanEditing;
  if(onAdmin&&window.isAdmin) window.kanbanEditing=true;
  const id=document.getElementById('task-id')?.value;
  const title=document.getElementById('task-title')?.value?.trim();
  if(!title){typeof showToast==='function'&&showToast('Titre requis','error');return;}
  const sA=window.selectedAssignees||new Set();
  const task={title,desc:document.getElementById('task-desc')?.value||'',priority:document.getElementById('task-priority')?.value||'medium',status:document.getElementById('task-status')?.value||'todo',progress:parseInt(document.getElementById('task-progress')?.value||0),tags:(document.getElementById('task-tags')?.value||'').split(',').map(t=>t.trim()).filter(Boolean),date:document.getElementById('task-date')?.value||'',assignees:[...sA]};
  if(id){const i=window.tasks.findIndex(t=>t.id===id);if(i>-1)window.tasks[i]={...window.tasks[i],...task};}
  else{window.tasks.push({id:Date.now().toString(),...task});}
  typeof closeTaskModal==='function'&&closeTaskModal();
  typeof renderKanban==='function'&&renderKanban();
  typeof renderAdminKanban==='function'&&renderAdminKanban();
  typeof updateHomeStats==='function'&&updateHomeStats();
  typeof populatePomoTaskSelect==='function'&&populatePomoTaskSelect();
  typeof saveToStorage==='function'&&saveToStorage();
  if(window.isAdmin) fbPushToGist();
  typeof showToast==='function'&&showToast(id?'✓ Tâche mise à jour':'✓ Tâche créée','success');
  if(onAdmin&&window.isAdmin) window.kanbanEditing=orig;
};

window.deleteTask = function(id) {
  const onAdmin = document.getElementById('page-admin')?.classList.contains('active');
  if(onAdmin&&window.isAdmin){
    if(!confirm('Supprimer cette tâche ?')) return;
    window.tasks=window.tasks.filter(t=>t.id!==id);
    typeof renderKanban==='function'&&renderKanban();
    typeof renderAdminKanban==='function'&&renderAdminKanban();
    typeof updateHomeStats==='function'&&updateHomeStats();
    typeof saveToStorage==='function'&&saveToStorage();
    fbPushToGist();
    typeof showToast==='function'&&showToast('Supprimée','info');
  }
};

// ── 11. ESCAPE / CLIC DEHORS ─────────────────────────────────
document.addEventListener('click',e=>{['fb-admin-modal','fb-cloud-modal'].forEach(id=>{const el=document.getElementById(id);if(el&&e.target===el)fbClose(id);});});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){fbClose('fb-admin-modal');fbClose('fb-cloud-modal');}});

// ── 12. INIT ─────────────────────────────────────────────────
function init() {
  if(localStorage.getItem('flowboard_admin')==='true'){window.isAdmin=true;window.kanbanEditing=true;}
  injectNavBtn();
  patchDropdownMenu();
  if(window.isAdmin&&localStorage.getItem('flowboard_gist_token')) startAutoSync();
  const gistId=localStorage.getItem('flowboard_gist_id');
  if(gistId&&!window.isAdmin) startUserAutoRefresh(gistId);
  const dropBtn=document.querySelector('[onclick="toggleDropdown()"]');
  if(dropBtn) dropBtn.onclick=()=>{toggleDropdown();setTimeout(patchDropdownMenu,50);};
}

if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init);}else{init();}

})();