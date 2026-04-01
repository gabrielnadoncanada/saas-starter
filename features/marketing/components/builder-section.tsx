export function BuilderSection() {
  return (
    <section id="built-by" className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl border bg-card p-8 sm:p-10">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            {/* Replace with your real photo */}
            <div className="h-20 w-20 shrink-0 rounded-full bg-muted flex items-center justify-center">
              <span className="text-2xl font-semibold text-muted-foreground">
                ?
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Built by [Your Name]
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {/* Replace this with your real bio */}I build SaaS products and
                got tired of rewiring auth, billing, and plan enforcement from
                scratch every time. So I built the foundation I actually wanted
                — one where the billing system controls what users can do, not
                just what they pay.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                This starter is the base I use for my own products. It's
                opinionated enough to move fast, simple enough to understand in
                an afternoon, and clean enough to hand off to another developer
                without apologies.
              </p>
              <div className="mt-4 flex gap-4">
                {/* Replace with your real links */}
                <a
                  href="#"
                  className="text-sm font-medium text-foreground underline underline-offset-4 hover:text-orange-500"
                >
                  Twitter / X
                </a>
                <a
                  href="#"
                  className="text-sm font-medium text-foreground underline underline-offset-4 hover:text-orange-500"
                >
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
