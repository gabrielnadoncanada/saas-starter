const config = {
  entry: ["app/**/*.{ts,tsx}", "test/**/*.{ts,tsx}"],
  project: [
    "app/**/*.{ts,tsx}",
    "features/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "config/**/*.ts",
    "constants/**/*.ts",
    "hooks/**/*.{ts,tsx}",
    "lib/**/*.{ts,tsx}",
    "types/**/*.ts",
    "test/**/*.{ts,tsx}",
  ],
  ignore: [
    "components/ai-elements/**",
    "components/ui/**",
  ],
};

export default config;
