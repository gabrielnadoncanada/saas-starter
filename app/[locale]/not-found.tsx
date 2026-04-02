"use client";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/i18n/navigation";

import { Button } from "@/shared/components/ui/button";

export default function NotFound() {
  const router = useRouter();
  const t = useTranslations("notFound");

  return (
    <div className="h-svh">
      <div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
        <h1 className="text-[7rem] leading-tight font-bold">404</h1>
        <span className="font-medium">{t("title")}</span>
        <p className="text-center text-muted-foreground">
          {t("description")}
        </p>
        <div className="mt-6 flex gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            {t("back")}
          </Button>
          <Button onClick={() => router.push("/")}>{t("backToHome")}</Button>
        </div>
      </div>
    </div>
  );
}

