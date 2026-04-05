import { hashPassword } from "better-auth/crypto";

import { db } from "@/shared/lib/db/prisma";

import { seedDemoWorkspaceContent } from "./demo-workspace-content-seed";

const DEMO_EMAIL = "demo@starter.local";
const DEMO_PASSWORD = "demo123";
const DEMO_NAME = "Demo Owner";
const DEMO_ORGANIZATION_ID = "seed-demo-org";
const DEMO_ORGANIZATION_SLUG = "demo-workspace";

const TEAMMATE_EMAIL = "teammate@starter.local";
const TEAMMATE_NAME = "Taylor Demo";

async function ensureCredentialAccount(userId: string, password: string) {
  const hashedPassword = await hashPassword(password);
  const existingAccount = await db.account.findFirst({
    where: { userId, providerId: "credential" },
  });

  if (!existingAccount) {
    await db.account.create({
      data: {
        id: crypto.randomUUID(),
        accountId: userId,
        providerId: "credential",
        userId,
        password: hashedPassword,
      },
    });

    return;
  }

  await db.account.update({
    where: { id: existingAccount.id },
    data: { password: hashedPassword },
  });
}

async function ensureUser(input: {
  email: string;
  name: string;
  password?: string;
}) {
  const user = await db.user.upsert({
    where: { email: input.email },
    update: {
      name: input.name,
      emailVerified: true,
    },
    create: {
      name: input.name,
      email: input.email,
      emailVerified: true,
    },
  });

  if (input.password) {
    await ensureCredentialAccount(user.id, input.password);
  }

  return user;
}

async function ensureDemoOrganization() {
  return db.organization.upsert({
    where: { id: DEMO_ORGANIZATION_ID },
    update: {
      name: "Demo Workspace",
      slug: DEMO_ORGANIZATION_SLUG,
      stripeCustomerId: null,
    },
    create: {
      id: DEMO_ORGANIZATION_ID,
      name: "Demo Workspace",
      slug: DEMO_ORGANIZATION_SLUG,
    },
  });
}

async function ensureMembership(input: {
  organizationId: string;
  userId: string;
  role: "owner" | "member";
}) {
  await db.member.upsert({
    where: {
      organizationId_userId: {
        organizationId: input.organizationId,
        userId: input.userId,
      },
    },
    update: {
      role: input.role,
    },
    create: {
      id: crypto.randomUUID(),
      organizationId: input.organizationId,
      userId: input.userId,
      role: input.role,
    },
  });
}

export async function seedDemoWorkspace() {
  const [owner, teammate, organization] = await Promise.all([
    ensureUser({
      email: DEMO_EMAIL,
      name: DEMO_NAME,
      password: DEMO_PASSWORD,
    }),
    ensureUser({
      email: TEAMMATE_EMAIL,
      name: TEAMMATE_NAME,
    }),
    ensureDemoOrganization(),
  ]);

  await ensureMembership({
    organizationId: organization.id,
    userId: owner.id,
    role: "owner",
  });
  await ensureMembership({
    organizationId: organization.id,
    userId: teammate.id,
    role: "member",
  });

  await seedDemoWorkspaceContent({
    organizationId: organization.id,
  });

  console.log(`Demo workspace ready: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
}
