import { cn } from "@crm/ui/lib/utils";
import type { ReactNode } from "react";

export function CellShell({
	step,
	title,
	icon,
	children,
	className,
}: {
	step: string;
	title: string;
	icon: ReactNode;
	children: ReactNode;
	className?: string;
}) {
	return (
		<article
			className={cn(
				"flex flex-col rounded-xl border border-border bg-card p-6",
				className,
			)}
		>
			<div className="flex items-center gap-2 text-muted-foreground">
				{icon}
				<p className="font-mono text-xs">{step}</p>
			</div>
			<h3 className="mt-3 font-semibold text-lg tracking-tight">{title}</h3>
			<div className="mt-5 flex min-h-28 flex-1 flex-col justify-center gap-2">
				{children}
			</div>
		</article>
	);
}
