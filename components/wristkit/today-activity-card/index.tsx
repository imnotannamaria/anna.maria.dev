import type * as React from "react"
import type { TodayState } from "./load"
import {
  TodayActivityCardEmpty,
  TodayActivityCardError,
  TodayActivityCardLoading,
  TodayActivityCardOk,
  TodayActivityCardStale,
} from "./states"

/**
 * The loader is deliberately *not* re-exported here.
 *
 * `load.ts` imports the Postgres client, so anything that re-exports it drags a server-only
 * module into every importer's graph. This file is the pure card, and the showcase renders it
 * from a fixture in a client component — which broke the build the moment the two were reachable
 * through one entry point. Callers that need the query import `./load` directly.
 */
export type { TodayData, TodayState } from "./load"

export function TodayActivityCard({
  state,
  className,
}: {
  state: TodayState
  className?: string
}): React.JSX.Element {
  switch (state.kind) {
    case "loading":
      return <TodayActivityCardLoading className={className} />
    case "empty":
      return <TodayActivityCardEmpty className={className} />
    case "error":
      return <TodayActivityCardError className={className} />
    case "stale":
      return <TodayActivityCardStale className={className} data={state.data} />
    case "ok":
      return <TodayActivityCardOk className={className} data={state.data} />
  }
}
