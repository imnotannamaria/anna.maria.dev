"use client"

import { useEffect, useRef, useState } from "react"

/** Focus after errors (and, for a wizard, its step) have committed. Editing a field does not
 * request another focus move; only a rejected submit does. */
export function useInvalidFocus(ready = true) {
  const formRef = useRef<HTMLFormElement>(null)
  const [request, setRequest] = useState(0)
  const handled = useRef(0)
  useEffect(() => {
    if (!ready || request === handled.current) return
    const field = formRef.current?.querySelector<HTMLElement>(
      '[aria-invalid="true"]:not([disabled])',
    )
    if (!field) return
    field.focus()
    handled.current = request
  }, [request, ready])
  return { formRef, focusInvalid: () => setRequest((value) => value + 1) }
}
