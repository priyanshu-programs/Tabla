import Logo from "./logo";
import { cn } from "../lib/utils";

export function Wordmark({ className }: { className?: string }) {
	return (
		<span className={cn("inline-flex items-center gap-2.5", className)}>
			<Logo className="size-7 shrink-0" />
			<span className="font-semibold text-xl tracking-tight">Tabla</span>
		</span>
	);
}
