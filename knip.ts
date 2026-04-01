import type { KnipConfig } from "knip";

const config: KnipConfig = {
  entry: ["app/**/*.{ts,tsx}", "test/**/*.{ts,tsx}"],
  project: [
    "app/**/*.{ts,tsx}",
    "features/**/*.{ts,tsx}",
    "shared/**/*.{ts,tsx}",
    "test/**/*.{ts,tsx}",
  ],
  ignore: [
    "shared/components/ai-elements/**",
    "shared/components/ui/**",
  ],
};

export default config;
