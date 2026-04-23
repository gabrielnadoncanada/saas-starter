# Sourcing — 5 starting points to find the 50

Target: 15-20 qualified prospects per source. Overshoot — half will disqualify on deeper check.

---

## 1. Twitter/X — replies & quote-tweets of starter launches

The fastest source. People who comment on ShipFast-style launches are the exact buyers.

**Queries to run (Twitter search):**
- `from:marc_louvion min_replies:20` → open recent threads, scrape commenters who have product URLs in bio
- `"shipfast" OR "makerkit" OR "supastarter" lang:en min_faves:5 -filter:replies` (past 90 days)
- `"next.js starter" OR "saas boilerplate" lang:en min_faves:10` (past 60 days)
- `"just shipped" "next.js" OR "nextjs" lang:en min_faves:15` (past 90 days) — freshly launched products = perfect reviewers
- `"building in public" "nextjs" lang:en` — active IH-style builders

**Filter on profile:**
- Real product URL in bio that loads
- ≥500 followers AND last tweet <14 days ago
- Pinned tweet is a launch or build-update (not content/thread bait)

**How I help:** paste me the thread URL + "extract 10 qualified commenters" → I use WebFetch to pull handles + do the 30-sec qualification check.

---

## 2. Indie Hackers — recent product launches + active forum

https://www.indiehackers.com/products — filter by "SaaS" + "Recently launched"

**Signal:**
- Product page with revenue badge OR "launched in last 6 months"
- Founder has an IH profile that's been active in the last 30 days
- Uses a tech stack overlap (Next.js, Prisma, Stripe visible in their stack tag)

**Channel:** IH has native DM. Lower noise than Twitter, higher reply rate.

**How I help:** paste me 5 product URLs → I extract founder handles + build a personalized hook per founder.

---

## 3. GitHub — contributors & stargazers of competing starters

Public lists, zero friction.

**Repos to mine:**
- https://github.com/shipixen/shipixen (open source starter — its users are your people)
- https://github.com/haydenbleasel/next-forge — Vercel's starter, huge stargazer pool
- https://github.com/Saas-Starter-Kit — community
- https://github.com/vercel/commerce — shipped-something crowd
- https://github.com/supabase/supabase/stargazers — Next.js + BaaS builders

**Per repo:**
- `/stargazers` page → pull the last 100 stargazers (they starred recently = active interest in this category)
- Check each GitHub profile for: bio mentions "building X", pinned repo is a SaaS, personal website links to a product

**Channel:** GitHub profile often has Twitter + email + site. Message via their preferred channel (listed on their profile).

**How I help:** give me a repo URL → I'll WebFetch the stargazers page and shortlist 15 promising profiles to investigate.

---

## 4. Product Hunt — hunters & makers of recent SaaS launches

https://www.producthunt.com/topics/saas — filter by past 90 days.

**Signal:**
- Makers of launches with >100 upvotes (active, built something real)
- Top 5 commenters on any Next.js SaaS launch (they engage, they care)

**How I help:** paste me a PH launch URL → I extract makers + top commenters + their Twitter handles.

---

## 5. Dev blogs & newsletters — written-word indie hackers

These people write = they'll give *detailed* feedback. Highest signal reviewers.

**Sources:**
- Hashnode.dev — search "nextjs saas" past 6 months, sort by popular
- Dev.to — tag `#nextjs` + `#saas`
- Substack/Beehiiv newsletters in indie SaaS space — ask for guest feedback, not just a DM
- Personal blogs linked from Indie Hackers profiles

**Per author:**
- Do they have a product? (not just a content creator → qualify)
- Are they writing about stacks/starters/DX? (yes = perfect reviewer)

**How I help:** paste 3 blog post URLs from the category → I pull author bios + products + recent activity.

---

## Pacing plan — how to hit 50 in 2 weeks

| Day | Action | Target |
|---|---|---|
| Mon W1 | Sourcing session — populate 20 raw rows | 20 prospects |
| Tue W1 | I enrich + draft, you review | 20 messages ready |
| Wed W1 | You send 10 | 10 sent |
| Thu W1 | You send 10 | 20 sent |
| Fri W1 | Check replies, triage | 3-5 replies expected |
| Mon W2 | Sourcing session round 2 | +30 raw rows |
| Tue W2 | I enrich + draft | 30 messages ready |
| Wed W2 | You send 15 | 35 sent |
| Thu W2 | You send 15 | 50 sent |
| Fri W2 | Follow-ups D+4 on W1 non-responders | |

Expected result: 50 sent → 10-15 replies → 5-10 accepted → 3-5 usable feedback docs.

If reply rate <10% after 20 sent → we stop and rework the hook, not the volume.
