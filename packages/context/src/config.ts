const SECOND_MS = 1_000;

const KILOBYTE = 1_024;

export const CONTEXT_ENGINE = {
	page: {
		timeoutMs: 8 * SECOND_MS,
		maxBytes: 2_048 * KILOBYTE,
	},

	manifest: {
		maxBytes: 64 * KILOBYTE,
	},

	image: {
		maxCandidates: 4,
	},

	brand: {
		titleMaxLength: 80,
		descriptionMaxLength: 500,
		minLabelLength: 3,
		minColourSaturation: 0.12,
		minPhoneDigits: 7,
	},

	organisationTypes: [
		"Organization",
		"Corporation",
		"LocalBusiness",
		"OnlineBusiness",
		"OnlineStore",
		"ProfessionalService",
		"FinancialService",
		"LegalService",
		"MedicalOrganization",
		"EducationalOrganization",
		"GovernmentOrganization",
		"NGO",
		"Store",
	],

	siteTypes: ["WebSite"],

	social: {
		linkedinSections: ["company", "school", "showcase"],
		reservedHandles: [
			"about",
			"explore",
			"features",
			"hashtag",
			"home",
			"i",
			"intent",
			"login",
			"marketplace",
			"orgs",
			"pricing",
			"privacy",
			"search",
			"settings",
			"share",
			"signup",
			"sponsors",
			"topics",
			"tos",
		],
	},

	links: {
		pricingPath: /^\/(pricing|plans|prices)\/?$/i,
		careersPath: /^\/(careers?|jobs|join-us|work-with-us|hiring)\/?$/i,
		careersText:
			/^(careers?|jobs|we.?re hiring|join us|work with us|open roles|open positions)$/i,
	},
} as const;
