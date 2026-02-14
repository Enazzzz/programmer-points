"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";

interface Redeem {
	id: number;
	name: string;
	cost: number;
	description: string | null;
}

interface Me {
	id: number;
	name: string;
	points: number;
}

export default function StorePage() {
	const { data: session, status } = useSession();
	const [redeems, setRedeems] = useState<Redeem[]>([]);
	const [me, setMe] = useState<Me | null>(null);
	const [loading, setLoading] = useState(true);
	const [redeeming, setRedeeming] = useState<number | null>(null);

	useEffect(() => {
		fetch("/api/redeems")
			.then((r) => r.json())
			.then(setRedeems)
			.catch(console.error)
			.finally(() => setLoading(false));
	}, []);

	useEffect(() => {
		if (status === "authenticated") {
			fetch("/api/me")
				.then((r) => (r.ok ? r.json() : null))
				.then(setMe)
				.catch(() => setMe(null));
		} else {
			setMe(null);
		}
	}, [status]);

	async function handleRedeem(redeemId: number) {
		if (!session) {
			signIn("github", { callbackUrl: "/store" });
			return;
		}
		setRedeeming(redeemId);
		try {
			const res = await fetch("/api/store/redeem", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ redeemId }),
			});
			const data = await res.json();
			if (res.ok) {
				setMe(data);
			} else {
				alert(data.error || "Failed to redeem");
			}
		} catch {
			alert("Network error");
		} finally {
			setRedeeming(null);
		}
	}

	const points = me?.points ?? 0;

	return (
		<div className="min-h-screen bg-mesh">
			<header className="sticky top-0 z-10 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-xl">
				<div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-5">
					<Link href="/" className="font-display text-2xl font-bold tracking-tight text-orange-400">
						◇ HotwireRobotics Store
					</Link>
					<div className="flex items-center gap-3">
						{status === "loading" ? (
							<span className="text-sm text-zinc-500">...</span>
						) : session ? (
							<>
								<span className="rounded-lg bg-orange-500/10 px-3 py-1.5 font-mono text-sm font-semibold text-orange-400">
									{points} pts
								</span>
								<Link
									href="/admin"
									className="text-sm text-zinc-400 hover:text-zinc-300"
								>
									Admin
								</Link>
								<Link
									href="/"
									className="text-sm text-zinc-400 hover:text-zinc-300"
								>
									Leaderboard
								</Link>
							</>
						) : (
							<>
								<button
									onClick={() => signIn("github", { callbackUrl: "/store" })}
									className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-red-500"
								>
									Sign in
								</button>
								<Link href="/" className="text-sm text-zinc-400 hover:text-zinc-300">
									Leaderboard
								</Link>
							</>
						)}
					</div>
				</div>
			</header>

			<main className="mx-auto max-w-3xl px-4 py-14">
				{!session && (
					<div className="mb-8 rounded-2xl border border-orange-500/30 bg-orange-500/10 p-4 text-center">
						<p className="text-orange-200">
							Sign in with GitHub to redeem items with your points.
						</p>
						<button
							onClick={() => signIn("github", { callbackUrl: "/store" })}
							className="mt-3 text-sm font-medium text-orange-400 underline hover:no-underline"
						>
							Sign in with GitHub →
						</button>
					</div>
				)}

				{loading ? (
					<div className="flex flex-col items-center py-24">
						<div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500/30 border-t-orange-500" />
						<p className="mt-4 text-sm text-zinc-500">Loading store...</p>
					</div>
				) : redeems.length === 0 ? (
					<div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 px-8 py-16 text-center text-zinc-500">
						<p className="text-lg">No items yet.</p>
						<p className="mt-1 text-sm">Admin can add redeems.</p>
					</div>
				) : (
					<div className="grid gap-4 sm:grid-cols-2">
						{redeems.map((r) => {
							const canAfford = session && points >= r.cost;
							const isRedeeming = redeeming === r.id;
							return (
								<div
									key={r.id}
									className="group rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 shadow-card transition-all hover:border-orange-500/30 hover:shadow-glow"
								>
									<div className="flex items-start justify-between gap-3">
										<div className="min-w-0 flex-1">
											<span className="font-medium text-zinc-100">{r.name}</span>
											{r.description && (
												<p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
													{r.description}
												</p>
											)}
										</div>
										<div className="flex shrink-0 flex-col items-end gap-2">
											<span className="rounded-lg bg-orange-500/10 px-2.5 py-1 font-mono text-sm font-semibold text-orange-400">
												{r.cost} pts
											</span>
											<button
												onClick={() => handleRedeem(r.id)}
												disabled={!session || !canAfford || isRedeeming}
												className="rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-semibold text-zinc-900 transition-all hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
											>
												{!session
													? "Sign in to redeem"
													: !canAfford
													? "Not enough pts"
													: isRedeeming
													? "..."
													: "Redeem"}
											</button>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</main>
		</div>
	);
}
