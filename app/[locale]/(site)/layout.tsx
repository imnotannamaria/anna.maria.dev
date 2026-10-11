import { SiteShell } from "@/components/site/frame/site-shell"
import { pageLocale } from "@/lib/i18n/page"

/**
 * The frame around every page of the site. See `SiteShell`.
 *
 * It sets the language before rendering anything, like every layout and page under `[locale]`
 * has to. next-intl decides a request's language the first time something asks for a
 * translation, and keeps it for the whole request. This layout's own frame asks, and it can run
 * before the root layout above has finished reading the address: without the line below it
 * sometimes asked first, got no answer, and the whole page came out in English under a
 * Portuguese frame.
 */
export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  await pageLocale(params)
  return <SiteShell>{children}</SiteShell>
}
