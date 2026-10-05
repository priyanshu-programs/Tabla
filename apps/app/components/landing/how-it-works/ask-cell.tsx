import Chat from "@carbon/icons-react/es/Chat";
import { CellShell } from "@/components/landing/how-it-works/cell-shell";

const ANSWERS = ["CTO started in March.", "Renewal lands in Q3."] as const;

export function AskCell({ className }: { className?: string }) {
	return (
		<CellShell
			step="05 — Ask"
			title="Ask anything about an account"
			icon={<Chat size={14} aria-hidden="true" />}
			className={className}
		>
			<p className="w-fit max-w-full rounded-md rounded-br-none bg-muted px-3 py-2 text-xs">
				What changed at Acme this month?
			</p>
			<div className="rounded-md rounded-bl-none border border-border bg-background px-3 py-2">
				{ANSWERS.map((answer, index) => (
					<p
						key={answer}
						className="animate-landing-rise font-mono text-xs"
						style={{ animationDelay: `${0.6 + index * 0.9}s` }}
					>
						{answer}
					</p>
				))}
				<span
					aria-hidden="true"
					className="mt-1 block h-3.5 w-px animate-landing-caret bg-primary"
				/>
			</div>
		</CellShell>
	);
}
