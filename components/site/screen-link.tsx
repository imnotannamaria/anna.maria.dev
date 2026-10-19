import { useLocale } from "next-intl"
import Link from "next/link"
import type { ComponentProps } from "react"
import { localePath } from "@/lib/i18n/locales"
import { hrefOf, type ScreenId } from "./pages"

/**
 * A link to another screen of the site, by its id: `to="notes"`, `to="post:my-post"`. It goes to
 * that screen in the language of the page it is on.
 */
export function ScreenLink({
  to,
  ...rest
}: Omit<ComponentProps<typeof Link>, "href"> & { to: ScreenId }) {
  return <Link {...rest} href={localePath(useLocale(), hrefOf(to))} />
}
