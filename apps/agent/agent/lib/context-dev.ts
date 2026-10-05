import ContextDev from "context.dev";
import { APIError } from "context.dev/core/error";
import { z } from "zod";
import { contextDevKey } from "./capabilities";
import { CONTEXT } from "./context-config";

export type JsonSchema = {
	type?:
		| "array"
		| "boolean"
		| "integer"
		| "null"
		| "number"
		| "object"
		| "string";
	description?: string;
	properties?: Record<string, JsonSchema>;
	items?: JsonSchema;
	required?: string[];
	enum?: (string | number | boolean | null)[];
	additionalProperties?: boolean | JsonSchema;
};

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

export async function extract(
	url: string,
	schema: JsonSchema,
	instructions: string,
): Promise<
	{ outcome: "found"; data: unknown } | { outcome: "failed"; reason: string }
> {
	const api = await contextDev();
	if (!api) {
		return { outcome: "failed", reason: "Context.dev is not configured." };
	}

	try {
		const response = await api.web.extract({
			url,
			schema,
			instructions,
			maxPages: 8,
			timeoutMS: CONTEXT.timeoutMs,
		});
		return { outcome: "found", data: response.data };
	} catch (error) {
		return { outcome: "failed", reason: describe(error) };
	}
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
