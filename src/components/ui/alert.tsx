import { cn } from "@/lib/utils";

const variantClasses = {
	default: "border-border bg-secondary text-secondary-foreground",
	destructive: "border-border bg-secondary text-secondary-foreground",
};

function Alert({ className, variant = "default", ...props }: any) {
	return (
		<div
			data-slot="alert"
			role="alert"
			className={cn(
				"grid gap-1 rounded-md border p-3 text-sm",
				variantClasses[variant] ?? variantClasses.default,
				className,
			)}
			{...props}
		/>
	);
}

function AlertTitle({ className, ...props }: any) {
	return <div data-slot="alert-title" className={cn("font-bold", className)} {...props} />;
}

function AlertDescription({ className, ...props }: any) {
	return <div data-slot="alert-description" className={cn("text-sm", className)} {...props} />;
}

function AlertAction({ className, ...props }: any) {
	return <div data-slot="alert-action" className={cn("justify-self-end", className)} {...props} />;
}

export { Alert, AlertTitle, AlertDescription, AlertAction };
