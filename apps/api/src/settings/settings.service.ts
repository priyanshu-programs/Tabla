import type { Db } from "@crm/db";
import {
	DEFAULT_AGENT_MODEL,
	readAgentModel,
	readArchiveRetentionDays,
	writeAgentModel,
	writeArchiveRetentionDays,
} from "@crm/db/settings";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { InjectDatabase } from "../database/database.constants";
import { ModelCatalogService } from "./model-catalog.service";
import type {
	AgentModelSettings,
	ArchiveRetentionSettings,
	ModelCatalogResult,
} from "./settings.contracts";

@Injectable()
export class SettingsService {
	private readonly logger = new Logger(SettingsService.name);

	constructor(
		@InjectDatabase() private readonly db: Db,
		private readonly catalog: ModelCatalogService,
	) {}

	async agentModel(): Promise<AgentModelSettings> {
		const [model, row] = await Promise.all([
			readAgentModel(this.db),
			this.db.appSetting.findFirst({ select: { updatedAt: true } }),
		]);

		return {
			selectedId: model.isDefault ? null : model.id,
			effectiveId: model.id,
			defaultId: DEFAULT_AGENT_MODEL.id,
			effective: await this.catalog.find(model.id),
			updatedAt: row?.updatedAt.toISOString() ?? null,
		};
	}

	async setAgentModel(modelId: string | null): Promise<AgentModelSettings> {
		if (modelId === null) {
			await writeAgentModel(this.db, null);
			this.logger.log({ message: "Agent model reset to the default" });
			return this.agentModel();
		}

		const models = await this.catalog.models();

		if (!models) {
			throw new BadRequestException(
				"Could not reach the AI Gateway to check that model. Try again in a moment.",
			);
		}

		const chosen = models.find((model) => model.id === modelId);

		if (!chosen) {
			throw new BadRequestException(
				`The AI Gateway does not serve a tool-using model called "${modelId}".`,
			);
		}

		await writeAgentModel(this.db, {
			id: chosen.id,
			contextWindowTokens: chosen.contextWindowTokens,
		});

		this.logger.log({ message: "Agent model changed", modelId: chosen.id });

		return this.agentModel();
	}

	async modelCatalog(): Promise<ModelCatalogResult> {
		const models = await this.catalog.models();
		return { models: models ?? [], available: models !== null };
	}

	async archiveRetention(): Promise<ArchiveRetentionSettings> {
		return { days: await readArchiveRetentionDays(this.db) };
	}

	async setArchiveRetention(days: number): Promise<ArchiveRetentionSettings> {
		const saved = await writeArchiveRetentionDays(this.db, days);

		this.logger.log({
			message: "Archive retention changed",
			days: saved,
		});

		return { days: saved };
	}
}
