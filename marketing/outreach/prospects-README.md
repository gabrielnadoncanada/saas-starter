# prospects.csv — column guide

| column | what to put |
|---|---|
| `id` | 1-50, auto-increment |
| `name` | First name (for personalization) |
| `handle` | `@username` — the handle on the primary platform |
| `platform` | `twitter` \| `indiehackers` \| `github` \| `reddit` |
| `profile_url` | Direct link to their profile |
| `product_url` | The SaaS/project they shipped — needed for personalization |
| `stack_signals` | Free text — e.g. `nextjs, prisma, stripe, shadcn` |
| `why_good_fit` | 1 sentence — why this person specifically |
| `hook_personnel` | The specific tweet/repo/post I'll reference in the DM |
| `channel` | Where you'll send the message: `twitter_dm`, `ih_dm`, `email`, `github_issue` |
| `message_variant` | `A` \| `B` \| `C` — which template from templates.md |
| `status` | `new` → `drafted` → `sent` → `replied` → `accepted` / `declined` / `ghosted` |
| `sent_at`, `replied_at`, `feedback_received_at` | ISO dates |
| `accepted` | `yes` / `no` / `pending` |
| `notes` | Anything useful for follow-up |

## Workflow rhythm
- **Monday** — you dump 15-20 raw prospects into rows (just `handle` + `profile_url` + `product_url` minimum)
- **Tuesday** — I enrich each row (why_good_fit, hook_personnel, message_variant) and draft the messages
- **Wednesday-Thursday** — you review/edit, then send 10-15/day (hit rate limits otherwise)
- **Friday** — we check replies, schedule follow-ups for non-responders at D+4
