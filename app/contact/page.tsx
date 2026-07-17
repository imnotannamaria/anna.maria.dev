import Link from "next/link"
import { EnvelopeSimpleIcon } from "@phosphor-icons/react/dist/ssr"
import { cn } from "@/lib/utils"
import { createMetadata } from "@/lib/metadata"
import { ContactForm } from "@/components/contact/contact-form"
import { GitHubIcon, LinkedInIcon, XIcon } from "@/components/ui/icons"
import { ContactOutline, type OutlineItem } from "./contact-outline"

export const metadata = createMetadata({
  title: "Contact",
  description: "Get in touch — open to OSS collaborations and tech conversations.",
  path: "/contact",
})

const EMAIL = "anna.maria.dev.br@gmail.com"

const outline: OutlineItem[] = [
  { id: "contact", label: "contact", level: 1 },
  { id: "channels", label: "channels", level: 2 },
  { id: "message", label: "send a message", level: 2 },
]

type Channel = {
  Icon: React.ComponentType<{ size?: number }>
  label: string
  value: string
  href: string
  action: string
  primary?: boolean
}

const channels: Channel[] = [
  {
    Icon: EnvelopeSimpleIcon,
    label: "primary · email",
    value: EMAIL,
    href: `mailto:${EMAIL}`,
    action: "send",
    primary: true,
  },
  {
    Icon: GitHubIcon,
    label: "github · oss",
    value: "imnotannamaria",
    href: "https://github.com/imnotannamaria",
    action: "open",
  },
  {
    Icon: LinkedInIcon,
    label: "linkedin · work",
    value: "in/imnotannamaria",
    href: "https://linkedin.com/in/imnotannamaria",
    action: "open",
  },
  {
    Icon: XIcon,
    label: "x · short pings",
    value: "@annamariadevbr",
    href: "https://x.com/annamariadevbr",
    action: "open",
  },
]

// ─── Inline text helpers ─────────────────────────────────────────────────────

function Strong({ children }: { children: React.ReactNode }) {
  return <strong style={{ color: "var(--fg-primary)", fontWeight: 500 }}>{children}</strong>
}

function Em({ children }: { children: React.ReactNode }) {
  return (
    <em style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", color: "var(--fg-brand)" }}>
      {children}
    </em>
  )
}

function DocLabel({ level, children }: { level: "#" | "##"; children: React.ReactNode }) {
  return (
    <div
      className="mb-3 font-mono text-xs tracking-[0.08em] uppercase"
      style={{ color: "var(--fg-muted)" }}
    >
      <span aria-hidden style={{ color: "var(--fg-brand)" }}>
        {level}
      </span>{" "}
      {children}
    </div>
  )
}

function DisplayH2({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: "var(--font-serif)",
        fontWeight: 400,
        fontSize: 40,
        lineHeight: 1.1,
        letterSpacing: "-0.02em",
        color: "var(--fg-primary)",
        margin: "0 0 16px",
      }}
    >
      {children}
    </h2>
  )
}

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="mb-8 text-[15px] leading-[1.7]"
      style={{ fontFamily: "var(--font-sans)", color: "var(--fg-secondary)", maxWidth: "60ch" }}
    >
      {children}
    </p>
  )
}

function Section({
  id,
  first,
  children,
}: {
  id: string
  first?: boolean
  children: React.ReactNode
}) {
  return (
    <section
      id={id}
      style={{
        scrollMarginTop: 24,
        paddingTop: first ? 0 : 64,
        paddingBottom: 64,
        borderTop: first ? "none" : "1px solid var(--border-subtle)",
      }}
    >
      {children}
    </section>
  )
}

function ChannelCard({ Icon, label, value, href, action, primary }: Channel) {
  const external = !href.startsWith("mailto:")
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn(
        "group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-[var(--radius-lg)] border px-5 py-4 transition-colors duration-150",
        primary
          ? "border-[var(--border-brand)] bg-[var(--bg-surface-brand)] hover:border-[var(--border-brand-strong)]"
          : "border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-surface-elevated)]",
      )}
    >
      <span
        className="grid place-items-center rounded-[var(--radius-md)] border border-[var(--border-subtle)] transition-colors duration-150 group-hover:border-[var(--fg-brand)]"
        style={{
          width: 40,
          height: 40,
          background: "var(--bg-canvas)",
          color: "var(--fg-brand)",
        }}
      >
        <Icon size={18} />
      </span>

      <span className="flex min-w-0 flex-col gap-0.5">
        <span
          className="font-mono text-[10px] tracking-[0.08em] uppercase"
          style={{ color: "var(--fg-muted)" }}
        >
          {label}
        </span>
        <span className="truncate font-mono text-sm" style={{ color: "var(--fg-primary)" }}>
          {value}
        </span>
        {external && <span className="sr-only">(opens in a new tab)</span>}
      </span>

      <span
        className="inline-flex items-center gap-1 font-mono text-[11px]"
        style={{ color: "var(--fg-brand)" }}
      >
        {action}
        <span
          aria-hidden
          className="transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        >
          ↗
        </span>
      </span>
    </a>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ContactPage() {
  return (
    <div className="mx-auto grid w-full max-w-[1160px] grid-cols-1 min-[1100px]:grid-cols-[200px_minmax(0,1fr)]">
      <ContactOutline items={outline} />

      <div className="min-w-0">
        <div className="mx-auto max-w-[880px] px-5 py-12 sm:px-8 lg:px-12">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="mb-8 font-mono text-xs"
            style={{ color: "var(--fg-muted)" }}
          >
            <Link href="/" className="transition-colors hover:text-[color:var(--fg-primary)]">
              ~
            </Link>
            <span aria-hidden style={{ opacity: 0.5, margin: "0 6px" }}>
              /
            </span>
            <span style={{ color: "var(--fg-primary)" }}>contact.tsx</span>
          </nav>

          {/* ══════════ HERO ══════════ */}
          <Section id="contact" first>
            <DocLabel level="#">contact</DocLabel>

            <div
              className="mb-6 inline-flex flex-wrap items-center gap-3 rounded-full border px-4 py-2 font-mono text-xs"
              style={{
                borderColor: "var(--border-subtle)",
                background: "var(--bg-surface)",
                color: "var(--fg-secondary)",
              }}
            >
              <span
                aria-hidden
                className="inline-block size-2 animate-pulse rounded-full"
                style={{ background: "var(--status-success)" }}
              />
              <span>
                inbox <Strong>open</Strong>
              </span>
              <span aria-hidden style={{ color: "var(--fg-muted)", opacity: 0.6 }}>
                ·
              </span>
              <span>
                replies within <Strong>a day</Strong>
              </span>
              <span aria-hidden style={{ color: "var(--fg-muted)", opacity: 0.6 }}>
                ·
              </span>
              <span>recife · brt</span>
            </div>

            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontWeight: 400,
                fontSize: "clamp(56px, 8vw, 96px)",
                lineHeight: 0.95,
                letterSpacing: "-0.02em",
                color: "var(--fg-primary)",
                margin: "0 0 16px",
              }}
            >
              Let&apos;s <Em>talk.</Em>
            </h1>

            <p
              className="text-[18px] leading-[1.65]"
              style={{
                fontFamily: "var(--font-sans)",
                color: "var(--fg-secondary)",
                maxWidth: "56ch",
              }}
            >
              Pick a channel below or just send me a message, whichever is easier for you. I read
              everything that lands in my inbox and I try to reply within a day. If it&apos;s about{" "}
              <Em>work</Em>, tell me a bit about what you&apos;re building and I&apos;ll take it
              from there.
            </p>
          </Section>

          {/* ══════════ CHANNELS ══════════ */}
          <Section id="channels">
            <DocLabel level="##">channels</DocLabel>
            <DisplayH2>
              <Em>Four</Em> ways to reach me.
            </DisplayH2>
            <Prose>
              Email is best for anything that needs a real answer. GitHub is where I live for open
              source, and LinkedIn or X are perfect for a quick hello. I keep an eye on all of them.
            </Prose>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {channels.map((channel) => (
                <ChannelCard key={channel.label} {...channel} />
              ))}
            </div>
          </Section>

          {/* ══════════ MESSAGE ══════════ */}
          <Section id="message">
            <DocLabel level="##">send a message</DocLabel>
            <DisplayH2>
              Or just type it <Em>here.</Em>
            </DisplayH2>
            <Prose>
              This drops straight into my inbox. If it&apos;s about work, a couple of lines on what
              you&apos;re building and where I&apos;d fit in is all I need to get back to you.
            </Prose>

            <ContactForm email={EMAIL} />
          </Section>
        </div>
      </div>
    </div>
  )
}
