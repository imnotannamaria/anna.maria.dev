"use client"

/**
 * The four channels, as one card with four rows.
 *
 * They were four cards, each hand-rolling `rounded-[var(--radius-lg)] border px-5 py-4` with
 * its own hover — the reuse-before-invention tell, four times over. And four cards ahead of
 * the form put the only thing on the page that *does* something two scrolls down.
 *
 * One card, four rows, in the column beside the form. It reads the same and takes a third of
 * the height.
 *
 * The channel list lives in this file rather than in the page because `Icon` is a component
 * reference, and a component reference is not serialisable across the server/client boundary
 * — only props and already-rendered elements are. Building the rows here keeps the lookup on
 * this side of the line.
 */

import { EnvelopeSimpleIcon } from "@phosphor-icons/react/dist/ssr"
import { motion } from "motion/react"
import { CardFoot, CardHead } from "@/components/ui/card-parts"
import { GitHubIcon, LinkedInIcon, XIcon } from "@/components/ui/icons"
import { useReveal } from "@/components/ui/reveal"
import { Spotlight, useSpotlight } from "@/components/ui/spotlight"
import { siteConfig } from "@/lib/site-config"

const EMAIL = siteConfig.email

const channels = [
  {
    Icon: EnvelopeSimpleIcon,
    label: "email",
    value: EMAIL,
    href: `mailto:${EMAIL}`,
    primary: true,
  },
  { Icon: GitHubIcon, label: "github", value: "imnotannamaria", href: siteConfig.socials.github },
  {
    Icon: LinkedInIcon,
    label: "linkedin",
    value: "in/imnotannamaria",
    href: siteConfig.socials.linkedin,
  },
  { Icon: XIcon, label: "x", value: "@annamariadevbr", href: siteConfig.socials.x },
]

export function ChannelsCard({ index = 0 }: { index?: number }) {
  const { onMouseMove, spotlight } = useSpotlight(280)
  const reveal = useReveal(index * 0.06)

  return (
    <motion.div
      id="channels"
      className="bento-card"
      style={{ scrollMarginTop: 24 }}
      onMouseMove={onMouseMove}
      {...reveal}
    >
      <Spotlight {...spotlight} />
      <CardHead label="other channels" meta={String(channels.length)} />

      <div className="relative flex flex-col">
        {channels.map(({ Icon, label, value, href, primary }, i) => {
          const external = !href.startsWith("mailto:")
          return (
            <a
              key={label}
              href={href}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="group/row flex items-center gap-3 py-2.5"
              style={{
                borderTop: i === 0 ? "none" : "1px dashed var(--border-subtle)",
                textDecoration: "none",
              }}
            >
              <span
                className="grid shrink-0 place-items-center rounded-[var(--radius-sm)]"
                style={{
                  width: 28,
                  height: 28,
                  background: primary ? "var(--bg-surface-brand)" : "var(--bg-hover-soft)",
                  color: primary ? "var(--fg-brand)" : "var(--fg-secondary)",
                }}
              >
                <Icon size={14} />
              </span>

              <span className="flex min-w-0 flex-col">
                <span
                  className="font-mono text-[10px] tracking-[0.08em] uppercase"
                  style={{ color: "var(--fg-muted)" }}
                >
                  {label}
                </span>
                <span
                  className="truncate font-mono text-[12.5px] transition-colors group-hover/row:text-[var(--fg-brand)] group-focus-visible/row:text-[var(--fg-brand)]"
                  style={{ color: "var(--fg-primary)" }}
                >
                  {value}
                </span>
                {external && <span className="sr-only">(opens in a new tab)</span>}
              </span>

              {/* Mirrored on focus-visible — the affordance can't be hover-only. */}
              <span
                aria-hidden
                className="ml-auto shrink-0 transition-transform duration-200 ease-out group-hover/row:translate-x-0.5 group-hover/row:-translate-y-0.5 group-focus-visible/row:translate-x-0.5 group-focus-visible/row:-translate-y-0.5"
                style={{ color: "var(--fg-brand)" }}
              >
                ↗
              </span>
            </a>
          )
        })}
      </div>

      <CardFoot comment="all of them get read" />
    </motion.div>
  )
}
