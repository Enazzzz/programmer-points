import type { Config } from "tailwindcss";

const config: Config = {
	content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			fontFamily: {
				display: ["var(--font-display)", "system-ui", "sans-serif"],
				mono: ["var(--font-mono)", "ui-monospace", "monospace"],
			},
			colors: {
				accent: { DEFAULT: "#f97316", dark: "#ea580c", hotwire: "#dc2626" },
				surface: "#0f0f13",
				card: "#18181d",
				border: "#27272a",
			},
			animation: {
				"fade-in": "fadeIn 0.4s ease-out",
				"pulse-soft": "pulseSoft 2s ease-in-out infinite",
			},
			keyframes: {
				fadeIn: {
					"0%": { opacity: "0", transform: "translateY(6px)" },
					"100%": { opacity: "1", transform: "translateY(0)" },
				},
				pulseSoft: {
					"0%, 100%": { opacity: "1" },
					"50%": { opacity: "0.6" },
				},
			},
			boxShadow: {
				glow: "0 0 40px -12px rgba(249, 115, 22, 0.3)",
				card: "0 4px 24px -4px rgba(0, 0, 0, 0.4)",
				inner: "inset 0 1px 0 0 rgba(255, 255, 255, 0.05)",
			},
		},
	},
	plugins: [],
};

export default config;
