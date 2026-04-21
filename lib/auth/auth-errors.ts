type BetterAuthErrorLike = {
  body?: {
    code?: string;
    message?: string;
  };
  code?: string;
  message?: string;
  status?: number;
};

export function getAuthErrorCode(error: unknown): string | null {
  const authError = error as BetterAuthErrorLike | null | undefined;

  if (typeof authError?.body?.code === "string") {
    return authError.body.code;
  }

  return typeof authError?.code === "string" ? authError.code : null;
}

export function getAuthErrorMessage(error: unknown, fallback: string): string {
  const authError = error as BetterAuthErrorLike | null | undefined;

  if (typeof authError?.body?.message === "string") {
    return authError.body.message;
  }

  if (typeof authError?.message === "string") {
    return authError.message;
  }

  return fallback;
}
