import { z } from "zod";

const text = z.string().nullable().optional();

const colour = z.object({ hex: text, name: text });

const logo = z.object({
	url: text,
	mode: text,
	type: text,
	colors: z.array(colour).nullable().optional(),
});

const social = z.object({ type: text, url: text });

const address = z.object({
	city: text,
	state_code: text,
	country: text,
	country_code: text,
});

const industry = z.object({ industry: text, subindustry: text });

export const siteBrand = z.object({
	domain: text,
	title: text,
	description: text,
	slogan: text,
	email: text,
	phone: text,
	colors: z.array(colour).nullable().optional(),
	logos: z.array(logo).nullable().optional(),
	socials: z.array(social).nullable().optional(),
	address: address.nullable().optional(),
	industries: z
		.object({ eic: z.array(industry).nullable().optional() })
		.nullable()
		.optional(),
	links: z.object({ pricing: text, careers: text }).nullable().optional(),
});

export type SiteBrand = z.infer<typeof siteBrand>;

export type SiteBrandLogo = z.infer<typeof logo>;

export type SiteBrandSocial = z.infer<typeof social>;

const storedEnrichment = z.object({ brand: siteBrand });

export function parseStoredBrand(value: unknown): SiteBrand | null {
	const parsed = storedEnrichment.safeParse(value);

	return parsed.success ? parsed.data.brand : null;
}
