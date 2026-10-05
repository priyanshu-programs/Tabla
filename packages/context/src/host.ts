export function hostOf(domain: string): string | null {
	const trimmed = domain.trim().toLowerCase();
	if (!trimmed) return null;

	try {
		const url = new URL(
			trimmed.includes("://") ? trimmed : `https://${trimmed}`,
		);
		const host = url.hostname.replace(/^www\./, "");
		return host.includes(".") ? host : null;
	} catch {
		return null;
	}
}

export function bare(hostname: string): string {
	return hostname.toLowerCase().replace(/^www\./, "");
}

export function within(hostname: string, host: string): boolean {
	const candidate = bare(hostname);
	return candidate === host || candidate.endsWith(`.${host}`);
}

export function squash(value: string): string {
	return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function labelOf(host: string): string {
	return squash(host.split(".")[0] ?? "");
}
