import { vi } from "vitest";

process.env.BASE_URL = "http://localhost:3000";
process.env.AUTH_SECRET = "test-auth-secret";
process.env.STRIPE_SECRET_KEY = "sk_test_123";
process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_123";
process.env.STRIPE_PRICE_PRO_MONTHLY = "price_pro_monthly";
process.env.STRIPE_PRICE_PRO_YEARLY = "price_pro_yearly";
process.env.STRIPE_PRICE_TEAM_MONTHLY = "price_team_monthly";
process.env.STRIPE_PRICE_TEAM_YEARLY = "price_team_yearly";
process.env.RESEND_API_KEY = "re_test_123";
process.env.EMAIL_FROM = "Acme <notifications@example.com>";
process.env.GOOGLE_GENERATIVE_AI_API_KEY = "google_test_123";
process.env.GROQ_API_KEY = "groq_test_123";

vi.mock("server-only", () => ({}));
