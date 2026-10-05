import { readText, safeFetch } from "@crm/db/safe-fetch";
import { CONTEXT_ENGINE } from "./config";

export type PageRead =
	| { outcome: "read"; url: URL; html: string }
	| { outcome: "unreachable" }
	| { outcome: "refused"; status: number }
	| { outcome: "not-html" };

export async function readPage(url: string): Promise<PageRead> {
	const result = await safeFetch(url, {
		timeoutMs: CONTEXT_ENGINE.page.timeoutMs,
		headers: { accept: "text/html,application/xhtml+xml" },
	});

	if (!result) return { outcome: "unreachable" };

	const { response } = result;

	if (!response.ok) {
		await response.body?.cancel();
		return { outcome: "refused", status: response.status };
	}

	if (!(response.headers.get("content-type") ?? "").includes("html")) {
		await response.body?.cancel();
		return { outcome: "not-html" };
	}

	const html = await readText(response, CONTEXT_ENGINE.page.maxBytes);

	if (html === null) return { outcome: "unreachable" };

	return { outcome: "read", url: result.url, html };
}

export async function readResource(
	url: string,
	maxBytes: number,
): Promise<string | null> {
	const result = await safeFetch(url, {
		timeoutMs: CONTEXT_ENGINE.page.timeoutMs,
	});

	if (!result) return null;

	if (!result.response.ok) {
		await result.response.body?.cancel();
		return null;
	}

	return readText(result.response, maxBytes);
}
