'use client'

import { useActionState, useEffect, useState } from 'react'
import { Loader2, UserPlus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import {
  type InviteOrganizationMemberActionState,
  inviteOrganizationMemberAction,
} from '@/features/organizations/actions/organization-owner.actions'
import { getFieldState } from '@/shared/lib/get-field-state'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group'

type InviteOrganizationMemberDialogProps = {
  canInviteMembers: boolean
}

export function InviteOrganizationMemberDialog({
  canInviteMembers,
}: InviteOrganizationMemberDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState<
    InviteOrganizationMemberActionState,
    FormData
  >(inviteOrganizationMemberAction, {})

  const emailField = getFieldState(state, 'email')
  const defaultEmail = state.values?.email ?? ''
  const defaultRole = state.values?.role ?? 'member'

  useEffect(() => {
    if (state.error && !state.fieldErrors) {
      toast.error(state.error)
    }

    if (state.success) {
      toast.success(state.success)
      setOpen(false)
    }

    if (state.refreshKey) {
      router.refresh()
    }
  }, [router, state.error, state.fieldErrors, state.refreshKey, state.success])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={!canInviteMembers}>
          <UserPlus className='size-4' />
          Invite Members
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a member</DialogTitle>
          <DialogDescription>
            Send an invitation to join your organization.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className='space-y-4'>
          <Field data-invalid={emailField.invalid}>
            <FieldLabel htmlFor='invite-member-email'>Email</FieldLabel>
            <Input
              id='invite-member-email'
              name='email'
              type='email'
              placeholder='name@company.com'
              defaultValue={defaultEmail}
              aria-invalid={emailField.invalid}
              disabled={!canInviteMembers}
              required
            />
            <FieldError>{emailField.error}</FieldError>
          </Field>

          <div className='space-y-3'>
            <Label>Role</Label>
            <RadioGroup
              name='role'
              defaultValue={defaultRole}
              disabled={!canInviteMembers}
            >
              <div className='flex items-center gap-2'>
                <RadioGroupItem value='member' id='invite-role-member' />
                <Label htmlFor='invite-role-member'>Member</Label>
              </div>
              <div className='flex items-center gap-2'>
                <RadioGroupItem value='admin' id='invite-role-admin' />
                <Label htmlFor='invite-role-admin'>Admin</Label>
              </div>
            </RadioGroup>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant='outline'>Cancel</Button>
            </DialogClose>
            <Button type='submit' disabled={isPending || !canInviteMembers}>
              {isPending ? (
                <>
                  <Loader2 className='size-4 animate-spin' />
                  Sending...
                </>
              ) : (
                'Send Invite'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
