/**
 * List redeems (public) or add redeem (admin only).
 */
import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export async function GET() {
	const rows = await sql`
		SELECT id, name, cost, description, created_at
		FROM redeems
		ORDER BY cost ASC, name ASC
	`;
	return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
	if (!(await isAdmin())) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	const body = await req.json();
	const name = body?.name?.trim();
	const cost = Number(body?.cost);
	const description = body?.description?.trim() || null;
	if (!name || isNaN(cost) || cost < 0) {
		return NextResponse.json({ error: "Name and valid cost required" }, { status: 400 });
	}
	const rows = await sql`
		INSERT INTO redeems (name, cost, description)
		VALUES (${name}, ${cost}, ${description})
		RETURNING id, name, cost, description, created_at
	`;
	return NextResponse.json(rows[0]);
}
