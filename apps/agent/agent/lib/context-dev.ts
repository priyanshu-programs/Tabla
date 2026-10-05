import ContextDev from "context.dev";
import { APIError } from "context.dev/core/error";
import { z } from "zod";
import { contextDevKey } from "./capabilities";

let client: { key: string; api: ContextDev } | null = null;

export async function contextDev(): Promise<ContextDev | null> {
	const key = await contextDevKey();

	if (!key) {
		client = null;
		return null;
	}

	if (client?.key !== key) {
		client = { key, api: new ContextDev({ apiKey: key }) };
	}

	return client.api;
}

const apiErrorBody = z
	.object({
		error_code: z.string().optional().catch(undefined),
		message: z.string().optional().catch(undefined),
	})
	.catch({});

function errorCode(error: APIError): string | undefined {
	return apiErrorBody.parse(error.error).error_code;
}

export function describe(cause: unknown): string {
	if (cause instanceof APIError) {
		return `${cause.status ?? "?"} ${errorCode(cause) ?? cause.message}`;
	}
	return cause instanceof Error ? cause.message : String(cause);
}
