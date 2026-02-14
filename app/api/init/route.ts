/**
 * One-time DB schema init. Admin only. Call once after first deploy.
 */
import { NextResponse } from "next/server";
import { initSchema } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export async function POST() {
	if (!(await isAdmin())) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	try {
		await initSchema();
		return NextResponse.json({ ok: true, message: "Schema initialized" });
	} catch (e) {
		console.error(e);
		return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
	}
}
