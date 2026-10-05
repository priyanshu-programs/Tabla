import { z } from "zod";

const text = z.string().trim().min(1).nullable().catch(null);

export const webManifest = z
	.object({
		name: text,
		short_name: text,
		theme_color: text,
	})
	.catch({ name: null, short_name: null, theme_color: null });

export type WebManifest = z.infer<typeof webManifest>;

export function parseWebManifest(source: string): WebManifest {
	try {
		return webManifest.parse(JSON.parse(source));
	} catch {
		return webManifest.parse(null);
	}
}
