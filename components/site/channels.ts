import { siteConfig } from "@/lib/site-config"

/**
 * The ways to reach Anna, in the order the site lists them, once. The contact page's dock, the
 * chat's answer and the footer each draw their own icons; which channels there are, what they are
 * called and where they go is here.
 */
export type ChannelId = "email" | "linkedin" | "github" | "x"
export type Channels = Record<ChannelId, string>

const NAMES: Record<ChannelId, string> = {
  email: "Email",
  linkedin: "LinkedIn",
  github: "GitHub",
  x: "X",
}

const ORDER: ChannelId[] = ["email", "linkedin", "github", "x"]

/** `channels` holds the email address and the three profile URLs. */
export function channelLinks(channels: Channels) {
  return ORDER.map((id) => ({
    id,
    name: NAMES[id],
    /** the address or the URL, as it is written */
    value: channels[id],
    href: id === "email" ? `mailto:${channels[id]}` : channels[id],
  }))
}

/** The site's own channels, from its config. */
export const SITE_CHANNELS: Channels = { email: siteConfig.email, ...siteConfig.socials }
