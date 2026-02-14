/**
 * Get current user's person record. Creates one if they've signed in but don't have a linked person.
 */
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { sql } from "@/lib/db";

export async function GET() {
	const session = await auth();
	const githubId = (session as { githubId?: string } | null)?.githubId;
	if (!githubId) {
		return NextResponse.json({ error: "Not signed in" }, { status: 401 });
	}
	let rows = await sql`SELECT id, name, points FROM people WHERE github_id = ${githubId}`;
	if (rows.length === 0) {
		const name = (session?.user?.name as string) || session?.user?.email?.split("@")[0] || "User";
		const inserted = await sql`
			INSERT INTO people (name, points, github_id)
			VALUES (${name}, 0, ${githubId})
			RETURNING id, name, points
		`;
		rows = inserted;
	}
	return NextResponse.json(rows[0]);
}
