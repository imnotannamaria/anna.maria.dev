import { getRequestConfig } from "next-intl/server"
import { DEFAULT_LOCALE, isLocale } from "./locales"

/**
 * What next-intl needs to render a page: its language and that language's messages. The
 * language is the `[locale]` segment the page lives under (see proxy.ts for how a visitor gets
 * there); a page outside that segment, the admin, is in English.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = isLocale(requested) ? requested : DEFAULT_LOCALE
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    // dates on the site are written by hand or formatted on the server in São Paulo
    timeZone: "America/Sao_Paulo",
  }
})
