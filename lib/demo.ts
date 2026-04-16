export function isDemoMode(): boolean {
  return process.env.DEMO_MODE === "true";
}

export const DEMO_DISABLED_MESSAGE = "This action is disabled in demo mode.";

export function assertNotDemo<T = { error: string }>(
  message = DEMO_DISABLED_MESSAGE,
): T | null {
  if (isDemoMode()) {
    return { error: message } as T;
  }
  return null;
}

export function throwIfDemo(message = DEMO_DISABLED_MESSAGE): void {
  if (isDemoMode()) {
    throw new Error(message);
  }
}
