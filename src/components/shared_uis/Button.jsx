import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Slot } from "@radix-ui/react-slot"

const buttonVariants = cva(
  "inline-flex py-6 whitespace-nowrap cursor-pointer items-center active:scale-[1.06] p-2 justify-center rounded-lg  font-medium transition disabled:opacity-60 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-primary bg-[#0050A4]  text-white hover:bg-primary/90",
        secondary: "bg-[#00AEEF] text-[#0050A4] hover:bg-[#00AEEF]/90",
        outline: "border  border-[#0050A4]/50 bg-white/90 hover:bg-white/80 text-[#0050A4] ",
        ghost: "hover:bg-accent",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        link: "underline underline-offset-4 hover:opacity-80",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4",
        lg: "h-12 px-6",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export {Button} 