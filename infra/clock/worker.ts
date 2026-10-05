interface Env {
	API_URL?: string;
	CRON_SECRET?: string;
}

interface ScheduledController {
	cron: string;
}

const REQUEST_TIMEOUT_MS = 90_000;

const JOBS = {
	"*/30 * * * *": ["/internal/sync/mailboxes", "/internal/agent/tick"],
	"0 4 * * *": [
		"/internal/tracking/retention",
		"/internal/archive/prune",
		"/internal/sync/rates",
	],
} as const satisfies Record<string, readonly string[]>;

function jobsFor(cron: string): readonly string[] | undefined {
	return Object.entries(JOBS).find(([schedule]) => schedule === cron)?.[1];
}

async function call(base: string, secret: string, path: string) {
	try {
		const response = await fetch(new URL(path, base), {
			method: "POST",
			headers: { authorization: `Bearer ${secret}` },
			signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
		});

		return { path, ok: response.ok, outcome: String(response.status) };
	} catch (error) {
		return {
			path,
			ok: false,
			outcome: error instanceof Error ? error.name : "unreachable",
		};
	}
}

export default {
	async scheduled(controller: ScheduledController, env: Env): Promise<void> {
		const base = env.API_URL?.trim();
		const secret = env.CRON_SECRET?.trim();

		if (!base || !secret) {
			throw new Error("The clock needs API_URL and CRON_SECRET.");
		}

		const paths = jobsFor(controller.cron);
		if (!paths) {
			throw new Error(`The clock has no jobs for "${controller.cron}".`);
		}

		const failed: string[] = [];
		for (const path of paths) {
			const result = await call(base, secret, path);
			console.log(`${result.path} ${result.outcome}`);
			if (!result.ok) failed.push(`${result.path} ${result.outcome}`);
		}

		if (failed.length > 0) {
			throw new Error(`The clock tick failed: ${failed.join(", ")}`);
		}
	},
};
