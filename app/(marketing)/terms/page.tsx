import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
}): Promise<Metadata> {
  const t = await getTranslations("marketing");

  return {
    title: t("terms.title"),
    description: t("terms.metaDescription"),
  };
}

export default async function TermsPage({
}: {} = {}) {
  const t = await getTranslations("marketing");

  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        {t("terms.title")}
      </h1>
      <p className="mt-4 rounded-md border border-orange-500/30 bg-orange-500/10 px-4 py-3 text-sm text-orange-700 dark:text-orange-400">
        {t("terms.placeholderWarning")}
      </p>
      <div className="mt-8 space-y-4 text-muted-foreground">
        <p>{t("terms.intro")}</p>
      </div>
    </main>
  );
}
