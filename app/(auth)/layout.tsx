import { Command } from "lucide-react";
import { redirect } from "next/navigation";

import { Separator } from "@/shared/components/ui/separator";
import { routes } from "@/shared/constants/routes";
import { getCurrentUser } from "@/shared/lib/auth/get-current-user";

export default async function AuthLayout(props: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (user) {
    redirect(routes.app.dashboard);
  }

  return (
    <div className="grid h-dvh justify-center p-2">
      <div className="relative order-1 flex h-full">
        <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[400px]">
          {props.children}
        </div>
      </div>
    </div>
  );
}
