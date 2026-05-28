# FlowBoard — Plateforme Multi-Outils

FlowBoard est un hub personnel regroupant des outils de gestion de projet, de configuration serveur et d'utilitaires divers.

## 🏗️ Architecture Multi-Fichiers

```
flowboard/
├── index.html              # Point d'entrée principal
├── vercel.json             # Configuration Vercel (headers sécurité)
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

### Section MacHub — Protection Admin (Client-Side)
- Mot de passe admin : **`1980`**
- Verrouillage dans l'interface avec persistance `localStorage` par utilisateur
- Une fois déverrouillé, l'accès reste ouvert pour ce pseudo sur ce navigateur

### Coffre MDP — Isolation par Utilisateur
- Le coffre mots de passe utilise la clé de stockage `flowboard_<pseudo>_vault`
- Chaque pseudo a son propre coffre, invisible des autres

## ☁️ Synchronisation Cloud

- Export/Import JSON local
- Synchronisation GitHub Gist (token requis)
- Intervalle de sync auto : 30 secondes

## 🚀 Déploiement Vercel

```bash
# Déployer directement
vercel --prod
```

**Note :** C'est un site statique HTML/CSS/JS. Aucun build step nécessaire.

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

- La protection admin est **client-side** — c'est un site 100% frontend
- Pour une sécurité renforcée, le mot de passe peut être changé dans `js/modules/machub.js`
- Les données restent locales (`localStorage`) sauf si sync GitHub Gist activée
