import { describe, expect, it } from "bun:test";

process.env.API_URL = "  https://api.crm.example.test  ";
process.env.APP_URL = " https://crm.example.test ";
process.env.GOOGLE_CLIENT_ID =
	" 559708752870-padded.apps.googleusercontent.com ";
process.env.GOOGLE_CLIENT_SECRET = "\tGOCSPX-padded-secret\n";
process.env.AUTH_COOKIE_DOMAIN = "   ";

const { canConfigureSso, ssoCallbackBase, ssoCallbackURL, ssoProviderName } =
	await import("../src/sso");

const { env } = await import("../src/env");

describe("canConfigureSso", () => {
	it("is the same answer as renaming the workspace", () => {
		expect(canConfigureSso("owner")).toBe(true);
		expect(canConfigureSso("admin")).toBe(true);
		expect(canConfigureSso("member")).toBe(false);
		expect(canConfigureSso(null)).toBe(false);
	});
});

describe("ssoCallbackURL", () => {
	it("is the app origin plus the path better-auth mounts the callback on", () => {
		expect(ssoCallbackURL("okta")).toBe(
			"https://crm.example.test/api/auth/sso/callback/okta",
		);
	});

	it("hangs off the base the settings page shows", () => {
		expect(ssoCallbackBase()).toBe(
			"https://crm.example.test/api/auth/sso/callback",
		);
	});
});

describe("a value pasted into a dashboard carries whitespace", () => {
	it("strips the padding off the Google credentials", () => {
		expect(env.google).toEqual({
			clientId: "559708752870-padded.apps.googleusercontent.com",
			clientSecret: "GOCSPX-padded-secret",
		});
	});

	it("strips the padding off the API origin", () => {
		expect(env.apiUrl).toBe("https://api.crm.example.test");
	});

	it("reads a value that is only spaces as unset", () => {
		expect(env.cookieDomain).toBeUndefined();
	});
});

describe("ssoProviderName", () => {
	it("reads as a button on the sign-in page", () => {
		expect(ssoProviderName("okta")).toBe("Okta");
		expect(ssoProviderName("entra-id")).toBe("Entra Id");
		expect(ssoProviderName("jump_cloud")).toBe("Jump Cloud");
	});

	it("leaves an acronym alone", () => {
		expect(ssoProviderName("ADFS")).toBe("ADFS");
	});
});
