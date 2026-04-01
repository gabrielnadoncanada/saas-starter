import "dotenv/config";

import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx shared/lib/db/seed.ts",
  },
  datasource: {
    url: env("POSTGRES_URL"),
  },
});
