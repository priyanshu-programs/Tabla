# Design rules

`packages/ui` is the single source of truth for shared interface components.

Use shared shadcn components from that package.

Add new variants in the shared component.

Do not override a shared component at its call site.

## Typography

Inter is the interface and wordmark typeface.

Geist Mono is the code and technical-label typeface.

Georgia is the serif typeface.

The base tracking value is `-0.015em`.

Use the shared tracking scale for tighter or wider text.

## Color

The palette uses warm neutral surfaces and one lime primary.

The primary token is `oklch(0.9154 0.2402 128.2393)`.

Reserve lime for filled controls, focus rings, and selected states.

Use black text on lime fills.

Do not use primary-colored text on light backgrounds.

Use foreground text for links.

Use destructive, success, warning, and information tokens for their named meanings.

Use chart tokens for data series only.

## Shape

The base radius is `0.75rem`.

The shared scale derives smaller and larger radii from that value.

Use `rounded-sm` for compact controls.

Use `rounded-md` for inputs and buttons.

Use `rounded-lg` or `rounded-xl` for containing surfaces.

Use square edges only when adjacent elements join.

## Depth and motion

The interface uses zero shadows.

Use borders and surface contrast to show depth.

Keep existing shared motion tokens.

Respect reduced-motion preferences.

## Themes

Light and dark tokens live in `packages/ui/src/styles/globals.css`.

`next-themes` follows the system preference by default.

Authenticated users retain the existing theme control.
