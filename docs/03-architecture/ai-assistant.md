# AI Assistant Feature

## What it proves

The assistant is not meant to be a full AI product surface. It demonstrates a sellable, AI-ready monetization pattern inside the starter:

1. Plan gating with `ai.assistant`
2. Monthly AI quotas with `aiRequestsPerMonth`
3. Tool-specific billing checks like `email.sync` and `emailSyncsPerMonth`
4. Real guarded task creation through the same task contract used elsewhere

## What is real vs scaffold

| Component | Status | Notes |
|---|---|---|
| Route gating | Real | `ai.assistant` + `aiRequestsPerMonth` are enforced in `app/api/assistant/route.ts` |
| Task creation | Real | Uses the same guarded task contract as the normal task action |
| Demo inbox review | Scaffold | Returns sample inbox data, but still enforces `email.sync` and `emailSyncsPerMonth` |
| Invoice draft | Scaffold | Returns a structured draft, but does not persist an invoice model |
| Provider switching | Real | The UI sends a selected `provider` + `modelId`, with `AI_PROVIDER=google|groq` as server fallback |

## Architecture shape

```txt
app/api/assistant/route.ts
app/(app)/dashboard/assistant/page.tsx
features/assistant/server/get-assistant-model.ts
features/assistant/server/tools.ts
features/assistant/server/email-provider.ts
features/assistant/components/*
```

The assistant stays local to the feature. It does not introduce a global AI framework.

## Billing behavior

- The route enforces `ai.assistant` and `aiRequestsPerMonth`
- `reviewInbox` enforces `email.sync` and `emailSyncsPerMonth`
- `createInvoiceDraft` enforces `invoice.create`
- `createTask` reuses the guarded task creation contract, so task billing rules stay consistent
- `aiRequestsPerMonth` is recorded once per completed AI response

## Environment contract

```env
AI_PROVIDER=google
GOOGLE_GENERATIVE_AI_API_KEY=
GROQ_API_KEY=
```

- Default provider: `google`
- Allowed values: `google`, `groq`
- The selected provider must have its matching API key present
- There is no silent fallback to another provider

## Adaptation points

1. Change provider or model in `features/assistant/server/get-assistant-model.ts`
2. Add or remove tools in `features/assistant/server/tools.ts`
3. Replace the demo inbox provider in `features/assistant/server/email-provider.ts`
4. Persist invoices only when you add a real invoice data model

The intended buyer lesson is simple: define a capability, define a limit, enforce both in one obvious place, and keep AI monetization under the same billing system as the rest of the product.
