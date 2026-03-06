import { PricingPage as BillingPricingPage } from '@/features/billing/components/PricingPage';

// Prices are fresh for one hour max
export const revalidate = 3600;

export default async function PricingPage() {
  return <BillingPricingPage />;
}
