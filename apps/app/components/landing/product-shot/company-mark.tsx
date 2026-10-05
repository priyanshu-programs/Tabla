import { cn } from "@crm/ui/lib/utils";
import Image from "next/image";
import type { MockCompany } from "./companies";

/**
 * The square a company is drawn in inside the mock.
 */
export function CompanyMark({
	company,
	size,
	glyph,
}: {
	company: Pick<MockCompany, "name" | "logo">;
	size: number;
	glyph: number;
}) {
	if (!company.logo) {
		return (
			<span
				className="flex shrink-0 items-center justify-center rounded-md bg-muted font-semibold text-foreground"
				style={{ width: size, height: size }}
			>
				<span style={{ fontSize: glyph }}>{company.name.slice(0, 1)}</span>
			</span>
		);
	}

	return (
		<span
			className="flex shrink-0 items-center justify-center overflow-clip"
			style={{ width: size, height: size }}
		>
			<Image
				src={company.logo.src}
				alt=""
				width={size}
				height={size}
				className={cn(
					"size-full object-contain",
					company.logo.invert && "invert",
				)}
			/>
		</span>
	);
}
