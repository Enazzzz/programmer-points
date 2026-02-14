/**
 * NextAuth config - GitHub sign in. All users can sign in; admin from config.
 */
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { ADMIN_GITHUB_USERNAME } from "./config/admin";

export const { handlers, auth, signIn, signOut } = NextAuth({
	providers: [
		GitHub({
			clientId: process.env.GITHUB_CLIENT_ID ?? "",
			clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
		}),
	],
	trustHost: true,
	secret: process.env.AUTH_SECRET || (process.env.NODE_ENV === "development" ? "dev-secret-min-32-chars-required!!" : undefined),
	pages: {
		signIn: "/login",
		error: "/login",
	},
	callbacks: {
		signIn() {
			return true;
		},
		async session({ session, token }) {
			const login = (token as { login?: string }).login ?? "";
			const isAdmin = login.toLowerCase() === ADMIN_GITHUB_USERNAME.toLowerCase();
			return { ...session, isAdmin, githubId: token.sub as string };
		},
		async jwt({ token, profile }) {
			if (profile) {
				token.login = (profile as { login?: string }).login;
				token.githubId = (profile as { id?: number }).id;
			}
			return token;
		},
	},
});
