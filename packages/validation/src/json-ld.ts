import { z } from "zod";

const text = z.string().trim().min(1).nullable().catch(null);

const types = z
	.union([z.string(), z.array(z.string())])
	.transform((value) => [value].flat())
	.catch([]);

const textList = z
	.union([z.string(), z.array(text)])
	.transform((value) => [value].flat().flatMap((item) => (item ? [item] : [])))
	.catch([]);

const imageUrl = z.union([
	z.string().trim().min(1),
	z.object({ url: z.string().trim().min(1) }).transform((value) => value.url),
	z
		.object({ contentUrl: z.string().trim().min(1) })
		.transform((value) => value.contentUrl),
]);

const firstImage = z
	.union([
		imageUrl,
		z
			.array(imageUrl.nullable().catch(null))
			.transform((value) => value.find((item) => item !== null) ?? null),
	])
	.nullable()
	.catch(null);

const countryName = z
	.union([
		z.string().trim().min(1),
		z
			.object({ name: z.string().trim().min(1) })
			.transform((value) => value.name),
	])
	.nullable()
	.catch(null);

const postalAddress = z
	.object({
		addressLocality: text,
		addressRegion: text,
		addressCountry: countryName,
	})
	.nullable()
	.catch(null);

const EMPTY_CONTACT_POINT = { telephone: null, email: null };

const contactPoint = z
	.object({ telephone: text, email: text })
	.catch(EMPTY_CONTACT_POINT);

const contactPoints = z
	.union([contactPoint, z.array(contactPoint)])
	.transform((value) => [value].flat())
	.catch([]);

const EMPTY_ORGANISATION = { name: null, url: null };

const organisationRef = z
	.union([
		z
			.string()
			.trim()
			.min(1)
			.transform((name) => ({ name, url: null })),
		z.object({ name: text, url: text }),
	])
	.catch(EMPTY_ORGANISATION);

const organisationRefs = z
	.union([organisationRef, z.array(organisationRef)])
	.transform((value) => [value].flat())
	.catch([]);

export const jsonLdNode = z.object({
	"@type": types,
	name: text,
	legalName: text,
	description: text,
	slogan: text,
	url: text,
	logo: firstImage,
	image: firstImage,
	sameAs: textList,
	email: text,
	telephone: text,
	address: postalAddress,
	contactPoint: contactPoints,
	jobTitle: textList,
	worksFor: organisationRefs,
	alumniOf: organisationRefs,
});

export type JsonLdNode = z.infer<typeof jsonLdNode>;

const graph = z.object({ "@graph": z.array(z.unknown()) });

const list = z.array(z.unknown());

function nodesOf(value: unknown): unknown[] {
	const many = list.safeParse(value);
	if (many.success) return many.data.flatMap(nodesOf);

	const nested = graph.safeParse(value);
	if (nested.success) return [value, ...nested.data["@graph"].flatMap(nodesOf)];

	return [value];
}

export function parseJsonLd(source: string): JsonLdNode[] {
	let document: unknown;

	try {
		document = JSON.parse(source);
	} catch {
		return [];
	}

	return nodesOf(document).flatMap((node) => {
		const parsed = jsonLdNode.safeParse(node);
		return parsed.success ? [parsed.data] : [];
	});
}
