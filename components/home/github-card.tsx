"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@/app/components/entrepta/skeleton"
import { ArrowLink } from "@/components/ui/arrow-link"
import { CardFoot, CardHead } from "@/components/ui/card-parts"
import { Spotlight, useSpotlight } from "@/components/ui/spotlight"

const GithubCalendarInner = dynamic(
  () => import("@/components/about/github-calendar").then((m) => m.GithubCalendar),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[140px] w-full rounded-lg" />,
  },
)

/**
 * The calendar itself is still `react-github-calendar` and still due a rewrite —
 * see the roadmap. This is only the frame around it.
 *
 * That frame used to be `.bento-card` copied out by hand into inline styles,
 * with a React state hook driving the hover so it could also lift and cast a
 * shadow. Everything it was reimplementing already exists: the class does the
 * surface, `CardHead` and `CardFoot` do the chrome, `ArrowLink` does the link.
 * The lift went with the state — no other card on the page lifts, and keeping it
 * meant keeping a re-render on every pointer enter to do what CSS does free.
 */
export function GithubCard({ username }: { username: string }) {
  const { onMouseMove, spotlight } = useSpotlight(700)

  return (
    <div className="bento-card" onMouseMove={onMouseMove}>
      <Spotlight {...spotlight} />

      <CardHead label="contributions" as="h3" meta={username} />

      <div className="relative overflow-x-auto">
        <GithubCalendarInner username={username} />
      </div>

      {/* Same dashed rule the tree and oss footers use — spelled with the token,
          not Tailwind's default border colour, which is a different grey. */}
      <CardFoot
        comment="public activity · last 12 months"
        className="border-t border-dashed border-(--border-subtle) pt-3"
      >
        <span style={{ color: "var(--fg-brand)" }}>
          <ArrowLink
            href={`https://github.com/${username}`}
            external
            className="text-[11px] text-(--fg-brand)"
          >
            github
          </ArrowLink>
        </span>
      </CardFoot>
    </div>
  )
}
