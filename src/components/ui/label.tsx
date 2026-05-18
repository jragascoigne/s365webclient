import { Label as LabelPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

function Label({ className, ...props }: any) {
	return (
		<LabelPrimitive.Root
			data-slot="label"
			className={cn("text-sm font-bold text-foreground", className)}
			{...props}
		/>
	);
}

export { Label };
