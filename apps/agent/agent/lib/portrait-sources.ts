import { teamPortraits } from "@crm/context/team";
import { CONTEXT } from "./context-config";
import { namesMatch } from "./names";
import { personByProfileUrl, slugFromProfileUrl } from "./people";

export type PortraitSource = "linkedin" | "github" | "employer-site";

export type PortraitCandidate = {
	source: PortraitSource;
	url: string;
};

export type PortraitSubject = {
	id: string;
	name: string | null;
	linkedinUrl: string | null;
	githubUrl: string | null;
	companyName: string | null;
	companyDomain: string | null;
};

export async function findPortrait(
	subject: PortraitSubject,
	spend: (units?: number) => { ok: boolean; reason?: string },
	contextReady = true,
): Promise<
	| { found: true; candidate: PortraitCandidate }
	| { found: false; tried: string[]; reason?: string }
> {
	const tried: string[] = [];

	if (subject.linkedinUrl && !contextReady) {
		tried.push("Context.dev is not connected, so LinkedIn was not read");
	}

	if (subject.linkedinUrl && contextReady) {
		const slug = slugFromProfileUrl(subject.linkedinUrl);
		if (slug) {
			const charge = spend(CONTEXT.people.enrichCost);
			if (!charge.ok) return { found: false, tried, reason: charge.reason };

			const result = await personByProfileUrl(
				`https://www.linkedin.com/in/${slug}`,
			);
			if (result.outcome === "found" && result.person.photoUrl) {
				return {
					found: true,
					candidate: { source: "linkedin", url: result.person.photoUrl },
				};
			}
			tried.push(
				result.outcome === "found"
					? "LinkedIn profile has no picture"
					: "LinkedIn profile could not be read",
			);
		}
	}

	const login = githubLogin(subject.githubUrl);
	if (login) {
		return {
			found: true,
			candidate: {
				source: "github",
				url: `https://github.com/${encodeURIComponent(login)}.png?size=460`,
			},
		};
	}

	if (subject.companyDomain && subject.name) {
		const charge = spend(CONTEXT.cost.site);
		if (!charge.ok) return { found: false, tried, reason: charge.reason };

		const fromSite = await fromEmployerSite(
			subject.companyDomain,
			subject.name,
		);
		if (fromSite) return { found: true, candidate: fromSite };
		tried.push("Not on the company's own site");
	}

	return { found: false, tried };
}

async function fromEmployerSite(
	companyDomain: string,
	name: string,
): Promise<PortraitCandidate | null> {
	const portraits = await teamPortraits(companyDomain);

	const match = portraits.find((portrait) => namesMatch(portrait.name, name));

	return match ? { source: "employer-site", url: match.photoUrl } : null;
}

function githubLogin(raw: string | null): string | null {
	if (!raw) return null;

	try {
		const url = new URL(raw.trim());
		const host = url.hostname.toLowerCase().replace(/^www\./, "");
		if (host !== "github.com") return null;

		const segments = url.pathname.split("/").filter(Boolean);
		if (segments.length !== 1) return null;

		return segments[0] ?? null;
	} catch {
		return null;
	}
}
