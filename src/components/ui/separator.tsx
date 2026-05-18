"use client";

import { Separator as SeparatorPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

function Separator({
	className,
	orientation = "horizontal",
	decorative = true,
	...props
}: any) {
	return (
		<SeparatorPrimitive.Root
			data-slot="separator"
			decorative={decorative}
			orientation={orientation}
			className={cn(
				"bg-border",
				orientation === "vertical" ? "h-full w-px" : "h-px w-full",
				className,
			)}
			{...props}
		/>
	);
}

export { Separator };
