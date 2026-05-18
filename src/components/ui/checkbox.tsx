import { Checkbox as CheckboxPrimitive } from "radix-ui";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function Checkbox({ className, ...props }: any) {
	return (
		<CheckboxPrimitive.Root
			data-slot="checkbox"
			className={cn(
				"grid size-4 place-items-center rounded border border-input bg-background text-primary-foreground data-checked:border-primary data-checked:bg-primary",
				className,
			)}
			{...props}
		>
			<CheckboxPrimitive.Indicator>
				<CheckIcon className="size-3" />
			</CheckboxPrimitive.Indicator>
		</CheckboxPrimitive.Root>
	);
}

export { Checkbox };
