import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

const variantClasses = {
	default: "border-primary bg-primary text-primary-foreground",
	outline: "border-border bg-secondary text-secondary-foreground",
	secondary: "border-border bg-secondary text-secondary-foreground",
	destructive: "border-destructive bg-destructive text-destructive-foreground",
	ghost: "border-transparent bg-transparent text-foreground",
	link: "h-auto min-h-0 border-transparent bg-transparent p-0 text-primary underline-offset-4 hover:underline",
};

const sizeClasses = {
	default: "min-h-10 px-3",
	xs: "min-h-6 px-2 text-xs",
	sm: "min-h-8 px-3 text-sm",
	lg: "min-h-11 px-4",
	icon: "size-10 p-0",
	"icon-xs": "size-6 p-0",
	"icon-sm": "size-8 p-0",
	"icon-lg": "size-11 p-0",
};

function Button({
	className,
	variant = "default",
	size = "default",
	asChild = false,
	...props
}: any) {
	const Comp = asChild ? Slot.Root : "button";

	return (
		<Comp
			data-slot="button"
			data-variant={variant}
			data-size={size}
			className={cn(
				"inline-flex items-center justify-center gap-2 rounded-md border font-medium transition-colors disabled:pointer-events-none disabled:opacity-60 [&_svg]:size-4",
				variantClasses[variant] ?? variantClasses.default,
				sizeClasses[size] ?? sizeClasses.default,
				className,
			)}
			{...props}
		/>
	);
}

export { Button };
