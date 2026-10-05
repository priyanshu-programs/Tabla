"use client";

import { animate, m, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";
import { LANDING_MOTION } from "@crm/ui/components/motion/config";

export function Counter({
	value,
	suffix = "",
}: {
	value: number;
	suffix?: string;
}) {
	const reduceMotion = useReducedMotion();
	const started = useRef(false);
	const [display, setDisplay] = useState(reduceMotion ? value : 0);

	const start = () => {
		if (reduceMotion || started.current) {
			return;
		}
		started.current = true;
		animate(0, value, {
			duration: LANDING_MOTION.counter.durationSecs,
			ease: "easeOut",
			onUpdate: (latest) => setDisplay(latest),
		});
	};

	return (
		<m.span onViewportEnter={start} viewport={{ once: true }}>
			{`${Math.round(display)}${suffix}`}
		</m.span>
	);
}