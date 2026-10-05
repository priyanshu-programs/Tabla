"use client";

import type { CSSProperties, ReactNode } from "react";
import { LANDING_MOTION } from "@crm/ui/components/motion/config";
import { cn } from "@crm/ui/lib/utils";

export function Marquee({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	const trackClassName =
		"flex w-max shrink-0 animate-landing-marquee motion-reduce:animate-none";
	const trackStyle = {
		animationDuration: `${LANDING_MOTION.ticker.durationSecs}s`,
	} as CSSProperties;

	return (
		<div className={cn("flex overflow-hidden", className)}>
			<div className={trackClassName} style={trackStyle}>
				<div className="flex shrink-0 items-center">{children}</div>
				<div className="flex shrink-0 items-center" aria-hidden="true">
					{children}
				</div>
			</div>
		</div>
	);
}