import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:shadow-lg active:scale-95 hover:scale-105 hover:-translate-y-1",
  {
    variants: {
      variant: {
        default: "bg-[#00ced1] text-white hover:bg-[#00ced1] hover:text-slate-900 shadow-md hover:shadow-[#00ced1]/50 dark:hover:bg-[#00ced1] dark:hover:text-slate-900 dark:hover:shadow-[#00ced1]/50 hover:shadow-[#00ffff]/40 hover:text-[#00ffff] hover:border-[#00ffff]",
        destructive:
          "bg-[#00ced1] text-white hover:bg-[#00ced1] hover:text-slate-900 shadow-md focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 hover:shadow-[#00ced1]/50 dark:hover:shadow-[#00ced1]/50 hover:shadow-[#00ffff]/40 hover:text-[#00ffff]",
        outline:
          "bg-[#00ced1] text-white hover:bg-[#00ced1] hover:text-slate-900 border border-[#00ced1] shadow-md hover:shadow-[#00ced1]/50 dark:hover:shadow-[#00ced1]/50 hover:shadow-[#00ffff]/40 hover:text-[#00ffff] hover:border-[#00ffff]",
        secondary:
          "bg-[#00ced1] text-white hover:bg-[#00ced1] hover:text-slate-900 shadow-md hover:shadow-[#00ced1]/50 dark:hover:shadow-[#00ced1]/50 hover:shadow-[#00ffff]/40 hover:text-[#00ffff]",
        ghost:
          "bg-[#00ced1] text-white hover:bg-[#00ced1] hover:text-slate-900 hover:shadow-md hover:shadow-[#00ced1]/30 dark:hover:shadow-[#00ced1]/30 hover:shadow-[#00ffff]/30 hover:text-[#00ffff]",
        link: "text-[#00ced1] underline-offset-4 hover:text-[#00ced1] hover:underline dark:hover:text-[#00ced1] hover:text-[#00ffff]",
      },
      size: {
        default: "h-10 px-5 py-2 rounded-lg has-[>svg]:px-4",
        sm: "h-9 rounded-lg gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-11 rounded-lg px-6 has-[>svg]:px-4",
        icon: "size-10",
        "icon-sm": "size-9",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button }
