import { useTranslations } from "next-intl"

/**
 * A date as the site writes it, in the page's language: "oct 11, 2026", "11 de out de 2026".
 * Read from the ISO string alone, with no `Date`, so the server and the browser cannot disagree
 * about which day it is.
 */
export function useShortDate(): (iso: string) => string {
  const t = useTranslations("date")
  return (iso) => {
    const month = Number(iso.slice(5, 7))
    if (!(month >= 1 && month <= 12)) return iso
    return t("short", {
      month: t(`months.${month as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12}`),
      day: Number(iso.slice(8, 10)),
      year: iso.slice(0, 4),
    })
  }
}
