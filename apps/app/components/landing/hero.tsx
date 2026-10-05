import { Button } from "@crm/ui/components/button";
import { LANDING_MOTION } from "@crm/ui/components/motion/config";
import { Marker } from "@crm/ui/components/motion/marker";
import { Reveal } from "@crm/ui/components/motion/reveal";
import Link from "next/link";

export function Hero() {
	const stagger = LANDING_MOTION.hero.staggerSecs;

	return (
		<section className="flex w-full flex-col items-center px-5 pt-20 pb-8 sm:px-6 md:pt-28">
			<div className="flex w-full max-w-5xl flex-col items-center gap-7">
				<Reveal className="flex w-full flex-col items-center">
					<p className="rounded-full bg-primary px-3 py-1.5 font-semibold text-primary-foreground text-xs">
						AI-native customer work
					</p>
				</Reveal>
				<Reveal
					className="flex w-full flex-col items-center"
					delaySecs={stagger}
				>
					<h1 className="max-w-[880px] text-balance text-center font-semibold text-5xl/12 tracking-tighter md:text-7xl/18">
						Your CRM should keep itself <Marker>up to date.</Marker>
					</h1>
				</Reveal>
				<Reveal
					className="flex w-full flex-col items-center"
					delaySecs={stagger * 2}
				>
					<p className="max-w-2xl text-pretty text-center text-lg/7 text-muted-foreground md:text-xl/8">
						Tabla brings current records, customer context, and follow-up work
						together.
					</p>
				</Reveal>
				<Reveal
					className="flex w-full flex-col items-center"
					delaySecs={stagger * 3}
				>
					<div className="flex flex-wrap items-center justify-center gap-3 pt-2">
						<Button asChild size="lg">
							<Link href="/sign-in">Get started</Link>
						</Button>
						<Button asChild size="lg" variant="outline">
							<Link href="#product-preview">See Tabla in action</Link>
						</Button>
					</div>
				</Reveal>
			</div>
		</section>
	);
}
