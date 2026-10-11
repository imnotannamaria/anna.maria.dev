import { EnvelopeSimpleIcon } from "@phosphor-icons/react/dist/ssr"
import { useTranslations } from "next-intl"
import { siteConfig } from "@/lib/site-config"
import { PageHeader } from "@/components/site/page-header"
import { Postcard } from "./postcard"
import "./contact.css"

export function Contact() {
  const t = useTranslations("contact")
  return (
    <article className="st-room st-screen">
      <PageHeader
        icon={<EnvelopeSimpleIcon aria-hidden size={13} weight="bold" />}
        label={t("label")}
      >
        {t.rich("lede", {
          b: (words) => <span className="text-[var(--fg-primary)]">{words}</span>,
        })}
      </PageHeader>
      <Postcard channels={{ email: siteConfig.email, ...siteConfig.socials }} />
    </article>
  )
}
