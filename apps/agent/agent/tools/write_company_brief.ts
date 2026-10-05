import { ActivityType, db } from "@crm/db";
import { defineTool } from "eve/tools";
import { z } from "zod";
import { CONTEXT } from "../lib/context-config";
import { hostOf } from "../lib/names";
import { assertResearchPurpose } from "../lib/session-purpose";

const LIMITS = CONTEXT.brief;

const line = z.string().trim().min(1).max(LIMITS.lineMaxLength);

const inputSchema = z.object({
	companyId: z.string(),
	positioning: z
		.string()
		.trim()
		.min(LIMITS.positioningMinLength)
		.max(LIMITS.positioningMaxLength)
		.describe("One paragraph: what they sell and who to."),
	pricingModel: line
		.optional()
		.describe("How they charge — per seat, usage, flat, enterprise-only."),
	targetCustomer: line
		.optional()
		.describe("The customer they describe themselves as serving."),
	notableCustomers: z
		.array(z.string().trim().min(1).max(LIMITS.customerMaxLength))
		.max(LIMITS.maxCustomers)
		.default([])
		.describe("Named customers or logos on the site."),
	recentNews: z
		.array(z.string().trim().min(1).max(LIMITS.newsMaxLength))
		.max(LIMITS.maxNews)
		.default([])
		.describe("Recent announcements, funding, or launches."),
	industry: z
		.string()
		.trim()
		.min(2)
		.max(LIMITS.industryMaxLength)
		.optional()
		.describe(
			'The broad industry, in two or three plain words, e.g. "Software", "Financial Services", "Healthcare". Only when the site makes it plain.',
		),
	subIndustry: z
		.string()
		.trim()
		.min(2)
		.max(LIMITS.industryMaxLength)
		.optional()
		.describe('The narrower field, e.g. "Payments", "Developer Tools".'),
	sourceUrls: z
		.array(z.string().url())
		.min(1)
		.max(LIMITS.maxSources)
		.describe(
			"The pages you read, from research_company. They must be on the company's own site.",
		),
});

type BriefInput = z.infer<typeof inputSchema>;

export default defineTool({
	description:
		"Write a research brief to a company's timeline from what research_company returned: positioning, pricing, who they sell to, notable customers, recent news. Also fills the industry when it is blank. Never overwrites what a person typed.",
	inputSchema,
	async execute(input, ctx) {
		assertResearchPurpose(ctx);

		const company = await db.company.findUnique({
			where: { id: input.companyId },
			select: {
				id: true,
				name: true,
				domain: true,
				website: true,
				ownerId: true,
			},
		});

		if (!company) {
			return { written: false as const, reason: "No such company." };
		}

		const site = hostOf(company.website ?? company.domain ?? "");

		if (!site) {
			return {
				written: false as const,
				reason: "This company has no website, so there is nothing to cite.",
			};
		}

		const sources = input.sourceUrls.filter((url) => onSite(url, site));

		if (sources.length === 0) {
			return {
				written: false as const,
				reason: `None of those pages is on ${site}. Cite the pages research_company returned.`,
			};
		}

		const author =
			company.ownerId ??
			(await db.user.findFirst({ select: { id: true } }))?.id ??
			null;

		if (!author) {
			return { written: false as const, reason: "No user to attribute to." };
		}

		const activity = await db.activity.create({
			data: {
				type: ActivityType.ENRICHMENT,
				subject: `Research brief — ${company.name}`,
				body: formatBrief(input),
				occurredAt: new Date(),
				companyId: company.id,
				createdById: author,
				meta: {
					source: "site",
					pages: sources,
					agent: "people-research",
				},
			},
			select: { id: true },
		});

		const filled = await fillIndustry(company.id, input);

		await db.company.update({
			where: { id: company.id },
			data: { lastActivityAt: new Date() },
		});

		return { written: true as const, activityId: activity.id, filled };
	},
});

function onSite(url: string, site: string): boolean {
	const host = hostOf(url);

	return host === site || host.endsWith(`.${site}`);
}

async function fillIndustry(
	companyId: string,
	input: BriefInput,
): Promise<string[]> {
	const filled: string[] = [];

	if (input.industry) {
		const { count } = await db.company.updateMany({
			where: { id: companyId, industry: null },
			data: { industry: input.industry },
		});
		if (count > 0) filled.push("industry");
	}

	if (input.subIndustry) {
		const { count } = await db.company.updateMany({
			where: { id: companyId, subIndustry: null },
			data: { subIndustry: input.subIndustry },
		});
		if (count > 0) filled.push("subIndustry");
	}

	return filled;
}

function formatBrief(brief: BriefInput): string {
	const lines: string[] = [brief.positioning];

	if (brief.pricingModel) lines.push(`Pricing: ${brief.pricingModel}`);
	if (brief.targetCustomer) lines.push(`Sells to: ${brief.targetCustomer}`);

	if (brief.notableCustomers.length > 0) {
		lines.push(`Customers: ${brief.notableCustomers.join(", ")}`);
	}

	if (brief.recentNews.length > 0) {
		lines.push(
			`Recently:\n${brief.recentNews.map((item) => `• ${item}`).join("\n")}`,
		);
	}

	return lines.join("\n\n");
}
