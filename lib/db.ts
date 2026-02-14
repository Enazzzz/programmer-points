/**
 * Neon Postgres database client.
 * Requires DATABASE_URL from env (set via Vercel Neon integration).
 * Lazy init to avoid build-time errors when DATABASE_URL is unset.
 */
import { neon } from "@neondatabase/serverless";

let _sql: ReturnType<typeof neon> | null = null;

function getSql() {
	if (!_sql) {
		const url = process.env.DATABASE_URL;
		if (!url) throw new Error("DATABASE_URL not set");
		_sql = neon(url);
	}
	return _sql;
}

/** Tagged template for queries: sql`SELECT ...` */
export function sql(
	strings: TemplateStringsArray,
	...values: unknown[]
): Promise<Record<string, unknown>[]> {
	return getSql()(strings, ...values) as Promise<Record<string, unknown>[]>;
}

/** Initialize schema - run once or via /api/init. */
export async function initSchema() {
	await sql`
		CREATE TABLE IF NOT EXISTS people (
			id SERIAL PRIMARY KEY,
			name TEXT NOT NULL UNIQUE,
			points INTEGER NOT NULL DEFAULT 0,
			created_at TIMESTAMPTZ DEFAULT NOW()
		)
	`;
	await sql`
		CREATE TABLE IF NOT EXISTS redeems (
			id SERIAL PRIMARY KEY,
			name TEXT NOT NULL,
			cost INTEGER NOT NULL,
			description TEXT,
			created_at TIMESTAMPTZ DEFAULT NOW()
		)
	`;
	await sql`
		CREATE TABLE IF NOT EXISTS transactions (
			id SERIAL PRIMARY KEY,
			person_id INTEGER REFERENCES people(id),
			amount INTEGER NOT NULL,
			type TEXT NOT NULL,
			redeem_id INTEGER REFERENCES redeems(id),
			note TEXT,
			created_at TIMESTAMPTZ DEFAULT NOW()
		)
	`;
}
