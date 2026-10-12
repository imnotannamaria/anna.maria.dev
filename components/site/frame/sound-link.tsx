import Link from "next/link"
import type { ComponentProps } from "react"

/**
 * A link that behaves like a button, so it clicks like one: the sidebar and the phone's bar. The
 * click sound is the document's and covers buttons only; `data-sound="click"` is how a link
 * joins them. A link inside a paragraph or a card is a link and stays quiet.
 */
export function SoundLink(props: ComponentProps<typeof Link>) {
  return <Link data-sound="click" {...props} />
}
