"use client"

import type { AnchorHTMLAttributes } from "react"
import { useNavigate } from "../site-frame"
import type { ScreenId } from "./pages"

/**
 * A link to another screen of the Front, opened inside the frame. It is a real `<a>`, like the
 * sidebar's: on the site each screen is a URL. Here screens have none, so the click tells the
 * frame instead of navigating.
 */
export function ScreenLink({
  to,
  onClick,
  ...rest
}: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { to: ScreenId }) {
  const navigate = useNavigate()
  return (
    <a
      {...rest}
      href={`#${to}`}
      onClick={(event) => {
        onClick?.(event)
        event.preventDefault()
        navigate(to)
      }}
    />
  )
}
