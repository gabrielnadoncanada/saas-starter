"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { routes } from "@/constants/routes";

export function BillingCheckoutSuccessToast({
  planName,
}: {
  planName: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const firedRef = useRef(false);

  useEffect(() => {
    if (searchParams.get("checkout") !== "success" || firedRef.current) {
      return;
    }

    firedRef.current = true;
    toast.success(`Upgraded to ${planName}`, {
      description: "Your new plan is active — enjoy the unlocked limits.",
    });
    router.replace(routes.settings.billing, { scroll: false });
  }, [planName, router, searchParams]);

  return null;
}
