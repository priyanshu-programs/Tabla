import Link from "@carbon/icons-react/es/Link";
import { CellShell } from "@/components/landing/how-it-works/cell-shell";

const PROVIDERS = ["Gmail", "Calendar", "Outlook", "Slack"] as const;

export function ConnectCell({ className }: { className?: string }) {
	return (
		<CellShell
			step="01 — Connect"
			title="One sign-in connects mail and calendar"
			icon={<Link size={14} aria-hidden="true" />}
			className={className}
		>
			<div className="flex flex-wrap gap-2">
				{PROVIDERS.map((provider, index) => (
					<span
						key={provider}
						className="animate-landing-pulse rounded-md border border-border bg-background px-3 py-2 font-medium text-xs"
						style={{ animationDelay: `${index * 1.05}s` }}
					>
						{provider}
					</span>
				))}
			</div>
		</CellShell>
	);
}
