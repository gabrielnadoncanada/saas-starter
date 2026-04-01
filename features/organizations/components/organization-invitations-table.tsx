'use client'

import { useActionState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { Mail, MoreVertical, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import {
  cancelOrganizationInvitationAction,
  resendOrganizationInvitationAction,
  type CancelOrganizationInvitationActionState,
  type ResendOrganizationInvitationActionState,
} from '@/features/organizations/actions/organization-owner.actions'
import type { OrganizationInvitationView } from '@/features/organizations/types/membership.types'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/components/ui/empty'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'

type OrganizationInvitationsTableProps = {
  canManageInvitations: boolean
  invitations: OrganizationInvitationView[]
}

function formatDate(value?: string | null) {
  if (!value) {
    return 'Pending'
  }

  return format(parseISO(value), 'MMM d, yyyy')
}

function InvitationActions({
  invitation,
  canManageInvitations,
}: {
  invitation: OrganizationInvitationView
  canManageInvitations: boolean
}) {
  const router = useRouter()
  const [resendState, resendAction, isResending] = useActionState<
    ResendOrganizationInvitationActionState,
    FormData
  >(resendOrganizationInvitationAction, {})
  const [cancelState, cancelAction, isCanceling] = useActionState<
    CancelOrganizationInvitationActionState,
    FormData
  >(cancelOrganizationInvitationAction, {})

  useEffect(() => {
    if (resendState.error) {
      toast.error(resendState.error)
    }

    if (cancelState.error) {
      toast.error(cancelState.error)
    }

    if (resendState.success) {
      toast.success(resendState.success)
    }

    if (cancelState.success) {
      toast.success(cancelState.success)
    }

    if (resendState.refreshKey || cancelState.refreshKey) {
      router.refresh()
    }
  }, [
    cancelState.error,
    cancelState.refreshKey,
    cancelState.success,
    resendState.error,
    resendState.refreshKey,
    resendState.success,
    router,
  ])

  if (!canManageInvitations) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='size-9'>
          <MoreVertical className='size-4' />
          <span className='sr-only'>Open invitation actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem asChild>
          <form action={resendAction} className='w-full'>
            <input type='hidden' name='invitationId' value={invitation.id} />
            <button
              type='submit'
              className='flex w-full items-center gap-2 text-left'
              disabled={isResending}
            >
              <Mail className='size-4' />
              {isResending ? 'Resending...' : 'Resend invite'}
            </button>
          </form>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <form action={cancelAction} className='w-full'>
            <input type='hidden' name='invitationId' value={invitation.id} />
            <button
              type='submit'
              className='flex w-full items-center gap-2 text-left'
              disabled={isCanceling}
            >
              <X className='size-4' />
              {isCanceling ? 'Canceling...' : 'Cancel invite'}
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function OrganizationInvitationsTable({
  canManageInvitations,
  invitations,
}: OrganizationInvitationsTableProps) {
  return (
    <div className='rounded-md border p-0.5'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Expires</TableHead>
            {canManageInvitations ? <TableHead className='w-16 text-right' /> : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {invitations.length ? (
            invitations.map((invitation) => (
              <TableRow key={invitation.id}>
                <TableCell>{invitation.email}</TableCell>
                <TableCell>
                  <Badge variant='outline'>Pending</Badge>
                </TableCell>
                <TableCell className='text-muted-foreground'>
                  {formatDate(invitation.expiresAt)}
                </TableCell>
                {canManageInvitations ? (
                  <TableCell className='text-right'>
                    <InvitationActions
                      invitation={invitation}
                      canManageInvitations={canManageInvitations}
                    />
                  </TableCell>
                ) : null}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={canManageInvitations ? 4 : 3}>
                <Empty className='border-0 p-0'>
                  <EmptyHeader>
                    <EmptyMedia variant='icon'>
                      <Mail className='size-6' />
                    </EmptyMedia>
                    <EmptyTitle>No pending invitations</EmptyTitle>
                    <EmptyDescription>
                      All invitations have been accepted or canceled.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
