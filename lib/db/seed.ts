import "dotenv/config";

import { execSync } from "node:child_process";

import { runAsAdmin } from "./tenant-scope";

function ensureFreshPrismaClient() {
  execSync("pnpm exec prisma generate", { stdio: "inherit" });
}

async function seed() {
  ensureFreshPrismaClient();

  const [
    { seedAdminOrganization },
    { seedDemoOrganization },
    { seedStripeProducts },
  ] = await Promise.all([
    import("./seeds/admin-seed"),
    import("./seeds/demo-organization-seed"),
    import("./seeds/stripe-products-seed"),
  ]);

  await runAsAdmin(async () => {
    await seedAdminOrganization();
    await seedDemoOrganization();
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
