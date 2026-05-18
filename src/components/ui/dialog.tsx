import { Dialog as DialogPrimitive } from "radix-ui";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function Dialog({ ...props }: any) {
	return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({ ...props }: any) {
	return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({ ...props }: any) {
	return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({ ...props }: any) {
	return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({ className, ...props }: any) {
	return (
		<DialogPrimitive.Overlay
			data-slot="dialog-overlay"
			className={cn("fixed inset-0 z-50 bg-foreground/20", className)}
			{...props}
		/>
	);
}

function DialogContent({ className, children, showCloseButton = true, ...props }: any) {
	return (
		<DialogPortal>
			<DialogOverlay />
			<DialogPrimitive.Content
				data-slot="dialog-content"
				className={cn(
					"fixed left-1/2 top-1/2 z-50 grid w-[min(420px,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-lg",
					className,
				)}
				{...props}
			>
				{children}
				{showCloseButton && (
					<DialogPrimitive.Close asChild>
						<Button variant="ghost" size="icon-sm" className="absolute right-2 top-2">
							<XIcon />
							<span className="sr-only">Close</span>
						</Button>
					</DialogPrimitive.Close>
				)}
			</DialogPrimitive.Content>
		</DialogPortal>
	);
}

function DialogHeader({ className, ...props }: any) {
	return <div data-slot="dialog-header" className={cn("grid gap-2", className)} {...props} />;
}

function DialogFooter({ className, showCloseButton = false, children, ...props }: any) {
	return (
		<div
			data-slot="dialog-footer"
			className={cn("flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end", className)}
			{...props}
		>
			{children}
			{showCloseButton && (
				<DialogPrimitive.Close asChild>
					<Button variant="outline">Close</Button>
				</DialogPrimitive.Close>
			)}
		</div>
	);
}

function DialogTitle({ className, ...props }: any) {
	return <DialogPrimitive.Title className={cn("text-base font-bold", className)} {...props} />;
}

function DialogDescription({ className, ...props }: any) {
	return (
		<DialogPrimitive.Description
			className={cn("text-sm text-muted-foreground", className)}
			{...props}
		/>
	);
}

export {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogOverlay,
	DialogPortal,
	DialogTitle,
	DialogTrigger,
};
