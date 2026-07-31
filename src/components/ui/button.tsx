import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap transition-all duration-200 outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        /* Primary — uses CSS theme gradient, works across all 4 themes */
        default: "text-[var(--theme-active-text)] shadow-md",
        outline:
          "border-border bg-white/70 dark:bg-white/5 backdrop-blur-sm text-foreground hover:bg-white/90 dark:hover:bg-white/10 dark:border-white/15",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost:
          "hover:bg-[var(--theme-glow-soft)] text-foreground",
        destructive:
          "bg-destructive/10 text-destructive shadow-sm hover:bg-destructive/20 hover:shadow-[0_0_16px_rgba(239,68,68,0.25)]",
        link: "text-primary underline-offset-4 hover:underline",
        success:
          "bg-emerald-500 text-white shadow-sm hover:bg-emerald-600 hover:shadow-[0_0_16px_rgba(34,197,94,0.3)]",
      },
      size: {
        default:
          "h-11 gap-1.5 px-5 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        xs: "h-7 gap-1 px-3 text-xs",
        sm: "h-9 gap-1 px-4 text-[0.8rem]",
        lg: "h-12 gap-1.5 px-6 text-base",
        icon: "size-11",
        "icon-xs": "size-7",
        "icon-sm": "size-9",
        "icon-lg": "size-12",
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
  loading = false,
  fullWidth = false,
  children,
  disabled,
  style,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button"

  /* Primary variant uses CSS gradient vars so theme switching works */
  const gradientStyle =
    variant === "default" || variant === undefined
      ? {
          background: `linear-gradient(135deg, var(--theme-gradient-from), var(--theme-gradient-to))`,
          boxShadow: `0 4px 14px var(--theme-glow)`,
          ...style,
        }
      : style

      const isMobile = useIsMobile();

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      disabled={disabled || loading}
      className={cn(buttonVariants({ variant, size, className }), fullWidth && 'w-full', isMobile && "h-9 gap-1 px-4 text-[0.8rem] sm:h-11 sm:gap-1.5 sm:px-5 sm:text-sm")}
      style={gradientStyle}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          {children}
        </span>
      ) : children}
    </Comp>
  )
}

export { Button, buttonVariants }
