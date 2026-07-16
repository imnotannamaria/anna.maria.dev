"use client"

import * as React from "react"

interface UseCommandPaletteOptions {
  shortcut?: string
}

interface UseCommandPaletteReturn {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  toggle: () => void
}

function useCommandPalette(options: UseCommandPaletteOptions = {}): UseCommandPaletteReturn {
  const { shortcut = "k" } = options
  const [open, setOpen] = React.useState(false)
  const toggle = React.useCallback(() => setOpen((v) => !v), [])

  React.useEffect(() => {
    if (typeof document === "undefined") return
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === shortcut) {
        e.preventDefault()
        toggle()
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [shortcut, toggle])

  return { open, setOpen, toggle }
}

export { useCommandPalette }
export type { UseCommandPaletteOptions, UseCommandPaletteReturn }
