import { HeartIcon } from "@phosphor-icons/react/dist/ssr"
import { PageHeader } from "@/components/site/page-header"
import { LETTERS } from "./letters"
import { Mural } from "./mural"
import "./wall.css"

export function Wall() {
  return (
    <article className="st-room st-screen">
      <PageHeader
        icon={<HeartIcon aria-hidden size={13} weight="bold" />}
        label="wall of love"
        count={LETTERS.length}
      >
        Kind words, <span className="text-[var(--fg-primary)]">by invitation</span>.
      </PageHeader>

      <Mural
        letters={[...LETTERS].sort(
          (a, b) => Number(b.featured ?? false) - Number(a.featured ?? false),
        )}
      />
    </article>
  )
}
