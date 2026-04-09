import { Trash } from "lucide-react";

import { DeleteOrganizationDialog } from "@/features/organizations/components/delete-organization-panel";
import { RenameOrganizationPanel } from "@/features/organizations/components/rename-organization-panel";
import { getCurrentOrganizationContext } from "@/features/organizations/server/current-organization";
import {
  Page,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/shared/components/layout/page-layout";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

export default async function SettingsPage() {
  const context = await getCurrentOrganizationContext();

  return (
    <Page>
      <PageHeader>
        <PageTitle>Organization Settings</PageTitle>
        <PageDescription>
          Manage your organization details and subscription.
        </PageDescription>
      </PageHeader>
      {context ? (
        <>
          <RenameOrganizationPanel
            currentName={context.organization.name}
            canManage={context.isOwner}
          />
          {context.isOwner ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trash className="size-4" />
                  Delete Organization
                </CardTitle>
                <CardDescription>
                  Permanently delete this organization and all of its data
                </CardDescription>
                <CardAction>
                  <DeleteOrganizationDialog>
                    <Button variant="destructive" size="sm">
                      Delete Organization
                    </Button>
                  </DeleteOrganizationDialog>
                </CardAction>
              </CardHeader>
            </Card>
          ) : null}
        </>
      ) : null}
    </Page>
  );
}
