"use client"

/**
 * An error boundary for a lazily-loaded chunk.
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
 * `reset` bumps a key rather than re-importing: a failed dynamic import is cached by the
 * bundler's module registry, so retrying the same import returns the same rejected promise.
 * Remounting the subtree is what actually gives it another go.
 */

import { Component, Fragment, type ReactNode } from "react"

type Props = {
  children: ReactNode
  /** Given a retry callback, renders whatever the failure should look like. */
  fallback: (retry: () => void) => ReactNode
  /** Prefixes the console.error so failures stay distinguishable in the logs. */
  logTag: string
}

type State = { failed: boolean; key: number }

export class ChunkBoundary extends Component<Props, State> {
  state: State = { failed: false, key: 0 }

  static getDerivedStateFromError(): Partial<State> {
    return { failed: true }
  }

  componentDidCatch(error: Error) {
    console.error(this.props.logTag, error)
  }

  render() {
    if (this.state.failed) {
      return this.props.fallback(() => this.setState((s) => ({ failed: false, key: s.key + 1 })))
    }
    // A keyed Fragment, not a keyed div: the graph fills its container absolutely, and an
    // extra wrapper here would silently change what it is positioned against.
    return <Fragment key={this.state.key}>{this.props.children}</Fragment>
  }
}
