import { PricingSection } from '@/features/billing/components/PricingSection';

export const revalidate = 3600;

export default async function PricingPage() {
  return <PricingSection />;
}
