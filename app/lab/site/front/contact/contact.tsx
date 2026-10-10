import { EnvelopeSimpleIcon } from "@phosphor-icons/react/dist/ssr"
import { siteConfig } from "@/lib/site-config"
import { PageHeader } from "../page-header"
import { Postcard } from "./postcard"
import "./contact.css"

export function Contact() {
  return (
    <article className="st-room st-screen">
      <PageHeader icon={<EnvelopeSimpleIcon aria-hidden size={13} weight="bold" />} label="contact">
        Let&rsquo;s <span className="text-[var(--fg-primary)]">talk</span>.
      </PageHeader>
      <Postcard channels={{ email: siteConfig.email, ...siteConfig.socials }} />
    </article>
  )
}
