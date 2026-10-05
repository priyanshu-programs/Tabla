import { CONTEXT_ENGINE } from "./config";
import { type HomeRead, readHome } from "./home";
import { bare } from "./host";
import {
	type Anchor,
	anchors,
	isWeb,
	type Page,
	parsePage,
	titleText,
	visibleText,
} from "./html";
import {
	type PageFailure,
	type ReadPage,
	readPage,
	readResource,
} from "./page";

export type SitePage = { url: string; title: string | null; text: string };

export type SiteRead = { outcome: "read"; pages: SitePage[] } | PageFailure;

export type OpenSite =
	| {
			outcome: "read";
			home: ReadPage;
			page: Page;
			host: string;
			disallowed: string[];
	  }
	| PageFailure;

type RankedLink = { url: string; score: number; depth: number };

const USER_AGENT = /^user-agent\s*:\s*(.*)$/i;

const DISALLOW = /^disallow\s*:\s*(.*)$/i;

export function parseRobots(source: string): string[] {
	const disallowed: string[] = [];
	let applies = false;
	let inAgents = false;

	for (const raw of source.split(/\r?\n/)) {
		const line = raw.split("#")[0]?.trim() ?? "";

		const agent = USER_AGENT.exec(line)?.[1]?.trim();
		if (agent !== undefined) {
			applies = inAgents ? applies || agent === "*" : agent === "*";
			inAgents = true;
			continue;
		}

		inAgents = false;

		const path = DISALLOW.exec(line)?.[1]?.trim();
		if (applies && path) disallowed.push(path.split("*")[0] ?? path);
	}

	return disallowed.filter((path) => path.startsWith("/"));
}

export function allowed(url: URL, disallowed: readonly string[]): boolean {
	return !disallowed.some((prefix) => url.pathname.startsWith(prefix));
}

function pathKey(url: URL): string {
	return `${url.hostname}${url.pathname.replace(/\/+$/, "")}`.toLowerCase();
}

function sectionWeight(link: Anchor): number {
	const path = link.url.pathname;

	return CONTEXT_ENGINE.site.sections.reduce(
		(best, section) =>
			section.pattern.test(path) || section.pattern.test(link.text)
				? Math.max(best, section.weight)
				: best,
		0,
	);
}

function depthOf(url: URL): number {
	return url.pathname.split("/").filter(Boolean).length;
}

function crawlable(link: Anchor, home: URL): boolean {
	if (!isWeb(link.url)) return false;
	if (bare(link.url.hostname) !== bare(home.hostname)) return false;
	if (pathKey(link.url) === pathKey(home)) return false;

	const path = link.url.pathname;

	return (
		depthOf(link.url) <= CONTEXT_ENGINE.site.maxPathDepth &&
		!CONTEXT_ENGINE.site.skipPath.test(path) &&
		!CONTEXT_ENGINE.site.skipFile.test(path)
	);
}

export function rankLinks(page: Page): string[] {
	const best = new Map<string, RankedLink>();

	for (const link of anchors(page)) {
		if (!crawlable(link, page.url)) continue;

		const weight = sectionWeight(link);
		if (weight === 0) continue;

		const score =
			weight + (link.region === "header" ? CONTEXT_ENGINE.site.headerBonus : 0);

		const key = pathKey(link.url);
		const clean = new URL(link.url);
		clean.hash = "";
		clean.search = "";

		if ((best.get(key)?.score ?? 0) < score) {
			best.set(key, {
				url: clean.toString(),
				score,
				depth: depthOf(link.url),
			});
		}
	}

	return [...best.values()]
		.sort((left, right) => right.score - left.score || left.depth - right.depth)
		.map((link) => link.url);
}

export async function fetchPages(urls: readonly string[]): Promise<ReadPage[]> {
	const pages: ReadPage[] = [];
	const size = CONTEXT_ENGINE.site.concurrency;

	for (let start = 0; start < urls.length; start += size) {
		const batch = await Promise.all(
			urls.slice(start, start + size).map((url) => readPage(url)),
		);

		for (const read of batch) {
			if (read.outcome === "read") pages.push(read);
		}
	}

	return pages;
}

async function robotsFor(home: HomeRead): Promise<string[]> {
	if (home.outcome !== "read") return [];

	const source = await readResource(
		new URL("/robots.txt", home.page.url).toString(),
		CONTEXT_ENGINE.site.robotsMaxBytes,
	);

	return source ? parseRobots(source) : [];
}

export async function openSite(domain: string): Promise<OpenSite> {
	const home = await readHome(domain);

	if (home.outcome !== "read") return home;

	const disallowed = await robotsFor(home);

	if (!allowed(home.page.url, disallowed)) {
		return {
			outcome: "skipped",
			reason: "The site's robots.txt asks automated readers to stay out.",
		};
	}

	return {
		outcome: "read",
		home: home.page,
		page: parsePage(home.page.html, home.page.url),
		host: home.host,
		disallowed,
	};
}

function toSitePage(read: ReadPage): SitePage {
	return {
		url: read.url.toString(),
		title: titleText(parsePage(read.html, read.url)),
		text: visibleText(read.html).slice(0, CONTEXT_ENGINE.site.maxCharsPerPage),
	};
}

export async function readSite(domain: string): Promise<SiteRead> {
	const site = await openSite(domain);

	if (site.outcome !== "read") return site;

	const links = rankLinks(site.page)
		.filter((url) => allowed(new URL(url), site.disallowed))
		.slice(0, CONTEXT_ENGINE.site.maxPages - 1);

	const pages = [site.home, ...(await fetchPages(links))]
		.map(toSitePage)
		.filter((page) => page.text.length > 0);

	if (pages.length === 0) {
		return {
			outcome: "skipped",
			reason: "The site has no text that a plain page read can see.",
		};
	}

	return { outcome: "read", pages };
}
