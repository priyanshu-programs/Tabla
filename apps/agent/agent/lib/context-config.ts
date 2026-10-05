const SECOND_MS = 1_000;

export const CONTEXT = {
	timeoutMs: 60 * SECOND_MS,

	cost: {
		brand: 1,
		site: 1,
	},

	brief: {
		positioningMinLength: 40,
		positioningMaxLength: 600,
		lineMaxLength: 300,
		customerMaxLength: 80,
		maxCustomers: 12,
		newsMaxLength: 200,
		maxNews: 6,
		industryMaxLength: 60,
		maxSources: 8,
	},

	people: {
		matchFloor: 70,
		enrichCost: 2,
	},

	avatarHosts: ["brand.dev", "licdn.com"],
} as const;
