import { readSite } from "@crm/context/site";
import { db } from "@crm/db";
import { defineTool } from "eve/tools";
import { z } from "zod";
import { CONTEXT } from "../lib/context-config";
import { spend } from "../lib/focus";

export default defineTool({
	description:
		"Read a company's own website — the home page and the pages that say what they sell, who to and for how much — and return the text. Writes nothing. Follow it with write_company_brief, and cite the page URLs it returned.",
	inputSchema: z.object({
		companyId: z.string(),
	}),
	async execute({ companyId }) {
		const company = await db.company.findUnique({
			where: { id: companyId },
			select: { id: true, name: true, domain: true, website: true },
		});

		if (!company) return { read: false as const, reason: "No such company." };

		const site = company.website ?? company.domain;

		if (!site) {
			return { read: false as const, reason: "This company has no website." };
		}

		const charge = spend(CONTEXT.cost.site);
		if (!charge.ok) return { read: false as const, reason: charge.reason };

		const result = await readSite(site);

		if (result.outcome !== "read") {
			return { read: false as const, reason: result.reason };
		}

		return {
			read: true as const,
			companyId: company.id,
			company: company.name,
			pages: result.pages,
			note:
				"This is the company's own marketing copy. State only what these pages say, " +
				"leave a line out rather than guess, and call write_company_brief with the URLs you used.",
		};
	},
});
