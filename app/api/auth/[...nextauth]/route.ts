/**
 * NextAuth catch-all route - handles /api/auth/signin, /api/auth/signout, etc.
 */
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
