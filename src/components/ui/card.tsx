import { cn } from "@/lib/utils";

function Card({ className, ...props }: any) {
	return (
		<div
			data-slot="card"
			className={cn("rounded-lg border border-border bg-card text-card-foreground", className)}
			{...props}
		/>
	);
}

function CardHeader({ className, ...props }: any) {
	return <div data-slot="card-header" className={cn("p-4 pb-2", className)} {...props} />;
}

function CardTitle({ className, ...props }: any) {
	return <div data-slot="card-title" className={cn("text-base font-bold", className)} {...props} />;
}

function CardDescription({ className, ...props }: any) {
	return (
		<div
			data-slot="card-description"
			className={cn("text-sm text-muted-foreground", className)}
			{...props}
		/>
	);
}

function CardAction({ className, ...props }: any) {
	return <div data-slot="card-action" className={cn("ml-auto", className)} {...props} />;
}

function CardContent({ className, ...props }: any) {
	return <div data-slot="card-content" className={cn("p-4", className)} {...props} />;
}

function CardFooter({ className, ...props }: any) {
	return <div data-slot="card-footer" className={cn("border-t border-border p-4", className)} {...props} />;
}

export {
	Card,
	CardHeader,
	CardFooter,
	CardTitle,
	CardAction,
	CardDescription,
	CardContent,
};
