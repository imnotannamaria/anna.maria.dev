import { type VariantProps, cva } from "class-variance-authority"
import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * The pieces a long-form page is written in: the `#` and `##` labels, the
 * section wrapper, a serif heading, prose, and the two inline emphases.
 *
 * No entrance built in, so installing these never pulls in `motion`. Wrap a
 * label or heading in `Reveal` for one.
 */

/** Inline emphasis: serif italic in the brand text ink. */
const Em = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <em
      ref={ref}
      className={cn("font-serif text-[var(--fg-brand-text)] italic", className)}
      {...props}
    />
  ),
)
Em.displayName = "Em"

/** Inline strong: primary ink at medium weight, not bold. */
const Strong = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <strong
      ref={ref}
      className={cn("font-medium text-[var(--fg-primary)]", className)}
      {...props}
    />
  ),
)
Strong.displayName = "Strong"

interface DocLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: "#" | "##"
}

/** The markdown-style label above a section heading: `# about`, `## career`. */
const DocLabel = React.forwardRef<HTMLDivElement, DocLabelProps>(
  ({ className, level = "#", children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "text-mono-sm mb-3 font-mono tracking-[0.08em] text-[var(--fg-muted)] uppercase",
        className,
      )}
      {...props}
    >
      <span aria-hidden className="text-[var(--fg-brand)]">
        {level}
      </span>{" "}
      {children}
    </div>
  ),
)
DocLabel.displayName = "DocLabel"

/** The serif section heading. */
const DisplayH2 = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn(
        "text-display-md m-0 font-serif font-normal tracking-[-0.02em] text-[var(--fg-primary)]",
        "[&_em]:text-[var(--fg-brand)] [&_em]:italic",
        className,
      )}
      {...props}
    />
  ),
)
DisplayH2.displayName = "DisplayH2"

/** A paragraph of prose, in Inter, capped at a readable measure. */
const Prose = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        "text-body-lg mt-0 mb-6 max-w-[60ch] font-sans leading-[1.65] text-[var(--fg-secondary)]",
        className,
      )}
      {...props}
    />
  ),
)
Prose.displayName = "Prose"

const sectionVariants = cva("scroll-mt-6 pb-16", {
  variants: {
    variant: {
      default: "border-t border-[var(--border-subtle)] pt-16",
      // the first section on a page has no rule or padding above it
      first: "pt-0",
    },
  },
  defaultVariants: { variant: "default" },
})

interface SectionProps
  extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof sectionVariants> {}

/** A page section: 64px of air, a rule between sections, and room above anchors. */
const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, variant, ...props }, ref) => (
    <section ref={ref} className={cn(sectionVariants({ variant }), className)} {...props} />
  ),
)
Section.displayName = "Section"

export { DisplayH2, DocLabel, Em, Prose, Section, Strong }
export type { DocLabelProps, SectionProps }
