"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Person {
	id: number;
	name: string;
	points: number;
	created_at: string;
}

interface Redeem {
	id: number;
	name: string;
	cost: number;
	description: string | null;
}

export default function HomePage() {
	const [people, setPeople] = useState<Person[]>([]);
	const [redeems, setRedeems] = useState<Redeem[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		Promise.all([
			fetch("/api/people").then((r) => r.json()),
			fetch("/api/redeems").then((r) => r.json()),
		])
			.then(([p, r]) => {
				setPeople(p);
				setRedeems(r);
			})
			.catch(console.error)
			.finally(() => setLoading(false));
	}, []);

	return (
		<div className="min-h-screen bg-mesh">
			<header className="sticky top-0 z-10 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-xl">
				<div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-5">
					<h1 className="font-display text-2xl font-bold tracking-tight text-amber-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.2)]">
						◇ Programmer Points
					</h1>
					<Link
						href="/admin"
						className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-amber-500/50 hover:bg-zinc-800 hover:text-amber-400"
					>
						Admin
					</Link>
				</div>
			</header>

			<main className="mx-auto max-w-3xl px-4 py-14">
				{loading ? (
					<div className="flex flex-col items-center justify-center py-24">
						<div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500/30 border-t-amber-500" />
						<p className="mt-4 text-sm text-zinc-500">Loading leaderboard...</p>
					</div>
				) : (
					<>
						<section className="animate-fade-in">
							<h2 className="mb-5 flex items-center gap-2 font-display text-xl font-semibold text-zinc-200">
								<span className="text-2xl">🏆</span> Leaderboard
							</h2>
							<div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 shadow-card backdrop-blur-sm">
								{people.length === 0 ? (
									<div className="px-8 py-16 text-center text-zinc-500">
										<p className="text-lg">No one yet.</p>
										<p className="mt-1 text-sm">Admin can add people.</p>
									</div>
								) : (
									<ul className="divide-y divide-zinc-800/80">
										{people.map((p, i) => {
											const rank = i + 1;
											const isTop = rank <= 3;
											const medal =
												rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;
											return (
												<li
													key={p.id}
													className={`flex items-center justify-between px-6 py-4 transition-colors hover:bg-zinc-800/40 ${
														isTop ? "bg-zinc-800/20" : ""
													}`}
												>
													<div className="flex items-center gap-4">
														<span className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 font-mono text-sm font-medium text-zinc-400">
															{medal || `#${rank}`}
														</span>
														<span className="font-medium text-zinc-100">
															{p.name}
														</span>
													</div>
													<span className="rounded-lg bg-amber-500/10 px-3 py-1 font-mono text-sm font-semibold text-amber-400">
														{p.points} pts
													</span>
												</li>
											);
										})}
									</ul>
								)}
							</div>
						</section>

						<section className="mt-16 animate-fade-in">
							<h2 className="mb-5 flex items-center gap-2 font-display text-xl font-semibold text-zinc-200">
								<span className="text-2xl">🎁</span> Redeem Options
							</h2>
							<div className="grid gap-4 sm:grid-cols-2">
								{redeems.length === 0 ? (
									<div className="col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900/50 px-8 py-12 text-center text-zinc-500 shadow-card">
										<p className="text-lg">No redeems yet.</p>
										<p className="mt-1 text-sm">Admin can add them.</p>
									</div>
								) : (
									redeems.map((r) => (
										<div
											key={r.id}
											className="group rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 shadow-card transition-all hover:border-amber-500/30 hover:shadow-glow"
										>
											<div className="flex items-start justify-between gap-3">
												<div className="min-w-0 flex-1">
													<span className="font-medium text-zinc-100">
														{r.name}
													</span>
													{r.description && (
														<p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
															{r.description}
														</p>
													)}
												</div>
												<span className="shrink-0 rounded-lg bg-amber-500/10 px-2.5 py-1 font-mono text-sm font-semibold text-amber-400 group-hover:bg-amber-500/20">
													{r.cost} pts
												</span>
											</div>
										</div>
									))
								)}
							</div>
						</section>
					</>
				)}
			</main>
		</div>
	);
}
