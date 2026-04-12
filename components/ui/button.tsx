import { cn } from "@/lib/utils"

type ButtonVariant = "primary" | "ghost"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: [
    "bg-indigo-500 text-white",
    "hover:bg-indigo-400 hover:-translate-y-px",
    "active:bg-indigo-600 active:translate-y-px",
  ].join(" "),
  ghost: [
    "bg-bg-surface border border-border text-text-primary",
    "hover:border-border-hover hover:bg-bg-elevated",
  ].join(" "),
}

export function Button({ variant = "primary", className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg px-5 py-2.5",
        "text-sm font-medium transition-all duration-200",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant],
        className,
      )}
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
  children,
  ...props
}: LinkButtonProps) {
  return (
    <a
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg px-5 py-2.5",
        "text-sm font-medium transition-all duration-200",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </a>
  )
}
