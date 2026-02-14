/**
 * List people (public) or add person (admin only).
 */
import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export async function GET() {
	const rows = await sql`
		SELECT id, name, points, created_at
		FROM people
		ORDER BY points DESC, name ASC
	`;
	return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
	if (!(await isAdmin())) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	const body = await req.json();
	const name = body?.name?.trim();
	if (!name) {
		return NextResponse.json({ error: "Name required" }, { status: 400 });
	}
	try {
		const rows = await sql`
			INSERT INTO people (name, points)
			VALUES (${name}, 0)
			RETURNING id, name, points, created_at
		`;
		return NextResponse.json(rows[0]);
	} catch (e: unknown) {
		const err = e as { code?: string };
		if (err.code === "23505") {
			return NextResponse.json({ error: "Person already exists" }, { status: 409 });
		}
		throw e;
	}
}
