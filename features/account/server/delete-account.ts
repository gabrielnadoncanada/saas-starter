import { db } from "@/shared/lib/db/prisma";
import { auth } from "@/shared/lib/auth";
import { getAccountDeletionBlocker } from "@/features/account/server/account-deletion-policy";

export type DeleteAccountUser = {
  id: string;
  email: string;
};

export async function deleteAccount(user: DeleteAccountUser, reqHeaders: Headers) {
  const blocker = await getAccountDeletionBlocker(user.id);

  if (blocker) {
    return { error: blocker };
  }

  const orgs = await auth.api.listOrganizations({ headers: reqHeaders });

  for (const org of orgs ?? []) {
    await auth.api.leaveOrganization({
      headers: reqHeaders,
      body: { organizationId: org.id },
    });
  }

  await db.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: {
        deletedAt: new Date(),
        email: `${user.email}-${user.id}-deleted`,
        image: null,
      },
    });

    await tx.account.deleteMany({
      where: { userId: user.id },
    });

    await tx.session.deleteMany({
      where: { userId: user.id },
    });

    await tx.invitation.updateMany({
      where: {
        inviterId: user.id,
        status: "pending",
      },
      data: { status: "canceled" },
    });
  });

  return { success: "Account deleted successfully." };
}


