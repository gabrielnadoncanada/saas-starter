'use client'

import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useState } from 'react'

import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog'
import { routes } from '@/constants/routes'

interface SignOutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function handleSignOut() {
    setIsLoading(true)

    const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`

    try {
      await signOut({ redirect: false })
      router.push(
        `${routes.auth.login}?redirect=${encodeURIComponent(currentPath)}`
      )
      router.refresh()
    } finally {
      setIsLoading(false)
      onOpenChange(false)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Sign out'
      desc='Are you sure you want to sign out? You will need to sign in again to access your account.'
      confirmText='Sign out'
      destructive
      handleConfirm={() => {
        void handleSignOut()
      }}
      isLoading={isLoading}
      className='sm:max-w-sm'
    />
  )
}
