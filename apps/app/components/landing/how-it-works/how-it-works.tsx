import { Reveal } from "@crm/ui/components/motion/reveal";
import { AskCell } from "@/components/landing/how-it-works/ask-cell";
import { ConnectCell } from "@/components/landing/how-it-works/connect-cell";
import { RecordsCell } from "@/components/landing/how-it-works/records-cell";
import { ResearchCell } from "@/components/landing/how-it-works/research-cell";
import { StepsCell } from "@/components/landing/how-it-works/steps-cell";

export function HowItWorks() {
	return (
		<section className="w-full px-5 py-20 sm:px-6">
			<div className="mx-auto max-w-6xl">
				<Reveal className="flex flex-col items-center text-center">
					<p className="font-mono text-muted-foreground text-xs">
						How Tabla works
					</p>
					<h2 className="mt-3 max-w-2xl text-balance font-semibold text-4xl/11 tracking-tight">
						The CRM that keeps itself current.
					</h2>
					<p className="mt-4 max-w-xl text-muted-foreground text-sm/6">
						Connect once. Tabla researches every account, rewrites stale
						records, and drafts the next step.
					</p>
				</Reveal>
				<Reveal className="mt-10" delaySecs={0.1}>
					<div className="grid gap-4 md:grid-cols-6">
						<ResearchCell className="md:col-span-4" />
						<ConnectCell className="md:col-span-2" />
						<RecordsCell className="md:col-span-2" />
						<StepsCell className="md:col-span-2" />
						<AskCell className="md:col-span-2" />
					</div>
				</Reveal>
			</div>
		</section>
	);
}
