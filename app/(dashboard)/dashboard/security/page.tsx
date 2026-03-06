import { SecuritySettingsPage } from '@/features/auth/components/SecuritySettingsPage';

export default async function SecurityPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <SecuritySettingsPage searchParams={searchParams} />;
}
