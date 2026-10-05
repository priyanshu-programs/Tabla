import Checkmark from "@carbon/icons-react/es/Checkmark";
import ListChecked from "@carbon/icons-react/es/ListChecked";
import { CellShell } from "@/components/landing/how-it-works/cell-shell";

const STEPS = [
	"Send the renewal recap",
	"Introduce the new CTO",
	"Confirm the Q3 close date",
] as const;

export function StepsCell({ className }: { className?: string }) {
	return (
		<CellShell
			step="04 — Act"
			title="Context turns into next steps"
			icon={<ListChecked size={14} aria-hidden="true" />}
			className={className}
		>
			{STEPS.map((step, index) => (
				<div
					key={step}
					className="flex animate-landing-rise items-center gap-2 rounded-md border border-border bg-background px-3 py-2"
					style={{ animationDelay: `${index * 0.8}s` }}
				>
					<span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary">
						<Checkmark size={10} aria-hidden="true" />
					</span>
					<p className="text-xs">{step}</p>
				</div>
			))}
		</CellShell>
	);
}
