/**
 * User redeems an item for themselves (must be signed in).
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { sql } from "@/lib/db";

export async function POST(req: NextRequest) {
	const session = await auth();
	const githubId = (session as { githubId?: string } | null)?.githubId;
	if (!githubId) {
		return NextResponse.json({ error: "Sign in to redeem" }, { status: 401 });
	}
	const body = await req.json();
	const redeemId = Number(body?.redeemId);
	if (!redeemId) {
		return NextResponse.json({ error: "redeemId required" }, { status: 400 });
	}
	const [person] = await sql`SELECT id, name, points FROM people WHERE github_id = ${githubId}`;
	if (!person) {
		return NextResponse.json({ error: "Profile not found" }, { status: 404 });
	}
	const [redeem] = await sql`SELECT id, name, cost FROM redeems WHERE id = ${redeemId}`;
	if (!redeem) {
		return NextResponse.json({ error: "Redeem not found" }, { status: 404 });
	}
	const r = redeem as { cost: number; name: string };
	const p = person as { id: number; points: number };
	if (Number(p.points) < Number(r.cost)) {
		return NextResponse.json({ error: "Insufficient points" }, { status: 400 });
	}
	const cost = -r.cost;
	await sql`UPDATE people SET points = points + ${cost} WHERE id = ${p.id}`;
	await sql`
		INSERT INTO transactions (person_id, amount, type, redeem_id, note)
		VALUES (${p.id}, ${cost}, 'redeem', ${redeemId}, ${r.name})
	`;
	const [updated] = await sql`SELECT id, name, points FROM people WHERE id = ${p.id}`;
	return NextResponse.json(updated);
}
