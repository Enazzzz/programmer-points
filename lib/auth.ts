/**
 * Admin auth - uses NextAuth session. Only user matching config admin can sign in.
 */
import { auth } from "@/auth";

export async function isAdmin(): Promise<boolean> {
	const session = await auth();
	return (session as { isAdmin?: boolean } | null)?.isAdmin === true;
}
