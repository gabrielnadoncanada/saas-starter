import { PricingSection } from '@/features/billing/components/PricingSection';
import { FaqSection } from '@/features/billing/components/FaqSection';

export const revalidate = 3600;

export default async function PricingPage() {
  return (
    <>
      <PricingSection />
      <FaqSection />
    </>
  );
}
