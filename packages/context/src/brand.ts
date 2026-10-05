import { iconsFromHtml, servesImage } from "@crm/db/favicon";
import type { JsonLdNode } from "@crm/validation/json-ld";
import type {
	SiteBrand,
	SiteBrandLogo,
	SiteBrandSocial,
} from "@crm/validation/site-brand";
import { parseWebManifest } from "@crm/validation/web-manifest";
import { CONTEXT_ENGINE } from "./config";
import { readHome } from "./home";
import { labelOf, squash, within } from "./host";
import {
	type Anchor,
	anchors,
	clean,
	isWeb,
	jsonLd,
	linkHref,
	metaContent,
	type Page,
	parsePage,
	pictures,
	resolve,
	titleText,
} from "./html";
import { type ReadPage, readResource } from "./page";

export type BrandLookup =
	| { outcome: "found"; brand: SiteBrand; sourceUrl: string }
	| { outcome: "skipped"; reason: string }
	| { outcome: "failed"; reason: string; retryable: boolean };

export type BrandDraft = {
	brand: SiteBrand;
	logoCandidates: string[];
	hasColour: boolean;
};

type Network = "linkedin" | "x" | "github";

type SocialCandidate = { type: Network; url: string; rank: number };

type SiteLinks = { pricing: string | null; careers: string | null };

type Country = { country: string | null; country_code: string | null };

const NETWORK_HOSTS: readonly { type: Network; host: string }[] = [
	{ type: "linkedin", host: "linkedin.com" },
	{ type: "x", host: "x.com" },
	{ type: "x", host: "twitter.com" },
	{ type: "github", host: "github.com" },
];

const NETWORKS: readonly Network[] = ["linkedin", "x", "github"];

const TITLE_SEPARATOR = /\s+[|\-–—·•:]\s+|\s*\|\s*/;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RANK = { sameAs: 4, ownName: 2, chrome: 1 } as const;

function isType(node: JsonLdNode, types: readonly string[]): boolean {
	return node["@type"].some((type) => types.includes(type));
}

function organisationOf(nodes: JsonLdNode[]): JsonLdNode | null {
	return (
		nodes.find((node) => isType(node, CONTEXT_ENGINE.organisationTypes)) ?? null
	);
}

function siteOf(nodes: JsonLdNode[]): JsonLdNode | null {
	return nodes.find((node) => isType(node, CONTEXT_ENGINE.siteTypes)) ?? null;
}

function namesSite(segment: string, label: string): boolean {
	const name = squash(segment);

	if (
		name.length < CONTEXT_ENGINE.brand.minLabelLength ||
		label.length < CONTEXT_ENGINE.brand.minLabelLength
	) {
		return false;
	}

	return name === label || name.startsWith(label) || label.startsWith(name);
}

function titleOf(page: Page, nodes: JsonLdNode[], host: string): string | null {
	const organisation = organisationOf(nodes);

	const declared =
		organisation?.name ??
		organisation?.legalName ??
		siteOf(nodes)?.name ??
		metaContent(page, [
			"og:site_name",
			"application-name",
			"apple-mobile-web-app-title",
		]);

	const label = labelOf(host);

	if (declared) {
		const named = ownSegment(declared, label);
		if (named) return named;

		if (declared.length <= CONTEXT_ENGINE.brand.titleMaxLength) return declared;
	}

	return ownSegment(titleText(page) ?? "", label);
}

function ownSegment(text: string, label: string): string | null {
	return (
		text
			.split(TITLE_SEPARATOR)
			.map((part) => part.trim())
			.find((part) => namesSite(part, label)) ?? null
	);
}

function shorten(value: string, limit: number): string {
	if (value.length <= limit) return value;

	const cut = value.slice(0, limit);
	const space = cut.lastIndexOf(" ");

	return `${(space > 0 ? cut.slice(0, space) : cut).trimEnd()}…`;
}

function descriptionOf(page: Page, nodes: JsonLdNode[]): string | null {
	const found =
		metaContent(page, [
			"description",
			"og:description",
			"twitter:description",
		]) ??
		organisationOf(nodes)?.description ??
		null;

	return found
		? shorten(found, CONTEXT_ENGINE.brand.descriptionMaxLength)
		: null;
}

export function normaliseHex(raw: string | null): string | null {
	const digits = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(raw?.trim() ?? "")?.[1];
	if (!digits) return null;

	const full =
		digits.length === 3
			? [...digits].map((digit) => digit + digit).join("")
			: digits;

	return `#${full.toLowerCase()}`;
}

export function brandColour(raw: string | null): string | null {
	const hex = normaliseHex(raw);
	if (!hex) return null;

	const value = Number.parseInt(hex.slice(1), 16);
	const channels = [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
	const saturation = (Math.max(...channels) - Math.min(...channels)) / 0xff;

	return saturation > CONTEXT_ENGINE.brand.minColourSaturation ? hex : null;
}

function handleOf(type: Network, url: URL): string | null {
	const segments = url.pathname.split("/").filter(Boolean);
	const [first, second] = segments;

	if (!first) return null;

	if (type === "linkedin") {
		const sections: readonly string[] = CONTEXT_ENGINE.social.linkedinSections;
		return sections.includes(first.toLowerCase()) && second
			? `${first.toLowerCase()}/${second}`
			: null;
	}

	if (segments.length !== 1) return null;

	const handle = first.replace(/^@/, "");
	const reserved: readonly string[] = CONTEXT_ENGINE.social.reservedHandles;

	return reserved.includes(handle.toLowerCase()) ? null : handle;
}

function profileUrl(type: Network, handle: string): string {
	if (type === "linkedin") return `https://www.linkedin.com/${handle}`;
	if (type === "x") return `https://x.com/${handle}`;
	return `https://github.com/${handle}`;
}

function socialFrom(
	url: URL,
	rank: number,
	label: string,
): SocialCandidate | null {
	if (!isWeb(url)) return null;

	const network = NETWORK_HOSTS.find(({ host }) => within(url.hostname, host));
	if (!network) return null;

	const handle = handleOf(network.type, url);
	if (!handle) return null;

	const own = squash(handle.split("/").pop() ?? "").includes(label);

	return {
		type: network.type,
		url: profileUrl(network.type, handle),
		rank: rank + (own && label ? RANK.ownName : 0),
	};
}

function socialsOf(
	links: Anchor[],
	nodes: JsonLdNode[],
	host: string,
	base: URL,
): SiteBrandSocial[] {
	const label = labelOf(host);

	const declared = nodes
		.flatMap((node) => node.sameAs)
		.flatMap((raw) => {
			const url = resolve(raw, base);
			const candidate = url ? socialFrom(url, RANK.sameAs, label) : null;
			return candidate ? [candidate] : [];
		});

	const linked = links.flatMap((link) => {
		const candidate = socialFrom(
			link.url,
			link.region === "body" ? 0 : RANK.chrome,
			label,
		);
		return candidate ? [candidate] : [];
	});

	const candidates = [...declared, ...linked];

	return NETWORKS.flatMap((type) => {
		const best = candidates
			.filter((candidate) => candidate.type === type)
			.reduce<SocialCandidate | null>(
				(top, candidate) =>
					top === null || candidate.rank > top.rank ? candidate : top,
				null,
			);

		return best ? [{ type: best.type, url: best.url }] : [];
	});
}

function plain(url: URL): string {
	const copy = new URL(url);
	copy.hash = "";
	copy.search = "";
	return copy.toString();
}

function linksOf(links: Anchor[], host: string): SiteLinks {
	const web = links.filter((link) => isWeb(link.url));
	const own = web.filter((link) => within(link.url.hostname, host));

	const pricing = own.find((link) =>
		CONTEXT_ENGINE.links.pricingPath.test(link.url.pathname),
	);

	const careers =
		own.find((link) =>
			CONTEXT_ENGINE.links.careersPath.test(link.url.pathname),
		) ?? web.find((link) => CONTEXT_ENGINE.links.careersText.test(link.text));

	return {
		pricing: pricing ? plain(pricing.url) : null,
		careers: careers ? plain(careers.url) : null,
	};
}

function addressOf(raw: string, protocol: string): string | null {
	const value = raw.trim().toLowerCase().startsWith(protocol)
		? raw.trim().slice(protocol.length)
		: raw.trim();

	try {
		return decodeURIComponent(value.split("?")[0] ?? "").trim() || null;
	} catch {
		return null;
	}
}

function ownEmail(raw: string | null, host: string): string | null {
	const email = raw ? addressOf(raw, "mailto:")?.toLowerCase() : null;
	if (!email || !EMAIL.test(email)) return null;

	const domain = email.slice(email.lastIndexOf("@") + 1);

	return within(domain, host) ? email : null;
}

function emailOf(
	links: Anchor[],
	nodes: JsonLdNode[],
	host: string,
): string | null {
	const organisation = organisationOf(nodes);

	const declared = [
		organisation?.email ?? null,
		...(organisation?.contactPoint ?? []).map((point) => point.email),
	];

	const linked = links
		.filter((link) => link.url.protocol === "mailto:")
		.map((link) => link.url.href);

	for (const raw of [...declared, ...linked]) {
		const email = ownEmail(raw, host);
		if (email) return email;
	}

	return null;
}

function phoneFrom(raw: string | null): string | null {
	const value = raw ? addressOf(raw, "tel:") : null;
	if (!value) return null;

	const phone = clean(value.replace(/[^\d+()\-.\s]/g, ""));
	const digits = phone?.replace(/\D/g, "").length ?? 0;

	return phone && digits >= CONTEXT_ENGINE.brand.minPhoneDigits ? phone : null;
}

function phoneOf(links: Anchor[], nodes: JsonLdNode[]): string | null {
	const organisation = organisationOf(nodes);

	const declared = [
		organisation?.telephone ?? null,
		...(organisation?.contactPoint ?? []).map((point) => point.telephone),
	];

	const linked = links
		.filter((link) => link.url.protocol === "tel:")
		.map((link) => link.url.href);

	for (const raw of [...declared, ...linked]) {
		const phone = phoneFrom(raw);
		if (phone) return phone;
	}

	return null;
}

function countryOf(raw: string | null): Country {
	if (!raw) return { country: null, country_code: null };

	if (!/^[a-z]{2}$/i.test(raw)) return { country: raw, country_code: null };

	const code = raw.toUpperCase();

	try {
		const name = new Intl.DisplayNames(["en"], { type: "region" }).of(code);
		return { country: name && name !== code ? name : null, country_code: code };
	} catch {
		return { country: null, country_code: code };
	}
}

function addressFrom(nodes: JsonLdNode[]): SiteBrand["address"] {
	const address = organisationOf(nodes)?.address;
	if (!address) return null;

	const region = address.addressRegion;

	const found = {
		city: address.addressLocality,
		state_code:
			region && /^[a-z]{2,3}$/i.test(region) ? region.toUpperCase() : null,
		...countryOf(address.addressCountry),
	};

	return found.city || found.state_code || found.country || found.country_code
		? found
		: null;
}

function logoCandidatesOf(
	page: Page,
	nodes: JsonLdNode[],
	host: string,
): string[] {
	const label = labelOf(host);
	const declared = resolve(organisationOf(nodes)?.logo, page.url);

	const marked = pictures(page).filter((picture) =>
		picture.hint.includes("logo"),
	);

	const inChrome = marked.filter((picture) => picture.region === "header");

	const named = marked.filter(
		(picture) =>
			picture.region !== "header" &&
			label.length >= CONTEXT_ENGINE.brand.minLabelLength &&
			squash(picture.hint).includes(label),
	);

	const ordered = [
		...(declared && isWeb(declared) ? [declared] : []),
		...inChrome.map((picture) => picture.url),
		...named.map((picture) => picture.url),
	].map((url) => url.toString());

	return [...new Set(ordered)].slice(0, CONTEXT_ENGINE.image.maxCandidates);
}

export function draftBrand(page: Page, host: string): BrandDraft {
	const nodes = jsonLd(page);
	const links = anchors(page);

	const colour = brandColour(
		metaContent(page, ["theme-color", "msapplication-TileColor"]),
	);

	return {
		brand: {
			domain: host,
			title: titleOf(page, nodes, host),
			description: descriptionOf(page, nodes),
			slogan: organisationOf(nodes)?.slogan ?? null,
			email: emailOf(links, nodes, host),
			phone: phoneOf(links, nodes),
			colors: colour ? [{ hex: colour, name: null }] : [],
			logos: [],
			socials: socialsOf(links, nodes, host, page.url),
			address: addressFrom(nodes),
			industries: null,
			links: linksOf(links, host),
		},
		logoCandidates: logoCandidatesOf(page, nodes, host),
		hasColour: colour !== null,
	};
}

export function hasBrandData(brand: SiteBrand): boolean {
	return Boolean(
		brand.title ||
			brand.description ||
			(brand.logos ?? []).some((logo) => logo.type === "logo") ||
			(brand.socials ?? []).length > 0,
	);
}

async function firstImage(candidates: string[]): Promise<string | null> {
	for (const candidate of candidates) {
		if (await servesImage(candidate)) return candidate;
	}

	return null;
}

function iconCandidatesOf(html: string, url: URL): string[] {
	return [
		...iconsFromHtml(html, url).slice(0, CONTEXT_ENGINE.image.maxCandidates),
		new URL("/favicon.ico", url).toString(),
	];
}

async function manifestColour(page: Page): Promise<string | null> {
	const manifest = linkHref(page, "manifest");
	if (!manifest || !isWeb(manifest)) return null;

	const source = await readResource(
		manifest.toString(),
		CONTEXT_ENGINE.manifest.maxBytes,
	);

	return source ? brandColour(parseWebManifest(source).theme_color) : null;
}

async function completeBrand(
	read: ReadPage,
	host: string,
): Promise<BrandLookup> {
	const page = parsePage(read.html, read.url);
	const draft = draftBrand(page, host);

	const [logoUrl, iconUrl, colour] = await Promise.all([
		firstImage(draft.logoCandidates),
		firstImage(iconCandidatesOf(read.html, read.url)),
		draft.hasColour ? null : manifestColour(page),
	]);

	const logos: SiteBrandLogo[] = [
		...(logoUrl ? [{ url: logoUrl, type: "logo", mode: "light" }] : []),
		...(iconUrl ? [{ url: iconUrl, type: "icon", mode: null }] : []),
	];

	const brand: SiteBrand = {
		...draft.brand,
		logos,
		colors: colour ? [{ hex: colour, name: null }] : draft.brand.colors,
	};

	if (!hasBrandData(brand)) {
		return {
			outcome: "skipped",
			reason: "The site has no brand data that a plain page read can see.",
		};
	}

	return { outcome: "found", brand, sourceUrl: read.url.toString() };
}

export async function brandFromSite(domain: string): Promise<BrandLookup> {
	const home = await readHome(domain);

	if (home.outcome !== "read") return home;

	return completeBrand(home.page, home.host);
}
