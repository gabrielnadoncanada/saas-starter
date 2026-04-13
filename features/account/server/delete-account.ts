import { getAccountDeletionBlocker } from "@/features/account/server/get-account-deletion-blocker";
import { deleteUserAvatar } from "@/features/account/server/profile-image";
import { auth } from "@/lib/auth/auth-config";
import { db } from "@/lib/db/prisma";

type DeleteAccountParams = {
  userId: string;
  userEmail: string;
  requestHeaders: Headers;
};

export async function deleteAccount({
  userId,
  userEmail,
  requestHeaders,
}: DeleteAccountParams) {
  const blocker = await getAccountDeletionBlocker(userId);

  if (blocker) {
    return { error: blocker };
  }

  const organizations = await auth.api.listOrganizations({
    headers: requestHeaders,
  });

  for (const organization of organizations ?? []) {
    await auth.api.leaveOrganization({
      headers: requestHeaders,
      body: {
        organizationId: organization.id,
      },
    });
  }

  await deleteUserAvatar(userId);

  await db.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        email: `${userEmail}-${userId}-deleted`,
        image: null,
      },
    });

    await tx.account.deleteMany({
      where: { userId },
    });

    await tx.session.deleteMany({
      where: { userId },
    });

    await tx.invitation.updateMany({
      where: {
        inviterId: userId,
        status: "pending",
      },
      data: {
        status: "canceled",
      },
    });
  });

  return {
    success: "Account deleted successfully.",
  };
}
