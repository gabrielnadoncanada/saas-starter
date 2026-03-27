'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useFormActionToasts } from '@/shared/hooks/useFormActionToasts';
import { renameOrganizationAction } from '@/features/teams/organization/actions/rename-organization.action';

type ActionState = {
  error?: string;
  success?: string;
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
    {}
  );

  useFormActionToasts(state);

  useEffect(() => {
    if (!state.refreshKey) {
      return;
    }

    router.refresh();
  }, [state.refreshKey, router]);

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
              placeholder="Organization name"
              required
              disabled={!canManage || isPending}
            />
          </div>
          <Button
            type="submit"
            disabled={isPending || !canManage}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save'
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
