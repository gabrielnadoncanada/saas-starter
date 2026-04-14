import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

const navigationItems = ["Features", "Demo", "Pricing", "FAQ"];

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-md text-sm font-semibold">
            S
          </div>
          <div>
            <p className="text-sm font-semibold">StarterKit</p>
            <p className="text-muted-foreground text-xs">
              Next.js SaaS Starter
            </p>
          </div>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          {navigationItems.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-muted-foreground text-sm transition-colors hover:text-foreground"
            >
              {item}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" className="hidden md:inline-flex">
            View Demo
          </Button>
          <Button className="hidden md:inline-flex">Buy Now</Button>
          <Button
            variant="outline"
            size="icon"
            className="md:hidden"
            aria-label="Open navigation"
          >
            <Menu className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
