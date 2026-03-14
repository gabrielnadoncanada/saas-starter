
import { Main } from '@/shared/components/layout/shell/Main';
import { Separator } from '@/shared/components/ui/separator';
import { SidebarNav } from '@/features/account/components/settings/SidebarNav';


export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {

  return (
    <Main fixed>
      <div className='space-y-0.5'>
        <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>
          Settings
        </h1>
        <p className='text-muted-foreground'>
          Manage your account settings and set e-mail preferences.
        </p>
      </div>
      <Separator className='my-4 lg:my-6' />
      <div className='flex flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12'>
        <aside className='top-0 lg:sticky lg:w-1/5'>
          <SidebarNav />
        </aside>
        <div className='flex w-full overflow-y-hidden p-1'>
          {children}
        </div>
      </div>
    </Main>
  );
}
