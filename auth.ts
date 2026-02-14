/**
 * NextAuth config - GitHub-only sign in, restricted to admin from config.
 */
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { ADMIN_GITHUB_USERNAME } from "./config/admin";

export const { handlers, auth, signIn, signOut } = NextAuth({
	providers: [
		GitHub({
			clientId: process.env.GITHUB_CLIENT_ID!,
			clientSecret: process.env.GITHUB_CLIENT_SECRET!,
		}),
	],
	pages: {
		signIn: "/admin/login",
		error: "/admin/login",
	},
	callbacks: {
		signIn({ profile }) {
			const login = (profile as { login?: string })?.login;
			if (!login) return false;
			return login.toLowerCase() === ADMIN_GITHUB_USERNAME.toLowerCase();
		},
		session({ session }) {
			// Only allowed user can sign in, so if they have a session they're admin
			return { ...session, isAdmin: true };
		},
	},
});
