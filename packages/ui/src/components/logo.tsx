import type * as React from "react";

const Logo = (props: React.SVGProps<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={32}
		height={32}
		viewBox="0 0 32 32"
		fill="none"
		aria-label="Tabla logo"
		{...props}
	>
		<rect width="32" height="32" rx="8" fill="var(--primary)" />
		<path
			d="M8 8.5h16v4h-5.75V24h-4.5V12.5H8z"
			fill="var(--primary-foreground)"
		/>
	</svg>
);

export default Logo;
