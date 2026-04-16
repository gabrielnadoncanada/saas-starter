import { ShieldAlert } from "lucide-react";

import { stopImpersonatingAction } from "@/features/admin/actions/users.actions";
import { getAuthSession } from "@/lib/auth/get-session";

export async function ImpersonationBanner() {
  const session = await getAuthSession();
  const impersonatedBy = session?.session
    ? (session.session as { impersonatedBy?: string | null }).impersonatedBy
    : null;

  if (!impersonatedBy) return null;

  const displayName = session?.user?.email ?? session?.user?.name ?? "this user";

  return (
    <div className="sticky top-0 z-50 border-b border-amber-500/40 bg-amber-500/10 text-amber-950 dark:text-amber-50">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-2 text-sm">
        <div className="flex items-center gap-2">
          <ShieldAlert className="size-4" />
          <span>
            You are impersonating <strong>{displayName}</strong>. All actions
            are performed as this user.
          </span>
        </div>
        <form action={stopImpersonatingAction}>
          <button
            type="submit"
            className="underline underline-offset-2 hover:text-amber-700"
          >
            Stop impersonating
          </button>
        </form>
      </div>
    </div>
  );
}
