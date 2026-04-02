# Assistant Tool Integration

The assistant ships with two demo-only integrations:

- `reviewInbox` reads from `features/assistant/server/demo-inbox.ts`
- `createInvoiceDraft` returns a computed draft without saving to a billing system

Use them as shape references, not as production integrations.

## Replace `reviewInbox`

1. Pick a real inbox source: Gmail API, Microsoft Graph, IMAP, or your own sync service.
2. Replace `assistantDemoInbox.getRecentMessages()` with a provider-owned function that returns the same `EmailMessage[]` shape.
3. Keep plan gating and usage tracking in `features/assistant/server/tools.ts`.
4. Keep failures mapped through `toAssistantToolFailure()` so UI behavior stays consistent.

## Replace `createInvoiceDraft`

1. Decide where invoice drafts live: Stripe invoices, your own Prisma model, or a third-party invoicing API.
2. Keep the tool input schema as the assistant contract.
3. Replace the computed response with a real persisted draft id and dates from that system.
4. Return only the data the chat UI needs to confirm the result.

## Keep This Boundary

- `tools.ts` should stay as the orchestration layer
- provider-specific API calls should live in their own server files
- billing guards should stay next to the tool execution path
