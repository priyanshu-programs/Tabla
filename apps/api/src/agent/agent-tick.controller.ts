import {
	BadGatewayException,
	Controller,
	ForbiddenException,
	Headers,
	Logger,
	Post,
	ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
	ApiBadGatewayResponse,
	ApiForbiddenResponse,
	ApiHeader,
	ApiOkResponse,
	ApiOperation,
	ApiServiceUnavailableResponse,
	ApiTags,
} from "@nestjs/swagger";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";
import type { EnvironmentVariables } from "../config/env.validation";
import { AgentTriggerService } from "./agent-trigger.service";

@ApiTags("Internal — Cron")
@ApiHeader({
	name: "authorization",
	description: "`Bearer <CRON_SECRET>`",
	required: true,
})
@ApiForbiddenResponse({ description: "CRON_SECRET did not match." })
@ApiServiceUnavailableResponse({ description: "CRON_SECRET is not set." })
@Controller("internal/agent")
export class AgentTickController {
	private readonly logger = new Logger(AgentTickController.name);
	private readonly secret: string | undefined;

	constructor(
		private readonly trigger: AgentTriggerService,
		config: ConfigService<EnvironmentVariables, true>,
	) {
		this.secret = config.get("CRON_SECRET", { infer: true });
	}

	@Post("tick")
	@AllowAnonymous()
	@ApiOperation({
		summary: "Tell the agent to drain its queues and run its sweeps",
	})
	@ApiOkResponse({
		description: "The agent accepted the tick, or has no bridge.",
	})
	@ApiBadGatewayResponse({ description: "The agent did not answer." })
	async tick(@Headers("authorization") authorization?: string) {
		if (!this.secret) {
			this.logger.error({
				message: "CRON_SECRET is not set — refusing to run the agent tick.",
			});
			throw new ServiceUnavailableException(
				"The agent tick is not configured.",
			);
		}

		if (!timingSafeEquals(authorization ?? "", `Bearer ${this.secret}`)) {
			throw new ForbiddenException();
		}

		if (!this.trigger.canReachAgent()) {
			return { agent: "not-configured" as const };
		}

		if (!(await this.trigger.tick())) {
			throw new BadGatewayException("The agent did not answer.");
		}

		return { agent: "reached" as const };
	}
}

function timingSafeEquals(a: string, b: string): boolean {
	if (a.length !== b.length) return false;

	let mismatch = 0;
	for (let index = 0; index < a.length; index += 1) {
		mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
	}

	return mismatch === 0;
}
