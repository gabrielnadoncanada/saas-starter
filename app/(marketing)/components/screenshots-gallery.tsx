import { MonitorSmartphone } from "lucide-react";

type Screenshot = {
  slot: string;
  src: string | null;
  caption: string;
};

const screenshots: Screenshot[] = [
  {
    slot: "login",
    src: null,
    caption:
      "Sign in with magic link, Google, or GitHub. Account linking built in.",
  },
  {
    slot: "dashboard",
    src: null,
    caption: "Dashboard with plan status, usage meters, and team overview.",
  },
  {
    slot: "tasks",
    src: null,
    caption:
      "Tasks CRUD with sort, filter, pagination, and plan-gated creation.",
  },
  {
    slot: "team",
    src: null,
    caption: "Team management with roles, invitations, and team switching.",
  },
  {
    slot: "settings",
    src: null,
    caption:
      "Settings: profile, linked auth providers, and account management.",
  },
  {
    slot: "billing",
    src: null,
    caption:
      "Pricing page with monthly plans and Stripe-powered subscriptions.",
  },
  {
    slot: "plan-gate",
    src: null,
    caption: "Plan gating in action - upgrade prompts when limits are reached.",
  },
];

function ScreenshotSlot({ item }: { item: Screenshot }) {
  return (
    <div className="group">
      <div className="overflow-hidden rounded-lg border bg-muted/50">
        {item.src ? (
          <img
            src={item.src}
            alt={item.caption}
            className="w-full"
            loading="lazy"
          />
        ) : (
          <div className="flex aspect-video items-center justify-center">
            <div className="text-center">
              <MonitorSmartphone className="mx-auto h-8 w-8 text-muted-foreground/40" />
              <p className="mt-2 text-xs text-muted-foreground/60">
                {item.slot}.png
              </p>
            </div>
          </div>
        )}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{item.caption}</p>
    </div>
  );
}

export function ScreenshotsGallery() {
  return (
    <section id="screenshots" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 text-center">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            See what you're getting
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-muted-foreground">
            Every screen is real, functional, and ready to customize. Drop in
            your brand and start building.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {screenshots.map((item) => (
            <ScreenshotSlot key={item.slot} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
