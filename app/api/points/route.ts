/**
 * Give points to a person (admin only).
 */
import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
	if (!(await isAdmin())) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	const body = await req.json();
	const personId = Number(body?.personId);
	const amount = Number(body?.amount);
	const note = body?.note?.trim() || null;
	if (!personId || isNaN(amount) || amount === 0) {
		return NextResponse.json({ error: "personId and non-zero amount required" }, { status: 400 });
	}
	// Update person points and record transaction
	await sql`
		UPDATE people
		SET points = points + ${amount}
		WHERE id = ${personId}
	`;
	const updated = await sql`SELECT id, name, points FROM people WHERE id = ${personId}`;
	if (updated.length === 0) {
		return NextResponse.json({ error: "Person not found" }, { status: 404 });
	}
	await sql`
		INSERT INTO transactions (person_id, amount, type, note)
		VALUES (${personId}, ${amount}, 'grant', ${note})
	`;
	return NextResponse.json(updated[0]);
}
