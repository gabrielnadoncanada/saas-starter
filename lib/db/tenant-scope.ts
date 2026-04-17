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

// Sets tenant context for the current async task tree. Idempotent across the
// same request when the orgId matches; conflicts throw to surface bugs.
export function setTenantContext(organizationId: string): void {
  const current = store.getStore();
  if (current?.kind === "tenant" && current.organizationId !== organizationId) {
    throw new TenantScopeError(
      `Cannot switch tenant context from ${current.organizationId} to ${organizationId} within the same request.`,
    );
  }
  if (current?.kind === "admin") {
    return;
  }
  store.enterWith({ kind: "tenant", organizationId });
}

export function runInTenantScope<T>(
  organizationId: string,
  fn: () => Promise<T>,
): Promise<T> {
  return store.run({ kind: "tenant", organizationId }, fn);
}

// Escape hatch for system-level code (Stripe webhooks, admin dashboards,
// cross-tenant reporting). Every use is an explicit audit point.
export function runAsAdmin<T>(fn: () => Promise<T>): Promise<T> {
  return store.run({ kind: "admin" }, fn);
}
