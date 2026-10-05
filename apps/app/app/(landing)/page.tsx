import type { Metadata } from "next";
import { ClosingCta } from "@/components/landing/closing-cta";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works/how-it-works";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingNav } from "@/components/landing/landing-nav";
import { ProductShot } from "@/components/landing/product-shot/product-shot";
import { SignalTicker } from "@/components/landing/signal-ticker";
import { Stats } from "@/components/landing/stats";

export const metadata: Metadata = {
	title: "Tabla",
	description: "Tabla is the AI-native CRM that keeps customer work moving.",
};

export default function Home() {
	return (
		<div className="flex min-h-svh w-full flex-col items-center overflow-clip bg-background text-foreground">
			<LandingNav />
			<main className="w-full">
				<Hero />
				<SignalTicker />
				<div id="product-preview" className="scroll-mt-8">
					<ProductShot />
				</div>
				<HowItWorks />
				<Stats />
				<ClosingCta />
			</main>
			<LandingFooter />
		</div>
	);
}
