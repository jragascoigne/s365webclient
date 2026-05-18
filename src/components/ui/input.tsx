import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: any) {
	return (
		<input
			type={type}
			data-slot="input"
			className={cn(
				"min-h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring disabled:cursor-not-allowed disabled:opacity-60",
				className,
			)}
			{...props}
		/>
	);
}

export { Input };
