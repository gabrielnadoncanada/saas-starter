# Resend Setup

Ce starter utilise Resend pour les emails transactionnels.

Les flows deja branches sont :

- validation d'email a l'inscription
- reset de mot de passe
- invitation d'un membre d'equipe

## 1. Creer un compte Resend

Va sur `https://resend.com` puis :

1. Cree ton compte
2. Ouvre le dashboard
3. Genere une API key dans `API Keys`

Garde cette cle pour l'etape `.env`.

## 2. Verifier un domaine d'envoi

Dans Resend :

1. Va dans `Domains`
2. Clique sur `Add Domain`
3. Ajoute ton domaine ou un sous-domaine dedie, par exemple `mail.ton-domaine.com`
4. Ajoute les enregistrements DNS demandes par Resend
5. Attends que le domaine passe en statut `Verified`

Important :

- `EMAIL_FROM` doit utiliser un domaine verifie
- pour un SaaS, prefere un sous-domaine dedie comme `mail.ton-domaine.com` ou `notifications.ton-domaine.com`
- evite les adresses `no-reply@` si tu veux une meilleure delivrabilite

## 3. Ajouter les variables dans `.env`

Ajoute ou complete ces variables dans [`.env`](/c:/laragon/www/saas-starter/.env) :

```env
BASE_URL=http://localhost:3000
RESEND_API_KEY=re_xxxxxxxxx
EMAIL_FROM=Mon App <notifications@mail.ton-domaine.com>
EMAIL_REPLY_TO=support@ton-domaine.com
```

Le format attendu est aussi visible dans [`.env.example`](/c:/laragon/www/saas-starter/.env.example).

Notes :

- `RESEND_API_KEY` est obligatoire
- `EMAIL_FROM` est obligatoire
- `EMAIL_REPLY_TO` est optionnel
- `BASE_URL` sert a construire les liens absolus dans les emails

## 4. Redemarrer le serveur

Apres modification du `.env`, redemarre Next.js :

```bash
pnpm dev
```

## 5. Tester en local

Le plus simple est de tester les flows deja connectes dans l'app.

### Reset de mot de passe

1. Lance l'application
2. Va sur `/forgot-password`
3. Entre l'email d'un utilisateur existant
4. Verifie que l'email est envoye

Le code passe par :

- [features/auth/lib/password-reset.ts](/c:/laragon/www/saas-starter/features/auth/lib/password-reset.ts)
- [lib/email/senders.ts](/c:/laragon/www/saas-starter/lib/email/senders.ts)

### Validation d'email

1. Lance l'application
2. Va sur `/sign-up`
3. Cree un compte avec email + mot de passe
4. Verifie que l'email de validation est envoye
5. Clique le lien puis connecte-toi

Le code passe par :

- [features/auth/lib/email-verification.ts](/c:/laragon/www/saas-starter/features/auth/lib/email-verification.ts)
- [app/(login)/verify-email/page.tsx](/c:/laragon/www/saas-starter/app/(login)/verify-email/page.tsx)
- [lib/email/senders.ts](/c:/laragon/www/saas-starter/lib/email/senders.ts)

### Invitation d'equipe

1. Connecte-toi
2. Va dans les reglages d'equipe
3. Invite un membre
4. Verifie que l'email d'invitation est envoye

Le code passe par :

- [features/team/lib/team-invitations.ts](/c:/laragon/www/saas-starter/features/team/lib/team-invitations.ts)
- [lib/email/senders.ts](/c:/laragon/www/saas-starter/lib/email/senders.ts)

### Adresse de test recommandee

Pour un test sans risque, Resend recommande d'utiliser :

```text
delivered@resend.dev
```

N'utilise pas de fausses adresses Gmail ou Outlook. Elles vont bouncer et peuvent degrader la reputation du domaine.

## 6. Mise en production

En production :

1. remplace `BASE_URL` par ton vrai domaine
2. utilise un domaine d'envoi verifie dans Resend
3. verifie SPF, DKIM et DMARC
4. commence avec un faible volume si ton domaine est neuf

Exemple :

```env
BASE_URL=https://ton-domaine.com
EMAIL_FROM=Mon App <notifications@mail.ton-domaine.com>
EMAIL_REPLY_TO=support@ton-domaine.com
```

## 7. Comment cette app envoie les emails

Cette app a deja une integration Resend simple via HTTP.

Fichiers principaux :

- [lib/email/config.ts](/c:/laragon/www/saas-starter/lib/email/config.ts)
- [lib/email/client.ts](/c:/laragon/www/saas-starter/lib/email/client.ts)
- [lib/email/templates.ts](/c:/laragon/www/saas-starter/lib/email/templates.ts)
- [lib/email/senders.ts](/c:/laragon/www/saas-starter/lib/email/senders.ts)

Le starter envoie actuellement :

- emails de validation d'email
- emails de reset de mot de passe
- emails d'invitation d'equipe

Si tu veux ajouter un nouvel email :

1. ajoute le template dans [lib/email/templates.ts](/c:/laragon/www/saas-starter/lib/email/templates.ts)
2. ajoute le sender dans [lib/email/senders.ts](/c:/laragon/www/saas-starter/lib/email/senders.ts)
3. appelle ce sender depuis la feature concernee

## 8. Problemes frequents

### `RESEND_API_KEY is not set`

Ajoute `RESEND_API_KEY` dans `.env` puis redemarre le serveur.

### `EMAIL_FROM is not set`

Ajoute `EMAIL_FROM` dans `.env` avec une adresse sur un domaine verifie.

### L'email ne part pas

Verifie :

- la cle API est correcte
- le domaine d'envoi est bien verifie dans Resend
- `EMAIL_FROM` correspond a ce domaine
- le serveur a bien ete redemarre

### Le lien dans l'email pointe vers localhost

Verifie que `BASE_URL` correspond bien a ton environnement actuel.
