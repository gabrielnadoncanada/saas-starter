"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/shared/components/ui/button";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");

  return (
    <div className="h-svh">
      <div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
        <h1 className="text-[7rem] leading-tight font-bold">{t("dashboard.code")}</h1>
        <span className="font-medium">{t("dashboard.title")}</span>
        <p className="text-center text-muted-foreground">
          {t("dashboard.description")}
        </p>
        <div className="mt-6 flex gap-4">
          <Button onClick={() => reset()}>{t("dashboard.button")}</Button>
        </div>
      </div>
    </div>
  );
}
