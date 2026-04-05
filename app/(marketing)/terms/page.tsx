import type { Metadata } from "next";

export async function generateMetadata({}): Promise<Metadata> {
  return {
    title: "Terms of Service",
    description: "Terms and conditions governing your use of our platform.",
  };
}

export default async function TermsPage({}: {} = {}) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Terms of Service
      </h1>
      <p className="mt-4 rounded-md border border-orange-500/30 bg-orange-500/10 px-4 py-3 text-sm text-orange-700 dark:text-orange-400">
        This is a placeholder page. Replace this content with your actual Terms
        of Service before launching.
      </p>
      <div className="mt-8 space-y-4 text-muted-foreground">
        <p>
          These Terms of Service govern your use of our platform. By accessing
          or using the service, you agree to be bound by these terms.
        </p>
      </div>
    </main>
  );
}
