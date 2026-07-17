import Link from "next/link"
import { GithubLogoIcon, ArrowSquareOutIcon } from "@phosphor-icons/react/dist/ssr"

export type ProjectCardData = {
  slug: string
  title: string
  description: string
  tags: string[]
  github?: string
  live?: string
  date: string
  featured?: boolean
}

// ─── Shared pieces ───────────────────────────────────────────────────────────

function CardBadge({
  children,
  variant = "default",
}: {
  children: React.ReactNode
  variant?: "default" | "brand-soft"
}) {
  const styles = {
    default: { bg: "rgba(255,255,255,0.06)", fg: "var(--fg-secondary)" },
    "brand-soft": { bg: "var(--bg-surface-brand)", fg: "var(--fg-brand-hover)" },
  }[variant]
  return (
    <span
      className="inline-flex h-[22px] items-center rounded-[var(--radius-sm)] px-2 font-mono text-[11px] font-medium"
      style={{ background: styles.bg, color: styles.fg }}
    >
      {children}
    </span>
  )
}

/** External link that sits above a card's stretch overlay. */
function ExternalLink({
  href,
  icon,
  label,
}: {
  href: string
  icon: "github" | "live"
  label: string
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="relative z-[2] inline-flex items-center gap-1.5 transition-all duration-150 hover:tracking-[0.06em] hover:[color:var(--fg-brand)]"
      style={{ color: "var(--fg-primary)", fontFamily: "var(--font-mono)", fontSize: 12 }}
    >
      {icon === "github" ? <GithubLogoIcon size={13} /> : <ArrowSquareOutIcon size={12} />}
      {label}
    </Link>
  )
}

/** Serif title that splits a hyphenated name onto two lines with a brand accent. */
function SplitTitle({ title, size }: { title: string; size: number }) {
  const hyphen = title.indexOf("-")
  return (
    <h3
      className="transition-colors group-hover:[color:var(--fg-brand)]"
      style={{
        fontFamily: "var(--font-serif)",
        fontWeight: 400,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: "-0.02em",
        color: "var(--fg-primary)",
        margin: 0,
      }}
    >
      {hyphen > -1 ? (
        <>
          <em style={{ fontStyle: "italic", color: "var(--fg-brand)" }}>
            {title.slice(0, hyphen + 1)}
          </em>
          <br />
          {title.slice(hyphen + 1)}
        </>
      ) : (
        <em style={{ fontStyle: "italic", color: "var(--fg-brand)" }}>{title}</em>
      )}
    </h3>
  )
}

// ─── Featured card — mirrors the home "entrepta" featured card ────────────────

export function FeaturedProjectCard({ project }: { project: ProjectCardData }) {
  const year = new Date(project.date).getFullYear()

  return (
    <div
      className="featured-card group relative flex flex-col gap-4 overflow-hidden p-6 sm:p-8"
      style={{
        background: "var(--bg-surface-brand)",
        border: "1px solid var(--border-brand)",
        borderRadius: "var(--radius-xl)",
        minHeight: 300,
      }}
    >
      {/* Stretch link — covers the card; inner links sit above via z-index */}
      <Link
        href={`/projects/${project.slug}`}
        className="absolute inset-0 z-[1]"
        aria-label={`View ${project.title}`}
      />

      {/* Dot pattern decoration */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          right: "-10%",
          bottom: "-30%",
          width: "55%",
          aspectRatio: "1",
          opacity: 0.3,
          pointerEvents: "none",
          backgroundImage: "radial-gradient(var(--fg-brand) 1px, transparent 1.4px)",
          backgroundSize: "22px 22px",
          maskImage: "radial-gradient(circle, #000 0%, transparent 60%)",
          WebkitMaskImage: "radial-gradient(circle, #000 0%, transparent 60%)",
        }}
      />

      <div className="flex items-center justify-between">
        <span
          className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.08em] uppercase"
          style={{ color: "var(--fg-secondary)" }}
        >
          <span aria-hidden style={{ color: "var(--fg-brand)", fontSize: 10 }}>
            ◆
          </span>
          featured
        </span>
        <CardBadge variant="brand-soft">{year}</CardBadge>
      </div>

      <SplitTitle title={project.title} size={44} />

      <p
        className="max-w-[46ch] text-sm leading-relaxed"
        style={{ fontFamily: "var(--font-sans)", color: "var(--fg-secondary)" }}
      >
        {project.description}
      </p>

      <div className="flex flex-wrap gap-1.5">
        {project.tags.slice(0, 5).map((tag) => (
          <CardBadge key={tag} variant="brand-soft">
            {tag}
          </CardBadge>
        ))}
      </div>

      <div
        className="mt-auto flex items-center justify-between gap-4 pt-2 font-mono text-[12px]"
        style={{ color: "var(--fg-muted)" }}
      >
        <div className="flex gap-5">
          {project.github && <ExternalLink href={project.github} icon="github" label="github ↗" />}
          {project.live && <ExternalLink href={project.live} icon="live" label="live ↗" />}
        </div>
        <span
          className="inline-flex items-center gap-1.5 transition-[gap]"
          style={{ color: "var(--fg-brand)" }}
        >
          open .tsx
          <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </span>
      </div>
    </div>
  )
}

// ─── Simple card — mirrors the home bento card ────────────────────────────────

export function ProjectCard({ project }: { project: ProjectCardData }) {
  const year = new Date(project.date).getFullYear()
  const visibleTags = project.tags.slice(0, 3)
  const remaining = project.tags.length - visibleTags.length

  return (
    <div className="bento-card group relative">
      <Link
        href={`/projects/${project.slug}`}
        className="absolute inset-0 z-[1]"
        aria-label={`View ${project.title}`}
      />

      {/* Dot pattern + glow — echoes the featured card, subtler */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          right: "-8%",
          bottom: "-45%",
          width: "48%",
          aspectRatio: "1",
          opacity: 0.45,
          pointerEvents: "none",
          backgroundImage: "radial-gradient(var(--fg-brand) 1px, transparent 1.4px)",
          backgroundSize: "20px 20px",
          maskImage: "radial-gradient(circle, #000 0%, transparent 62%)",
          WebkitMaskImage: "radial-gradient(circle, #000 0%, transparent 62%)",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          right: "-12%",
          top: "-30%",
          width: 240,
          height: 240,
          borderRadius: "50%",
          background: "radial-gradient(circle, var(--bg-surface-brand), transparent 70%)",
          opacity: 0.7,
          pointerEvents: "none",
        }}
      />

      <div
        className="relative flex items-center justify-between font-mono text-[11px] tracking-[0.08em] uppercase"
        style={{ color: "var(--fg-secondary)" }}
      >
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden style={{ color: "var(--fg-brand)", fontSize: 10 }}>
            ◆
          </span>
          project
        </span>
        <span style={{ color: "var(--fg-muted)" }}>{year}</span>
      </div>

      <h3
        className="relative transition-colors group-hover:[color:var(--fg-brand)]"
        style={{
          fontFamily: "var(--font-serif)",
          fontWeight: 400,
          fontSize: 26,
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          color: "var(--fg-primary)",
          margin: 0,
        }}
      >
        {project.title}
      </h3>

      <p
        className="relative line-clamp-2 text-sm leading-relaxed"
        style={{ fontFamily: "var(--font-sans)", color: "var(--fg-secondary)", margin: 0 }}
      >
        {project.description}
      </p>

      <div className="relative flex flex-wrap gap-1.5">
        {visibleTags.map((tag) => (
          <CardBadge key={tag}>{tag}</CardBadge>
        ))}
        {remaining > 0 && <CardBadge>+{remaining}</CardBadge>}
      </div>

      <div
        className="relative mt-auto flex items-center justify-between gap-4 font-mono text-[12px]"
        style={{ color: "var(--fg-muted)" }}
      >
        <div className="flex gap-4">
          {project.github && <ExternalLink href={project.github} icon="github" label="github" />}
          {project.live && <ExternalLink href={project.live} icon="live" label="live" />}
        </div>
        <span
          className="inline-flex items-center gap-1.5 transition-[gap]"
          style={{ color: "var(--fg-brand)" }}
        >
          open .tsx
          <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </span>
      </div>
    </div>
  )
}
