import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: any) {
	return (
		<textarea
			data-slot="textarea"
			className={cn(
				"min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring disabled:cursor-not-allowed disabled:opacity-60",
				className,
			)}
			{...props}
		/>
	);
}

export { Textarea };
