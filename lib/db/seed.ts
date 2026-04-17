import "dotenv/config";

import { execSync } from "node:child_process";

import { runAsAdmin } from "./tenant-scope";

function ensureFreshPrismaClient() {
  execSync("pnpm exec prisma generate", { stdio: "inherit" });
}

async function seed() {
  ensureFreshPrismaClient();

  const [{ seedAdminWorkspace }, { seedDemoWorkspace }, { seedStripeProducts }] =
    await Promise.all([
      import("./seeds/admin-seed"),
      import("./seeds/demo-workspace-seed"),
      import("./seeds/stripe-products-seed"),
    ]);

  await runAsAdmin(async () => {
    await seedAdminWorkspace();
    await seedDemoWorkspace();
    await seedStripeProducts();
  });
}

seed()
  .catch((error) => {
    console.error("Seed process failed:", error);
    process.exit(1);
  })
  .finally(() => {
    console.log("Seed process finished. Exiting...");
    process.exit(0);
  });
