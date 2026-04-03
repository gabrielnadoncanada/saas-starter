import { seedAdminWorkspace } from "./seeds/admin-seed";
import { seedDemoWorkspace } from "./seeds/demo-workspace-seed";
import { seedStripeProducts } from "./seeds/stripe-products-seed";

async function seed() {
  await seedAdminWorkspace();
  await seedDemoWorkspace();
  await seedStripeProducts();
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
