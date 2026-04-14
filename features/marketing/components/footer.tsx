import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const trustBadges = [
  "Next.js",
  "Auth",
  "Billing",
  "Teams",
  "Dashboard",
  "Settings",
  "Documentation",
];

const footerGroups = [
  {
    title: "Product",
    items: ["Features", "Demo", "Pricing", "FAQ"],
  },
  {
    title: "Included",
    items: ["Auth", "Billing", "Teams", "Documentation"],
  },
  {
    title: "Use cases",
    items: ["B2B SaaS", "Client portals", "AI tools", "Internal software"],
  },
];

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-md text-sm font-semibold">
                S
              </div>
              <div>
                <p className="text-sm font-semibold">StarterKit</p>
                <p className="text-muted-foreground text-xs">
                  Launch faster with a real SaaS foundation
                </p>
              </div>
            </div>
            <p className="text-muted-foreground max-w-md text-sm">
              Built for solo founders, consultants, indie hackers, and small
              technical teams who want to ship quickly without rebuilding the
              same product foundation again.
            </p>
            <div className="flex flex-wrap gap-2">
              {trustBadges.map((item) => (
                <Badge key={item} variant="outline">
                  {item}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {footerGroups.map((group) => (
              <div key={group.title} className="space-y-3">
                <p className="text-sm font-medium">{group.title}</p>
                <div className="grid gap-2">
                  {group.items.map((item) => (
                    <a
                      key={item}
                      href="#"
                      className="text-muted-foreground text-sm transition-colors hover:text-foreground"
                    >
                      {item}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 StarterKit. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <a href="#" className="transition-colors hover:text-foreground">
              Terms
            </a>
            <a href="#" className="transition-colors hover:text-foreground">
              Privacy
            </a>
            <a href="#" className="transition-colors hover:text-foreground">
              License
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
