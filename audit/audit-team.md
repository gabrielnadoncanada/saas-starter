# Audit Multi-Tenant — Edge Cases Identifies

> Date : 2026-03-17
> Scope : isolation des tenants, gestion des teams, billing, invitations, cycle de vie des comptes, securite auth, Stripe

---

## Table des priorites

| Priorite | # | Edge Case | Categorie |
|----------|---|-----------|-----------|
| **P0** | 1 | Suppression de compte ne nettoie qu'une seule team | Cycle de vie |
| **P0** | 2 | Owner peut orpheliner une team en supprimant son compte | Cycle de vie |
| **P0** | 8 | Race condition sur acceptation d'invitation vs seat limit | Concurrence |
| **P0** | 14 | Session JWT active apres retrait d'un membre | Securite auth |
| **P0** | 15 | Checkout finalization sans authentification | Securite billing |
| **P0** | 16 | Race condition removal + seat sync (non-atomique) | Concurrence |
| **P0** | 29 | priceId non valide : checkout avec un prix arbitraire (client trust) | Billing |
| **P1** | 3 | Pas de transfert d'ownership | Feature manquante |
| **P1** | 4 | Pas de fonctionnalite "quitter une team" | Feature manquante |
| **P1** | 7 | Pas d'expiration des invitations | Securite |
| **P1** | 11 | Account deletion policy ne regarde que la team active | Cycle de vie |
| **P1** | 17 | Plan downgrade sans enforcement retroactif des quotas | Billing |
| **P1** | 18 | Email header injection via team name | Securite |
| **P1** | 19 | Email recycle : ancien invite re-accepte via nouvelle inscription | Securite auth |
| **P1** | 27 | OWNER peut se retirer lui-meme via Remove member | Cycle de vie |
| **P1** | 28 | Team peut atteindre 0 membres (dernier membre retire) | Cycle de vie |
| **P2** | 5 | On peut inviter quelqu'un comme OWNER | Roles |
| **P2** | 6 | Le role ADMIN ne sert a rien | Roles |
| **P2** | 9 | Pas de suppression de team | Feature manquante |
| **P2** | 12 | Invitations fantomes apres suppression de l'inviteur | Cycle de vie |
| **P2** | 10 | Donnees fantomes apres suppression de membre | Cycle de vie |
| **P2** | 20 | Changements billing non logges (webhooks) | Audit trail |
| **P2** | 21 | IP address jamais capturee dans les activity logs | Audit trail |
| **P2** | 22 | syncSeatQuantity echoue silencieusement | Billing |
| **P2** | 23 | Pas de rate limiting sur les API routes | Securite |
| **P3** | 13 | Middleware ne valide pas le contexte de team | Architecture |
| **P3** | 24 | Plan invalide en DB cause un crash (pas de fallback) | Resilience |
| **P3** | 25 | Checkout lock timeout trop court (30 min) | Billing |
| **P3** | 26 | Schema Zod invitation exclut ADMIN des roles | Roles |

---

## P0 — Critique

### 1. Suppression de compte ne nettoie qu'une seule team

**Fichier :** `features/account/server/delete-account.ts:52-58`

**Probleme :** La suppression de compte ne retire le membership que de la team **active** (celle dans le cookie `active_team_id`). Si un user est membre de 3 teams, les 2 autres memberships restent en base comme des enregistrements fantomes.

**Impact :**
- Les ex-membres apparaissent toujours dans les listes de membres des autres teams
- Le compteur de seats Stripe reste faux (sur-facturation)
- Les donnees du user soft-deleted restent liees aux teams

**Code actuel :**
```typescript
if (membership?.teamId) {
  await tx.teamMember.deleteMany({
    where: {
      userId: user.id,
      teamId: membership.teamId, // <-- ne supprime que la team active
    },
  });
}
```

**Fix propose :**
```typescript
// 1. Recuperer TOUTES les teams du user avant suppression
const allMemberships = await tx.teamMember.findMany({
  where: { userId: user.id },
  select: { teamId: true },
});

// 2. Supprimer tous les memberships
await tx.teamMember.deleteMany({
  where: { userId: user.id },
});

// 3. Sync seat quantity pour chaque team (apres la transaction)
for (const m of allMemberships) {
  await syncSeatQuantity(m.teamId);
}
```

---

### 2. Owner peut orpheliner une team en supprimant son compte

**Fichier :** `features/teams/server/account-deletion-policy.ts`

**Probleme :** La policy de suppression ne bloque que si le user est le **dernier membre** d'une team avec un abonnement actif. Mais si la team a 3 membres et que l'OWNER supprime son compte, la team se retrouve **sans owner**. Plus personne ne peut :
- Inviter de nouveaux membres
- Retirer des membres
- Gerer la facturation
- Annuler l'abonnement

**Impact :**
- Team inutilisable sans owner
- Abonnement Stripe qui continue a facturer sans que personne ne puisse l'annuler
- Perte de revenus potentielle (chargebacks, support tickets)

**Fix propose :**
```typescript
export async function getAccountDeletionBlocker(userId: number) {
  // Verifier TOUTES les teams ou le user est OWNER
  const ownedTeams = await db.teamMember.findMany({
    where: { userId, role: "OWNER" },
    include: {
      team: {
        select: {
          id: true,
          name: true,
          subscriptionStatus: true,
          _count: { select: { teamMembers: true } },
        },
      },
    },
  });

  for (const membership of ownedTeams) {
    const team = membership.team;
    const hasOtherOwners = await db.teamMember.count({
      where: {
        teamId: team.id,
        role: "OWNER",
        userId: { not: userId },
      },
    });

    if (hasOtherOwners === 0 && team._count.teamMembers > 1) {
      return `Vous etes le seul owner de "${team.name}". Transferez l'ownership avant de supprimer votre compte.`;
    }

    if (hasOtherOwners === 0 && hasActiveSubscription(team)) {
      return `Annulez l'abonnement de "${team.name}" avant de supprimer votre compte.`;
    }
  }

  return null;
}
```

---

### 8. Race condition sur acceptation d'invitation vs seat limit

**Fichier :** `features/auth/server/complete-post-sign-in.ts:59-61`

**Probleme :** Le check de limite de seats est fait **avant** la transaction, mais la creation du `TeamMember` est faite **dans** la transaction. Si 2 invites acceptent simultanement :
1. User A verifie : 4/5 seats utilises → OK
2. User B verifie : 4/5 seats utilises → OK
3. User A cree son membership → 5/5
4. User B cree son membership → 6/5 (limite depassee)

**Code actuel :**
```typescript
// Check HORS transaction
const invitedTeamPlan = resolveTeamPlan(invitedTeam);
assertCapability(invitedTeamPlan, "team.invite");
assertLimit(invitedTeamPlan, "teamMembers", invitedTeam._count.teamMembers);

// Creation DANS transaction
await db.$transaction(async (tx) => {
  await tx.teamMember.create({ ... });
});
```

**Fix propose :** Deplacer le check dans la transaction avec un lock pessimiste :
```typescript
await db.$transaction(async (tx) => {
  // Lock la team pour eviter les race conditions
  await tx.$queryRaw`SELECT id FROM "Team" WHERE id = ${invitation.teamId} FOR UPDATE`;

  const team = await tx.team.findUnique({
    where: { id: invitation.teamId },
    select: {
      planId: true,
      _count: { select: { teamMembers: true } },
    },
  });

  const plan = resolveTeamPlan(team);
  assertLimit(plan, "teamMembers", team._count.teamMembers);

  await tx.teamMember.create({ ... });
  await tx.invitation.update({ ... });
});
```

---

### 14. Session JWT active apres retrait d'un membre

**Fichiers :**
- `shared/lib/auth/callbacks.ts:21-43` (JWT callback)
- `shared/lib/auth/active-user.ts` (validation user)
- `features/teams/actions/remove-team-member.action.ts`

**Probleme :** Quand un membre est retire d'une team via `removeTeamMemberAction`, son token JWT reste valide. Le JWT callback (`callbacks.ts:33`) appelle `getActiveAuthUserById()` qui verifie seulement si le user est soft-deleted — PAS s'il a encore un membership dans la team.

Le cookie `active_team_id` pointe toujours vers l'ancienne team. Jusqu'a expiration du JWT, l'ex-membre peut potentiellement continuer a faire des requetes. Les guards applicatifs (`requireTeamRole`, `getUserTeamMembership`) le bloqueront puisque le `TeamMember` n'existe plus, mais :
- Il y a une fenetre de temps ou le user pense encore avoir acces
- Certaines routes qui lisent le cookie directement sans revalidation pourraient leaker des donnees

**Impact :**
- Fenetre de vulnerabilite entre le retrait et l'expiration du JWT
- L'ex-membre n'est pas force a se re-authentifier

**Fix propose :**
```typescript
// Option 1 : Invalider la session en supprimant les sessions DB
// Dans remove-team-member.action.ts, apres deleteMany :
await db.session.deleteMany({ where: { userId: removedMemberId } });

// Option 2 : Ajouter un "teamMembershipVersion" au JWT
// Incrementer a chaque changement de membership
// Le JWT callback compare la version → force refresh si mismatch
```

---

### 15. Checkout finalization sans authentification

**Fichier :** `app/api/stripe/checkout/route.ts`

**Probleme :** La route `GET /api/stripe/checkout?session_id=XXX` n'a aucun check d'authentification. N'importe qui possedant un `session_id` Stripe peut declencher la finalisation du checkout.

Le `session_id` est passe dans l'URL (query parameter), ce qui signifie qu'il apparait dans :
- Les logs du serveur
- L'historique du navigateur
- Les referrer headers si l'utilisateur navigue ensuite vers un site externe
- Les outils de monitoring/analytics

**Code actuel :**
```typescript
// app/api/stripe/checkout/route.ts
export async function GET(request: NextRequest) {
  const sessionId = searchParams.get('session_id');
  // Aucun check auth → finalizeCheckoutSession directement
  await finalizeCheckoutSession(sessionId);
}
```

**Attenuation existante :** `ProcessedStripeCheckout` empeche le double-processing, et le `session_id` est un token Stripe opaque (non devinable). Mais c'est du security-by-obscurity.

**Fix propose :**
```typescript
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(new URL(routes.auth.login, request.url));
  }
  // ... reste du code
}
```

---

### 16. Race condition removal + seat sync (non-atomique)

**Fichier :** `features/teams/actions/remove-team-member.action.ts:23-30`

**Probleme :** La suppression du membre et la synchronisation Stripe sont deux operations separees, pas dans une transaction :

```typescript
// Etape 1 : supprime le membre
await db.teamMember.deleteMany({
  where: { id: memberId, teamId: guard.teamId },
});

// Etape 2 : sync Stripe (HORS transaction)
await syncSeatQuantity(guard.teamId);
```

Si un autre membre rejoint entre l'etape 1 et l'etape 2, `syncSeatQuantity` comptera le nouveau membre mais pas l'ancien. Le count Stripe sera faux.

De plus, si `syncSeatQuantity` echoue (Stripe down, timeout), le membership est deja supprime mais Stripe continue a facturer l'ancien nombre de seats.

**Impact :**
- Desynchronisation entre le nombre reel de membres et la facturation Stripe
- Sur-facturation ou sous-facturation possible

**Fix propose :** Le meme pattern s'applique a `completePostSignIn` (ligne 96). Les deux doivent etre rendus atomiques :
```typescript
await db.$transaction(async (tx) => {
  await tx.teamMember.deleteMany({ where: { id: memberId, teamId } });
  // ... le sync devrait au minimum utiliser le count de la transaction
});
// sync Stripe apres (avec retry si echec)
await syncSeatQuantityWithRetry(teamId);
```

---

### 29. priceId non valide : checkout avec un prix arbitraire (client trust)

**Fichiers :**
- `features/billing/actions/checkout.action.ts` (priceId depuis `formData.get("priceId")`)
- `features/billing/server/create-checkout-session.ts` (aucune allowlist)
- `app/post-sign-in/page.tsx` (priceId depuis searchParams)

**Probleme :** Le serveur accepte un `priceId` envoye par le client (formulaire ou query) et appelle directement `stripe.prices.retrieve(priceId)` puis cree une session Checkout. Aucune verification que ce `priceId` fait partie des prix **autorises** (ceux affiches sur la page pricing, issus du catalogue Stripe de l'app). Tout prix **actif** existant dans le meme compte Stripe peut etre utilise.

**Impact :**
- Un attaquant peut substituer un autre `price_id` (ex. prix de test a 0,01 EUR, ou ancien plan moins cher) et lancer un checkout a ce prix pour sa team.
- Perte de revenus ; abus billing.

**Code actuel :**
```typescript
// checkout.action.ts
const priceId = formData.get("priceId") as string;
// ...
const url = await createCheckoutSession({ priceId, teamId, ... });

// create-checkout-session.ts — aucune allowlist
const price = await deps.stripe.prices.retrieve(params.priceId, { expand: ["product"] });
```

**Fix propose :**
1. Construire une allowlist des price IDs autorises pour le checkout (ex. meme source que la page pricing : `getStripePrices()` ou env `STRIPE_PRICE_PRO_MONTHLY`, etc.).
2. Avant `createCheckoutSession`, valider `allowedPriceIds.includes(priceId)`.
3. Si le catalogue vient de Stripe (getStripePrices), valider que le priceId est bien dans la liste retournee pour eviter l'usage d'un prix "cache" ou de test.

---

## P1 — Important

### 3. Pas de transfert d'ownership

**Probleme :** Il n'existe aucun mecanisme pour transferer le role OWNER a un autre membre de la team. C'est un prerequis pour que le point #2 soit resolvable proprement.

**Impact :**
- Un OWNER est piege pour toujours dans sa team
- Impossible de deleguer le controle administratif
- Bloque la suppression de compte (si on corrige le point #2)

**Action requise :** Creer une action `transferOwnership(fromUserId, toUserId, teamId)` qui :
1. Verifie que le `fromUser` est bien OWNER
2. Verifie que le `toUser` est bien membre de la team
3. Dans une transaction : passe le `toUser` a OWNER et le `fromUser` a ADMIN
4. Log l'activite

---

### 4. Pas de fonctionnalite "quitter une team"

**Probleme :** Un MEMBER ou ADMIN ne peut pas quitter une team volontairement. Seul l'OWNER peut retirer des membres via `removeTeamMemberAction`.

**Impact :**
- Un user ajoute a une team par erreur ne peut pas s'en retirer
- Friction inutile (doit demander a l'OWNER de le retirer)

**Action requise :** Creer une action `leaveTeam(userId, teamId)` qui :
1. Verifie que le user n'est pas le seul OWNER (sinon bloquer)
2. Supprime le `TeamMember`
3. Sync les seats Stripe
4. Si c'etait la team active, switch vers la premiere team restante
5. Log l'activite

---

### 7. Pas d'expiration des invitations

**Fichier :** `prisma/models/teams.prisma` (modele `Invitation`)

**Probleme :** Les invitations PENDING restent eternellement en base. Un lien d'invitation envoye il y a 6 mois fonctionne toujours. C'est un risque de securite (un email compromis longtemps apres l'envoi pourrait etre utilise).

**Impact :**
- Risque de securite : acces non autorise via un vieux lien
- Invitations fantomes qui comptent dans la limite de seats
- Confusion UI avec des invitations obsoletes

**Fix propose :**
1. Ajouter un champ `expiresAt DateTime` au modele `Invitation`
2. Le setter a `now() + 7 jours` lors de la creation
3. Verifier dans `completePostSignIn` que `invitation.expiresAt > now()`
4. Ajouter un check lazy ou un cron pour marquer les expirees comme `EXPIRED`

---

### 11. Account deletion policy ne regarde que la team active

**Fichier :** `features/teams/server/account-deletion-policy.ts`

**Probleme :** `getAccountDeletionBlocker` recoit un `membership` qui ne represente que la team active du cookie. Si un OWNER est owner de 2 teams avec des subscriptions actives, le blocker ne detecte que celle de la team active. L'autre team sera orphelinee avec une subscription Stripe qui continue a facturer.

**Impact :** Meme impact que le point #2, mais specifique au cas multi-team.

**Fix :** Fusionner avec la correction du point #2 — iterer sur toutes les teams du user, pas seulement la team active.

---

### 17. Plan downgrade sans enforcement retroactif des quotas

**Fichiers :**
- `features/billing/server/handle-subscription-change.ts`
- `features/billing/usage/usage-service.ts`
- `features/billing/guards/assert-limit.ts`

**Probleme :** Quand une team downgrade (ex: Pro → Free via Stripe), le systeme met a jour le `planId` mais ne verifie **jamais** si l'usage existant depasse les nouvelles limites.

Scenario :
1. Team Pro cree 50 tasks ce mois (limite Pro = 1000)
2. Team downgrade a Free (limite Free = 10)
3. Le downgrade reussit — aucun check
4. Les 50 tasks restent accessibles
5. La team ne peut plus creer de tasks (le check `consumeMonthlyUsage` bloque) mais conserve l'acces aux 50 existantes

**Impact :**
- Pas de data loss (les donnees restent), mais inconsistance entre plan et usage
- Un user malin pourrait creer plein de ressources en Pro puis downgrader a Free
- Pour `teamMembers` : une team Pro avec 5 membres qui downgrade a Free (limite = 1) garde ses 5 membres

**Action requise :**
- Decider d'une politique : bloquer le downgrade ? Avertir ? Retirer l'acces ?
- Pour les membres : soit forcer le retrait des membres exedentaires, soit bloquer le downgrade
- Pour les tasks/usage : l'acces en lecture seule est acceptable, mais empecher la creation

---

### 18. Email header injection via team name

**Fichier :** `shared/lib/email/templates.ts:24`

**Probleme :** Le nom de team est directement interpole dans le subject de l'email d'invitation :

```typescript
subject: `Vous êtes invité à rejoindre ${input.teamName}`,
```

Si un owner nomme sa team `"Mon Equipe\nBcc: attacker@evil.com"`, le retour a la ligne peut injecter des headers dans certains clients email/SMTP.

Le body de l'email est en React (JSX) qui auto-escape le HTML, donc pas de risque XSS. Mais le **subject** est une string brute passee directement.

**Impact :**
- Injection de headers email (Bcc, Cc, Reply-To)
- Envoi d'emails a des destinataires non prevus
- Phishing via un team name crafted

**Fix propose :**
```typescript
// Sanitizer le team name dans les emails
function sanitizeForEmailSubject(value: string) {
  return value.replace(/[\r\n]/g, ' ').trim().slice(0, 100);
}

subject: `Vous êtes invité à rejoindre ${sanitizeForEmailSubject(input.teamName)}`,
```

Et aussi valider le team name a la creation :
```typescript
// Dans le schema de creation de team
name: z.string().min(1).max(100).regex(/^[^\r\n]*$/, "Invalid characters")
```

---

### 19. Email recycle : ancien invite accepte via nouvelle inscription

**Fichier :** `features/auth/server/complete-post-sign-in.ts:29-39`

**Probleme :** L'acceptation d'invitation se base uniquement sur le match `email` + `status: PENDING`. Si :

1. User A (alice@company.com) est invite a une team
2. User A ne repond jamais
3. User A quitte l'entreprise, l'email est recycle
4. User B recoit alice@company.com
5. User B s'inscrit via le lien d'invitation (ou meme sans, si le `inviteId` est dans l'URL)
6. User B est automatiquement ajoute a la team de l'ancien User A

**Code :**
```typescript
const invitation = await db.invitation.findFirst({
  where: {
    id: invitationId,
    email, // <-- seul check : l'email matche
    status: "PENDING",
  },
});
```

**Impact :**
- Acces non autorise a des donnees d'entreprise
- Particulierement dangereux pour les domaines d'entreprise avec recyclage d'emails

**Fix propose :** Ce point est resolu en grande partie si on implemente l'expiration des invitations (#7). Une invitation expiree apres 7 jours empeche le scenario. Complementer avec :
- Permettre a l'OWNER de revoquer une invitation avant qu'elle soit acceptee (deja fait via `cancelInvitation`)
- Afficher un avertissement dans l'UI si une invitation est vieille de plus de 48h

---

### 27. OWNER peut se retirer lui-meme via Remove member

**Fichiers :** `features/teams/actions/remove-team-member.action.ts`, `features/teams/components/TeamMembersPanel.tsx`

**Probleme :** L'action `removeTeamMemberAction` ne verifie pas que la cible du retrait n'est pas le dernier OWNER (ni que l'appelant ne se retire pas lui-meme en tant qu'OWNER). Un OWNER peut envoyer son propre `memberId` (TeamMember.id) et se retirer de la team. La team se retrouve sans owner — meme impact que le point #2 (suppression de compte par l'owner), mais via le flux "Remove member".

L'UI masque le bouton "Remove" uniquement pour les deux **premiers** membres de la liste (`index > 1`). Selon l'ordre d'affichage (ex. OWNER en 3e position), l'OWNER peut avoir le bouton et se retirer lui-meme. Ce n'est pas une vraie protection.

**Impact :**
- Team orpheline sans owner
- Abonnement Stripe qui continue a facturer sans que personne puisse l'annuler
- Meme impact que #2, par un autre vecteur

**Fix propose :** Dans `removeTeamMemberAction`, avant le `deleteMany` :
1. Charger le membre cible et verifier son role
2. Si la cible est OWNER : verifier qu'il existe au moins un autre OWNER dans la team ; sinon retourner une erreur du type "Transferez l'ownership avant de vous retirer"
3. Optionnel : interdire explicitement de retirer soi-meme (meme en tant que seul OWNER) pour eviter toute ambiguite

---

### 28. Team peut atteindre 0 membres (dernier membre retire)

**Fichier :** `features/teams/actions/remove-team-member.action.ts`

**Probleme :** Rien n'empeche de retirer le **dernier** membre d'une team (ou de retirer les membres un par un jusqu'a 0). On peut donc avoir une team avec 0 membres, un abonnement Stripe actif, et personne pour gerer la facturation ou supprimer la team.

**Impact :**
- Team zombie : 0 membres, abo actif, donnees orphelines
- Impossible d'annuler l'abonnement ou de supprimer la team sans intervention manuelle (DB / Stripe dashboard)

**Fix propose :**
1. Dans `removeTeamMemberAction`, avant le `deleteMany`, compter les membres de la team
2. Si `_count.teamMembers <= 1`, retourner une erreur : "Impossible de retirer le dernier membre. Supprimez la team ou transferez l'ownership avant."
3. Coupler avec la feature "suppression de team" (#9) : la derniere personne doit pouvoir soit "quitter" (et declencher la suppression de la team si abo annule), soit transferer l'ownership puis quitter

---

## P2 — Qualite

### 5. On peut inviter quelqu'un comme OWNER

**Fichier :** `features/teams/server/team-invitations.ts`

**Probleme :** `inviteTeamMemberToTeam` accepte n'importe quel `TeamRole` dans le champ `role`, y compris `OWNER`. Rien n'empeche d'inviter un 2e, 3e, 4e OWNER.

**Impact :**
- Ambiguite sur qui controle la team
- Plusieurs OWNER peuvent prendre des decisions contradictoires
- Complique la logique de transfert d'ownership

**Fix propose :** Valider au niveau du schema ou de la logique :
```typescript
// Dans inviteTeamMemberSchema (zod)
role: z.enum(["ADMIN", "MEMBER"]) // exclure OWNER

// Ou dans inviteTeamMemberToTeam
if (input.role === "OWNER") {
  return { error: "Cannot invite as OWNER. Use transfer ownership instead." };
}
```

---

### 6. Le role ADMIN ne sert a rien

**Fichiers concernes :**
- `features/teams/actions/invite-team-member.action.ts` — requiert `OWNER`
- `features/teams/actions/remove-team-member.action.ts` — requiert `OWNER`
- `features/teams/server/cancel-invitation.ts` — requiert `OWNER`
- `features/billing/actions/checkout.action.ts` — requiert `OWNER`

**Probleme :** Toutes les actions privilegiees exigent le role `OWNER`. Le role `ADMIN` n'a aucune permission supplementaire par rapport a `MEMBER`. Il existe dans l'enum mais ne sert a rien.

**Options :**
1. **Donner des permissions aux ADMIN** — par exemple : inviter des MEMBER, gerer les tasks, voir les logs d'activite
2. **Supprimer le role ADMIN** — simplifier a OWNER/MEMBER si la granularite n'est pas necessaire

---

### 9. Pas de suppression de team

**Probleme :** Aucune route, action ou fonction serveur ne permet de supprimer une team. Le schema Prisma a `onDelete: Cascade` sur les relations, donc la suppression en cascade fonctionnerait techniquement, mais il n'y a pas de code pour le declencher.

**Impact :**
- Un owner qui veut fermer sa team ne peut pas
- Les teams abandonnees restent en base indefiniment
- Pas de cleanup possible sans intervention directe en base

**Action requise :** Creer une action `deleteTeam(userId, teamId)` qui :
1. Verifie que le user est OWNER
2. Verifie qu'il n'y a pas d'abonnement actif (ou l'annuler d'abord)
3. Supprime la team (cascade supprime les membres, tasks, invitations, logs, etc.)
4. Redirige les membres vers leur prochaine team

---

### 10. Donnees fantomes apres suppression de membre

**Fichier :** `features/teams/actions/remove-team-member.action.ts`

**Probleme :** Quand un membre est retire, seul son `TeamMember` est supprime. Ses **tasks**, **conversations AI**, et **activity logs** restent dans la team.

**Impact :**
- Les tasks creees par l'ex-membre restent visibles (peut-etre voulu)
- Les conversations AI sont orphelines (scopees par `userId` donc inaccessibles, mais toujours en base)
- Confusion dans l'historique d'activite

**Action a considerer :**
- Definir une politique claire : les donnees d'un ex-membre sont-elles conservees ou supprimees ?
- Si conservees : s'assurer que l'UI gere gracieusement les references a des users soft-deleted
- Si supprimees : ajouter un cleanup dans le flow de suppression de membre

---

### 12. Invitations fantomes apres suppression de l'inviteur

**Probleme :** Quand un user soft-delete son compte, ses invitations envoyees (`invitedBy = user.id`) ne sont pas annulees. Elles restent PENDING.

**Detail important :** Le modele Prisma a `onDelete: Cascade` sur la relation `inviter`, mais la suppression de compte est un **soft-delete** (`deletedAt = new Date()`), pas un hard-delete. Le cascade ne se declenche donc pas.

**Impact :**
- Un invite peut accepter une invitation envoyee par quelqu'un qui n'existe plus
- Confusion dans l'UI (l'inviteur n'est plus trouvable)

**Fix propose :** Dans la transaction de `deleteAccount`, ajouter :
```typescript
await tx.invitation.updateMany({
  where: {
    invitedBy: user.id,
    status: "PENDING",
  },
  data: { status: "CANCELED" },
});
```

---

### 20. Changements billing non logges (webhooks Stripe)

**Fichier :** `features/billing/server/handle-subscription-change.ts`

**Probleme :** Quand un webhook Stripe met a jour l'etat d'une subscription (upgrade, downgrade, annulation, expiration), le `team.update()` est execute mais **aucun** `ActivityLog` n'est cree.

Meme chose dans `finalizeCheckoutSession` — le checkout est finalise sans log.

**Impact :**
- Aucune trace d'audit pour les changements de plan
- Impossible de debugger les problemes billing sans consulter le dashboard Stripe
- Non conforme aux bonnes pratiques d'audit pour un SaaS B2B

**Fix propose :** Ajouter un `ActivityType.BILLING_CHANGE` et logger dans les deux handlers.

---

### 21. IP address jamais capturee dans les activity logs

**Fichiers :** Tous les fichiers qui appellent `createActivityLog` ou `tx.activityLog.create`

**Probleme :** Tous les activity logs sont crees avec `ipAddress: ""` (string vide). L'adresse IP reelle de l'utilisateur n'est jamais extraite de la requete.

**Exemples :**
- `features/teams/server/team-invitations.ts:104` → `ipAddress: ""`
- `features/auth/server/complete-post-sign-in.ts:91` → `ipAddress: ""`
- `features/auth/server/onboarding.ts:35` → `ipAddress: ""`

**Impact :**
- Impossible de detecter des connexions suspectes
- Pas d'information pour investigation de securite
- Le champ existe dans le schema (`ipAddress String? @db.VarChar(45)`) mais n'est jamais utilise

**Fix propose :** Extraire l'IP via `headers()` de Next.js :
```typescript
import { headers } from 'next/headers';

function getClientIp(): string {
  const h = headers();
  return h.get('x-forwarded-for')?.split(',')[0]?.trim()
    || h.get('x-real-ip')
    || '';
}
```

---

### 22. syncSeatQuantity echoue silencieusement

**Fichier :** `features/billing/server/sync-seat-quantity.ts:32-34`

**Probleme :** `syncSeatQuantity` a un `try/catch` global qui log l'erreur et la swallow :

```typescript
} catch (error) {
  console.error("Failed to sync seat quantity for team", teamId, error);
  // pas de throw, pas de retry, pas d'alerte
}
```

Si Stripe est temporairement down, la quantite de seats ne sera jamais corrigee. Il n'y a pas de mecanisme de retry ni d'alerte.

**Impact :**
- Facturation Stripe desynchronisee (potentiellement pour toujours)
- Sur-facturation ou sous-facturation silencieuse

**Fix propose :**
- Ajouter un mecanisme de retry (exponential backoff)
- Ou : creer une table `pending_seat_syncs` et un cron qui retente periodiquement
- Au minimum : ajouter une alerte/notification pour les echecs

---

### 23. Pas de rate limiting sur les API routes

**Fichiers :** Toutes les routes dans `app/api/`

**Probleme :** Aucune route API n'a de rate limiting. Un attaquant peut :
- Spammer le endpoint assistant pour consommer des tokens AI (meme si l'usage est compte, le systeme ne bloque qu'apres avoir consomme le quota)
- Brute-forcer les `invitationId` dans les URLs d'invitation (IDs sequentiels)
- Saturer le webhook Stripe avec des requetes forgees (rejetees par la signature, mais consomment des ressources)

**Impact :**
- Abus de ressources
- Couts imprevus (API AI)
- DoS sur le serveur

**Fix propose :** Utiliser un middleware de rate limiting (ex: `@upstash/ratelimit` ou custom avec Redis) sur :
- `/api/assistant/*` — limiter par userId
- `/api/stripe/webhook` — limiter par IP
- Toutes les server actions sensibles

---

## P3 — Amelioration architecturale

### 13. Middleware ne valide pas le contexte de team

**Fichier :** `middleware.ts`

**Probleme :** Le middleware ne fait qu'un check d'authentification basique (est-ce que le user est connecte ?). Il ne valide pas que l'utilisateur a bien acces a la team dans le cookie `active_team_id`. Chaque route/action fait sa propre validation.

**Impact :**
- Fragile : une seule route qui oublie le check `teamId` = data leak cross-tenant
- Pas de couche de defense en profondeur

**Consideration :** Ce n'est pas un bug en soi (toutes les routes actuelles font le check), mais c'est une fragilite architecturale. Un middleware qui valide le team membership ajouterait une couche de securite.

**Option alternative :** Si un middleware est trop couteux en performance (1 query DB par requete), envisager un pattern de "team context provider" cote serveur qui centralise la validation et que toutes les routes doivent utiliser.

---

### 24. Plan invalide en DB cause un crash (pas de fallback)

**Fichier :** `features/billing/plans/plans.ts:79-81`

**Probleme :** `getPlan(planId)` accede directement a `plans[planId]` sans validation. Si la DB contient un `planId` invalide (ex: `"enterprise"`, suite a une modification Stripe mal configuree), la fonction retourne `undefined`, ce qui cause un crash en cascade.

```typescript
export function getPlan(planId: PlanId): Plan {
  return plans[planId]; // undefined si planId invalide → crash quand on accede a .name, .limits, etc.
}
```

**Impact :**
- 500 error pour toute la team affectee
- L'app devient inutilisable jusqu'a correction manuelle en DB

**Fix propose :**
```typescript
export function getPlan(planId: PlanId): Plan {
  return plans[planId] ?? plans.free;
}
```

---

### 25. Checkout lock timeout trop court (30 min)

**Fichier :** `features/billing/server/checkout-lock.ts:6`

**Probleme :** Le lock de checkout expire apres 30 minutes (`CHECKOUT_LOCK_WINDOW_MS = 30 * 60 * 1000`). Si un utilisateur ouvre la page Stripe Checkout et attend plus de 30 minutes avant de payer :

1. Le lock expire
2. Un autre OWNER (ou le meme user dans un autre onglet) peut initier un 2e checkout
3. Les deux checkouts aboutissent → 2 subscriptions pour la meme team

`finalizeCheckoutSession` a une protection `hasConflictingActiveSubscription`, mais elle ne couvre que le cas ou la 1ere subscription est deja finalisee au moment de la 2eme.

**Impact :**
- Double facturation possible
- Etat de subscription incoherent

**Fix propose :**
- Augmenter le timeout a 60 min (les sessions Stripe expirent a 24h par defaut)
- Ou mieux : verifier dans `reserveCheckoutForTeam` si une session Stripe active existe via l'API Stripe

---

### 26. Schema Zod invitation exclut ADMIN des roles

**Fichier :** `features/teams/schemas/team.schema.ts:9`

**Probleme :** Le schema Zod d'invitation ne permet que `MEMBER` et `OWNER` :

```typescript
export const inviteTeamMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['MEMBER', 'OWNER']) // ADMIN absent
});
```

Alors que le modele Prisma supporte 3 roles : `OWNER`, `ADMIN`, `MEMBER`. Il est impossible d'inviter quelqu'un comme ADMIN via l'UI.

Combine avec le point #6 (ADMIN ne sert a rien), ca confirme que le role ADMIN est un dead code. Mais si on decide de donner des permissions aux ADMIN, il faudra penser a mettre a jour ce schema.

**Impact :** Incoherence entre le schema DB et le schema de validation.

---

## Resume des actions

### Corrections immediates (P0) — 6 items
| # | Description | Effort estime |
|---|-------------|---------------|
| 1 | Suppression de compte : nettoyer TOUS les memberships | Faible |
| 2 | Account deletion policy : verifier TOUTES les teams ownees | Moyen |
| 8 | Race condition invitation : lock pessimiste dans la transaction | Moyen |
| 14 | Invalider session apres retrait de membre | Moyen |
| 15 | Ajouter auth check sur `/api/stripe/checkout` | Faible |
| 16 | Rendre removal + seat sync atomique | Moyen |

### Sprint suivant (P1) — 6 items
| # | Description | Effort estime |
|---|-------------|---------------|
| 3 | Implementer transfert d'ownership | Moyen |
| 4 | Implementer "quitter une team" | Moyen |
| 7 | Ajouter expiration des invitations (expiresAt + check) | Moyen |
| 11 | Merger avec fix #2 (policy multi-team) | Inclus dans #2 |
| 17 | Politique de downgrade (bloquer ou avertir si quotas depasses) | Moyen |
| 18 | Sanitizer team name dans les emails (newlines) | Faible |
| 19 | Expiration invitation resout ce point (merger avec #7) | Inclus dans #7 |

### Backlog (P2) — 7 items
| # | Description | Effort estime |
|---|-------------|---------------|
| 5 | Interdire invitation comme OWNER | Faible |
| 6 | Definir les permissions ADMIN ou supprimer le role | Decision produit |
| 9 | Implementer suppression de team | Moyen |
| 10 | Politique de nettoyage des donnees d'ex-membres | Decision produit |
| 12 | Annuler invitations pending du user supprime | Faible |
| 20 | Logger les changements billing (ActivityType.BILLING_CHANGE) | Faible |
| 21 | Capturer l'IP dans les activity logs | Faible |
| 22 | Retry mechanism pour syncSeatQuantity | Moyen |
| 23 | Rate limiting sur les API routes | Moyen |

### Ameliorations (P3) — 3 items
| # | Description | Effort estime |
|---|-------------|---------------|
| 13 | Middleware de validation du contexte team | Moyen |
| 24 | Fallback dans getPlan() pour planId invalide | Faible |
| 25 | Augmenter checkout lock timeout ou verifier via Stripe API | Faible |
| 26 | Aligner schema Zod avec les roles DB | Faible |
