'use client'
import React, { useEffect, useState, type JSX } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { cn } from '@/shared/lib/utils'
import { buttonVariants } from '@/shared/components/ui/button'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import Link from 'next/link'
import { settingsGroup } from '@/shared/components/navigation/config/settings-group'
import type { SidebarNavItem } from '@/shared/components/navigation/sidebar-types'

export function SidebarNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const router = useRouter()
  const pathname = usePathname()
  const [value, setValue] = useState(pathname)
  const items = settingsGroup.items[0].items ?? []


  console.log(items)
  useEffect(() => {
    setValue(pathname)
  }, [pathname])

  const handleSelect = (nextHref: string) => {
    setValue(nextHref)
    router.push(nextHref)
  }

  return (
    <>
      <div className='p-1 md:hidden'>
        <Select value={value} onValueChange={handleSelect}>
          <SelectTrigger className='h-12 sm:w-48'>
            <SelectValue placeholder='Theme' />
          </SelectTrigger>
          <SelectContent>
            {items.map((item: SidebarNavItem, index: number) => (
              <SelectItem key={`${item.url}-${index}`} value={item.url ?? ''}>
                <div className='flex gap-x-4 px-2 py-1'>
                  <span className='scale-125'>{item.icon && React.createElement(item.icon)}</span>
                  <span className='text-md'>{item.title}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ScrollArea
        type='always'
        className='hidden w-full min-w-40 bg-background px-1 py-2 md:block'
      >
        <nav
          className={cn(
            'flex space-x-2 py-1 lg:flex-col lg:space-y-1 lg:space-x-0',
            className
          )}
          {...props}
        >
          {items.map((item: SidebarNavItem, index: number) => (
            <Link key={`${item.url}-${index}`} href={item.url ?? ''}
              className={cn(
                buttonVariants({ variant: 'ghost' }),
                pathname === item.url
                  ? 'bg-muted hover:bg-accent'
                  : 'hover:bg-accent hover:underline',
                'justify-start'
              )}
            >
              <span className='me-2'>{item.icon && React.createElement(item.icon)}</span>
              {item.title}
            </Link>
          ))}
        </nav>
      </ScrollArea>
    </>
  )
}
