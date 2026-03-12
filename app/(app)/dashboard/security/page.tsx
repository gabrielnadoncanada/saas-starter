import { SecuritySettingsSection } from '@/features/auth/components/settings/SecuritySettingsSection';

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SecurityPage({ searchParams }: PageProps) {
  return <SecuritySettingsSection searchParams={await searchParams} />;
}