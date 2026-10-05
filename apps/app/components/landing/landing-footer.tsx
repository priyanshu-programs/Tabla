import { Wordmark } from "@crm/ui/components/wordmark";

export function LandingFooter() {
	return (
		<footer className="flex w-full justify-center border-border border-t">
			<div className="flex w-full max-w-6xl flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
				<Wordmark />
				<p className="text-muted-foreground text-sm">
					AI-native customer relationship management.
				</p>
			</div>
		</footer>
	);
}
