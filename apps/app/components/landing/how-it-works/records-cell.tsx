import Renew from "@carbon/icons-react/es/Renew";
import { CellShell } from "@/components/landing/how-it-works/cell-shell";

const FIELDS = [
	{ label: "Employees", from: "11–50", to: "51–200" },
	{ label: "Stage", from: "Lead", to: "Opportunity" },
] as const;

export function RecordsCell({ className }: { className?: string }) {
	return (
		<CellShell
			step="03 — Update"
			title="Records rewrite themselves"
			icon={<Renew size={14} aria-hidden="true" />}
			className={className}
		>
			{FIELDS.map((field) => (
				<div
					key={field.label}
					className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2"
				>
					<p className="text-muted-foreground text-xs">{field.label}</p>
					<span className="relative inline-block min-w-16 text-right font-medium text-xs">
						<span className="animate-landing-flip-a">{field.from}</span>
						<span className="absolute inset-0 animate-landing-flip-b text-right">
							{field.to}
						</span>
					</span>
				</div>
			))}
			<p className="font-mono text-muted-foreground text-xs">
				Updated just now
			</p>
		</CellShell>
	);
}
