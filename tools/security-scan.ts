import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const SCAN = {
	homeVariable: "VIBE_GUARD_HOME",
	entry: join("bin", "vibe-guard.js"),
	targets: ["apps", "packages"],
	defaultArgs: ["--min-severity", "high"],
	failureStatus: 1,
} as const;

const home = process.env[SCAN.homeVariable]?.trim();

if (!home) {
	fail([
		`${SCAN.homeVariable} is not set.`,
		"Clone https://github.com/IAmUnbounded/vibe-guard outside this repository.",
		`Then set ${SCAN.homeVariable} in .env to the clone path.`,
	]);
}

const cli = join(home, SCAN.entry);

if (!existsSync(cli)) {
	fail([
		`No scanner at ${cli}.`,
		`${SCAN.homeVariable} must point at a vibe-guard clone.`,
	]);
}

const passed = process.argv.slice(2);
const args = passed.length > 0 ? passed : [...SCAN.defaultArgs];

let status = 0;

for (const target of SCAN.targets) {
	const result = spawnSync(process.execPath, [cli, "scan", target, ...args], {
		stdio: "inherit",
	});

	status = Math.max(status, result.status ?? SCAN.failureStatus);
}

process.exit(status);

function fail(lines: string[]): never {
	console.error(["", ...lines.map((line) => `  ${line}`), ""].join("\n"));
	process.exit(SCAN.failureStatus);
}
