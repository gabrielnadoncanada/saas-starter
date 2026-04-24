import { Benefits } from "./_components/benefits";
import { ClosingCta } from "./_components/closing-cta";
import { CodeShowcase } from "./_components/code-showcase";
import { ComparisonGrid } from "./_components/comparison-grid";
import { Faq } from "./_components/faq";
import { FeatureTabs } from "./_components/feature-tabs";
import { Hero } from "./_components/hero";
import { HeroMedia } from "./_components/hero-media";
import { HowItWorks } from "./_components/how-it-works";
import { Pricing } from "./_components/pricing";
import { SiteFooter } from "./_components/site-footer";
import { SiteHeader } from "./_components/site-header";
import { SpecTable } from "./_components/spec-table";

export default function MarketingLandingPage() {
  return (
    <>
      <SiteHeader />
      <Hero />
      <HeroMedia />
      <Benefits />
      <FeatureTabs />
      <CodeShowcase />
      <HowItWorks />
      <SpecTable />
      <ComparisonGrid />
      <Pricing />
      <Faq />
      <ClosingCta />
      <SiteFooter />
    </>
  );
}
