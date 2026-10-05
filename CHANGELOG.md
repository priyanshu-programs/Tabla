# Changelog

## 1.15.3 (2026-08-21)


### Fixes

* **app:** prevent url param collision between fields sheet and table filter (#175) (1cebe1e)
* stop a finished enrichment reading as failed (#173) (2946580)

## 1.15.2 (2026-08-20)


### Documentation

* **api:** explain runtime openapi document and vendoring rules (#170) (630f2c9)

## 1.15.1 (2026-08-20)


### Fixes

* **api:** serve openapi.json and bundle swagger deps in function build (#166) (7ea4f37)

## 1.15.0 (2026-08-20)


### Features

* **agent:** scope field backfill tasks to records missing values (#163) (3be7bbd)

## 1.14.0 (2026-08-18)


### Features

* **agent:** read people from Context.dev instead of RapidAPI (CMP-86) (#158) (7b9288b)
* enrichment queue widget (CMP-92) (#159) (5e11482)
* page the enrichment queue (CMP-92) (#160) (8c1abb1)


### Fixes

* unblock the test suite and actually install the git hooks (CMP-83) (#152) (652135b)


### Refactors

* clear anti-slop type assertions and conditional object spreads (CMP-81) (#146) (bfd4dad)
* parse every remaining I/O boundary into a domain type (CMP-82) (#151) (3fb9922)


### Documentation

* propose an i18n layer (#143) (64440c6)

## 1.13.0 (2026-08-12)


### Features

* **app:** search company dropdowns instead of scrolling them (#125) (3b558a8)


### Fixes

* **agent:** let the assistant chat read the deal list it is told to use (CMP-77) (#139) (e86a0fb)
* **app:** show select field values in record tables (#133) (1d89b43)

## 1.12.0 (2026-08-11)


### Features

* edit a deployed agent, and show what Slack actually granted (CMP-77) (#109) (76b443a)

## 1.11.0 (2026-08-11)


### Features

* **app:** copy the tracking snippet for the selected install method (#128) (30e0137)

## 1.10.0 (2026-08-11)


### Features

* **tracking:** support installing the tracking tag via Google Tag Manager (#124) (2d8129c)

## 1.9.0 (2026-08-11)


### Features

* **agent:** stop suggesting a URL that already matches the field (#120) (ed43055)

## 1.8.2 (2026-08-11)


### Fixes

* **agent:** fill blank fields on the dispatch tick instead of sign-in (#117) (9660952)

## 1.8.1 (2026-08-11)


### Fixes

* **ci:** ship releases by opening a pull request into release (#114) (924060b)

## 1.8.0 (2026-08-11)


### Features

* **agent:** apply sourced facts to empty fields automatically (#112) (0342c8e)

## 1.7.0 (2026-08-11)


### Features

* **db:** add peek script for inspecting database contents (#110) (acae8ec)

## 1.6.1 (2026-08-11)


### Fixes

* **ci:** fall back to the pushed commit when release-please reports no sha (d1efd97)
* **ci:** make a release one pull request instead of two (206c746)

## 1.6.0 (2026-08-11)


### Features

* **tracking:** add website tracking with form capture and attribution (e050ff9)


### Fixes

* **ci:** make the release guard reject only genuinely untagged pull requests (#105) (815a832)
* **ci:** stop the auto-titler downgrading a release (8a1e390)

## 1.5.1 (2026-08-08)


### Fixes

* **api:** warn when the deployed schema does not match schema.prisma (#88) (f445c68)

## 1.5.0 (2026-08-08)


### Features

* **agent:** bound agent builder retries and improve chat scrolling (#89) (7780f81)


### Fixes

* **agent:** declare granted write actions in draft access summary (#93) (ad4f9f3)
* **app:** render agent transcript chronologically with anchored tool results (#92) (0e68e45)

## 1.4.0 (2026-08-07)


### Features

* **agent:** CMP-1 add sandboxed builder and runner runtimes (#60) (d033dbf)
* **app:** CMP-12 review agent drafts before deployment (#63) (51a4a11)
* **app:** CMP-46 add the private agent builder workspace (#62) (f64c88f)
* **app:** CMP-47 add inline composer context (57336ab)
* **db:** CMP-1 persist durable custom agents (#67) (4e79f83)


### Fixes

* **app:** CMP-47 consolidate agent builder presentation (#64) (1809d27)
* **app:** move chat beneath overview in icon rail (#83) (b63497d)
* **ci:** tag releases automatically and keep previews off the production schema (#82) (6078a84)


### Refactors

* **app:** CMP-59 harden CRM UI foundations (#61) (d8123e6)

## 1.3.0 (2026-08-07)


### Features

* **api:** add microsoft sign-in and outlook mailbox sync (#73) (2a0062f)
* **api:** enhance email domain handling with machine address detection (70d7e84)
* **api:** enhance onboarding and research key handling (f1d1332)
* **api:** implement Context.dev key verification and enhance capabil… (d42a04e)
* **api:** implement Context.dev key verification and enhance capabilities handling (5ca4eae)
* **api:** implement delete functionality for companies, contacts, an… (96bf31b)
* **api:** implement delete functionality for companies, contacts, and deals (4457f73)
* **app:** add dashboard and overview components for enhanced user experience (181bd28)
* **brand-mapping:** introduce fillable function and enhance brand update logic (aad5945)
* **landing:** enhance agent section and footer for improved layout and user engagement (ad4ceaa)
* **proxy:** implement marketing flag for landing page visibility (81a36d6)
* **seo-audit:** add SEO audit skill and related resources (f266040)
* **turbo:** update test dependencies and document workspace behavior (6d2e6e4)


### Fixes

* **app:** generate route types before type checking (03d4069)
* **proxy:** refine redirect logic for sign-in path (73875f0)
* **proxy:** update redirect logic for signed-out users (8871e49)


### Refactors

* **api:** enhance deletion logic and activity stamp handling (68f6014)
* **api:** improve email normalization and enhance record deletion handling (277afef)
* **api:** update record deletion tests and enhance agent task handling (82694a6)
* **landing:** remove unused Link imports from agent and capabili… (e2a5a7f)
* **landing:** remove unused Link imports from agent and capabilities sections (66213dd)
* **landing:** replace Link components with divs for improved layout consistency (79749f5)
* **proxy:** streamline onboarding and research gate handling (a189eab)
* **proxy:** streamline onboarding and research gate handling (14cb932)


### Documentation

* **env:** document landing page behavior based on landing visibility (bde4fd5)
* **env:** update .env.example and api.md to clarify landing visibility (34900ae)
* **README:** add stars badge for project visibility (4dd7e90)
* **README:** align images for better presentation in the README (a075794)
* **README:** remove duplicate stars badge and improve project visibility (96173a1)
* **README:** update stars badge positioning for improved visibility (b48268e)

## 1.2.0 (2026-08-07)


### Features

* **api:** add microsoft sign-in and outlook mailbox sync (#73) (2a0062f)

## 1.1.0 (2026-08-06)


### Features

* **api:** enhance email domain handling with machine address detection (70d7e84)
* **api:** enhance onboarding and research key handling (f1d1332)
* **api:** implement Context.dev key verification and enhance capabil… (d42a04e)
* **api:** implement Context.dev key verification and enhance capabilities handling (5ca4eae)
* **api:** implement delete functionality for companies, contacts, an… (96bf31b)
* **api:** implement delete functionality for companies, contacts, and deals (4457f73)
* **app:** add dashboard and overview components for enhanced user experience (181bd28)
* **landing:** enhance agent section and footer for improved layout and user engagement (ad4ceaa)
* **proxy:** implement marketing flag for landing page visibility (81a36d6)
* **seo-audit:** add SEO audit skill and related resources (f266040)
* **turbo:** update test dependencies and document workspace behavior (6d2e6e4)


### Fixes

* **app:** generate route types before type checking (03d4069)
* **proxy:** refine redirect logic for sign-in path (73875f0)
* **proxy:** update redirect logic for signed-out users (8871e49)


### Refactors

* **api:** enhance deletion logic and activity stamp handling (68f6014)
* **api:** improve email normalization and enhance record deletion handling (277afef)
* **api:** update record deletion tests and enhance agent task handling (82694a6)
* **landing:** remove unused Link imports from agent and capabili… (e2a5a7f)
* **landing:** remove unused Link imports from agent and capabilities sections (66213dd)
* **landing:** replace Link components with divs for improved layout consistency (79749f5)
* **proxy:** streamline onboarding and research gate handling (a189eab)
* **proxy:** streamline onboarding and research gate handling (14cb932)


### Documentation

* **env:** document landing page behavior based on landing visibility (bde4fd5)
* **env:** update .env.example and api.md to clarify landing visibility (34900ae)
* **README:** add stars badge for project visibility (4dd7e90)
* **README:** align images for better presentation in the README (a075794)
* **README:** remove duplicate stars badge and improve project visibility (96173a1)
* **README:** update stars badge positioning for improved visibility (b48268e)

## 1.0.0 (2026-08-03)


### Features

* **brand-mapping:** introduce fillable function and enhance brand update logic (aad5945)
