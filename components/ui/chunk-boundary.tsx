"use client"

/**
 * An error boundary for a lazily-loaded chunk, and a retry that actually retries.
 *
 * `next/dynamic` has a `loading` state and no error state. When the chunk request fails — a
 * dropped connection mid-navigation, a stale hashed filename after a deploy, a captive portal
 * — the component simply never resolves and the pane sits blank forever, with nothing on
 * screen admitting anything went wrong and no way to ask again. That was true of the stack
 * graph, which is the largest chunk on the site and therefore the likeliest to be interrupted.
 *
 * A class component, because `componentDidCatch` has no hook equivalent — this is the one
 * remaining thing React has no function-component API for.
 *
 * **`children` is a function of the attempt number, and that is the whole fix.** This used to
 * remount a keyed subtree and blame the bundler's module registry for the retry not working.
 * The registry is not the problem: webpack drops a failed chunk from `installedChunks`, so a
 * fresh `import()` really does go back to the network. The problem is one level up —
 * `next/dynamic` builds its `React.lazy` payload once at module scope, and `lazy` writes
 * `_status = 2` onto that payload when the loader rejects. Remounting hands React the same
 * settled payload, which re-throws instantly without calling the loader again. The button was
 * inert.
 *
 * So the consumer is handed `attempt` and rebuilds the lazy component from it. A new `lazy`
 * has no cached rejection, calls the loader, and the request goes out.
 */

import { Component, type ReactNode } from "react"

type Props = {
  /**
   * Rendered with the current attempt number. Build the `dynamic()`/`lazy()` component inside a
   * `useMemo` keyed on it — reusing one from module scope is what made the retry a no-op.
   */
  children: (attempt: number) => ReactNode
  /** Given a retry callback, renders whatever the failure should look like. */
  fallback: (retry: () => void) => ReactNode
  /** Prefixes the console.error so failures stay distinguishable in the logs. */
  logTag: string
}

type State = { failed: boolean; attempt: number }

export class ChunkBoundary extends Component<Props, State> {
  state: State = { failed: false, attempt: 0 }

  static getDerivedStateFromError(): Partial<State> {
    return { failed: true }
  }

  componentDidCatch(error: Error) {
    console.error(this.props.logTag, error)
  }

  render() {
    if (this.state.failed) {
      return this.props.fallback(() =>
        this.setState((s) => ({ failed: false, attempt: s.attempt + 1 })),
      )
    }
    return this.props.children(this.state.attempt)
  }
}
