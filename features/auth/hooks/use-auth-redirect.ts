"use client";

import { useEffect, useRef } from "react";

export function useAuthRedirect(redirectTo: string | null | undefined) {
  const lastRedirectRef = useRef<string | null>(null);

  useEffect(() => {
    if (!redirectTo || lastRedirectRef.current === redirectTo) {
      return;
    }

    lastRedirectRef.current = redirectTo;
    window.location.assign(redirectTo);
  }, [redirectTo]);
}
