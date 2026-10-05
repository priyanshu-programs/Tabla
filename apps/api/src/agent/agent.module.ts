import { Module } from "@nestjs/common";
import { TrpcModule } from "../trpc/trpc.module";
import { AgentAccessService } from "./agent-access.service";
import { AgentDefinitionsService } from "./agent-definitions.service";
import { AgentQueueService } from "./agent-queue.service";
import { AgentRunsService } from "./agent-runs.service";
import { AgentTickController } from "./agent-tick.controller";
import { AgentTriggerService } from "./agent-trigger.service";
import { AgentsRouter } from "./agents.router";
import { DispatchHeartbeatService } from "./dispatch-heartbeat.service";

@Module({
	imports: [TrpcModule],
	controllers: [AgentTickController],
	providers: [
		AgentAccessService,
		AgentDefinitionsService,
		AgentQueueService,
		AgentRunsService,
		AgentTriggerService,
		AgentsRouter,
		DispatchHeartbeatService,
	],
	exports: [AgentAccessService, AgentTriggerService, AgentQueueService],
})
export class AgentModule {}
