import { Marquee } from "@crm/ui/components/motion/marquee";
import { Reveal } from "@crm/ui/components/motion/reveal";

const SIGNALS = [
	"CTO joined Acme — record refreshed",
	"Follow-up drafted from inbox thread",
	"Renewal risk flagged for Q3",
	"Job change found at Globex",
	"Meeting notes attached to open deal",
	"New stakeholder mapped at Initech",
] as const;

export function SignalTicker() {
	return (
		<section
			aria-label="Recent Tabla activity"
			className="w-full border-border border-y bg-card py-4"
		>
			<Reveal>
				<Marquee>
					{SIGNALS.map((signal) => (
						<span
							key={signal}
							className="flex items-center gap-3 px-6 font-mono text-muted-foreground text-xs whitespace-nowrap"
						>
							<span
								aria-hidden="true"
								className="size-1.5 rounded-full bg-primary"
							/>
							{signal}
						</span>
					))}
				</Marquee>
			</Reveal>
		</section>
	);
}
