# Audit Assistant — Edge Cases et Securite

> Date : 2026-03-17
> Scope : API assistant (stream, conversations), plan gating, usage quotas, tools, model selection, isolation team/user

**Liens :** Rate limiting et billing sont traites dans [audit-team.md](./audit-team.md) (#23, #22) et le module billing (usage, plans).

---

## Table des priorites

| Priorite | # | Edge Case | Categorie |
|----------|---|-----------|-----------|
| **P1** | 1 | Routes conversations sans verification plan ai.assistant | Plan gating |
| **P2** | 2 | Usage consomme avant stream — requete abortee = quota debite | Billing / UX |
| **P2** | 3 | Taille des messages (body) non bornee → DoS / couts | Securite / Perf |
| **P2** | 4 | Race condition sur consumeMonthlyUsage (concurrence) | Billing |
| **P3** | 5 | modelId / provider depuis le client (allowlist OK, fallback) | Securite |
| **P3** | 6 | Pas de limite sur le nombre de conversations par team/user | Donnees / Quotas |

---

## P1 — Important

### 1. Routes conversations sans verification plan ai.assistant

**Fichiers :**
- `app/api/assistant/conversations/route.ts` (GET, POST)
- `app/api/assistant/conversations/[conversationId]/route.ts` (GET, PATCH, DELETE)

**Probleme :** Ces routes utilisent uniquement `resolveAssistantConversationScope()` (user + team). Elles ne verifient pas que la team a la capacite `ai.assistant` ni les quotas d'usage. Seule la route principale `POST /api/assistant` (stream) fait `assertCapability(teamPlan.planId, "ai.assistant")` et `consumeMonthlyUsage(...)`.

Un utilisateur sur un plan Free (sans ai.assistant) peut donc :
- Lister, creer, mettre a jour et supprimer des conversations via ces API
- Stocker des messages sans jamais declencher de call AI ni consommer de quota

**Impact :**
- Incoherence : l'UI dashboard bloque l'acces a l'assistant pour Free, mais l'API conversations reste ouverte
- Stockage de donnees (conversations) sans respect du gate metier
- Si plus tard une feature affiche "historique" cote Free, les donnees existent deja

**Fix propose :**
- Dans chaque route conversations (ou dans un middleware / helper commun), appeler `getTeamPlan()` puis `assertCapability(teamPlan.planId, "ai.assistant")` (ou equivalent) et retourner 403 si le plan n'a pas la capacite.
- Aligner le comportement sur la page dashboard (canUseAssistant) et la route stream.

---

## P2 — Qualite

### 2. Usage consomme avant stream — requete abortee = quota debite

**Fichier :** `app/api/assistant/route.ts`

**Probleme :** `consumeMonthlyUsage(teamId, "aiRequestsPerMonth", ...)` est appele au debut de la route, avant l'appel a `streamText()`. Si le stream echoue (erreur modele, timeout, client disconnect) ou si le client abandonne la requete, le quota a deja ete incremente.

**Impact :**
- L'utilisateur "paye" (quota) pour des requetes qui n'ont pas produit de reponse utilisable
- En cas d'instabilite (API AI down), tous les essais consomment le quota

**Fix propose :**
- Option A : Consommer le quota apres le premier chunk streamé (ou a la fin du stream) ; risque de race si plusieurs requetes passent le check avant consommation.
- Option B : Garder la consommation en entree mais ajouter un mecanisme de "remboursement" ou retry logic en cas d'erreur serveur (ex. pas de consommation si stream n'a pas demarre).
- Option C : Documenter le comportement et accepter le trade-off (simplicite vs quota parfait).

---

### 3. Taille des messages (body) non bornee → DoS / couts

**Fichier :** `app/api/assistant/route.ts` — `const { messages, ... } = await req.json();`

**Probleme :** Le body JSON (messages, modelId, provider, conversationId) est lu sans limite de taille. Un client peut envoyer un tableau `messages` enorme (ex. des MB de texte), ce qui peut :
- Saturer la memoire serveur
- Augmenter les couts d'appel au modele (contexte tres long)
- Ralentir ou faire planter la route

**Impact :**
- DoS par payload trop gros
- Couts API AI non maitrises

**Fix propose :**
- Limiter la taille du body (ex. `Content-Length` max 1 MB) au niveau route ou middleware
- Limiter le nombre de messages (ex. 100 derniers) et la longueur par message (ex. 10k caracteres par role)
- Valider/sanitizer avant d'appeler `convertToModelMessages(messages)`

---

### 4. Race condition sur consumeMonthlyUsage (concurrence)

**Fichiers :**
- `features/billing/usage/usage-service.ts` (`consumeMonthlyUsage`)
- `app/api/assistant/route.ts` (appel avant stream)
- `features/assistant/server/tools.ts` (reviewInbox : emailSyncsPerMonth)

**Probleme :** `consumeMonthlyUsage` fait un `updateMany` avec `where: { count: { lt: limit } }` puis `increment: 1`. Sous forte concurrence, deux requetes peuvent toutes deux lire `count < limit`, puis toutes deux reussir l'update (selon isolation DB), ce qui peut faire depasser la limite d'une unite.

**Impact :**
- Depassement possible du quota d'une requete (surestimation de l'usage)
- Impact generalement limite (1 requete en trop par fenetre de race)

**Fix propose :**
- Utiliser une transaction avec lock (ex. `SELECT ... FOR UPDATE` sur la ligne du compteur) avant increment, ou une contrainte DB + retry
- Ou accepter le risque et documenter (comportement courant pour les compteurs sans lock)

---

## P3 — Amelioration

### 5. modelId / provider depuis le client (allowlist OK, fallback)

**Fichiers :**
- `app/api/assistant/route.ts` — `getAssistantModel({ modelId, provider })`
- `features/assistant/server/get-assistant-model.ts`
- `features/assistant/models.ts` — `findAssistantModel(modelId, provider)`

**Probleme :** Le client envoie `modelId` et `provider` dans le body. Le serveur utilise `findAssistantModel()` qui ne retourne un modele que s'il correspond a la liste `assistantModels` (allowlist). Sinon, fallback sur le provider par defaut (env). Pas d'injection de modele arbitraire.

**Impact :** Aucun — le design est correct. Point note pour traçabilité et pour rappeler de maintenir l'allowlist si de nouveaux modeles sont ajoutes (ne pas faire confiance au client sans validation).

---

### 6. Pas de limite sur le nombre de conversations par team/user

**Fichier :** `features/assistant/server/conversations.ts` — `createAssistantConversation`

**Probleme :** Aucune limite sur le nombre de conversations qu'un utilisateur (ou une team) peut creer. Un utilisateur ou un script pourrait en creer des milliers, ce qui gonfle le stockage et les listes.

**Impact :**
- Croissance non maîtrisée de la table `AssistantConversation`
- UX degradee (listes trop longues) si pas de pagination

**Fix optionnel :**
- Definir une limite par user ou par team (ex. 100 conversations actives) et rejeter la creation au-dela, ou archiver/supprimer les plus anciennes
- S'assurer que la liste des conversations est paginee ou tronquee cote API/UI

---

## Resume des actions

1. **P1** : Ajouter la verification du plan `ai.assistant` (et eventuellement des quotas) sur les routes conversations pour aligner avec la route stream et l'UI.
2. **P2** : Borner la taille du body / des messages ; evaluer consommation usage avant vs apres stream ; documenter ou corriger la race sur le quota.
3. **P3** : Conserver l'allowlist modeles ; optionnel — limite du nombre de conversations et pagination.
