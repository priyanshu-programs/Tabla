"use client";

import { domAnimation, LazyMotion, m, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { LANDING_MOTION } from "@crm/ui/components/motion/config";
import { cn } from "@crm/ui/lib/utils";

export function Marker({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	const reduceMotion = useReducedMotion();

	return (
		<span className={cn("relative inline-block px-1", className)}>
			<LazyMotion features={domAnimation}>
				<m.span
					aria-hidden="true"
					className="absolute inset-0 origin-left bg-primary"
					initial={reduceMotion ? false : { scaleX: 0 }}
					animate={{ scaleX: 1 }}
					transition={{
						duration: LANDING_MOTION.hero.markerDurationSecs,
						delay: LANDING_MOTION.hero.markerDelaySecs,
						ease: [0.22, 1, 0.36, 1],
					}}
				/>
			</LazyMotion>
			<span className="relative">{children}</span>
		</span>
	);
}