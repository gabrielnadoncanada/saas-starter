import tseslint from "typescript-eslint";
import unusedImports from "eslint-plugin-unused-imports";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import eslintConfigPrettier from "eslint-config-prettier";

// Files allowed to import runAsAdmin. Every entry bypasses tenant isolation —
// adding here is a security decision. The tenant-scope extension itself and
// its tests are also exempt below.
const RUN_AS_ADMIN_ALLOWLIST = [
  "lib/activity/log-activity.ts",
  "lib/db/seed.ts",
  "lib/db/seeds/**",
  "features/auth/server/onboarding.ts",
  "app/api/demo/reset/route.ts",
];

const TENANT_SCOPE_INTERNAL = [
  "lib/db/tenant-scope.ts",
  "lib/db/tenant-scope-extension.ts",
  "lib/db/tenant-scope-guard.ts",
  "test/isolation/**",
];

const RAW_SQL_RESTRICTIONS = [
  {
    selector:
      "CallExpression[callee.property.name=/^(\\$queryRawUnsafe|\\$executeRawUnsafe)$/]",
    message:
      "Raw SQL bypasses the tenant-scope Prisma extension. Use typed Prisma queries, or add this file to the allowlist in eslint.config.mjs and wrap the call in runInTenantScope / runAsAdmin.",
  },
  {
    selector:
      "TaggedTemplateExpression[tag.property.name=/^(\\$queryRaw|\\$executeRaw)$/]",
    message:
      "Raw SQL bypasses the tenant-scope Prisma extension. Use typed Prisma queries, or add this file to the allowlist in eslint.config.mjs and wrap the call in runInTenantScope / runAsAdmin.",
  },
];

const RUN_AS_ADMIN_IMPORT_RESTRICTION = {
  paths: [
    {
      name: "@/lib/db/tenant-scope",
      importNames: ["runAsAdmin"],
      message:
        "runAsAdmin disables tenant isolation for every query inside its callback. Only the whitelisted entries in eslint.config.mjs (RUN_AS_ADMIN_ALLOWLIST) may import it — route handlers, server actions, and feature code must use runInTenantScope with an explicit org id.",
    },
  ],
};

export default tseslint.config(
  {
    ignores: [
      "node_modules",
      ".next",
      ".git",
      ".pnpm-store",
      ".source",
      "prisma/migrations",
      "scripts",
      "tsconfig.tsbuildinfo",
    ],
  },
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "unused-imports": unusedImports,
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "no-restricted-syntax": ["error", ...RAW_SQL_RESTRICTIONS],
      "no-restricted-imports": ["error", RUN_AS_ADMIN_IMPORT_RESTRICTION],
    },
  },
  {
    files: [...RUN_AS_ADMIN_ALLOWLIST, ...TENANT_SCOPE_INTERNAL],
    rules: {
      "no-restricted-imports": "off",
    },
  },
  eslintConfigPrettier,
);
