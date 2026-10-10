import type { CSSProperties } from "react"
import { BrandMark, type Tech } from "./brand-mark"
import { Cover } from "./project-cover"
import "./folder.css"

/**
 * A project folder: the cover inside it, the logos of its main technologies behind, and a
 * "featured" sticker. It opens when an ancestor with `st-folder-host` is hovered, focused, or
 * has `data-open`: the host is whatever the folder sits in (a button, a card).
 */
export function Folder({
  title,
  cover,
  techs,
  featured = false,
  badge = featured,
  sizes,
}: {
  title: string
  cover: string | null
  techs: Tech[]
  featured?: boolean
  /** The "featured" sticker. On by default for a featured folder. */
  badge?: boolean
  sizes: string
}) {
  return (
    <span className="st-folder" data-featured={featured || undefined} aria-hidden>
      <span className="st-folder-rear" />
      {techs.map((tech, index) => (
        <span key={tech.name} className="st-folder-tech" style={{ "--i": index } as CSSProperties}>
          <BrandMark tech={tech} />
        </span>
      ))}
      <Cover project={{ title, cover }} sizes={sizes} className="st-folder-photo" />
      <span className="st-folder-front" />
      {badge ? <span className="st-folder-sticker text-mono-xs font-mono">featured</span> : null}
    </span>
  )
}
