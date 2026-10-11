/**
 * The two languages of the site, and how one is picked for a visitor.
 *
 * The language is in the address: English at the root (`/notes`), Portuguese under `/pt`
 * (`/pt/notes`). Each has its own URL, so both are indexed and a link opens in the language of
 * whoever sent it. Inside the app every page lives under a `[locale]` segment, `/en` and `/pt`,
 * which is what lets them be built ahead; `proxy.ts` maps the English ones to the root, so
 * `/en` is never seen. A first visit with a browser that asks for Portuguese is sent to `/pt`,
 * and a click on the flag in the header is remembered in a cookie.
 */
export const LOCALES = ["en", "pt"] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = "en"

/** What `<html lang>` says for each. */
export const HTML_LANG: Record<Locale, string> = { en: "en", pt: "pt-BR" }
export const LOCALE_NAME: Record<Locale, string> = { en: "English", pt: "Português" }

/** The cookie a click on the flag writes. A year, since it is a choice and not a session. */
export const LOCALE_COOKIE = "site-lang"
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

export const isLocale = (value: unknown): value is Locale =>
  typeof value === "string" && (LOCALES as readonly string[]).includes(value)

/** The language after this one: what a click on the flag switches to. */
export function nextLocale(locale: Locale): Locale {
  return LOCALES[(LOCALES.indexOf(locale) + 1) % LOCALES.length]
}

/**
 * The language for a request: the visitor's own choice if they made one, otherwise the first
 * language their browser asks for that the site speaks, otherwise English.
 */
export function localeFrom(cookie: string | undefined, acceptLanguage: string | null): Locale {
  if (isLocale(cookie)) return cookie
  if (!acceptLanguage) return DEFAULT_LOCALE

  const wanted = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";")
      const q = params.map((param) => param.trim()).find((param) => param.startsWith("q="))
      const weight = q ? Number(q.slice(2)) : 1
      return { tag: tag.toLowerCase(), weight: Number.isFinite(weight) ? weight : 0 }
    })
    .filter(({ tag, weight }) => tag && weight > 0)
    // a stable sort: equal weights keep the order the browser sent them in
    .sort((a, b) => b.weight - a.weight)

  for (const { tag } of wanted) {
    const primary = tag.split("-")[0]
    if (isLocale(primary)) return primary
  }
  return DEFAULT_LOCALE
}

/**
 * An address without its language: `/pt/notes` and `/en/notes` are both `/notes`. It is how the
 * frame knows which page is showing whatever the language, and it reads the same at build time
 * (where the English pages are still under `/en`) as in the browser.
 */
export function stripLocale(pathname: string): string {
  const [, first, ...rest] = pathname.split("/")
  if (!isLocale(first)) return pathname
  return `/${rest.join("/")}`
}

/** The address of a page in a language: `/notes` in English, `/pt/notes` in Portuguese. */
export function localePath(locale: Locale, path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`
  if (locale === DEFAULT_LOCALE) return clean
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`
}

/** The language an address is written in, or null when it carries none (which reads as English). */
export function localeOfPath(pathname: string): Locale | null {
  const first = pathname.split("/")[1]
  return isLocale(first) ? first : null
}

/** What `proxy.ts` does with a page request. */
export type Routing =
  | { kind: "serve" }
  | { kind: "redirect"; to: string; permanent: boolean }
  | { kind: "rewrite"; to: string }

/**
 * Where a request for a page goes. Kept here, away from the proxy, so the rule can be read and
 * tested on its own:
 *
 * - `/pt/...` is served as it is
 * - `/en/...` is not an address of the site, and goes to the same page without the prefix, for good
 * - anything else is English, served from `/en/...` under the same address, unless the visitor
 *   would rather read another language (their own choice first, their browser's otherwise):
 *   then they are sent to it, for now, since the next visitor may differ
 */
export function routePage(
  pathname: string,
  cookie: string | undefined,
  acceptLanguage: string | null,
): Routing {
  const inPath = localeOfPath(pathname)
  if (inPath === DEFAULT_LOCALE)
    return { kind: "redirect", to: stripLocale(pathname), permanent: true }
  if (inPath) return { kind: "serve" }

  const wanted = localeFrom(cookie, acceptLanguage)
  if (wanted !== DEFAULT_LOCALE) {
    return { kind: "redirect", to: localePath(wanted, pathname), permanent: false }
  }
  return { kind: "rewrite", to: `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}` }
}
