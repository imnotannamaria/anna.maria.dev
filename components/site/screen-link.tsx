import Link from "next/link"
import type { ComponentProps } from "react"
import { hrefOf, type ScreenId } from "./pages"

/** A link to another screen of the site, by its id: `to="notes"`, `to="post:my-post"`. */
export function ScreenLink({
  to,
  ...rest
}: Omit<ComponentProps<typeof Link>, "href"> & { to: ScreenId }) {
  return <Link {...rest} href={hrefOf(to)} />
}
