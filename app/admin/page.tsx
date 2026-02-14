"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";

interface Person {
	id: number;
	name: string;
	points: number;
}

interface Redeem {
	id: number;
	name: string;
	cost: number;
}

export default function AdminPage() {
	const router = useRouter();
	const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
	const [people, setPeople] = useState<Person[]>([]);
	const [redeems, setRedeems] = useState<Redeem[]>([]);
	const [refresh, setRefresh] = useState(0);

	useEffect(() => {
		fetch("/api/auth/session")
			.then((r) => r.json())
			.then((d) => setIsAdmin(d.isAdmin))
			.catch(() => setIsAdmin(false));
	}, []);

	useEffect(() => {
		if (!isAdmin) return;
		Promise.all([
			fetch("/api/people").then((r) => r.json()),
			fetch("/api/redeems").then((r) => r.json()),
		]).then(([p, r]) => {
			setPeople(p);
			setRedeems(r);
		});
	}, [isAdmin, refresh]);

	if (isAdmin === null) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-mesh">
				<div className="flex flex-col items-center">
					<div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500/30 border-t-orange-500" />
					<p className="mt-4 text-sm text-zinc-500">Checking auth...</p>
				</div>
			</div>
		);
	}

	if (!isAdmin) {
		router.replace("/login?callbackUrl=/admin");
		return null;
	}

	async function initDb() {
		try {
			const res = await fetch("/api/init", { method: "POST" });
			const data = await res.json();
			alert(res.ok ? data.message : data.error || "Failed");
			if (res.ok) setRefresh((r) => r + 1);
		} catch (e) {
			alert("Failed: " + String(e));
		}
	}

	return (
		<div className="min-h-screen bg-mesh">
			<header className="sticky top-0 z-10 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-xl">
				<div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
					<h1 className="font-display text-2xl font-bold tracking-tight text-orange-400">
						◇ Admin · HotwireRobotics
					</h1>
					<div className="flex items-center gap-2">
						<button
							onClick={initDb}
							className="rounded-lg px-3 py-2 text-sm text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
							title="Run once after first deploy to create DB tables"
						>
							Init DB
						</button>
						<Link
							href="/"
							className="rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
						>
							View leaderboard
						</Link>
						<button
							onClick={() => signOut({ callbackUrl: "/" })}
							className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-400 transition-colors hover:border-red-500/50 hover:bg-zinc-800 hover:text-red-400"
						>
							Log out
						</button>
					</div>
				</div>
			</header>

			<main className="mx-auto max-w-5xl px-4 py-10">
				<div className="space-y-8">
					{/* Quick actions - most common */}
					<section>
						<h2 className="mb-4 font-display text-lg font-semibold text-zinc-300">
							Quick actions
						</h2>
						<div className="grid gap-6 lg:grid-cols-2">
							<GivePointsCard
								people={people}
								onSuccess={() => setRefresh((r) => r + 1)}
							/>
							<AddPersonCard onSuccess={() => setRefresh((r) => r + 1)} />
						</div>
					</section>

					{/* Store management */}
					<section>
						<h2 className="mb-4 font-display text-lg font-semibold text-zinc-300">
							Store & redeems
						</h2>
						<div className="grid gap-6 lg:grid-cols-2">
							<AddRedeemCard onSuccess={() => setRefresh((r) => r + 1)} />
							<ProcessRedeemCard
								people={people}
								redeems={redeems}
								onSuccess={() => setRefresh((r) => r + 1)}
							/>
						</div>
					</section>
				</div>
			</main>
		</div>
	);
}

function GivePointsCard({
	people,
	onSuccess,
}: {
	people: Person[];
	onSuccess: () => void;
}) {
	const [personId, setPersonId] = useState("");
	const [amount, setAmount] = useState("");
	const [note, setNote] = useState("");
	const [loading, setLoading] = useState(false);
	const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

	async function submit(e: React.FormEvent) {
		e.preventDefault();
		setMsg(null);
		setLoading(true);
		try {
			const res = await fetch("/api/points", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					personId: Number(personId),
					amount: Number(amount),
					note: note || null,
				}),
			});
			const data = await res.json();
			if (res.ok) {
				setMsg({ ok: true, text: `Added ${amount} pts to ${data.name}. New total: ${data.points}` });
				setPersonId("");
				setAmount("");
				setNote("");
				onSuccess();
			} else {
				setMsg({ ok: false, text: data.error || "Failed" });
			}
		} catch {
			setMsg({ ok: false, text: "Network error" });
		} finally {
			setLoading(false);
		}
	}

	return (
		<AdminCard title="Give Points">
			<form onSubmit={submit} className="space-y-4">
				<div>
					<label className="mb-2 block text-sm font-medium text-zinc-400">Person</label>
					<select
						value={personId}
						onChange={(e) => setPersonId(e.target.value)}
						className="w-full rounded-xl border border-zinc-700 bg-zinc-800/80 px-4 py-2.5 text-zinc-100 transition-colors focus:border-orange-500/50"
						required
					>
						<option value="">Select...</option>
						{people.map((p) => (
							<option key={p.id} value={p.id}>
								{p.name} ({p.points} pts)
							</option>
						))}
					</select>
				</div>
				<div>
					<label className="mb-2 block text-sm font-medium text-zinc-400">Amount</label>
					<div className="flex flex-wrap gap-2">
						{[5, 10, 25, 50, 100].map((n) => (
							<button
								key={n}
								type="button"
								onClick={() => setAmount(String(n))}
								className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
									amount === String(n)
										? "bg-orange-500 text-zinc-900"
										: "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
								}`}
							>
								{n}
							</button>
						))}
					</div>
					<input
						type="number"
						value={amount}
						onChange={(e) => setAmount(e.target.value)}
						className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-800/80 px-4 py-2.5 text-zinc-100 transition-colors focus:border-orange-500/50"
						placeholder="Or enter custom"
					/>
				</div>
				<div>
					<label className="mb-2 block text-sm font-medium text-zinc-400">Note (optional)</label>
					<input
						type="text"
						value={note}
						onChange={(e) => setNote(e.target.value)}
						className="w-full rounded-xl border border-zinc-700 bg-zinc-800/80 px-4 py-2.5 text-zinc-100 transition-colors focus:border-orange-500/50"
						placeholder="e.g. code review"
					/>
				</div>
				{msg && (
					<div className={`rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
						{msg.text}
					</div>
				)}
				<button
					type="submit"
					disabled={loading || people.length === 0}
					className="w-full rounded-xl bg-orange-500 py-3 font-semibold text-zinc-900 transition-all hover:bg-orange-400 hover:shadow-glow disabled:opacity-50"
				>
					{loading ? "Sending..." : "Give points"}
				</button>
			</form>
		</AdminCard>
	);
}

function AddPersonCard({ onSuccess }: { onSuccess: () => void }) {
	const [name, setName] = useState("");
	const [loading, setLoading] = useState(false);
	const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

	async function submit(e: React.FormEvent) {
		e.preventDefault();
		setMsg(null);
		setLoading(true);
		try {
			const res = await fetch("/api/people", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: name.trim() }),
			});
			const data = await res.json();
			if (res.ok) {
				setMsg({ ok: true, text: `Added ${data.name}` });
				setName("");
				onSuccess();
			} else {
				setMsg({ ok: false, text: data.error || "Failed" });
			}
		} catch {
			setMsg({ ok: false, text: "Network error" });
		} finally {
			setLoading(false);
		}
	}

	return (
		<AdminCard title="Add Person">
			<form onSubmit={submit} className="space-y-4">
				<div>
					<label className="mb-2 block text-sm font-medium text-zinc-400">Name</label>
					<input
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						className="w-full rounded-xl border border-zinc-700 bg-zinc-800/80 px-4 py-2.5 text-zinc-100 transition-colors focus:border-orange-500/50"
						placeholder="Jane"
						required
					/>
				</div>
				{msg && (
					<div className={`rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
						{msg.text}
					</div>
				)}
				<button
					type="submit"
					disabled={loading}
					className="w-full rounded-xl bg-orange-500 py-3 font-semibold text-zinc-900 transition-all hover:bg-orange-400 hover:shadow-glow disabled:opacity-50"
				>
					{loading ? "Adding..." : "Add person"}
				</button>
			</form>
		</AdminCard>
	);
}

function AddRedeemCard({ onSuccess }: { onSuccess: () => void }) {
	const [name, setName] = useState("");
	const [cost, setCost] = useState("");
	const [description, setDescription] = useState("");
	const [loading, setLoading] = useState(false);
	const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

	async function submit(e: React.FormEvent) {
		e.preventDefault();
		setMsg(null);
		setLoading(true);
		try {
			const res = await fetch("/api/redeems", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: name.trim(),
					cost: Number(cost),
					description: description.trim() || null,
				}),
			});
			const data = await res.json();
			if (res.ok) {
				setMsg({ ok: true, text: `Added redeem: ${data.name} (${data.cost} pts)` });
				setName("");
				setCost("");
				setDescription("");
				onSuccess();
			} else {
				setMsg({ ok: false, text: data.error || "Failed" });
			}
		} catch {
			setMsg({ ok: false, text: "Network error" });
		} finally {
			setLoading(false);
		}
	}

	return (
		<AdminCard title="Add Redeem">
			<form onSubmit={submit} className="space-y-4">
				<div>
					<label className="mb-2 block text-sm font-medium text-zinc-400">Name</label>
					<input
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						className="w-full rounded-xl border border-zinc-700 bg-zinc-800/80 px-4 py-2.5 text-zinc-100 transition-colors focus:border-orange-500/50"
						placeholder="Coffee run"
						required
					/>
				</div>
				<div>
					<label className="mb-2 block text-sm font-medium text-zinc-400">Cost (points)</label>
					<div className="flex flex-wrap gap-2">
						{[10, 25, 50, 100, 200].map((n) => (
							<button
								key={n}
								type="button"
								onClick={() => setCost(String(n))}
								className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
									cost === String(n)
										? "bg-orange-500 text-zinc-900"
										: "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
								}`}
							>
								{n}
							</button>
						))}
					</div>
					<input
						type="number"
						value={cost}
						onChange={(e) => setCost(e.target.value)}
						className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-800/80 px-4 py-2.5 text-zinc-100 transition-colors focus:border-orange-500/50"
						placeholder="Or enter custom"
						min="1"
						required
					/>
				</div>
				<div>
					<label className="mb-2 block text-sm font-medium text-zinc-400">Description (optional)</label>
					<input
						type="text"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						className="w-full rounded-xl border border-zinc-700 bg-zinc-800/80 px-4 py-2.5 text-zinc-100 transition-colors focus:border-orange-500/50"
						placeholder="Team buys you coffee"
					/>
				</div>
				{msg && (
					<div className={`rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
						{msg.text}
					</div>
				)}
				<button
					type="submit"
					disabled={loading}
					className="w-full rounded-xl bg-orange-500 py-3 font-semibold text-zinc-900 transition-all hover:bg-orange-400 hover:shadow-glow disabled:opacity-50"
				>
					{loading ? "Adding..." : "Add redeem"}
				</button>
			</form>
		</AdminCard>
	);
}

function ProcessRedeemCard({
	people,
	redeems,
	onSuccess,
}: {
	people: Person[];
	redeems: Redeem[];
	onSuccess: () => void;
}) {
	const [personId, setPersonId] = useState("");
	const [redeemId, setRedeemId] = useState("");
	const [loading, setLoading] = useState(false);
	const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

	async function submit(e: React.FormEvent) {
		e.preventDefault();
		setMsg(null);
		setLoading(true);
		try {
			const res = await fetch("/api/redeem", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					personId: Number(personId),
					redeemId: Number(redeemId),
				}),
			});
			const data = await res.json();
			if (res.ok) {
				setMsg({ ok: true, text: `Redeemed! ${data.name} now has ${data.points} pts` });
				setPersonId("");
				setRedeemId("");
				onSuccess();
			} else {
				setMsg({ ok: false, text: data.error || "Failed" });
			}
		} catch {
			setMsg({ ok: false, text: "Network error" });
		} finally {
			setLoading(false);
		}
	}

	return (
		<AdminCard title="Process Redeem">
			<form onSubmit={submit} className="space-y-4">
				<div>
					<label className="mb-2 block text-sm font-medium text-zinc-400">Person</label>
					<select
						value={personId}
						onChange={(e) => setPersonId(e.target.value)}
						className="w-full rounded-xl border border-zinc-700 bg-zinc-800/80 px-4 py-2.5 text-zinc-100 transition-colors focus:border-orange-500/50"
						required
					>
						<option value="">Select...</option>
						{people.map((p) => (
							<option key={p.id} value={p.id}>
								{p.name} ({p.points} pts)
							</option>
						))}
					</select>
				</div>
				<div>
					<label className="mb-2 block text-sm font-medium text-zinc-400">Redeem</label>
					<select
						value={redeemId}
						onChange={(e) => setRedeemId(e.target.value)}
						className="w-full rounded-xl border border-zinc-700 bg-zinc-800/80 px-4 py-2.5 text-zinc-100 transition-colors focus:border-orange-500/50"
						required
					>
						<option value="">Select...</option>
						{redeems.map((r) => (
							<option key={r.id} value={r.id}>
								{r.name} ({r.cost} pts)
							</option>
						))}
					</select>
				</div>
				{msg && (
					<div className={`rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
						{msg.text}
					</div>
				)}
				<button
					type="submit"
					disabled={loading || people.length === 0 || redeems.length === 0}
					className="w-full rounded-xl bg-orange-500 py-3 font-semibold text-zinc-900 transition-all hover:bg-orange-400 hover:shadow-glow disabled:opacity-50"
				>
					{loading ? "Processing..." : "Process redeem"}
				</button>
			</form>
		</AdminCard>
	);
}

function AdminCard({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-card backdrop-blur-sm transition-shadow hover:shadow-glow">
			<h2 className="mb-5 font-display text-lg font-semibold text-zinc-200">
				{title}
			</h2>
			{children}
		</div>
	);
}
