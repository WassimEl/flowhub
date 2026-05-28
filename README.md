# FlowBoard — Plateforme Multi-Outils

FlowBoard est un hub personnel regroupant des outils de gestion de projet, de configuration serveur et d'utilitaires divers.

## 🏗️ Architecture Multi-Fichiers

```
flowboard/
├── index.html              # Point d'entrée principal
├── vercel.json             # Configuration Vercel
├── middleware.js           # Protection admin (Edge)
├── css/
│   └── styles.css          # Tous les styles
└── js/
    ├── app.js              # Core App (Auth, Router, Storage, Cloud)
    └── modules/
        ├── kanban.js       # Kanban Board
        ├── machub.js       # Mac mini M4 Hub (🔒 Admin)
        ├── lolhub.js       # LoL Team Builder + Tournament
        ├── qrcode.js       # QR Code Generator
        ├── password.js     # Password Vault (👤 Per-User)
        └── characters.js   # Character Generator (randomuser.me)
```

## 🔐 Sécurité & Accès

### Système de Compte (Pseudo)
- Chaque utilisateur entre son pseudo à l'arrivée
- Les données sont stockées dans `localStorage` avec préfixe `flowboard_<pseudo>_`
- **Chaque utilisateur a ses propres données isolées** — partage le lien, chacun a son espace

### Section MacHub — Protection Admin
- **Client-side** : Verrouillage par mot de passe (`1980`) dans l'interface
- **Server-side (Vercel)** : Middleware Edge qui protège les routes `/admin/*`
- Le statut admin est persisté en localStorage par utilisateur

### Coffre MDP — Isolation par Utilisateur
- Le coffre mots de passe utilise la clé de stockage `flowboard_<pseudo>_vault`
- Chaque pseudo a son propre coffre, invisible des autres

## ☁️ Synchronisation Cloud

- Export/Import JSON local
- Synchronisation GitHub Gist (token requis)
- Intervalle de sync auto : 30 secondes

## 🚀 Déploiement Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel --prod
```

## 🛠️ Outils Inclus

| Outil | Status | Description |
|-------|--------|-------------|
| Kanban | ✅ Ready | Drag & drop, priorités, tags, assignés |
| MacHub | 🔒 Admin | Comparatif Mac mini, sélecteur projets serveur |
| LoL Hub | ✅ Ready | Team Builder + Tournoi 1v1 |
| QR Code | ✅ Ready | URL, WiFi, vCard, texte |
| Coffre MDP | ✅ Ready | Générateur + stockage per-user |
| Personnages | ✅ Ready | Générateur via randomuser.me |

## 📝 Notes

- Le middleware Vercel est une protection supplémentaire côté serveur
- La protection principale est client-side (mot de passe `1980`)
- Pour une sécurité renforcée, remplacez le mot de passe par une variable d'environnement Vercel
