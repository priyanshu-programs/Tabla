import { describe, expect, it } from "bun:test";
import { parsePage } from "../src/html";
import { portraitsOn, teamLinks } from "../src/team";

const TEAM = `<!doctype html>
<html><body>
	<header><img src="/img/logo.png" alt="Acme Rockets"></header>
	<section class="grid">
		<h2>Our leadership team</h2>
		<div class="card">
			<img src="/people/jane.jpg" alt="Photo of Jane Smith, Chief Executive">
			<h3>Jane Smith</h3>
		</div>
		<div class="card">
			<figure><img data-src="/people/raj.jpg" src="data:image/gif;base64,AAAA" alt=""></figure>
			<h3>Raj Patel</h3>
			<p>Head of Sales</p>
		</div>
		<div class="card">
			<img src="/people/unnamed.jpg" alt="">
		</div>
	</section>
	<section class="customers">
		<img src="/img/globex-badge.png" alt="Globex Corporation">
	</section>
</body></html>`;

const page = parsePage(TEAM, new URL("https://acme.com/team"));

describe("portraitsOn", () => {
	const portraits = portraitsOn(page);

	const photoOf = (name: string) =>
		portraits.find((portrait) => portrait.name === name)?.photoUrl;

	it("reads a name from the alt text and drops the label and the title", () => {
		expect(photoOf("Jane Smith")).toBe("https://acme.com/people/jane.jpg");
	});

	it("reads a name from the card heading and a lazy image from data-src", () => {
		expect(photoOf("Raj Patel")).toBe("https://acme.com/people/raj.jpg");
	});

	it("never gives one person's photo another person's name", () => {
		const names = portraits
			.filter((portrait) => portrait.photoUrl.endsWith("unnamed.jpg"))
			.map((portrait) => portrait.name);

		expect(names).toEqual([]);
	});

	it("leaves logos and badges out", () => {
		for (const portrait of portraits) {
			expect(portrait.photoUrl).not.toContain("/img/");
		}
	});
});

describe("teamLinks", () => {
	it("finds the pages that list people, on the company's own site only", () => {
		const home = parsePage(
			`<a href="/about">About</a><a href="/pricing">Pricing</a>
			 <a href="/company/leadership?x=1">Leadership</a>
			 <a href="https://other.example/team">Their team</a>`,
			new URL("https://acme.com/"),
		);

		expect(teamLinks(home, "acme.com")).toEqual([
			"https://acme.com/about",
			"https://acme.com/company/leadership",
		]);
	});
});
