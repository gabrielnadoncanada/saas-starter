# Audit Account — Edge Cases et Securite

> Date : 2026-03-17
> Scope : suppression de compte, mise a jour du profil, comptes lies (OAuth / magic link), activity log, parametres compte

**Liens :** Les points qui touchent aux teams ou a l'auth sont detailles dans [audit-team.md](./audit-team.md) (suppression compte #1, #2, #11, #12 ; invitations) et [audit-auth.md](./audit-auth.md) (session apres suppression, revocation).

---

## Table des priorites

| Priorite | # | Edge Case | Categorie |
|----------|---|-----------|-----------|
| **P1** | 1 | Unlink dernier compte possible (magic link seul) → lock out | Comptes lies |
| **P1** | 2 | Suppression de compte : memberships, policy, invitations (voir audit-team) | Cycle de vie |
| **P2** | 3 | Changement d'email sans confirmation ni invalidation session | Profil |
| **P2** | 4 | Update account : pas de re-verification email (prise de controle) | Securite |
| **P3** | 5 | Activity log : scope user uniquement (pas de filtre par team) | UX / Audit |
| **P3** | 6 | signOut apres delete : JWT reste valide jusqu'a expiration cookie | Auth (ref. audit-auth) |

---

## P1 — Important

### 1. Unlink dernier compte possible (magic link seul) → lock out

**Fichiers :**
- `features/account/server/linked-accounts.ts:82-84`
- `features/account/components/settings/LinkedAccountsCard.tsx` (canUnlink)

**Probleme :** La regle cote serveur pour autoriser le unlink est :

```typescript
if (!hasMagicLinkProvider() && linkedAccounts.length <= 1) {
  return { status: "blocked" };
}
```

On bloque uniquement quand il n'y a **pas** de magic link ET qu'il ne reste qu'un seul compte. Si le magic link (Resend) est configure et que l'utilisateur n'a **que** ce provider (1 compte), on n'entre pas dans le bloc : le unlink est autorise. L'utilisateur peut donc detacher son seul moyen de connexion et se retrouver sans aucun compte lie → **lock out definitif**.

**Impact :**
- Utilisateur bloque, ne peut plus se connecter
- Support / perte de compte

**Fix propose :**
- Bloquer des qu'il ne reste qu'un seul compte lie, independamment du magic link : `if (linkedAccounts.length <= 1) return { status: "blocked" };`
- Ou exiger au moins 2 comptes lies pour permettre un unlink (meme logique). Adapter le message : "Vous devez garder au moins un moyen de connexion."

---

### 2. Suppression de compte : memberships, policy, invitations (voir audit-team)

**Fichiers :** `features/account/server/delete-account.ts`, `features/account/actions/delete-account.action.ts`

**Probleme :** La suppression de compte (soft-delete) et le flux associe dependent de plusieurs points deja audites dans audit-team. Resumer ici pour coherence :

- **#1** — Seul le membership de la team **active** est supprime ; les autres teams gardent l'utilisateur comme membre fantome → [audit-team.md #1](./audit-team.md).
- **#2 / #11** — La policy de suppression (`getAccountDeletionBlocker`) ne regarde que la team active ; un OWNER peut orpheliner d'autres teams → [audit-team.md #2, #11](./audit-team.md).
- **#12** — Les invitations PENDING envoyees par l'utilisateur ne sont pas annulees (soft-delete, pas de cascade) → [audit-team.md #12](./audit-team.md).

**Action :** Traiter les correctifs decrits dans audit-team avant de considerer le flux account deletion comme solide.

**Comportement actuel correct :**
- Confirmation par mot "DELETE" (schema + UI).
- `signOut({ redirect: false })` apres suppression reussie.
- Session / Account / VerificationToken supprimes dans la transaction.

---

## P2 — Qualite

### 3. Changement d'email sans confirmation ni invalidation session

**Fichier :** `features/account/server/update-account.ts`

**Probleme :** La mise a jour du profil (nom, email, telephone) modifie directement `User` en base. Pour l'email :
- Aucune verification par email (lien de confirmation) avant prise en compte.
- La session JWT n'est pas invalidee : le token peut encore contenir l'ancien email jusqu'a refresh ou expiration.
- NextAuth / magic link utilisent l'email comme identifiant ; un changement non confirme peut creer des incoherences (ex. magic link envoye a l'ancienne adresse).

**Impact :**
- Prise de controle possible si un attaquant a acces a la session et change l'email vers le sien (sans verification).
- UX : utilisateur peut voir l'ancien email dans la session pendant un moment.

**Fix propose :**
- Option A : Exiger une confirmation par email pour le changement d'email (lien envoye a la nouvelle adresse, mise a jour uniquement apres clic).
- Option B : Au minimum, forcer un refresh de session ou une re-authentification apres changement d'email (et documenter le comportement).

---

### 4. Update account : pas de re-verification email (prise de controle)

**Fichier :** `features/account/server/update-account.ts`, schema `updateAccountSchema`

**Probleme :** Un attaquant ayant acces a une session (vol de cookie, session non fermee sur un poste partage) peut changer l'email du compte vers le sien. Apres cela, "Forgot password" / magic link iraient a la nouvelle adresse, et le legitime proprietaire perdrait l'acces.

**Impact :** Prise de controle de compte sans preuve de controle de l'email cible.

**Mitigation actuelle :** Contrainte unique sur l'email (P2002) evite les doublons ; pas de verification que la nouvelle adresse appartient a l'utilisateur.

**Fix propose :** Traiter le changement d'email comme un flux sensible : verification par lien envoye a la **nouvelle** adresse avant de mettre a jour `User.email`, et optionnellement notification sur l'ancienne adresse.

---

## P3 — Amelioration

### 5. Activity log : scope user uniquement (pas de filtre par team)

**Fichier :** `features/account/server/activity-log.ts`

**Probleme :** `getActivityLogs()` filtre par `userId: user.id` uniquement. L'utilisateur voit toutes ses actions, tous contextes (teams) confondus. Il n'y a pas de vue "activity de la team courante" ni de filtre par team.

**Impact :** Limite a l'UX / au besoin metier (audit par team). Pas de fuite de donnees (on ne voit que ses propres actions).

**Fix optionnel :** Si un besoin "activity par team" existe, ajouter un endpoint ou un parametre scope par `teamId` avec verification de membership.

---

### 6. signOut apres delete : JWT reste valide jusqu'a expiration cookie

**Fichier :** `features/account/actions/delete-account.action.ts` (appel a `signOut({ redirect: false })`)

**Probleme :** Apres suppression de compte, on appelle `signOut()` qui supprime le cookie cote client. Avec une strategie JWT stateless, un token copie ou non supprime (autre onglet, autre appareil) resterait techniquement valide jusqu'a son expiration. `getCurrentUser()` filtrant sur `deletedAt: null`, les requetes avec ce token renverraient `null` et l'acces serait refuse, mais le token n'est pas "revoke" explicitement.

**Impact :** Limite ; le comportement effectif est correct (acces refuse). Voir [audit-auth.md #1, #5](./audit-auth.md) pour revocation et invalidation.

---

## Resume des actions

1. **P1** : Corriger la regle unlink (bloquer si `linkedAccounts.length <= 1`) ; traiter les correctifs audit-team pour la suppression de compte (#1, #2, #11, #12).
2. **P2** : Renforcer le flux de changement d'email (confirmation par email, invalidation/refresh session).
3. **P3** : Optionnel — filtre activity par team ; documenter le comportement JWT apres delete.
