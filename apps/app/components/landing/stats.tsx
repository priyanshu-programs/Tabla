import { Counter } from "@crm/ui/components/motion/counter";
import { Reveal } from "@crm/ui/components/motion/reveal";

const STATS = [
	{ value: 5, suffix: " min", label: "Mailbox sync cadence" },
	{ value: 90, suffix: " days", label: "Tracking history retained" },
	{ value: 3, suffix: "", label: "Ways to sign in" },
] as const;

export function Stats() {
	return (
		<section className="w-full px-5 py-20 sm:px-6">
			<div className="mx-auto grid max-w-6xl gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-3">
				{STATS.map((stat) => (
					<div key={stat.label} className="bg-background p-7 md:p-8">
						<Reveal>
							<p className="font-semibold text-4xl tracking-tight">
								<Counter value={stat.value} suffix={stat.suffix} />
							</p>
							<p className="mt-2 text-muted-foreground text-sm/6">
								{stat.label}
							</p>
						</Reveal>
					</div>
				))}
			</div>
		</section>
	);
}
