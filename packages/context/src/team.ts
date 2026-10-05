import type { HTMLElement } from "node-html-parser";
import { CONTEXT_ENGINE } from "./config";
import { within } from "./host";
import {
	anchors,
	clean,
	imageHint,
	imageUrl,
	isWeb,
	type Page,
	parsePage,
} from "./html";
import { allowed, fetchPages, openSite } from "./site";

export type TeamPortrait = { name: string; photoUrl: string; pageUrl: string };

const WORD = /^\p{L}[\p{L}.'’-]*$/u;

function personName(raw: string | null | undefined): string | null {
	const text = clean(raw)?.replace(CONTEXT_ENGINE.team.nameLabel, "");
	const first = text?.split(CONTEXT_ENGINE.team.nameSeparator)[0]?.trim();

	if (!first || first.length > CONTEXT_ENGINE.team.maxNameLength) return null;

	const words = first.split(/\s+/);

	if (words.length < 2 || words.length > CONTEXT_ENGINE.team.maxNameWords) {
		return null;
	}

	return words.every((word) => WORD.test(word)) ? first : null;
}

function cardOf(image: HTMLElement): HTMLElement | null {
	let card: HTMLElement | null = null;
	let current: HTMLElement | null = image.parentNode;

	for (
		let depth = 0;
		current && depth < CONTEXT_ENGINE.team.ancestorDepth;
		depth += 1
	) {
		if (current.querySelectorAll("img").length !== 1) break;

		card = current;
		current = current.parentNode;
	}

	return card;
}

function namesFor(image: HTMLElement): string[] {
	const heading = cardOf(image)?.querySelector(
		CONTEXT_ENGINE.team.headingSelector,
	)?.text;

	const names = [personName(image.getAttribute("alt")), personName(heading)];

	return [...new Set(names.flatMap((name) => (name ? [name] : [])))];
}

export function portraitsOn(page: Page): TeamPortrait[] {
	return page.root.querySelectorAll("img").flatMap((image) => {
		const url = imageUrl(image, page.url);
		if (!url) return [];

		if (CONTEXT_ENGINE.team.skipHint.test(imageHint(image, url))) return [];

		return namesFor(image).map((name) => ({
			name,
			photoUrl: url.toString(),
			pageUrl: page.url.toString(),
		}));
	});
}

export function teamLinks(page: Page, host: string): string[] {
	const found = anchors(page).flatMap((link) => {
		if (!isWeb(link.url) || !within(link.url.hostname, host)) return [];

		const names =
			CONTEXT_ENGINE.team.pagePattern.test(link.url.pathname) ||
			CONTEXT_ENGINE.team.pagePattern.test(link.text);

		if (!names) return [];

		const plain = new URL(link.url);
		plain.hash = "";
		plain.search = "";

		return [plain.toString()];
	});

	return [...new Set(found)].filter((url) => url !== page.url.toString());
}

export async function teamPortraits(domain: string): Promise<TeamPortrait[]> {
	const site = await openSite(domain);

	if (site.outcome !== "read") return [];

	const links = teamLinks(site.page, site.host)
		.filter((url) => allowed(new URL(url), site.disallowed))
		.slice(0, CONTEXT_ENGINE.team.maxPages);

	const pages = (await fetchPages(links)).map((read) =>
		parsePage(read.html, read.url),
	);

	const seen = new Set<string>();

	return pages.flatMap(portraitsOn).filter((portrait) => {
		const key = `${portrait.name}|${portrait.photoUrl}`;
		if (seen.has(key)) return false;

		seen.add(key);
		return true;
	});
}
