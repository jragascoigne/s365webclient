"use client";

import { Select as SelectPrimitive } from "radix-ui";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function Select({ ...props }: any) {
	return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectGroup({ className, ...props }: any) {
	return <SelectPrimitive.Group className={cn("p-1", className)} {...props} />;
}

function SelectValue({ ...props }: any) {
	return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function SelectTrigger({ className, children, ...props }: any) {
	return (
		<SelectPrimitive.Trigger
			data-slot="select-trigger"
			className={cn(
				"flex min-h-10 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring",
				className,
			)}
			{...props}
		>
			{children}
			<SelectPrimitive.Icon asChild>
				<ChevronDownIcon className="size-4" />
			</SelectPrimitive.Icon>
		</SelectPrimitive.Trigger>
	);
}

function SelectContent({ className, children, ...props }: any) {
	return (
		<SelectPrimitive.Portal>
			<SelectPrimitive.Content
				data-slot="select-content"
				className={cn(
					"z-50 max-h-72 min-w-36 overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md",
					className,
				)}
				{...props}
			>
				<SelectScrollUpButton />
				<SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
				<SelectScrollDownButton />
			</SelectPrimitive.Content>
		</SelectPrimitive.Portal>
	);
}

function SelectLabel({ className, ...props }: any) {
	return <SelectPrimitive.Label className={cn("px-2 py-1 text-xs text-muted-foreground", className)} {...props} />;
}

function SelectItem({ className, children, ...props }: any) {
	return (
		<SelectPrimitive.Item
			data-slot="select-item"
			className={cn(
				"relative cursor-pointer rounded px-2 py-1.5 pr-8 text-sm outline-none focus:bg-secondary data-disabled:pointer-events-none data-disabled:opacity-50",
				className,
			)}
			{...props}
		>
			<span className="absolute right-2 top-1/2 -translate-y-1/2">
				<SelectPrimitive.ItemIndicator>
					<CheckIcon className="size-4" />
				</SelectPrimitive.ItemIndicator>
			</span>
			<SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
		</SelectPrimitive.Item>
	);
}

function SelectSeparator({ className, ...props }: any) {
	return <SelectPrimitive.Separator className={cn("my-1 h-px bg-border", className)} {...props} />;
}

function SelectScrollUpButton({ className, ...props }: any) {
	return (
		<SelectPrimitive.ScrollUpButton className={cn("grid place-items-center py-1", className)} {...props}>
			<ChevronUpIcon className="size-4" />
		</SelectPrimitive.ScrollUpButton>
	);
}

function SelectScrollDownButton({ className, ...props }: any) {
	return (
		<SelectPrimitive.ScrollDownButton className={cn("grid place-items-center py-1", className)} {...props}>
			<ChevronDownIcon className="size-4" />
		</SelectPrimitive.ScrollDownButton>
	);
}

export {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectScrollDownButton,
	SelectScrollUpButton,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
};
