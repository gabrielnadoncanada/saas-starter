# Audit Authentification & Autorisation — Edge Cases Identifies

> Date : 2026-03-17
> Scope : NextAuth, OAuth, magic link, sessions JWT, middleware, protection des routes, cycle de vie des comptes, CSRF, linking de providers

**Lien :** Les points qui touchent a la team (retrait de membre, invitations) sont detailles dans [audit-team.md](./audit-team.md).

---

## Table des priorites

| Priorite | # | Edge Case | Categorie |
|----------|---|-----------|-----------|
| **P0** | 1 | Open redirect possible — pas de `redirect` callback explicite | Securite auth |
| **P0** | 2 | Invitation IDs sequentiels et devinables | Securite auth |
| **P0** | 3 | `/post-sign-in` bypass le checkout lock et accepte un `priceId` arbitraire | Securite billing |
| **P0** | 4 | Session JWT non revoquee apres soft-delete du compte | Session |
| **P1** | 5 | Aucun rate limiting sur magic link / sign-in | Abus |
| **P1** | 6 | Email affiche sur `/check-email` — enumeration de comptes | Information leak |
| **P1** | 7 | Pas de `maxAge` explicite sur JWT/session (defaut 30 jours) | Session |
| **P1** | 8 | `allowDangerousEmailAccountLinking` actif par defaut | OAuth |
| **P1** | 9 | OAuth linking ne verifie pas `email_verified` du provider | OAuth |
| **P1** | 10 | Pas de mecanisme de recuperation de compte | Feature manquante |
| **P2** | 11 | Middleware exclut toutes les routes API du check auth | Architecture |
| **P2** | 12 | Pages dashboard protegees par layout, pas individuellement | Architecture |
| **P2** | 13 | `platformRole` expose dans le JWT (lisible client-side) | Information leak |
| **P2** | 14 | `SUPER_ADMIN` declare mais jamais enforce | Roles |
| **P2** | 15 | Sessions concurrentes illimitees, pas de revocation | Session |
| **P2** | 16 | IP jamais passee aux fonctions de log auth | Audit trail |
| **P2** | 17 | Pas de notification email lors du unlink d'un provider | UX securite |
| **P2** | 18 | `getCurrentUser()` sans cache — hit DB a chaque appel | Performance |
| **P3** | 19 | `sameSite: lax` sur le cookie `active_team_id` | CSRF |
| **P3** | 20 | Magic link : duree de validite non configuree explicitement | Token securite |
| **P3** | 21 | Timing attack sur sign-in (email existant vs inexistant) | Enumeration |

---

## P0 — Critique

### 1. Open redirect possible — pas de `redirect` callback explicite

**Fichiers :**
- `auth.ts:18` (callbacks — pas de `redirect` callback)
- `features/auth/components/AuthForm.tsx:66-67` (OAuth `signIn`)
- `features/auth/components/AuthForm.tsx:86-89` (magic link `signIn`)
- `features/account/components/settings/LinkedAccountsCard.tsx:65-66`

**Probleme :** Apres auth (OAuth ou magic link), le `redirectTo` est construit a partir des query params de l'URL et passe a `signIn()` :

```typescript
const callbackUrl = getPostSignInCallbackUrl({
  redirect,   // vient de ?redirect=...
  priceId,    // vient de ?priceId=...
  inviteId,   // vient de ?inviteId=...
});

await signIn(provider, { redirectTo: callbackUrl });
```

NextAuth v5 valide par defaut que le `callbackUrl` est du meme origin, **SAUF** si un `redirect` callback custom est defini. Ici aucun `redirect` callback n'est configure dans `authCallbacks` — NextAuth utilise son comportement par defaut (safe pour le moment).

**Pourquoi c'est P0 malgre tout :**
1. L'absence de callback explicite est fragile — un developpeur qui ajoute un `redirect` callback sans restriction ouvre une faille immediatement
2. Le `LinkedAccountsCard` passe un `redirectTo` avec un `provider` qui vient du state client
3. C'est un des vecteurs de phishing les plus exploites (OAuth open redirect → token vol)

**Fix propose :**
```typescript
// auth.ts — ajouter un redirect callback explicite et restrictif
callbacks: {
  ...authCallbacks,
  async redirect({ url, baseUrl }) {
    if (url.startsWith('/')) return `${baseUrl}${url}`;
    if (new URL(url).origin === baseUrl) return url;
    return baseUrl;
  },
},
```

---

### 2. Invitation IDs sequentiels et devinables

**Fichiers :**
- `prisma/models/teams.prisma` (`Invitation: id Int @id @default(autoincrement())`)
- `shared/lib/email/templates.ts:18-19` (URL avec `inviteId`)
- `features/auth/server/complete-post-sign-in.ts:29-39` (lookup par ID)

**Probleme :** L'invitation utilise un ID auto-incremente comme identifiant dans l'URL :

```
/sign-in?inviteId=42
```

Le lookup dans `completePostSignIn` :
```typescript
const invitation = await db.invitation.findFirst({
  where: {
    id: invitationId,   // ID sequentiel, devinable
    email,              // seule protection
    status: "PENDING",
  },
});
```

**Vulnerabilites :**
1. **Enumeration triviale** — `inviteId=1`, `inviteId=2`, etc.
2. **Information disclosure** — le nombre d'invitations dans le systeme est inferable
3. La protection repose uniquement sur le match `email`. Si l'attaquant controle l'email cible (compromis ou recycle), il peut accepter n'importe quelle invitation

**Scenario d'attaque :**
1. L'attaquant cree un compte avec `alice@company.com` (email compromis)
2. Il navigue vers `/sign-in?inviteId=1`, `inviteId=2`, etc.
3. Le `completePostSignIn` matche des qu'un ID correspond a une invitation PENDING pour cet email
4. L'attaquant est ajoute a la team cible

**Fix propose :**
```prisma
model Invitation {
  id        Int    @id @default(autoincrement())
  token     String @unique @default(uuid()) @db.VarChar(36)
  // ...
}
```
```typescript
// URL : /sign-in?inviteToken=a1b2c3d4-e5f6-...
// Lookup : where: { token: inviteToken, email, status: "PENDING" }
```

---

### 3. `/post-sign-in` bypass le checkout lock et accepte un `priceId` arbitraire

**Fichier :** `app/post-sign-in/page.tsx:30-71`

**Probleme :** La page `/post-sign-in` declenche un checkout Stripe directement si les query params `redirect=checkout&priceId=XXX` sont presents :

```typescript
if (authRedirect === 'checkout' && priceId) {
  const team = await db.team.findUnique({ where: { id: teamId }, ... });

  if (membership?.role !== 'OWNER') {
    redirect(routes.app.dashboard);
  }

  const url = await createCheckoutSession({
    priceId,        // ← vient directement de l'URL
    teamId: team.id,
    seatQuantity: team._count.teamMembers,
    stripeCustomerId: team.stripeCustomerId,
    userEmail: user.email,
  });
  redirect(url);
}
```

**3 problemes combines :**

1. **Pas de `reserveCheckoutForTeam`** — Ce path bypasse completement le mecanisme de checkout lock (`checkout-lock.ts`). Un utilisateur pourrait initier plusieurs checkouts simultanement en ouvrant `/post-sign-in?redirect=checkout&priceId=XXX` dans plusieurs onglets.

2. **`priceId` non valide** — N'importe quel `priceId` Stripe peut etre passe. `createCheckoutSession` verifie que le prix est actif, mais un attaquant pourrait passer un prix a $0.01 d'un autre product dans le meme compte Stripe.

3. **Pas de `pendingCheckoutPriceId`** — Le checkout normal stocke le `priceId` en attente pour eviter les conflits. Ce path ne le fait pas.

**Impact :**
- Double checkout possible
- Prix arbitraire injecte
- Race condition avec le checkout standard (`checkoutAction`)

**Fix propose :**
```typescript
if (authRedirect === 'checkout' && priceId) {
  if (membership?.role !== 'OWNER') {
    redirect(routes.app.dashboard);
  }

  try {
    await reserveCheckoutForTeam(team.id, priceId);

    const url = await createCheckoutSession({ ... });
    redirect(url);
  } catch (error) {
    if (error instanceof CheckoutInProgressError) {
      redirect(routes.app.settingsTeam);
    }
    await clearCheckoutReservation(team.id);
    throw error;
  }
}
```

---

### 4. Session JWT non revoquee apres soft-delete du compte

**Fichiers :**
- `features/account/server/delete-account.ts:31-46`
- `shared/lib/auth/callbacks.ts:29-37`
- `shared/lib/auth/active-user.ts:17`

**Probleme :** Quand un compte est soft-delete :
1. `deletedAt` est set sur le user
2. Les `sessions` et `accounts` DB sont supprimes dans la transaction

**MAIS** la strategie est `jwt` :
- Les sessions DB (`Session` table) ne sont **pas utilisees** avec la strategie JWT
- Le JWT reste valide en cookie jusqu'a expiration
- `getActiveAuthUserById` dans le JWT callback retournera `null` (car `deletedAt` est set), ce qui invalide le token **au prochain refresh**
- Mais entre le delete et le refresh, le user peut encore faire des requetes

**Attenuation partielle :** `getCurrentUser()` fait un `findFirst({ where: { deletedAt: null } })` — les server actions et API routes bloquent l'ex-user. Mais le layout dashboard rendra brievement avec l'ancien JWT.

**Impact :**
- Fenetre de vulnerabilite entre soft-delete et prochain JWT refresh
- Avec le `maxAge` par defaut de 30 jours (#7), cette fenetre peut etre tres longue si le user ne rafraichit pas la page

**Fix propose :**
```typescript
// Dans deleteAccount, apres la transaction — forcer clear cookie
import { cookies } from 'next/headers';

const cookieStore = await cookies();
cookieStore.delete('next-auth.session-token');
cookieStore.delete('__Secure-next-auth.session-token');

// Et configurer un maxAge court (#7)
```

---

## P1 — Important

### 5. Aucun rate limiting sur magic link / sign-in

**Fichiers :**
- `features/auth/components/AuthForm.tsx:82-107` (envoi magic link)
- `features/auth/components/ResendMagicLinkButton.tsx:28-53` (resend)
- `shared/lib/auth/providers.ts:84-106` (Resend provider)

**Probleme :** Aucune limitation de debit n'existe sur :
- Les demandes de magic link
- Les tentatives OAuth
- Le bouton "Resend a new one" sur `/check-email`

**Impact :**
- **DoS sur Resend** — un attaquant envoie des milliers de magic links → epuise le quota ou facture
- **Spam** — utiliser le systeme comme relai d'email vers n'importe quelle adresse
- **Brute force d'invitation IDs** — combiner avec le point #2
- **Enumeration** — tester des milliers d'emails

**Fix propose :**
```typescript
// Rate limiter par IP et par email
// Per IP : max 5 magic links / minute, max 20 / heure
// Per email : max 3 magic links / heure
// Utiliser @upstash/ratelimit ou similaire
```

---

### 6. Email affiche sur `/check-email` — enumeration de comptes

**Fichier :** `app/(auth)/check-email/page.tsx:30-32`

**Probleme :** L'email est affiche en clair sur la page et passe dans l'URL :

```typescript
{email
  ? `We sent a magic sign-in link to ${email}.`
  : 'We sent a magic sign-in link to your email address.'}
```

L'URL est de la forme : `/check-email?email=user@example.com`

1. **L'email est dans l'URL** — visible dans l'historique, server logs, referrer headers, analytics
2. **Reflexion XSS potentielle** — si l'email n'est pas correctement echappe (ici c'est React donc safe, mais le pattern est risque)

**Nuance :** NextAuth envoie un magic link meme pour un email inexistant (cree un nouveau user). Donc ca ne confirme pas directement l'existence d'un compte. Mais le pattern expose l'email dans des endroits non voulus.

**Fix propose :**
- Message generique : `"We've sent a sign-in link to your email address."`
- Ne pas passer l'email dans l'URL — utiliser un identifiant opaque si besoin de personnaliser

---

### 7. Pas de `maxAge` explicite sur JWT/session (defaut 30 jours)

**Fichier :** `auth.ts:11-13`

**Probleme :**
```typescript
session: {
  strategy: "jwt",
  // Pas de maxAge → defaut NextAuth = 30 jours
  // Pas de updateAge → defaut = 24h
},
```

Un JWT vole reste valide pendant **30 jours**. Meme apres un sign-out, le token est juste supprime du cookie — s'il a ete copie, il fonctionne toujours.

**Impact :**
- Fenetre d'exploitation enorme en cas de vol de token
- Aggrave tous les autres problemes de revocation (#4, #15)

**Fix propose :**
```typescript
session: {
  strategy: "jwt",
  maxAge: 24 * 60 * 60,     // 24 heures
  updateAge: 60 * 60,        // Rafraichir toutes les heures
},
```

---

### 8. `allowDangerousEmailAccountLinking` actif par defaut

**Fichier :** `shared/lib/auth/providers.ts:22-23`

**Probleme :**
```typescript
const allowEmailAccountLinking =
  process.env.ALLOW_DANGEROUS_EMAIL_ACCOUNT_LINKING !== "false";
```

Le linking est ON par defaut — il faut explicitement mettre `"false"` dans l'env pour desactiver. C'est l'inverse du principe de securite par defaut.

Les commentaires dans le code disent :
> "This is safe only because both Google and GitHub return verified email addresses."

**Risques :**
1. Si un nouveau provider est ajoute (ex: Discord qui ne verifie pas toujours les emails), le linking s'applique aussi
2. Aucun check dans le code ne verifie `email_verified` (voir #9)
3. Le nom de la variable contient "dangerous" — mauvaise valeur par defaut

**Fix propose :**
```typescript
// Inverser le defaut : off par defaut, opt-in explicite
const allowEmailAccountLinking =
  process.env.ALLOW_EMAIL_ACCOUNT_LINKING === "true";
```

---

### 9. OAuth linking ne verifie pas `email_verified` du provider

**Fichiers :**
- `shared/lib/auth/callbacks.ts:5-18` (signIn callback)
- `shared/lib/auth/providers.ts`

**Probleme :** Le callback `signIn` verifie que le user existe et n'est pas soft-deleted, mais ne verifie **pas** si l'email retourne par le provider est verifie :

```typescript
async signIn({ user }) {
  const userId = Number(user.id);
  const activeUser = await getActiveAuthUserById(userId);
  if (!activeUser) return false;
  return true;
  // Pas de check profile.email_verified
}
```

**Scenario d'attaque :**
1. Provider OAuth retourne `email_verified: false` pour `victim@company.com`
2. Avec `allowDangerousEmailAccountLinking` (defaut ON), le compte est lie automatiquement
3. L'attaquant a acces au compte de la victime

**Fix propose :**
```typescript
async signIn({ user, account, profile }) {
  if (account?.provider !== 'resend') {
    const emailVerified = profile?.email_verified ?? profile?.verified_email;
    if (emailVerified === false) {
      return false;
    }
  }
  // ... suite du callback
}
```

---

### 10. Pas de mecanisme de recuperation de compte

**Probleme :** Le systeme est 100% passwordless (magic link + OAuth). Si un utilisateur :
1. Perd l'acces a son email (compte compromis, provider ferme)
2. Et n'a pas de provider OAuth lie
3. → Compte **irrecuperable**

Le champ `phoneNumber` existe dans le schema User mais n'est pas utilise pour l'auth.

**Impact :**
- Perte d'acces permanente au compte et aux donnees
- Si l'unique OWNER → team orphelinee (voir audit-team.md #2)

**Fix propose :**
- Flow de recuperation via support (verification manuelle)
- Utiliser `phoneNumber` comme second facteur de recuperation
- Codes de backup a la creation du compte
- TOTP/authenticator app en option

---

## P2 — Qualite

### 11. Middleware exclut toutes les routes API du check auth

**Fichier :** `middleware.ts:22-25`

**Probleme :**
```typescript
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

Le matcher exclut tout `/api/*` du middleware. Etat actuel :

| Route | Auth check | Status |
|-------|-----------|--------|
| `/api/auth/[...nextauth]` | Gere par NextAuth | OK |
| `/api/assistant` | `getCurrentUser()` | OK |
| `/api/assistant/conversations` | `resolveAssistantConversationScope()` | OK |
| `/api/assistant/conversations/[id]` | `resolveAssistantConversationScope()` | OK |
| `/api/stripe/checkout` | **AUCUN** | VULNERABLE |
| `/api/stripe/webhook` | Signature Stripe (pas d'auth user) | OK |

Chaque nouvelle route API doit penser a ajouter l'auth. Une seule oubliee = data leak.

**Fix propose :** Middleware API avec auth par defaut, opt-out explicite pour les routes publiques (webhook).

---

### 12. Pages dashboard protegees par layout, pas individuellement

**Fichier :** `app/(app)/dashboard/layout.tsx:25-28`

**Probleme :** La protection auth est dans le layout :
```typescript
const user = await getCurrentUser();
if (!user) {
  redirect(routes.auth.login);
}
```

Les pages enfant (tasks, assistant) ne refont pas le check. Certaines pages (settings/account, settings/authentication) le refont — inconsistance.

**Risques :**
1. Si une page est deplacee hors du layout, elle perd sa protection
2. Les layouts Next.js ne sont pas re-rendus a chaque navigation client-side

**Impact :** Faible — pattern standard Next.js. Mais defense-in-depth recommande un check explicite.

---

### 13. `platformRole` expose dans le JWT (lisible client-side)

**Fichier :** `shared/lib/auth/callbacks.ts:25-26, 40`

**Probleme :**
```typescript
token.platformRole = activeUser.platformRole;
```

Les JWT NextAuth sont signes mais **pas encryptes** (base64). N'importe quel code client peut decoder le token et voir `platformRole`. Si un user est `SUPER_ADMIN`, cette info est visible.

**Impact :**
- Information disclosure (un attaquant sait qui est admin)
- Encourage les devs a faire des checks cote client au lieu du serveur

**Fix propose :** Ne garder que `userId` dans le JWT, verifier `platformRole` en DB cote serveur.

---

### 14. `SUPER_ADMIN` declare mais jamais enforce

**Fichiers :**
- `prisma/models/auth.prisma:1-6` (enum PlatformRole)
- Aucune route ne verifie `platformRole`

**Probleme :** Le role `SUPER_ADMIN` est defini, passe dans le JWT, expose dans la session, mais **jamais verifie** par aucune route ou action. Le commentaire dans le schema dit :

```
// Extension point: SUPER_ADMIN is wired through auth callbacks
// but no routes check it yet.
```

**Impact :** Dead code qui ajoute de la surface d'attaque sans benefice.

**Fix propose :** Implementer des guards admin ou supprimer le role jusqu'a ce qu'il soit necessaire.

---

### 15. Sessions concurrentes illimitees, pas de revocation

**Probleme :** Avec la strategie JWT stateless :
- Nombre illimite de sessions paralleles
- Pas de "Deconnecter tous les appareils"
- Un token vole ne peut pas etre revoque (valide 30 jours par defaut)
- `signOut()` ne fait que supprimer le cookie local

**Impact :**
- Token vole = acces pendant toute la duree de validite
- Pas de visibilite sur les sessions actives

**Fix propose :**
```typescript
// Option 1 : strategie "database"
session: { strategy: "database" }
// Permet revocation, mais +1 hit DB par requete

// Option 2 : "session version" dans le user
// JWT contient la version, callback verifie le match
// Incrementer la version = invalider toutes les sessions
```

---

### 16. IP jamais passee aux fonctions de log auth

**Fichiers :**
- `shared/lib/auth/activity.ts:7,16` (parametre `ipAddress = ""`)
- `shared/lib/auth/events.ts:16` (appel sans IP)

**Probleme :**
```typescript
// events.ts — appel sans IP
await logUserSignIn(userId);

// activity.ts — defaut vide
export async function logUserSignIn(userId: number, ipAddress = "") { ... }
```

Les events NextAuth n'ont pas acces au `request` object, donc l'IP n'est pas disponible dans ce contexte.

**Impact :** Impossible de detecter des connexions suspectes, pas de geo-fencing, pas d'alerte "nouvel appareil".

**Fix propose :** Deplacer le logging dans le callback `signIn` qui pourrait avoir acces aux headers (selon la version de NextAuth), ou dans le middleware.

---

### 17. Pas de notification email lors du unlink d'un provider

**Fichier :** `features/account/server/linked-accounts.ts:61-100`

**Probleme :** Quand un provider OAuth est unlinke, aucun email de notification n'est envoye. Si un attaquant a acces temporaire au compte et unlinke le provider du vrai proprietaire, celui-ci n'est pas alerte.

**Protection existante :** `unlinkOAuthAccountForUser` verifie qu'on ne peut pas unlinkle dernier provider (si pas de magic link). Mais unlinkle "premier" provider (tout en gardant le deuxieme) est silencieux.

**Impact :** Account takeover preparation silencieuse.

**Fix propose :** Envoyer un email : "Votre compte {Provider} a ete delie. Si ce n'etait pas vous, contactez le support."

---

### 18. `getCurrentUser()` sans cache — hit DB a chaque appel

**Fichier :** `shared/lib/auth/get-current-user.ts`

**Probleme :**
```typescript
export async function getCurrentUser() {
  const session = await auth();
  const userId = Number(session?.user?.id);
  // ...
  return db.user.findFirst({ where: { id: userId, deletedAt: null } });
}
```

Chaque appel fait `auth()` + `db.user.findFirst()`. Dans une meme requete, si le layout, la page, et un composant serveur appellent tous `getCurrentUser()`, ca fait 3 hits DB.

**Impact :** Performance et charge DB. Pas un bug de securite, mais un cout.

**Fix propose :**
```typescript
import { cache } from 'react';

export const getCurrentUser = cache(async () => {
  const session = await auth();
  // ...
});
```

---

## P3 — Ameliorations

### 19. `sameSite: lax` sur le cookie `active_team_id`

**Fichier :** `features/teams/server/active-team.ts:27-28`

**Probleme :**
```typescript
cookieStore.set(ACTIVE_TEAM_COOKIE, String(teamId), {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
});
```

`sameSite: 'lax'` permet l'envoi du cookie lors de navigations top-level (GET) depuis un site externe. Ce n'est pas directement exploitable (le cookie est juste un teamId, pas un token d'auth), mais `strict` eliminerait ce vecteur.

**Fix propose :** `sameSite: 'strict'`

---

### 20. Magic link : duree de validite non configuree explicitement

**Fichier :** `shared/lib/auth/providers.ts` (ResendProvider)

**Probleme :** La configuration du ResendProvider ne specifie pas de `maxAge` pour le token magic link. NextAuth utilise son defaut (probablement 24h).

Le schema `VerificationToken` a un champ `expires` — NextAuth gere correctement l'expiration et le rejeu (le token est supprime apres utilisation). Mais 24h est long pour un lien par email.

**Fix propose :**
```typescript
ResendProvider({
  apiKey: process.env.RESEND_API_KEY,
  from: process.env.EMAIL_FROM,
  maxAge: 10 * 60, // 10 minutes
  // ...
})
```

---

### 21. Timing attack sur sign-in (email existant vs inexistant)

**Probleme :** Quand un magic link est demande :
- **Email existant** : NextAuth cherche le user, genere un token, envoie l'email
- **Email inexistant** : NextAuth cree un nouveau user, genere un token, envoie l'email

Le temps de reponse pourrait theoriquement differer (creation = plus de queries).

**Attenuation :** Les deux paths envoient un email → reponse similaire. L'UI ne distingue pas les cas. L'API Resend ajoute de la latence variable qui masque la difference.

**Impact :** Tres faible — theorique, difficile a exploiter en pratique.

---

## Resume des actions

### Corrections immediates (P0) — 4 items
| # | Description | Effort |
|---|-------------|--------|
| 1 | Ajouter un `redirect` callback explicite dans NextAuth config | Faible |
| 2 | Remplacer les invitation IDs sequentiels par des UUID/tokens signes | Moyen |
| 3 | Ajouter checkout lock + validation `priceId` dans `/post-sign-in` | Moyen |
| 4 | Forcer clear cookie JWT lors du soft-delete de compte | Faible |

### Sprint suivant (P1) — 6 items
| # | Description | Effort |
|---|-------------|--------|
| 5 | Rate limiting sur magic link et sign-in (IP + email) | Moyen |
| 6 | Ne plus afficher l'email sur `/check-email` | Faible |
| 7 | Configurer `maxAge: 86400` et `updateAge: 3600` sur la session JWT | Faible |
| 8 | Inverser le defaut de `allowDangerousEmailAccountLinking` (off par defaut) | Faible |
| 9 | Verifier `email_verified` du provider dans le callback `signIn` | Faible |
| 10 | Definir une strategie de recuperation de compte | Decision produit |

### Backlog (P2) — 8 items
| # | Description | Effort |
|---|-------------|--------|
| 11 | Inclure les routes API dans le middleware auth (opt-out pour webhook) | Moyen |
| 12 | Ajouter check auth explicite dans chaque page dashboard | Faible |
| 13 | Retirer `platformRole` du JWT, verifier en DB uniquement | Faible |
| 14 | Implementer ou supprimer `SUPER_ADMIN` | Decision produit |
| 15 | Revocation de sessions (session version ou strategie database) | Eleve |
| 16 | Passer l'IP aux fonctions de log auth | Moyen |
| 17 | Email de notification lors du unlink d'un provider | Faible |
| 18 | Cache `getCurrentUser()` avec `React.cache()` | Faible |

### Ameliorations (P3) — 3 items
| # | Description | Effort |
|---|-------------|--------|
| 19 | `sameSite: 'lax'` → `'strict'` sur `active_team_id` | Faible |
| 20 | Configurer `maxAge: 600` (10 min) sur le magic link token | Faible |
| 21 | Timing attack sign-in : risque negligeable, aucune action requise | Aucun |
