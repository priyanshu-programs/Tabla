"use client";

import { domAnimation, LazyMotion, m, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { LANDING_MOTION } from "@crm/ui/components/motion/config";

export function Reveal({
	children,
	className,
	delaySecs = 0,
}: {
	children: ReactNode;
	className?: string;
	delaySecs?: number;
}) {
	const reduceMotion = useReducedMotion();

	if (reduceMotion) {
		return <div className={className}>{children}</div>;
	}

	return (
		<LazyMotion features={domAnimation}>
			<m.div
				className={className}
				initial={{ opacity: 0, y: LANDING_MOTION.reveal.distancePx }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, margin: "-80px" }}
				transition={{
					duration: LANDING_MOTION.reveal.durationSecs,
					delay: delaySecs,
					ease: [0.22, 1, 0.36, 1],
				}}
			>
				{children}
			</m.div>
		</LazyMotion>
	);
}