"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { renameOrganizationAction } from "@/features/organizations/actions/organization-owner.actions";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useRouter } from "@/shared/i18n/navigation";

type ActionState = {
  error?: string;
  success?: string;
  refreshKey?: number;
  fieldErrors?: Record<string, string[] | undefined>;
};

type RenameOrganizationPanelProps = {
  currentName: string;
  canManage: boolean;
};

export function RenameOrganizationPanel({
  currentName,
  canManage,
}: RenameOrganizationPanelProps) {
  const t = useTranslations("organizations");
  const tc = useTranslations("common");
  const router = useRouter();
  const [state, action, isPending] = useActionState<ActionState, FormData>(
    renameOrganizationAction,
    {},
  );

  useEffect(() => {
    if (state.error && !state.fieldErrors) {
      toast.error(state.error);
    }

    if (state.success) {
      toast.success(state.success);
    }

    if (state.refreshKey) {
      router.refresh();
    }
  }, [router, state.error, state.fieldErrors, state.refreshKey, state.success]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("rename.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="flex items-end gap-3">
          <div className="flex-1">
            <Label htmlFor="name" className="mb-2">
              {t("rename.nameLabel")}
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              defaultValue={currentName}
              placeholder={t("rename.namePlaceholder")}
              required
              disabled={!canManage || isPending}
            />
          </div>
          <Button type="submit" disabled={isPending || !canManage}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {tc("saving")}
              </>
            ) : (
              tc("save")
            )}
          </Button>
        </form>
      </CardContent>
      {!canManage ? (
        <CardFooter>
          <p className="text-sm text-muted-foreground">{t("rename.ownerOnly")}</p>
        </CardFooter>
      ) : null}
    </Card>
  );
}

