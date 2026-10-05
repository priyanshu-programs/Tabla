import { describe, expect, it } from "bun:test";
import {
	BadGatewayException,
	ForbiddenException,
	ServiceUnavailableException,
} from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import { AgentTickController } from "../src/agent/agent-tick.controller";
import type { AgentTriggerService } from "../src/agent/agent-trigger.service";
import type { EnvironmentVariables } from "../src/config/env.validation";

const SECRET = "agent-tick-spec-secret";
const BEARER = `Bearer ${SECRET}`;

function build(options: {
	secret: string | undefined;
	bridge: boolean;
	reached: boolean;
}) {
	let ticks = 0;
	const trigger = {
		canReachAgent() {
			return options.bridge;
		},
		async tick() {
			ticks += 1;
			return options.reached;
		},
	} as AgentTriggerService;
	const config = {
		get() {
			return options.secret;
		},
	} as unknown as ConfigService<EnvironmentVariables, true>;

	return {
		controller: new AgentTickController(trigger, config),
		ticks: () => ticks,
	};
}

describe("POST /internal/agent/tick", () => {
	it("refuses to run when CRON_SECRET is unset", async () => {
		const { controller, ticks } = build({
			secret: undefined,
			bridge: true,
			reached: true,
		});

		await expect(controller.tick(BEARER)).rejects.toBeInstanceOf(
			ServiceUnavailableException,
		);
		expect(ticks()).toBe(0);
	});

	it("refuses a missing or wrong bearer", async () => {
		const { controller, ticks } = build({
			secret: SECRET,
			bridge: true,
			reached: true,
		});

		await expect(controller.tick(undefined)).rejects.toBeInstanceOf(
			ForbiddenException,
		);
		await expect(controller.tick("Bearer wrong")).rejects.toBeInstanceOf(
			ForbiddenException,
		);
		await expect(controller.tick(SECRET)).rejects.toBeInstanceOf(
			ForbiddenException,
		);
		expect(ticks()).toBe(0);
	});

	it("ticks the agent once with the right bearer", async () => {
		const { controller, ticks } = build({
			secret: SECRET,
			bridge: true,
			reached: true,
		});

		expect(await controller.tick(BEARER)).toEqual({ agent: "reached" });
		expect(ticks()).toBe(1);
	});

	it("reports an install with no agent bridge without calling it", async () => {
		const { controller, ticks } = build({
			secret: SECRET,
			bridge: false,
			reached: false,
		});

		expect(await controller.tick(BEARER)).toEqual({ agent: "not-configured" });
		expect(ticks()).toBe(0);
	});

	it("fails loudly when the agent does not answer", async () => {
		const { controller } = build({
			secret: SECRET,
			bridge: true,
			reached: false,
		});

		await expect(controller.tick(BEARER)).rejects.toBeInstanceOf(
			BadGatewayException,
		);
	});
});
