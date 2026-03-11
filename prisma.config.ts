import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx lib/db/seed.ts",
  },
  datasource: {
    url: env("POSTGRES_URL"),
  },
});
