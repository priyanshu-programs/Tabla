import { Button } from "@crm/ui/components/button";
import { Wordmark } from "@crm/ui/components/wordmark";
import Link from "next/link";

export function LandingNav() {
	return (
		<header className="flex h-16 w-full items-center justify-center border-border border-b">
			<nav className="flex w-full max-w-6xl items-center gap-2 px-5 sm:gap-6 sm:px-6">
				<Link href="/" aria-label="Tabla home">
					<Wordmark />
				</Link>
				<div className="ml-auto flex items-center gap-2">
					<Button asChild variant="ghost" size="lg">
						<Link href="/sign-in">Sign in</Link>
					</Button>
					<Button asChild size="lg">
						<Link href="/sign-in">Get started</Link>
					</Button>
				</div>
			</nav>
		</header>
	);
}
