"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useReducedMotion, type Variants } from "motion/react"
import {
  GithubLogoIcon,
  LinkedinLogoIcon,
  PaperPlaneTiltIcon,
  XLogoIcon,
} from "@phosphor-icons/react"
import { buttonVariants } from "@/app/components/entrepta/button-variants"
import { RollingNumber } from "@/components/ui/rolling-number"
import { Spotlight, useSpotlight } from "@/components/ui/spotlight"
import { cn } from "@/lib/utils"
import { siteConfig } from "@/lib/site-config"

/** The project's --ease-out token, as a Motion cubic-bezier array. */
const EASE_OUT = [0.2, 0.8, 0.2, 1] as const

function Stat({ value, label, delay }: { value: number; label: string; delay: number }) {
  const [cycle, setCycle] = useState(0)

  /*
   * The stagger delay belongs to the entrance and nothing else.
   *
   * Left on the transition unconditionally, every hover re-applied it: the
   * in-flight spring got interrupted, and its replacement then sat waiting out
   * the delay before moving. On the last stat that delay is ~0.7s, so hovering
   * it mid-roll parked the strip between two digits and it looked frozen.
   *
   * This lives here rather than in Digit because the decision is "has the user
   * touched this yet", which is a fact about the stat, and it's set from an
   * event — no ref read during render, no setState inside an effect.
   */
  const [touched, setTouched] = useState(false)

  return (
    <div
      className="group/stat relative flex cursor-default flex-col items-center gap-1.5 py-1"
      onMouseEnter={() => {
        setTouched(true)
        setCycle(1)
      }}
      onMouseLeave={() => setCycle(0)}
    >
      <RollingNumber
        value={value}
        cycle={cycle}
        delay={touched ? 0 : delay}
        height={34}
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 30,
          color: "var(--fg-primary)",
          fontVariantNumeric: "tabular-nums",
        }}
      />
      <span
        className="font-mono text-[10px] tracking-[0.1em] uppercase transition-colors duration-200 group-hover/stat:text-(--fg-brand)"
        style={{ color: "var(--fg-muted)" }}
      >
        {label}
      </span>
      <span
        aria-hidden
        className="absolute -bottom-1 h-px w-0 transition-all duration-300 group-hover/stat:w-8"
        style={{ background: "var(--fg-brand)" }}
      />
    </div>
  )
}

// ─── Avatar ──────────────────────────────────────────────────────────────────

/**
 * Square, not round. At rest the brand frame sits behind and aligned; on hover
 * the photo lifts up-left and the frame slides the other way, showing through
 * like a print offset that missed registration.
 *
 * `alt=""` because the h1 beside it already says whose face this is — a screen
 * reader announcing the name twice is worse than not announcing the photo.
 */
function Avatar() {
  const reduce = useReducedMotion() ?? false

  const frame: Variants = {
    rest: { x: 0, y: 0, opacity: 0.45 },
    hover: { x: reduce ? 0 : 7, y: reduce ? 0 : 7, opacity: 1 },
  }
  const photo: Variants = {
    rest: { x: 0, y: 0, filter: "grayscale(0.55)" },
    hover: { x: reduce ? 0 : -5, y: reduce ? 0 : -5, filter: "grayscale(0)" },
  }

  return (
    <motion.div
      className="relative"
      style={{ width: 96, height: 96 }}
      initial="rest"
      whileHover="hover"
      animate="rest"
      transition={{ duration: reduce ? 0 : 0.32, ease: EASE_OUT }}
    >
      <motion.span
        aria-hidden
        variants={frame}
        transition={{ duration: reduce ? 0 : 0.32, ease: EASE_OUT }}
        className="absolute inset-0"
        style={{ border: "1.5px solid var(--fg-brand)", borderRadius: 14 }}
      />
      <motion.div
        variants={photo}
        transition={{ duration: reduce ? 0 : 0.32, ease: EASE_OUT }}
        className="absolute inset-0 overflow-hidden"
        style={{
          borderRadius: 14,
          border: "1px solid var(--border-strong)",
          background: "var(--bg-card)",
        }}
      >
        <Image
          src="/images/avatar.png"
          alt=""
          width={96}
          height={96}
          priority
          className="h-full w-full object-cover"
        />
      </motion.div>
    </motion.div>
  )
}

// ─── Social buttons ──────────────────────────────────────────────────────────

const SOCIALS = [
  { icon: GithubLogoIcon, href: siteConfig.socials.github, label: "GitHub" },
  { icon: LinkedinLogoIcon, href: siteConfig.socials.linkedin, label: "LinkedIn" },
  { icon: XLogoIcon, href: siteConfig.socials.x, label: "X" },
]

function SocialButton({
  icon: Icon,
  href,
  label,
}: {
  icon: typeof GithubLogoIcon
  href: string
  label: string
}) {
  return (
    /*
     * The <a> is the hit area and it never moves. Only the box inside it lifts.
     *
     * Putting the lift on the link itself made it flicker: the button slid out
     * from under the cursor, :hover ended, it dropped back, :hover started, and
     * so on for as long as you kept the pointer near its lower edge. A static
     * target with a moving skin can't get into that loop.
     */
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} — opens in a new tab`}
      className="group/social relative flex h-10 w-10 items-center justify-center outline-none"
    >
      <span
        className={cn(
          "flex h-full w-full items-center justify-center rounded-xl border",
          "border-(--border-subtle) text-(--fg-secondary)",
          "transition-[transform,background-color,border-color,color] duration-200 ease-out",
          "group-hover/social:-translate-y-1 group-hover/social:border-(--fg-brand)",
          "group-hover/social:bg-(--bg-surface-brand) group-hover/social:text-(--fg-brand)",
          "group-focus-visible/social:-translate-y-1 group-focus-visible/social:border-(--fg-brand)",
          "group-focus-visible/social:bg-(--bg-surface-brand) group-focus-visible/social:text-(--fg-brand)",
        )}
      >
        <Icon
          size={17}
          weight="fill"
          className="transition-transform duration-200 ease-out group-hover/social:scale-110"
        />
      </span>
      {/* the name rises from under the button as it lifts */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute -bottom-4 translate-y-1 font-mono text-[10px] tracking-[0.06em] opacity-0",
          "text-(--fg-brand) transition-all duration-200 ease-out",
          // focus as well as hover: a keyboard user gets the same reveal.
          "group-hover/social:translate-y-0 group-hover/social:opacity-100",
          "group-focus-visible/social:translate-y-0 group-focus-visible/social:opacity-100",
        )}
      >
        {label.toLowerCase()}
      </span>
    </Link>
  )
}

// ─── Card ────────────────────────────────────────────────────────────────────

export type ProfileStats = {
  years: number
  projects: number
  posts: number
  /** null when the database is unreachable — the stat is dropped, not zeroed. */
  logged: number | null
}

export function ProfileCard({ stats }: { stats: ProfileStats }) {
  const reduce = useReducedMotion() ?? false

  /** The numbers only roll once the card has finished arriving. */
  const ROLL_DELAY = reduce ? 0 : 0.45

  const { onMouseMove, spotlight } = useSpotlight()

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.08, delayChildren: 0.05 } },
  }
  const item: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 12 },
    show: { opacity: 1, y: 0, transition: { duration: reduce ? 0 : 0.45, ease: EASE_OUT } },
  }

  const cells: { value: number; label: string }[] = [
    { value: stats.years, label: "years" },
    { value: stats.projects, label: "projects" },
    { value: stats.posts, label: "posts" },
    // A database blip costs this one cell. Showing 0 would be a claim, not a gap.
    ...(stats.logged !== null ? [{ value: stats.logged, label: "logged" }] : []),
  ]

  return (
    <motion.div
      className="relative flex flex-col items-center gap-6 overflow-hidden p-6 text-center sm:p-8"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-xl)",
        minHeight: 420,
      }}
      variants={container}
      initial="hidden"
      animate="show"
      onMouseMove={onMouseMove}
    >
      <Spotlight {...spotlight} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: 0.14,
          backgroundImage: "radial-gradient(var(--fg-brand) 1px, transparent 1.4px)",
          backgroundSize: "20px 20px",
          maskImage: "radial-gradient(circle at 50% 0%, #000, transparent 70%)",
          WebkitMaskImage: "radial-gradient(circle at 50% 0%, #000, transparent 70%)",
        }}
      />

      <motion.div variants={item} className="relative">
        <Avatar />
      </motion.div>

      <motion.div variants={item} className="relative flex flex-col items-center gap-1.5">
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontWeight: 400,
            fontSize: "clamp(30px, 5vw, 38px)",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            color: "var(--fg-primary)",
            margin: 0,
          }}
        >
          Anna <em style={{ fontStyle: "italic", color: "var(--fg-brand)" }}>Maria</em>
        </h1>
        <span className="font-mono text-[11px]" style={{ color: "var(--fg-muted)" }}>
          @{siteConfig.githubUser} · Pernambuco, Brasil
        </span>
      </motion.div>

      <motion.p
        variants={item}
        className="relative max-w-[42ch] text-sm leading-relaxed"
        style={{ fontFamily: "var(--font-sans)", color: "var(--fg-secondary)", margin: 0 }}
      >
        Full-stack Software Engineer at{" "}
        <Link
          href="https://cesar.org.br"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:[border-bottom-color:var(--fg-brand)] hover:[color:var(--fg-brand)]"
          style={{ color: "var(--fg-primary)", borderBottom: "1px solid var(--border-strong)" }}
        >
          CESAR
        </Link>
        , always working on something open source on the side.
      </motion.p>

      <motion.div variants={item} className="relative flex w-full max-w-110 flex-col gap-2">
        <div
          className="flex flex-wrap rounded-[var(--radius-lg)] px-2 py-3"
          style={{ background: "var(--bg-hover-soft)", border: "1px solid var(--border-subtle)" }}
        >
          {cells.map((cell, i) => (
            <div
              key={cell.label}
              className={cn(
                // Two-up on a phone, one row from sm. At 375px the sidebar
                // leaves ~287px of card, which four columns cannot hold.
                "basis-1/2 py-1 sm:flex-1 sm:basis-0 sm:py-0",
                i > 0 && "sm:border-l",
              )}
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <Stat
                value={cell.value}
                label={cell.label}
                delay={ROLL_DELAY + (reduce ? 0 : i * 0.07)}
              />
            </div>
          ))}
        </div>

        <p
          className="font-mono text-[10px] leading-relaxed"
          style={{ color: "var(--fg-muted)", margin: 0 }}
        >
          <span aria-hidden style={{ opacity: 0.6 }}>
            {"// "}
          </span>
          projects, posts and log counted since 2026 · every project is open source
        </p>
      </motion.div>

      {/* flex-wrap because at 375px the sidebar leaves ~239px of card interior,
          and three buttons plus the CTA come to slightly more than that. */}
      <motion.div
        variants={item}
        className="relative mt-auto flex flex-wrap items-center justify-center gap-2.5 pb-1"
      >
        {SOCIALS.map((s) => (
          <SocialButton key={s.label} icon={s.icon} href={s.href} label={s.label} />
        ))}
        <span
          aria-hidden
          className="mx-1 h-6 w-px"
          style={{ background: "var(--border-subtle)" }}
        />
        <Link href="/contact" className={cn(buttonVariants({ variant: "primary" }), "group/cta")}>
          <PaperPlaneTiltIcon
            size={15}
            weight="fill"
            className="transition-transform duration-200 ease-out group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5"
          />
          say hi
        </Link>
      </motion.div>
    </motion.div>
  )
}
