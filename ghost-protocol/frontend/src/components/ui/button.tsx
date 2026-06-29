import { forwardRef, type ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "ghost" | "link"
  size?: "sm" | "default" | "lg"
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-mono text-xs tracking-widest uppercase transition-all duration-200 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
          {
            "border border-[var(--g-border-strong)] bg-[var(--g-surface)] text-[var(--g-green-primary)] hover:bg-[var(--g-green-deep)] hover:shadow-[var(--g-glow-sm)]":
              variant === "default",
            "border border-[var(--g-border-dim)] bg-transparent text-[var(--g-text-dim)] hover:text-[var(--g-green-primary)] hover:border-[var(--g-border)]":
              variant === "secondary",
            "text-[var(--g-text-dim)] hover:text-[var(--g-green-primary)]":
              variant === "ghost",
            "text-[var(--g-green-primary)] underline-offset-4 hover:underline":
              variant === "link",
          },
          {
            "h-9 px-4 text-[11px]": size === "sm",
            "h-11 px-6 text-xs": size === "default",
            "h-12 px-8 text-sm": size === "lg",
          },
          className,
        )}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button }
