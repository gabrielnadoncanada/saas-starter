"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/shared/components/ui/button";

export default function SettingsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");

  return (
    <div className="flex min-h-[60svh] items-center justify-center">
      <div className="space-y-3 text-center">
        <h1 className="font-semibold text-2xl">{t("settings.title")}</h1>
        <p className="text-muted-foreground text-sm">{t("settings.description")}</p>
        <Button onClick={() => reset()}>{t("settings.button")}</Button>
      </div>
    </div>
  );
}
