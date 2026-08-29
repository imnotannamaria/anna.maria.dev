import Link from "next/link"

/**
 * A page that does nothing for seven seconds, so `loading.tsx` next door is on screen long
 * enough for all three slow lines to arrive. `force-dynamic` because a static page would be
 * prerendered at build time and the wait would never happen in the browser.
 */
export const dynamic = "force-dynamic"

const SLEEP_MS = 7000

export default async function Live() {
  await new Promise((r) => setTimeout(r, SLEEP_MS))

  return (
    <div className="mx-auto w-full max-w-[900px] px-5 py-12 sm:px-8">
      <h1
        className="text-display-md m-0 font-serif leading-none font-normal tracking-[-0.02em]"
        style={{ color: "var(--fg-primary)" }}
      >
        Landed.
      </h1>
      <p className="text-mono-sm mt-4 font-mono" style={{ color: "var(--fg-muted)" }}>
        {`// held the screen for ${SLEEP_MS / 1000}s as admin`}
      </p>
      <Link
        href="/discovery/page-loading"
        className="text-mono-sm mt-8 inline-block font-mono"
        style={{ color: "var(--fg-brand)" }}
      >
        ← back
      </Link>
    </div>
  )
}
