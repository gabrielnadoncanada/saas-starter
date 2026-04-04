"use client";

import { Languages } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState } from "react";

import { updateLocaleAction } from "@/features/account/actions/update-locale.actions";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { useToastMessage } from "@/shared/hooks/useToastMessage";

type LocalePreferencesCardProps = {
  preferredLocale: "en" | "fr";
};

export function LocalePreferencesCard({
  preferredLocale,
}: LocalePreferencesCardProps) {
  const t = useTranslations("settings");
  const [state, formAction, isPending] = useActionState(updateLocaleAction, {});

  useToastMessage(state.success, { kind: "success", trigger: state });
  useToastMessage(state.error, { kind: "error", trigger: state });

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Languages className="size-4" />
          {t("locale.title")}
        </CardTitle>
        <CardDescription>{t("locale.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex gap-3">
          <input type="hidden" name="preferredLocale" value="en" />
          <Button
            type="submit"
            variant={preferredLocale === "en" ? "default" : "outline"}
            disabled={isPending}
          >
            {t("locale.english")}
          </Button>
        </form>
        <form action={formAction} className="mt-3 flex gap-3">
          <input type="hidden" name="preferredLocale" value="fr" />
          <Button
            type="submit"
            variant={preferredLocale === "fr" ? "default" : "outline"}
            disabled={isPending}
          >
            {t("locale.french")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
