# ESTIM Chat

ESTIM Chat est une application de messagerie temps reel construite avec `Node.js`, `Express`, `Socket.IO`, `MongoDB`, `Mongoose` et un frontend `HTML/CSS/JavaScript` sans framework.

## Fonctionnalites

- Inscription et connexion securisees avec email/mot de passe
- Hash des mots de passe avec `bcrypt`
- Authentification JWT pour proteger les routes
- Chat temps reel avec `Socket.IO`
- Historique des messages persiste dans MongoDB
- Liste des conversations avec recherche et statut en ligne
- Profil utilisateur modifiable
- Boutons et routes OAuth Google / Apple prets a configurer
- Interface responsive, sombre, inspiree des messageries modernes

## Structure

```text
/public
  login.html
  register.html
  inbox.html
  chat.html
  profile.html
  style.css
  script.js

/server
  server.js
  /middleware
    auth.js
  /models
    User.js
    Message.js
  /routes
    auth.js
    user.js
    message.js
```

## Installation

1. Installer les dependances :

```bash
npm install
```

2. Copier `.env.example` vers `.env` puis renseigner les variables :

```bash
cp .env.example .env
```

3. Verifier que MongoDB tourne localement, ou adapter `MONGO_URI`.

4. Lancer le projet :

```bash
npm run dev
```

5. Ouvrir :

```text
http://localhost:5000/login.html
```

## OAuth Google et Apple

L'application fonctionne immediatement avec l'authentification classique email/mot de passe.

Pour activer Google et Apple :

- renseigner les variables OAuth dans `.env`
- enregistrer les URLs de callback dans vos consoles Google et Apple
- relancer le serveur

Sans configuration OAuth, les boutons restent visibles et retournent un message clair cote serveur pour indiquer que la fonctionnalite doit etre configuree.

## Notes de securite

- Les mots de passe sont haches avec `bcrypt`
- Les routes API critiques utilisent un middleware JWT
- Les entrees utilisateur sont validees avant ecriture
- Les sockets sont authentifies via le token JWT

## Pages disponibles

- `login.html`
- `register.html`
- `inbox.html`
- `chat.html`
- `profile.html`
