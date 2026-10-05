import { describe, expect, it } from "bun:test";
import {
	brandColour,
	draftBrand,
	hasBrandData,
	hostOf,
	normaliseHex,
} from "../src/brand";
import { parsePage } from "../src/html";

const HOST = "acme.com";

function draft(html: string, host = HOST) {
	return draftBrand(parsePage(html, new URL(`https://${host}/`)), host);
}

const FULL_PAGE = `<!doctype html>
<html>
<head>
	<title>Acme | Rockets for everyone</title>
	<meta name="description" content="  Acme builds   rockets for coyotes. ">
	<meta property="og:site_name" content="Acme">
	<meta name="theme-color" content="#E11D48">
	<link rel="manifest" href="/site.webmanifest">
	<script type="application/ld+json">
	{
		"@context": "https://schema.org",
		"@graph": [
			{ "@type": "WebSite", "name": "Acme Site", "url": "https://acme.com" },
			{
				"@type": ["Organization", "Brand"],
				"name": "Acme Corporation",
				"slogan": "Rockets for everyone",
				"logo": { "@type": "ImageObject", "url": "/img/acme-logo.svg" },
				"sameAs": ["https://www.linkedin.com/company/acme-corp/", "https://twitter.com/acme"],
				"telephone": "+1 (415) 555-0100",
				"address": {
					"@type": "PostalAddress",
					"addressLocality": "San Francisco",
					"addressRegion": "ca",
					"addressCountry": "US"
				}
			}
		]
	}
	</script>
</head>
<body>
	<header>
		<a href="/"><img class="site-logo" src="/img/header-logo.png" alt="Acme"></a>
		<nav>
			<a href="/pricing">Pricing</a>
			<a href="/blog">Blog</a>
		</nav>
	</header>
	<main>
		<img src="/img/customer-logo-globex.png" alt="Globex logo">
		<a href="https://x.com/globex/status/123">A customer tweet</a>
		<a href="https://github.com/someone-else">A contributor</a>
	</main>
	<footer>
		<a href="https://github.com/acme">GitHub</a>
		<a href="https://jobs.lever.co/acme">Careers</a>
		<a href="mailto:hello@acme.com?subject=Hi">Email us</a>
		<a href="mailto:agency@webshop.example">Site by Webshop</a>
		<a href="tel:+14155550199">Call</a>
	</footer>
</body>
</html>`;

describe("hostOf", () => {
	it("reduces a domain or a URL to a bare host", () => {
		expect(hostOf("Acme.com")).toBe("acme.com");
		expect(hostOf("https://www.acme.com/pricing?x=1")).toBe("acme.com");
		expect(hostOf("  acme.co.uk ")).toBe("acme.co.uk");
	});

	it("refuses text that is not a web address", () => {
		expect(hostOf("")).toBeNull();
		expect(hostOf("acme")).toBeNull();
		expect(hostOf("not a domain")).toBeNull();
	});
});

describe("brandColour", () => {
	it("normalises a hex colour", () => {
		expect(normaliseHex("#E11D48")).toBe("#e11d48");
		expect(normaliseHex("f0a")).toBe("#ff00aa");
		expect(normaliseHex("rgb(1,2,3)")).toBeNull();
	});

	it("refuses white, black and grey, which are not a brand colour", () => {
		expect(brandColour("#ffffff")).toBeNull();
		expect(brandColour("#000")).toBeNull();
		expect(brandColour("#7a7a7a")).toBeNull();
		expect(brandColour("#e11d48")).toBe("#e11d48");
	});
});

describe("draftBrand", () => {
	const { brand, logoCandidates, hasColour } = draft(FULL_PAGE);

	it("prefers the organisation's declared name", () => {
		expect(brand.title).toBe("Acme Corporation");
	});

	it("collapses whitespace in the description", () => {
		expect(brand.description).toBe("Acme builds rockets for coyotes.");
	});

	it("reads the slogan, the colour and the phone", () => {
		expect(brand.slogan).toBe("Rockets for everyone");
		expect(brand.colors).toEqual([{ hex: "#e11d48", name: null }]);
		expect(hasColour).toBe(true);
		expect(brand.phone).toBe("+1 (415) 555-0100");
	});

	it("keeps only an email address on the company's own domain", () => {
		expect(brand.email).toBe("hello@acme.com");
	});

	it("reads the postal address and names the country", () => {
		expect(brand.address).toEqual({
			city: "San Francisco",
			state_code: "CA",
			country: "United States",
			country_code: "US",
		});
	});

	it("takes socials from sameAs and the footer, never from a customer's link", () => {
		expect(brand.socials).toEqual([
			{ type: "linkedin", url: "https://www.linkedin.com/company/acme-corp" },
			{ type: "x", url: "https://x.com/acme" },
			{ type: "github", url: "https://github.com/acme" },
		]);
	});

	it("finds the pricing page on the site and the careers page off it", () => {
		expect(brand.links).toEqual({
			pricing: "https://acme.com/pricing",
			careers: "https://jobs.lever.co/acme",
		});
	});

	it("orders logo candidates and leaves a customer's logo out", () => {
		expect(logoCandidates).toEqual([
			"https://acme.com/img/acme-logo.svg",
			"https://acme.com/img/header-logo.png",
		]);
	});

	it("leaves the industry empty, because a page does not state it", () => {
		expect(brand.industries).toBeNull();
	});
});

describe("draftBrand on a thin page", () => {
	it("takes the name from the title only when it matches the domain", () => {
		const matching = draft("<title>Welcome - Acme Inc</title>");
		expect(matching.brand.title).toBe("Acme Inc");

		const unrelated = draft("<title>Home | The best rockets</title>");
		expect(unrelated.brand.title).toBeNull();
	});

	it("keeps the name and drops the tagline when a site declares both as its name", () => {
		const tagged = draft(
			'<meta property="og:site_name" content="Acme - The Professional Rocket Platform">',
		);
		expect(tagged.brand.title).toBe("Acme");

		const plain = draft('<meta property="og:site_name" content="Acme Inc.">');
		expect(plain.brand.title).toBe("Acme Inc.");
	});

	it("reports no brand data for an empty application shell", () => {
		const shell = draft('<html><body><div id="root"></div></body></html>');

		expect(hasBrandData(shell.brand)).toBe(false);
		expect(shell.brand.socials).toEqual([]);
		expect(shell.brand.address).toBeNull();
	});

	it("survives JSON-LD that is not valid JSON", () => {
		const broken = draft(
			'<title>Acme</title><script type="application/ld+json">{ not json</script>',
		);

		expect(broken.brand.title).toBe("Acme");
	});

	it("does not treat a reserved path as a social handle", () => {
		const page = draft(
			'<footer><a href="https://x.com/intent/tweet?text=hi">Share</a><a href="https://github.com/features">Features</a></footer>',
		);

		expect(page.brand.socials).toEqual([]);
	});
});
