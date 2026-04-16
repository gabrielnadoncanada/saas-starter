import crypto from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import readline from "node:readline";

const c = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
};

function colorize(code: string, text: string) {
  return process.stdout.isTTY ? `${code}${text}${c.reset}` : text;
}

function ask(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer.trim());
    }),
  );
}

async function askWithDefault(
  label: string,
  defaultValue?: string,
): Promise<string> {
  const suffix = defaultValue ? colorize(c.dim, ` [${defaultValue}]`) : "";
  const answer = await ask(`${label}${suffix}: `);
  return answer || defaultValue || "";
}

async function askYesNo(label: string, defaultYes = false): Promise<boolean> {
  const hint = defaultYes ? "Y/n" : "y/N";
  const answer = await ask(`${label} (${hint}): `);
  if (!answer) return defaultYes;
  return answer.toLowerCase().startsWith("y");
}

function section(title: string) {
  console.log(`\n${colorize(c.bold + c.cyan, `› ${title}`)}`);
}

function info(message: string) {
  console.log(colorize(c.dim, `  ${message}`));
}

function success(message: string) {
  console.log(colorize(c.green, `  ✓ ${message}`));
}

function generateAuthSecret(): string {
  return crypto.randomBytes(32).toString("base64url");
}

type EnvGroup = {
  name: string;
  description: string;
  optional: boolean;
  collect: () => Promise<Record<string, string>>;
};

const groups: EnvGroup[] = [
  {
    name: "Database",
    description: "PostgreSQL connection string. Required.",
    optional: false,
    collect: async () => {
      info("Local Docker default: postgresql://postgres:postgres@localhost:5432/postgres");
      const url = await askWithDefault(
        "POSTGRES_URL",
        "postgresql://postgres:postgres@localhost:5432/postgres",
      );
      return { POSTGRES_URL: url };
    },
  },
  {
    name: "App URLs and auth",
    description: "BASE_URL and AUTH_SECRET. Required.",
    optional: false,
    collect: async () => {
      const baseUrl = await askWithDefault("BASE_URL", "http://localhost:3000");
      const generated = generateAuthSecret();
      info("AUTH_SECRET generated automatically (32 bytes, base64url).");
      return { BASE_URL: baseUrl, AUTH_SECRET: generated };
    },
  },
  {
    name: "Stripe billing",
    description: "Secret key + webhook secret + 4 price IDs. Optional.",
    optional: true,
    collect: async () => {
      const secret = await askWithDefault("STRIPE_SECRET_KEY", "");
      const webhook = await askWithDefault("STRIPE_WEBHOOK_SECRET", "");
      const proMonthly = await askWithDefault("STRIPE_PRICE_PRO_MONTHLY", "");
      const proYearly = await askWithDefault("STRIPE_PRICE_PRO_YEARLY", "");
      const teamMonthly = await askWithDefault("STRIPE_PRICE_TEAM_MONTHLY", "");
      const teamYearly = await askWithDefault("STRIPE_PRICE_TEAM_YEARLY", "");
      return {
        STRIPE_SECRET_KEY: secret,
        STRIPE_WEBHOOK_SECRET: webhook,
        STRIPE_PRICE_PRO_MONTHLY: proMonthly,
        STRIPE_PRICE_PRO_YEARLY: proYearly,
        STRIPE_PRICE_TEAM_MONTHLY: teamMonthly,
        STRIPE_PRICE_TEAM_YEARLY: teamYearly,
      };
    },
  },
  {
    name: "Email (Resend)",
    description: "Transactional email via Resend. Optional.",
    optional: true,
    collect: async () => {
      const key = await askWithDefault("RESEND_API_KEY", "");
      const from = await askWithDefault(
        "EMAIL_FROM",
        "SaaS Starter <hello@example.com>",
      );
      return { RESEND_API_KEY: key, EMAIL_FROM: from };
    },
  },
  {
    name: "OAuth",
    description: "Google and GitHub social login. Optional.",
    optional: true,
    collect: async () => {
      const googleId = await askWithDefault("GOOGLE_CLIENT_ID", "");
      const googleSecret = await askWithDefault("GOOGLE_CLIENT_SECRET", "");
      const githubId = await askWithDefault("GITHUB_CLIENT_ID", "");
      const githubSecret = await askWithDefault("GITHUB_CLIENT_SECRET", "");
      return {
        GOOGLE_CLIENT_ID: googleId,
        GOOGLE_CLIENT_SECRET: googleSecret,
        GITHUB_CLIENT_ID: githubId,
        GITHUB_CLIENT_SECRET: githubSecret,
      };
    },
  },
  {
    name: "Rate limiting (Upstash Redis)",
    description: "Free tier at console.upstash.com. Optional.",
    optional: true,
    collect: async () => {
      const url = await askWithDefault("UPSTASH_REDIS_REST_URL", "");
      const token = await askWithDefault("UPSTASH_REDIS_REST_TOKEN", "");
      return {
        UPSTASH_REDIS_REST_URL: url,
        UPSTASH_REDIS_REST_TOKEN: token,
      };
    },
  },
  {
    name: "Demo mode",
    description: "Public demo deploys only (banner + daily DB reset). Optional.",
    optional: true,
    collect: async () => {
      const enabled = await askYesNo("Enable DEMO_MODE?", false);
      if (!enabled) {
        const result: Record<string, string> = { DEMO_MODE: "false" };
        return result;
      }
      const cronSecret = crypto.randomBytes(32).toString("base64url");
      info("CRON_SECRET generated automatically.");
      const result: Record<string, string> = {
        DEMO_MODE: "true",
        CRON_SECRET: cronSecret,
      };
      return result;
    },
  },
  {
    name: "Error tracking (Sentry)",
    description: "Optional. Only the DSN is required at runtime.",
    optional: true,
    collect: async () => {
      const dsn = await askWithDefault("NEXT_PUBLIC_SENTRY_DSN", "");
      const org = await askWithDefault("SENTRY_ORG", "");
      const project = await askWithDefault("SENTRY_PROJECT", "");
      return {
        NEXT_PUBLIC_SENTRY_DSN: dsn,
        SENTRY_ORG: org,
        SENTRY_PROJECT: project,
      };
    },
  },
];

async function writeEnv(vars: Record<string, string>) {
  const envPath = path.join(process.cwd(), ".env");
  const exists = await fs
    .access(envPath)
    .then(() => true)
    .catch(() => false);

  if (exists) {
    const overwrite = await askYesNo(
      colorize(c.yellow, ".env already exists. Overwrite?"),
      false,
    );
    if (!overwrite) {
      const generatedPath = path.join(process.cwd(), ".env.generated");
      await writeEnvTo(generatedPath, vars);
      console.log(
        colorize(
          c.yellow,
          `\n  Wrote .env.generated instead. Merge values manually.`,
        ),
      );
      return;
    }
  }

  await writeEnvTo(envPath, vars);
  success(".env written.");
}

async function writeEnvTo(target: string, vars: Record<string, string>) {
  const lines = Object.entries(vars)
    .map(([key, value]) => {
      const quoted = /\s/.test(value) ? `"${value}"` : value;
      return `${key}=${quoted}`;
    })
    .join("\n");
  await fs.writeFile(target, `${lines}\n`);
}

async function main() {
  console.log(colorize(c.bold, "\nSaaS Starter — interactive setup\n"));
  info("Press Enter to accept defaults. Leave optional fields blank to skip.");

  const collected: Record<string, string> = {
    NEXT_PUBLIC_ACCOUNT_MODE: "organizations-only",
    ALLOW_EMAIL_ACCOUNT_LINKING: "true",
  };

  for (const group of groups) {
    section(group.name);
    info(group.description);

    if (group.optional) {
      const configure = await askYesNo(`  Configure ${group.name}?`, false);
      if (!configure) {
        info("Skipped.");
        continue;
      }
    }

    const vars = await group.collect();
    Object.assign(collected, vars);
  }

  console.log("");
  await writeEnv(collected);

  console.log(
    colorize(
      c.bold + c.green,
      "\nDone. Next steps:\n",
    ) +
      "  pnpm db:migrate\n" +
      "  pnpm db:seed\n" +
      "  pnpm dev\n",
  );
}

main().catch((error) => {
  console.error(colorize(c.red, "\nSetup failed:"), error);
  process.exit(1);
});
