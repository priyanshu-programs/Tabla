import Search from "@carbon/icons-react/es/Search";
import { CellShell } from "@/components/landing/how-it-works/cell-shell";

const FINDINGS = [
	"Found a job change: new CTO at Acme",
	"Drafted a follow-up from your inbox thread",
	"Flagged a renewal risk for Q3",
] as const;

export function ResearchCell({ className }: { className?: string }) {
	return (
		<CellShell
			step="02 — Research"
			title="The agent reads the web, then your history"
			icon={<Search size={14} aria-hidden="true" />}
			className={className}
		>
			<div className="flex items-center gap-2">
				<span
					aria-hidden="true"
					className="size-1.5 animate-landing-pulse rounded-full bg-primary"
				/>
				<p className="font-mono text-muted-foreground text-xs">
					Tabla agent — researching
				</p>
			</div>
			{FINDINGS.map((finding, index) => (
				<p
					key={finding}
					className="animate-landing-rise rounded-md border border-border bg-background px-3 py-2 font-mono text-xs"
					style={{ animationDelay: `${index * 0.9}s` }}
				>
					{finding}
				</p>
			))}
		</CellShell>
	);
}
