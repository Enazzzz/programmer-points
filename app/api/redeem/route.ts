/**
 * Redeem points for an item (admin only - admin processes the redeem).
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
	const redeemId = Number(body?.redeemId);
	if (!personId || !redeemId) {
		return NextResponse.json({ error: "personId and redeemId required" }, { status: 400 });
	}
	const [person] = await sql`SELECT id, name, points FROM people WHERE id = ${personId}`;
	const [redeem] = await sql`SELECT id, name, cost FROM redeems WHERE id = ${redeemId}`;
	if (!person || !redeem) {
		return NextResponse.json({ error: "Person or redeem not found" }, { status: 404 });
	}
	const r = redeem as { cost: number; name: string };
	if (Number((person as { points: number }).points) < Number(r.cost)) {
		return NextResponse.json({ error: "Insufficient points" }, { status: 400 });
	}
	const cost = -r.cost;
	await sql`UPDATE people SET points = points + ${cost} WHERE id = ${personId}`;
	await sql`
		INSERT INTO transactions (person_id, amount, type, redeem_id, note)
		VALUES (${personId}, ${cost}, 'redeem', ${redeemId}, ${r.name})
	`;
	const [updated] = await sql`SELECT id, name, points FROM people WHERE id = ${personId}`;
	return NextResponse.json(updated);
}
