import { afterEach, describe, expect, it } from "bun:test";
import { db, EnrichmentStatus } from "@crm/db";
import { runBrand } from "../agent/lib/brand";
import { settle } from "../agent/lib/enrichment";

const DNS_TEST_TIMEOUT_MS = 20_000;

const created: string[] = [];
const tasks: string[] = [];

afterEach(async () => {
	if (tasks.length > 0) {
		await db.agentTask.deleteMany({ where: { id: { in: tasks.splice(0) } } });
	}
	if (created.length === 0) return;
	await db.company.deleteMany({ where: { id: { in: created.splice(0) } } });
});

async function company(status: EnrichmentStatus) {
	const row = await db.company.create({
		data: {
			name: "Settle Probe",
			domain: `settle-${created.length}-${status}.test`.toLowerCase(),
			enrichmentStatus: status,
		},
		select: { id: true },
	});

	created.push(row.id);
	return row.id;
}

const subjectOf = (companyId: string) => ({
	id: `settle-${companyId}`,
	kind: "brand",
	contactId: null,
	companyId,
	dealId: null,
});

async function retiredSubjectOf(companyId: string) {
	await db.$executeRaw`
		UPDATE "company"
		SET "updatedAt" = NOW() - INTERVAL '1 second'
		WHERE id = ${companyId}
	`;

	const row = await db.agentTask.create({
		data: {
			companyId,
			kind: "brand",
			reason: "settle",
			attempts: 3,
			dueAt: new Date(),
			finishedAt: new Date(),
		},
		select: { id: true },
	});

	tasks.push(row.id);
	return { ...subjectOf(companyId), id: row.id };
}

const statusOf = async (id: string) =>
	(
		await db.company.findUnique({
			where: { id },
			select: { enrichmentStatus: true },
		})
	)?.enrichmentStatus;

describe("settling a brand task", () => {
	it("leaves a company that never started where the sweep will find it again", async () => {
		const id = await company(EnrichmentStatus.PENDING);

		await settle(subjectOf(id), EnrichmentStatus.SKIPPED, "Nothing ran.");

		expect(await statusOf(id)).toBe(EnrichmentStatus.PENDING);
	});

	it("does not strand a company that had already failed", async () => {
		const id = await company(EnrichmentStatus.FAILED);

		await settle(subjectOf(id), EnrichmentStatus.SKIPPED, "Nothing ran.");

		expect(await statusOf(id)).toBe(EnrichmentStatus.FAILED);
	});

	it("still settles a lookup that genuinely ran", async () => {
		const id = await company(EnrichmentStatus.RUNNING);

		await settle(subjectOf(id), EnrichmentStatus.SKIPPED, "No brand.");

		expect(await statusOf(id)).toBe(EnrichmentStatus.SKIPPED);
	});

	it("records a failure on a company that never started", async () => {
		const id = await company(EnrichmentStatus.PENDING);

		await settle(
			await retiredSubjectOf(id),
			EnrichmentStatus.FAILED,
			"Research was attempted several times and never completed.",
		);

		expect(await statusOf(id)).toBe(EnrichmentStatus.FAILED);
	});

	it("does not revive a company that already completed", async () => {
		const id = await company(EnrichmentStatus.COMPLETE);

		await settle(
			await retiredSubjectOf(id),
			EnrichmentStatus.FAILED,
			"too late",
		);

		expect(await statusOf(id)).toBe(EnrichmentStatus.COMPLETE);
	});
});

async function domainlessCompany(status: EnrichmentStatus) {
	const row = await db.company.create({
		data: {
			name: `Settle Probe ${created.length}`,
			enrichmentStatus: status,
		},
		select: { id: true },
	});

	created.push(row.id);
	return row.id;
}

describe("a brand task on an install with no research key", () => {
	it("marks a company with no domain skipped, because no sweep will find it again", async () => {
		const id = await domainlessCompany(EnrichmentStatus.PENDING);

		const result = await runBrand({ companyId: id });

		expect(result.enriched).toBe(false);
		expect(await statusOf(id)).toBe(EnrichmentStatus.SKIPPED);
	});

	it(
		"runs the lookup and settles a domain that has no site",
		async () => {
			const id = await company(EnrichmentStatus.PENDING);

			const result = await runBrand({ companyId: id });

			expect(result.enriched).toBe(false);
			expect(result.reason).toContain("No site answers");
			expect(await statusOf(id)).toBe(EnrichmentStatus.SKIPPED);
		},
		DNS_TEST_TIMEOUT_MS,
	);
});
