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

	site: {
		maxPages: 6,
		maxCharsPerPage: 6_000,
		concurrency: 3,
		maxPathDepth: 2,
		robotsMaxBytes: 64 * KILOBYTE,
		headerBonus: 1,
		sections: [
			{ pattern: /\b(about|company|who-we-are|our-story)\b/i, weight: 5 },
			{ pattern: /\b(pricing|plans)\b/i, weight: 5 },
			{
				pattern: /\b(products?|platform|features|solutions|services)\b/i,
				weight: 4,
			},
			{
				pattern: /\b(customers|clients|case-studies|stories)\b/i,
				weight: 4,
			},
			{ pattern: /\b(news|newsroom|press|blog|changelog)\b/i, weight: 2 },
			{ pattern: /\b(team|people|leadership|founders)\b/i, weight: 2 },
		],
		skipPath:
			/\b(login|log-in|signin|sign-in|signup|sign-up|register|privacy|terms|legal|cookies?|cart|checkout|account)\b/i,
		skipFile: /\.(pdf|png|jpe?g|gif|svg|webp|zip|mp4|mov|xml|json|css|js)$/i,
	},

	team: {
		maxPages: 3,
		ancestorDepth: 3,
		maxNameWords: 5,
		maxNameLength: 60,
		pagePattern:
			/\b(team|people|leadership|founders|management|staff|about|company|who-we-are)\b/i,
		nameLabel: /^(photo|picture|portrait|headshot|image|avatar)\s+(of\s+)?/i,
		nameSeparator: /\s+[|,–—-]\s+|\s*[|,]\s*/,
		skipHint: /logo|icon|sprite|badge|flag|banner|illustration/,
		headingSelector: "h1, h2, h3, h4, h5, h6, figcaption, strong",
	},

	links: {
		pricingPath: /^\/(pricing|plans|prices)\/?$/i,
		careersPath: /^\/(careers?|jobs|join-us|work-with-us|hiring)\/?$/i,
		careersText:
			/^(careers?|jobs|we.?re hiring|join us|work with us|open roles|open positions)$/i,
	},
} as const;
