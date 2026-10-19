"use client"

import * as React from "react"

type CopyState = "idle" | "copied" | "error"

/**
 * Copies text and says how it went, then settles back to idle. A failed copy
 * (no clipboard on an insecure origin, a denied permission, a failed fetch)
 * reports "error" instead of claiming it worked. The text can come from an
 * async function, such as a fetch of a page's Markdown.
 */
function useCopy(resetAfter = 1600) {
  const [state, setState] = React.useState<CopyState>("idle")
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  React.useEffect(() => () => clearTimeout(timer.current), [])

  const copy = React.useCallback(
    async (text: string | (() => Promise<string>)): Promise<boolean> => {
      let ok = false
      try {
        const value = typeof text === "string" ? text : await text()
        await navigator.clipboard.writeText(value)
        ok = true
      } catch {
        ok = false
      }
      setState(ok ? "copied" : "error")
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setState("idle"), resetAfter)
      return ok
    },
    [resetAfter],
  )

  return { state, copy }
}

export { useCopy }
export type { CopyState }
