"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { renameOrganizationAction } from "@/features/organizations/actions/rename-organization.actions";
import type { FormActionState } from "@/types/form-action-state";

type ActionState = FormActionState<{ name: string }> & {
  refreshKey?: number;
};

type RenameOrganizationPanelProps = {
  currentName: string;
  canManage: boolean;
};

export function RenameOrganizationPanel({
  currentName,
  canManage,
}: RenameOrganizationPanelProps) {
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
        <CardTitle>Organization Name</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="flex items-end gap-3">
          <div className="flex-1">
            <Label htmlFor="name" className="mb-2">
              Name
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              defaultValue={currentName}
              placeholder={"Organization name"}
              required
              disabled={!canManage || isPending}
            />
          </div>
          <Button type="submit" disabled={isPending || !canManage}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </form>
      </CardContent>
      {!canManage ? (
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            Only organization owners can rename the organization.
          </p>
        </CardFooter>
      ) : null}
    </Card>
  );
}
