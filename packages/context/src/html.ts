import { type JsonLdNode, parseJsonLd } from "@crm/validation/json-ld";
import { type HTMLElement, parse } from "node-html-parser";

export type Page = { url: URL; root: HTMLElement };

export type Region = "header" | "footer" | "body";

export type Anchor = { url: URL; text: string; region: Region };

export type Picture = { url: URL; hint: string; region: Region };

const META_ATTRIBUTES = ["property", "name"] as const;

const IMAGE_SOURCES = ["src", "data-src", "data-lazy-src"] as const;

const NOISE =
	"script, style, noscript, svg, template, iframe, nav, footer, form";

export function parsePage(html: string, url: URL): Page {
	return { url, root: parse(html) };
}

export function clean(value: string | null | undefined): string | null {
	const collapsed = value?.replace(/\s+/g, " ").trim();
	return collapsed ? collapsed : null;
}

export function resolve(raw: string | null | undefined, base: URL): URL | null {
	const trimmed = raw?.trim();
	if (!trimmed) return null;

	try {
		return new URL(trimmed, base);
	} catch {
		return null;
	}
}

export function isWeb(url: URL): boolean {
	return url.protocol === "https:" || url.protocol === "http:";
}

export function metaContent(
	page: Page,
	names: readonly string[],
): string | null {
	for (const name of names) {
		for (const attribute of META_ATTRIBUTES) {
			const found = clean(
				page.root
					.querySelector(`meta[${attribute}="${name}" i]`)
					?.getAttribute("content"),
			);
			if (found) return found;
		}
	}

	return null;
}

export function titleText(page: Page): string | null {
	return clean(page.root.querySelector("title")?.text);
}

export function linkHref(page: Page, rel: string): URL | null {
	return resolve(
		page.root.querySelector(`link[rel="${rel}" i]`)?.getAttribute("href"),
		page.url,
	);
}

export function jsonLd(page: Page): JsonLdNode[] {
	return page.root
		.querySelectorAll('script[type="application/ld+json" i]')
		.flatMap((script) => parseJsonLd(script.rawText));
}

function regionOf(element: HTMLElement): Region {
	if (element.closest("footer")) return "footer";
	if (element.closest("header, nav")) return "header";
	return "body";
}

export function anchors(page: Page): Anchor[] {
	return page.root.querySelectorAll("a[href]").flatMap((anchor) => {
		const url = resolve(anchor.getAttribute("href"), page.url);
		if (!url) return [];

		return [{ url, text: clean(anchor.text) ?? "", region: regionOf(anchor) }];
	});
}

export function imageUrl(image: HTMLElement, base: URL): URL | null {
	const source = IMAGE_SOURCES.map((name) => image.getAttribute(name)).find(
		(value) => value && !value.trim().startsWith("data:"),
	);

	const url = resolve(source, base);

	return url && isWeb(url) ? url : null;
}

export function imageHint(image: HTMLElement, url: URL): string {
	return [
		image.getAttribute("class"),
		image.getAttribute("id"),
		image.getAttribute("alt"),
		url.pathname,
	]
		.filter(Boolean)
		.join(" ")
		.toLowerCase();
}

export function pictures(page: Page): Picture[] {
	return page.root.querySelectorAll("img").flatMap((image) => {
		const url = imageUrl(image, page.url);
		if (!url) return [];

		return [{ url, hint: imageHint(image, url), region: regionOf(image) }];
	});
}

export function visibleText(html: string): string {
	const root = parse(html);

	for (const element of root.querySelectorAll(NOISE)) element.remove();

	const body = root.querySelector("body") ?? root;

	return body.structuredText
		.split("\n")
		.flatMap((line) => {
			const text = clean(line);
			return text ? [text] : [];
		})
		.join("\n");
}
