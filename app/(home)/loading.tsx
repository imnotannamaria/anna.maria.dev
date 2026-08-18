/**
 * The home page is force-dynamic — the wristkit rings and the log shelf are supposed to read
 * as live — so it waits on Postgres before anything paints.
 *
 * It lives in a `(home)` route group, and that is not cosmetic. As `app/loading.tsx` it was
 * the Suspense boundary for **every** route in the app, so `notFound()` anywhere underneath
 * was thrown after the response had started streaming: the status line said 200 and only the
 * body said 404. Every missing post, project and mistyped URL on the site became a soft 404,
 * which search engines keep in the index rather than dropping. Measured: with the file at the
 * root, a bogus `/projects/x` answered 200; inside the group it answers 404 and the home page
 * still gets its loading state.
 *
 * This does not draw the page in grey. The first attempt did: a rounded rectangle for the
 * avatar, bars for the name and the stats, a pill for the CTA. A skeleton works when the
 * thing behind it is a uniform repeating shape, because then the grey blocks *are* the
 * layout. The first row here is a bespoke card — a photo, a serif name, an odometer, three
 * social buttons — and a grey caricature of that reads as a broken page rather than a
 * loading one.
 *
 * So it says what is happening, in the voice the rest of the site already uses: the real
 * section prompt, then a `$` line underneath. `60vh` keeps the status bar from jumping up
 * to meet it and back down again.
 *
 * The line is plain text, not `TypeIn`. `TypeIn` fades its characters in on `whileInView`,
 * which needs the client to hydrate and an `IntersectionObserver` to fire before anything
 * shows — its `initial` state renders as `opacity: 0` in the SSR HTML. A page title can
 * afford that beat, it sits on a page that stays put. A loading state can't: it exists only
 * until the real data lands, and on a cold load that can happen before hydration finishes,
 * so the line stayed invisible for the state's entire time on screen while the dots, plain
 * CSS with no JS to wait on, animated the whole time regardless. The text needs to be there
 * on first paint, not after a round trip to the client. The dots are still CSS, and they
 * still loop: once the line has landed, one thing should still be moving, and an ellipsis
 * says "still working" where a caret only says "cursor".
 */

export default function HomeLoading() {
  return (
    <div
      className="mx-auto flex flex-col px-4 py-6 sm:px-6 md:px-8 lg:px-12 lg:py-8"
      style={{ maxWidth: 1280, minHeight: "60vh" }}
    >
      {/* The same head the section renders for real, so this line does not move when the
          page lands — it is the one piece of the home page that is known without a query. */}
      <div
        className="mb-6 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-dashed pb-3"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <span className="text-mono-sm font-mono tracking-[0.08em] uppercase">
          <span style={{ color: "var(--fg-brand)" }}>$</span>{" "}
          <span style={{ color: "var(--fg-muted)" }}>whoami</span>
        </span>
      </div>

      {/* The whole visible line is aria-hidden — the `role="status"` below is the one
          announcement a screen reader gets, so the mono `$`, the text and the dots are all
          decoration. Exposing the text here as well would announce the same fact twice. */}
      <p aria-hidden className="text-mono-md m-0 font-mono" style={{ color: "var(--fg-muted)" }}>
        <span style={{ color: "var(--fg-brand)" }}>$</span> loading page
        <span>
          <span className="load-dot load-dot-1">.</span>
          <span className="load-dot load-dot-2">.</span>
          <span className="load-dot load-dot-3">.</span>
        </span>
      </p>

      <span className="sr-only" role="status">
        Loading the page
      </span>
    </div>
  )
}
