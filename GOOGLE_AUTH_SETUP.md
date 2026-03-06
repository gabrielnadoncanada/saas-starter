# Google Auth Setup

Ce projet supporte l'authentification Google via NextAuth.

## 1. Creer le projet et les credentials dans Google Cloud

Dans Google Cloud Console:

1. Ouvre `Google Cloud Console`
2. Choisis un projet existant ou cree un nouveau projet
3. Va dans `APIs & Services`
4. Ouvre `Credentials`
5. Clique sur `Create Credentials`
6. Choisis `OAuth client ID`

Si Google te le demande, configure d'abord le `OAuth consent screen`.

## 2. Configurer l'OAuth client

Choisis:

- `Application type`: `Web application`

Ajoute ensuite:

- `Authorized JavaScript origins`: `http://localhost:3000`
- `Authorized redirect URIs`: `http://localhost:3000/api/auth/callback/google`

Ensuite:

1. Cree le client OAuth
2. Copie le `Client ID`
3. Copie le `Client Secret`

## 3. Ajouter les variables dans `.env`

Ajoute ces variables dans [`.env`](/c:/laragon/www/saas-starter/.env):

```env
GOOGLE_CLIENT_ID=ton_client_id
GOOGLE_CLIENT_SECRET=ton_client_secret
BASE_URL=http://localhost:3000
AUTH_SECRET=un_secret_long_et_aleatoire
```

Le format attendu est aussi visible dans [`.env.example`](/c:/laragon/www/saas-starter/.env.example).

## 4. Redemarrer le serveur

Apres modification du `.env`, redemarre le serveur Next.js:

```bash
pnpm dev
```

## 5. Verifier dans l'application

Va sur:

- `/sign-in`
- `/sign-up`

Si `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET` sont presents, le bouton `Continue with Google` apparaitra.

## 6. Callback URL en production

En production, remplace les URLs localhost par ton vrai domaine:

- `Authorized JavaScript origins`: `https://ton-domaine.com`
- `Authorized redirect URIs`: `https://ton-domaine.com/api/auth/callback/google`

Et mets a jour:

```env
BASE_URL=https://ton-domaine.com
```

## 7. Comment le linking fonctionne dans ce projet

Le comportement actuel est le suivant:

- si un compte existe deja avec le meme email et que Google fournit un email verifie, Google est relie a ce compte
- sinon un nouveau compte utilisateur est cree puis lie a Google

## 8. Problemes frequents

### Le bouton Google n'apparait pas

Verifie:

- `GOOGLE_CLIENT_ID` est rempli
- `GOOGLE_CLIENT_SECRET` est rempli
- le serveur a bien ete redemarre

### Erreur `redirect_uri_mismatch`

Verifie que l'URI configuree dans Google est exactement:

```text
http://localhost:3000/api/auth/callback/google
```

### Erreur sur l'ecran de consentement

Verifie que:

- le `OAuth consent screen` est configure
- ton compte test est autorise si l'application est en mode test

## 9. Fichiers concernes

- [auth.ts](/c:/laragon/www/saas-starter/auth.ts)
- [lib/auth/providers.ts](/c:/laragon/www/saas-starter/lib/auth/providers.ts)
- [app/(login)/login.tsx](/c:/laragon/www/saas-starter/app/(login)/login.tsx)
