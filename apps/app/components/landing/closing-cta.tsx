import { Button } from "@crm/ui/components/button";
import Link from "next/link";

export function ClosingCta() {
	return (
		<section className="w-full px-5 pb-20 sm:px-6">
			<div className="mx-auto flex max-w-6xl flex-col items-center gap-6 rounded-xl bg-foreground px-6 py-16 text-center text-background">
				<h2 className="max-w-2xl text-balance font-semibold text-4xl/11 tracking-tight">
					Give every customer conversation a current starting point.
				</h2>
				<p className="max-w-xl text-background/70 text-sm/6">
					Your first approved Google, Microsoft, or SSO sign-in creates your
					Tabla account.
				</p>
				<Button asChild size="lg">
					<Link href="/sign-in">Get started</Link>
				</Button>
			</div>
		</section>
	);
}
