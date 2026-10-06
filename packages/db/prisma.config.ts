import "@crm/env/load";

import path from "node:path";
import { defineConfig } from "prisma/config";

const url = process.env.DATABASE_URL;
const datasource = url ? { url } : undefined;

export default defineConfig({
	schema: path.join("prisma", "schema.prisma"),
	migrations: {
		path: path.join("prisma", "migrations"),
		seed: "bun run prisma/seed.ts",
	},
	datasource,
});
