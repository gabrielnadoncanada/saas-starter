import { AsyncLocalStorage } from "node:async_hooks";

export type TenantContext =
  | { kind: "tenant"; organizationId: string }
  | { kind: "admin" };

export class TenantScopeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TenantScopeError";
  }
}

const store = new AsyncLocalStorage<TenantContext>();

export function getTenantContext(): TenantContext | undefined {
  return store.getStore();
}

// Explicit tenant scope — for code that knows the org id but runs outside a
// user request (Stripe webhooks, cron jobs, queue workers). Inside a normal
// user request, the Prisma extension resolves the active org from the session
// on its own; you do not need this.
export function runInTenantScope<T>(
  organizationId: string,
  fn: () => Promise<T>,
): Promise<T> {
  return store.run({ kind: "tenant", organizationId }, fn);
}

// System-level escape hatch: bypasses tenant scoping entirely. Every use is an
// explicit audit point — reserve for admin dashboards, cross-tenant reporting,
// migrations, and seeds.
export function runAsAdmin<T>(fn: () => Promise<T>): Promise<T> {
  return store.run({ kind: "admin" }, fn);
}
