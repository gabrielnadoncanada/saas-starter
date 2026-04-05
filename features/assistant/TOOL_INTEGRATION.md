# Assistant Tool Integration

The assistant ships with `createTask`, which calls the shared org-scoped task mutation.

## Extend or replace tools

1. Add or change tools in `features/assistant/server/tools.ts`.
2. Add matching result types in `features/assistant/types.ts` when the success payload is structured.
3. Render tool output in `features/assistant/components/assistant-tool-result.tsx`.
4. Keep billing guards and domain calls next to the tool execution path.

## Keep this boundary

- `tools.ts` stays the orchestration layer.
- Provider-specific or heavy domain logic lives in feature `server/` files.
- Route handlers stay thin.
