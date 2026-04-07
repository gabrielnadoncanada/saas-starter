import { marketingBuilder } from "@/features/marketing/site";

export function BuilderSection() {
  const { name, initials, bioParagraphs, socialLinks } = marketingBuilder;

  return (
    <section id="built-by" className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl border bg-card p-8 sm:p-10">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-muted">
              <span className="text-2xl font-semibold text-muted-foreground">
                {initials}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Built by {name}
              </h3>
              {bioParagraphs.map((paragraph, index) => (
                <p
                  key={index}
                  className={`text-sm leading-relaxed text-muted-foreground ${
                    index === 0 ? "mt-2" : "mt-3"
                  }`}
                >
                  {paragraph}
                </p>
              ))}
              {socialLinks.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-4">
                  {socialLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      className="text-sm font-medium text-foreground underline underline-offset-4 hover:text-orange-500"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
