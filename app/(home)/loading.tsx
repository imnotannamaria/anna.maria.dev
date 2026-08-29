/**
 * What the home page shows before the shell itself is ready — which is a much smaller job than
 * it was, and a different one from what each card does.
 *
 * This used to cover everything: `Home()` awaited one `Promise.all` of three queries, so a slow
 * log query held the whole page here, including the featured project, the stack card and the
 * piano, none of which touch a database. Every card that reads something now sits behind its
 * own `<Suspense>` with its own skeleton, so the shell paints immediately and each card fills in
 * on its own clock. This file is what is left: the frame around a page whose slow parts announce
 * themselves individually.
 *
 * That split is also why this is a sentence and not a skeleton. A skeleton works when it stands
 * in for one known box and can trace it exactly — `ProfileCardSkeleton` knows there is a 96px
 * avatar and a four-cell stats rail. This stands in for the whole page before any of those
 * exist, and a grey rectangle per card is a caricature of a layout rather than a picture of one.
 *
 * It lives in a `(home)` route group, and that is not cosmetic. As `app/loading.tsx` it was the
 * Suspense boundary for **every** route in the app, so `notFound()` anywhere underneath was
 * thrown after the response had started streaming: the status line said 200 and only the body
 * said 404. Every missing post, project and mistyped URL on the site became a soft 404, which
 * search engines keep in the index rather than dropping. Measured: with the file at the root, a
 * bogus `/projects/x` answered 200; inside the group it answers 404 and the home page still gets
 * its loading state.
 */
import { PageLoading } from "@/components/chrome/page-loading"

export default function HomeLoading() {
  return (
    <PageLoading
      command="whoami"
      label="the page"
      steps={["connecting to postgres", "reading the log", "counting posts and projects"]}
    />
  )
}
