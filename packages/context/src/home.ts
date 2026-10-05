import { resolvesToPublicHost } from "@crm/db/safe-fetch";
import { bare, hostOf, labelOf, within } from "./host";
import {
	type PageFailure,
	type PageRead,
	pageFailure,
	type ReadPage,
	readPage,
} from "./page";

export type HomeRead =
	| { outcome: "read"; page: ReadPage; host: string }
	| PageFailure;

export async function readHome(domain: string): Promise<HomeRead> {
	const host = hostOf(domain);

	if (!host) {
		return { outcome: "skipped", reason: "That is not a web address." };
	}

	let last: Exclude<PageRead, ReadPage> | null = null;

	for (const hostname of [host, `www.${host}`]) {
		if (!(await resolvesToPublicHost(hostname))) continue;

		const read = await readPage(`https://${hostname}`);

		if (read.outcome !== "read") {
			last = read;
			continue;
		}

		const landed = bare(read.url.hostname);

		if (within(landed, host)) return { outcome: "read", page: read, host };

		if (labelOf(landed) === labelOf(host)) {
			return { outcome: "read", page: read, host: landed };
		}

		return {
			outcome: "skipped",
			reason: `The domain redirects to another site, ${landed}.`,
		};
	}

	if (!last) {
		return { outcome: "skipped", reason: "No site answers at this domain." };
	}

	return pageFailure(last);
}
