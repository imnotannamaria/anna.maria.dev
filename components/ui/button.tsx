import { cn } from "@/lib/utils"

type ButtonVariant = "primary" | "ghost"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: ["hover:-translate-y-px"].join(" "),
  ghost: ["hover:-translate-y-px"].join(" "),
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: "var(--fg-brand)",
    color: "var(--bg-canvas)",
  },
  ghost: {
    background: "var(--bg-surface)",
    color: "var(--fg-primary)",
    border: "1px solid var(--border-subtle)",
  },
}

export function Button({ variant = "primary", className, style, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 font-mono text-sm font-medium transition-all duration-200",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant],
        className,
      )}
      style={{
        height: 44,
        paddingInline: 24,
        borderRadius: "var(--radius-md)",
        ...variantStyles[variant],
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  )
}

interface LinkButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: ButtonVariant
}

export function LinkButton({
  variant = "primary",
  className,
  style,
  children,
  ...props
}: LinkButtonProps) {
  return (
    <a
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 font-mono text-sm font-medium transition-all duration-200",
        "hover:-translate-y-px",
        className,
      )}
      style={{
        height: 44,
        paddingInline: 24,
        borderRadius: "var(--radius-md)",
        textDecoration: "none",
        ...variantStyles[variant],
        ...style,
      }}
      {...props}
    >
      {children}
    </a>
  )
}
