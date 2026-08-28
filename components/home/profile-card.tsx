"use client"

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
import { Skeleton } from "@/app/components/entrepta/skeleton"
import { EASE_OUT, revealViewport } from "@/components/ui/reveal"
import { RollingNumber, useRollOnHover } from "@/components/ui/rolling-number"
import { Spotlight, useSpotlight } from "@/components/ui/spotlight"
import { cn } from "@/lib/utils"
import { siteConfig } from "@/lib/site-config"

function Stat({ value, label, delay }: { value: number; label: string; delay: number }) {
  const roll = useRollOnHover(delay)

  return (
    <div
      className="group/stat relative flex cursor-default flex-col items-center gap-1.5 py-1"
      {...roll.handlers}
    >
      <RollingNumber
        value={value}
        cycle={roll.cycle}
        delay={roll.delay}
        height={34}
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "var(--text-heading-lg)",
          color: "var(--fg-primary)",
          fontVariantNumeric: "tabular-nums",
        }}
      />
      <span
        className="text-mono-xs font-mono tracking-[0.1em] uppercase transition-colors duration-200 group-hover/stat:text-(--fg-brand)"
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
          "text-mono-xs pointer-events-none absolute -bottom-4 translate-y-1 font-mono tracking-[0.06em] opacity-0",
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
  /** null when the database didn't answer — the stat is dropped rather than
   *  guessed at. A real 0 is a count and still gets its cell. */
  logged: number | null
}

export function ProfileCard({ stats }: { stats: ProfileStats }) {
  const reduce = useReducedMotion() ?? false

  /** The numbers only roll once the card has finished arriving. */
  const ROLL_DELAY = reduce ? 0 : 0.45

  const { onMouseMove, spotlight } = useSpotlight()

  /*
   * The card rises as one piece and its contents follow, which is the same two
   * beats every other card on the page does. It used to animate only its
   * contents while the container sat still, and the tree beside it did the
   * opposite — two cards in the same row disagreeing about what an entrance is.
   */
  /*
   * It rises, it does not fade — and that is a performance decision, not a taste one.
   *
   * Motion serialises `hidden` into the SSR markup as an inline style, so an entrance that
   * starts at `opacity: 0` ships the card invisible and it cannot paint until React has
   * hydrated. The bio paragraph below is the home page's LCP element; with the fade,
   * Lighthouse measured 1568ms of "element render delay" against 60ms of TTFB — the whole
   * metric was the wait for JS. `y` alone has no such cost: the text is painted from the
   * first frame and the transform is what arrives late.
   *
   * The two beats survive: the card travels as one piece and its contents follow, which is
   * what every other card on the page does. Only the opacity is gone.
   */
  const container: Variants = {
    hidden: { y: reduce ? 0 : 14 },
    show: {
      y: 0,
      transition: {
        duration: reduce ? 0 : 0.5,
        ease: EASE_OUT,
        staggerChildren: reduce ? 0 : 0.08,
        delayChildren: reduce ? 0 : 0.12,
      },
    },
  }
  const item: Variants = {
    hidden: { y: reduce ? 0 : 12 },
    show: { y: 0, transition: { duration: reduce ? 0 : 0.45, ease: EASE_OUT } },
  }

  const cells: { value: number; label: string }[] = [
    { value: stats.years, label: "years" },
    { value: stats.projects, label: "projects" },
    { value: stats.posts, label: "posts" },
    // A database blip costs this one cell — there is no number to show, and
    // inventing a 0 would turn a gap into a claim.
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
      whileInView="show"
      viewport={revealViewport}
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
        <span className="text-mono-sm font-mono" style={{ color: "var(--fg-muted)" }}>
          @{siteConfig.githubUser} · Pernambuco, Brasil
        </span>
      </motion.div>

      <motion.p
        variants={item}
        className="text-body-md relative max-w-[42ch] leading-relaxed"
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
          className="text-mono-xs font-mono leading-relaxed"
          style={{ color: "var(--fg-muted)", margin: 0 }}
        >
          <span aria-hidden style={{ opacity: 0.6 }}>
            {"// "}
          </span>
          projects, posts and log counted since 2026 · every project is open source
        </p>
      </motion.div>

      {/* flex-wrap because at 375px the sidebar leaves ~239px of card interior,
          and three buttons plus the CTA come to slightly more than that.
          `@container` so the rule below can ask how wide this row actually is —
          it is narrow on a phone AND in the right-hand grid column, which a
          viewport query can't tell apart.

          `w-full` is not decoration: `container-type: inline-size` means the
          contents no longer contribute to the inline size, and the card is
          `items-center`, so this row was sized shrink-to-fit. Made a container
          without a width of its own, it collapsed to nothing and wrapped every
          button onto its own line. */}
      <motion.div
        variants={item}
        className="@container relative mt-auto flex w-full flex-wrap items-center justify-center gap-2.5 pb-1"
      >
        {SOCIALS.map((s) => (
          <SocialButton key={s.label} icon={s.icon} href={s.href} label={s.label} />
        ))}
        {/* A divider separates two things on one line. Once the CTA wraps below,
            it separates nothing and just trails off the end of the icons — so it
            leaves at ~285px, which is where the row stops fitting: three 40px
            buttons, the CTA at ~102px, and four 10px gaps. */}
        <span
          aria-hidden
          className="mx-1 hidden h-6 w-px @min-[285px]:block"
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

// ─── Loading ──────────────────────────────────────────────────────────────────

/**
 * The profile card while the log count is still in flight.
 *
 * `app/(home)/loading.tsx` argues at length that a grey caricature of this card reads as broken
 * rather than loading, and it was right about the version it was arguing with: a rounded
 * rectangle, three bars and a pill, which is a picture of a generic card. The answer is not to
 * give up and print `$ loading…` — it is to trace *this* card. Same box, same 420px floor, same
 * dot pattern, avatar at the real 96px with the real 14px radius and the brand frame behind it,
 * the stats rail with its four cells and its dividers, three buttons at 40px.
 *
 * What is grey is only what comes from the query. Everything structural is the real thing, so
 * nothing moves when the data lands.
 */
export function ProfileCardSkeleton() {
  return (
    <div
      className="relative flex flex-col items-center gap-6 overflow-hidden p-6 text-center sm:p-8"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-xl)",
        minHeight: 420,
      }}
    >
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

      {/* The offset frame is the avatar's resting state, not a hover effect, so it belongs
          here — without it the photo slot is a plain square and the card loses the one shape
          you recognise it by from across the page. */}
      <div className="relative" style={{ width: 96, height: 96 }} aria-hidden>
        <span
          className="absolute inset-0"
          style={{ border: "1.5px solid var(--fg-brand)", borderRadius: 14, opacity: 0.45 }}
        />
        <Skeleton className="absolute inset-0" style={{ borderRadius: 14 }} />
      </div>

      <div className="relative flex flex-col items-center gap-2.5" aria-hidden>
        <Skeleton delay={0.06} style={{ width: 172, height: 26, borderRadius: 5 }} />
        <Skeleton delay={0.12} style={{ width: 210, height: 10, borderRadius: 3 }} />
      </div>

      <div className="relative flex w-full max-w-[42ch] flex-col items-center gap-2" aria-hidden>
        <Skeleton delay={0.18} style={{ width: "88%", height: 10, borderRadius: 3 }} />
        <Skeleton delay={0.24} style={{ width: "64%", height: 10, borderRadius: 3 }} />
      </div>

      <div className="relative flex w-full max-w-110 flex-col gap-2" aria-hidden>
        <div
          className="flex flex-wrap rounded-[var(--radius-lg)] px-2 py-3"
          style={{ background: "var(--bg-hover-soft)", border: "1px solid var(--border-subtle)" }}
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn("basis-1/2 py-1 sm:flex-1 sm:basis-0 sm:py-0", i > 0 && "sm:border-l")}
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <div className="flex flex-col items-center gap-1.5 py-1">
                {/* 34px is `RollingNumber`'s `height` on the real tile, and the label under it
                    is `text-mono-xs`. Both are traced so the rail keeps its height. */}
                <Skeleton
                  delay={0.3 + i * 0.06}
                  style={{ width: 34, height: 26, borderRadius: 4 }}
                />
                <Skeleton
                  delay={0.3 + i * 0.06}
                  style={{ width: 46, height: 8, borderRadius: 3 }}
                />
              </div>
            </div>
          ))}
        </div>
        <Skeleton delay={0.54} style={{ width: "76%", height: 8, borderRadius: 3 }} />
      </div>

      <div className="relative flex flex-wrap items-center justify-center gap-2" aria-hidden>
        {[0, 1, 2].map((i) => (
          <Skeleton
            key={i}
            delay={0.6 + i * 0.06}
            style={{ width: 40, height: 40, borderRadius: 12 }}
          />
        ))}
        <Skeleton delay={0.78} style={{ width: 132, height: 40, borderRadius: 12 }} />
      </div>

      <span className="sr-only" role="status">
        Loading the profile
      </span>
    </div>
  )
}
