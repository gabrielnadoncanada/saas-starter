import { auth } from "@/shared/lib/auth/auth-config";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
