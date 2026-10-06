import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";

const EXPIRED_TITLE = "The sign-in link expired";

const REFUSED_TITLE = "That address cannot sign in";

const FALLBACK_TITLE = "Sign-in did not finish";

const TITLES = new Map([
	["FORBIDDEN", REFUSED_TITLE],
	["forbidden", REFUSED_TITLE],
	["email_not_found", "That provider returned no email address"],
	["unable_to_get_user_info", "That provider returned no account details"],
	["oauth_provider_not_found", "That sign-in method is not configured"],
	["invalid_code", EXPIRED_TITLE],
	["no_code", EXPIRED_TITLE],
	["invalid_callback_request", EXPIRED_TITLE],
	["state_mismatch", EXPIRED_TITLE],
	["please_restart_the_process", EXPIRED_TITLE],
	["unable_to_link_account", "That account is already in use"],
	[
		"account_already_linked_to_different_user",
		"That account belongs to somebody else",
	],
]);

const RESTART_DESCRIPTION = "Start again from this page.";

const REFUSED_DESCRIPTION =
	"Tabla is private. Ask the owner to add you to ALLOWED_SIGN_IN.";

const DESCRIPTIONS = new Map([
	["FORBIDDEN", REFUSED_DESCRIPTION],
	["forbidden", REFUSED_DESCRIPTION],
	["invalid_code", RESTART_DESCRIPTION],
	["no_code", RESTART_DESCRIPTION],
	["invalid_callback_request", RESTART_DESCRIPTION],
	["state_mismatch", RESTART_DESCRIPTION],
	["please_restart_the_process", RESTART_DESCRIPTION],
]);

function first(value: string | string[] | undefined): string | undefined {
	const single = Array.isArray(value) ? value[0] : value;
	return single && single.length > 0 ? single : undefined;
}

export function SignInError({
	code,
	description,
}: {
	code: string | string[] | undefined;
	description: string | string[] | undefined;
}) {
	const error = first(code);
	if (!error) return null;

	const detail =
		first(description) ?? DESCRIPTIONS.get(error) ?? RESTART_DESCRIPTION;

	return (
		<Alert variant="destructive">
			<AlertTitle>{TITLES.get(error) ?? FALLBACK_TITLE}</AlertTitle>
			<AlertDescription>{detail}</AlertDescription>
		</Alert>
	);
}
