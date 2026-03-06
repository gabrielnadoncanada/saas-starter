# GitHub Auth Setup

Ce projet supporte l'authentification GitHub via NextAuth.

## 1. Creer l'application OAuth sur GitHub

Dans GitHub:

1. Ouvre `Settings`
2. Va dans `Developer settings`
3. Clique sur `OAuth Apps`
4. Clique sur `New OAuth App`

Remplis les champs ainsi:

- `Application name`: le nom de ton app
- `Homepage URL`: `http://localhost:3000`
- `Authorization callback URL`: `http://localhost:3000/api/auth/callback/github`

Ensuite:

1. Cree l'application
2. Copie le `Client ID`
3. Genere puis copie le `Client Secret`

## 2. Ajouter les variables dans `.env`

Ajoute ces variables dans [`.env`](/c:/laragon/www/saas-starter/.env):

```env
GITHUB_CLIENT_ID=ton_client_id
GITHUB_CLIENT_SECRET=ton_client_secret
BASE_URL=http://localhost:3000
AUTH_SECRET=un_secret_long_et_aleatoire
```

Le format attendu est aussi visible dans [`.env.example`](/c:/laragon/www/saas-starter/.env.example).

## 3. Redemarrer le serveur

Apres modification du `.env`, redemarre le serveur Next.js:

```bash
pnpm dev
```

## 4. Verifier dans l'application

Va sur:

- `/sign-in`
- `/sign-up`

Si `GITHUB_CLIENT_ID` et `GITHUB_CLIENT_SECRET` sont presents, le bouton `Continue with GitHub` apparaitra.

## 5. Callback URL en production

En production, remplace les URLs localhost par ton vrai domaine:

- `Homepage URL`: `https://ton-domaine.com`
- `Authorization callback URL`: `https://ton-domaine.com/api/auth/callback/github`

Et mets a jour:

```env
BASE_URL=https://ton-domaine.com
```

## 6. Comment le linking fonctionne dans ce projet

Le comportement actuel est le suivant:

- si un compte existe deja avec le meme email et que l'email GitHub est accepte comme fiable, GitHub est relie a ce compte
- sinon un nouveau compte utilisateur est cree puis lie a GitHub

## 7. Problemes frequents

### Le bouton GitHub n'apparait pas

Verifie:

- `GITHUB_CLIENT_ID` est rempli
- `GITHUB_CLIENT_SECRET` est rempli
- le serveur a bien ete redemarre

### Erreur de callback

Verifie que l'URL configuree dans GitHub est exactement:

```text
http://localhost:3000/api/auth/callback/github
```

### Le login GitHub echoue

Ca peut arriver si GitHub ne renvoie pas un email utilisable ou si la configuration OAuth n'est pas correcte.

## 8. Fichiers concernes

- [auth.ts](/c:/laragon/www/saas-starter/auth.ts)
- [lib/auth/providers.ts](/c:/laragon/www/saas-starter/lib/auth/providers.ts)
- [app/(login)/login.tsx](/c:/laragon/www/saas-starter/app/(login)/login.tsx)
