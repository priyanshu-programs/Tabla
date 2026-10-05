export type MockCompany = {
	name: string;
	domain: string;
	logo?: { src: string; invert?: boolean };
	industry?: string;
	owner?: { name: string; avatar: string };
	contacts?: string;
	deals?: string;
	lastActivity?: string;
};

export const OWNER = {
	name: "Maya Chen",
	avatar: "/landing/avatar-patrick.jpg",
};

export const MOCK_COMPANIES: MockCompany[] = [
	{
		name: "Northstar Goods",
		domain: "northstar.example",
		industry: "Retail & E-commerce",
		owner: OWNER,
		contacts: "1",
		deals: "0",
		lastActivity: "2h ago",
	},
	{
		name: "Acorn Supply",
		domain: "acorn.example",
	},
	{
		name: "Juniper Labs",
		domain: "juniper.example",
	},
	{
		name: "Atlas Freight",
		domain: "atlas.example",
	},
	{
		name: "Harbor Health",
		domain: "harbor.example",
	},
	{
		name: "Pine Finance",
		domain: "pine.example",
	},
	{
		name: "Field Notes",
		domain: "fieldnotes.example",
	},
	{
		name: "Cedar Works",
		domain: "cedar.example",
	},
];

export const COMPANY_COLUMNS = [
	{ label: "Company", width: "26%" },
	{ label: "Domain", width: "16%" },
	{ label: "Industry", width: "16%" },
	{ label: "Owner", width: "16%" },
	{ label: "Contacts", width: "9%" },
	{ label: "Deals", width: "9%" },
	{ label: "Last activity", width: "12%" },
] as const;
