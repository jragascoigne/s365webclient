import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

const variantClasses = {
	default: "bg-primary text-primary-foreground",
	secondary: "bg-secondary text-secondary-foreground",
	destructive: "bg-destructive text-destructive-foreground",
	outline: "border border-border bg-background text-foreground",
	ghost: "bg-transparent text-foreground",
	link: "bg-transparent p-0 text-primary underline-offset-4 hover:underline",
};

function Badge({
	className,
	variant = "default",
	asChild = false,
	...props
}: any) {
	const Comp = asChild ? Slot.Root : "span";

	return (
		<Comp
			data-slot="badge"
			data-variant={variant}
			className={cn(
				"inline-flex min-h-6 items-center rounded-full px-2 text-xs font-bold",
				variantClasses[variant] ?? variantClasses.default,
				className,
			)}
			{...props}
		/>
	);
}

export { Badge };
