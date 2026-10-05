import { describe, expect, it } from "bun:test";
import { parsePage, visibleText } from "../src/html";
import { allowed, parseRobots, rankLinks } from "../src/site";

const HOME = `<!doctype html>
<html>
<head><title>Acme</title><style>.hero { color: red }</style></head>
<body>
	<header>
		<nav>
			<a href="/pricing">Pricing</a>
			<a href="/about-us">About</a>
			<a href="/login">Log in</a>
		</nav>
	</header>
	<main>
		<h1>Rockets for &amp; by coyotes</h1>
		<p>Acme builds   rockets.</p>
		<script>window.secret = "never shown";</script>
		<a href="/customers#logos">Our customers</a>
		<a href="/blog/2026/08/a-very-deep-post">A deep post</a>
		<a href="/whitepaper.pdf">Product whitepaper</a>
		<a href="https://other.example/pricing">Someone else's pricing</a>
		<a href="https://status.acme.com/news">Status news</a>
		<a href="/random">Nothing useful</a>
		<a href="/pricing?ref=footer">Pricing again</a>
	</main>
	<footer><a href="/privacy">Privacy</a><p>Copyright Acme</p></footer>
</body>
</html>`;

const page = parsePage(HOME, new URL("https://acme.com/"));

describe("rankLinks", () => {
	const links = rankLinks(page);

	it("puts the pages that say what a company sells first", () => {
		expect(links).toEqual([
			"https://acme.com/pricing",
			"https://acme.com/about-us",
			"https://acme.com/customers",
		]);
	});

	it("leaves out other sites, subdomains, files, sign-in pages and deep paths", () => {
		for (const unwanted of [
			"other.example",
			"status.",
			".pdf",
			"login",
			"2026",
		]) {
			expect(links.join(" ")).not.toContain(unwanted);
		}
	});

	it("lists a page once when two links point at it", () => {
		expect(links.filter((link) => link.includes("pricing"))).toHaveLength(1);
	});
});

describe("visibleText", () => {
	const text = visibleText(HOME);

	it("keeps the words a reader sees", () => {
		expect(text).toContain("Rockets for & by coyotes");
		expect(text).toContain("Acme builds rockets.");
	});

	it("drops scripts, styles, navigation and the footer", () => {
		for (const hidden of ["never shown", "color: red", "Log in", "Copyright"]) {
			expect(text).not.toContain(hidden);
		}
	});
});

describe("parseRobots", () => {
	const robots = [
		"User-agent: Googlebot",
		"Disallow: /only-google",
		"",
		"User-agent: *",
		"User-agent: OtherBot",
		"Disallow: /private/ # staff only",
		"Disallow: /search*q=",
		"Disallow:",
		"Allow: /",
	].join("\n");

	it("reads the rules for every reader and ignores the rules for one bot", () => {
		expect(parseRobots(robots)).toEqual(["/private/", "/search"]);
	});

	it("applies a rule as a path prefix", () => {
		const disallowed = parseRobots(robots);

		expect(allowed(new URL("https://acme.com/pricing"), disallowed)).toBe(true);
		expect(allowed(new URL("https://acme.com/private/x"), disallowed)).toBe(
			false,
		);
	});

	it("allows every path when there is no file", () => {
		expect(parseRobots("")).toEqual([]);
	});
});
