export function hasAnyAiProvider(): boolean {
  return Boolean(
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
      process.env.GROQ_API_KEY?.trim(),
  );
}
