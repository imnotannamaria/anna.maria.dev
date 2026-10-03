"use client"

import * as React from "react"

interface RedactState {
  /** The app has asked for values to be hidden. */
  hidden: boolean
  /** Already inside a mask, so a value here does not draw another. */
  masked: boolean
}

const RedactContext = React.createContext<RedactState>({ hidden: false, masked: false })

interface RedactProviderProps {
  /** Whether values are hidden. The app owns this state: a toggle, a setting, a URL. */
  hidden: boolean
  children: React.ReactNode
}

/**
 * Hides amounts and other marked values from view, for a screen share or a
 * café. It is the app's switch; without a provider nothing is hidden. It
 * hides from view, not from the page: the values stay in the HTML, so it is
 * no place for a secret.
 */
function RedactProvider({ hidden, children }: RedactProviderProps) {
  const parent = React.useContext(RedactContext)
  const value = React.useMemo(() => ({ hidden, masked: parent.masked }), [hidden, parent.masked])
  return React.createElement(RedactContext.Provider, { value }, children)
}

/** True when this value should be drawn as a mask: hidden, and not inside one already. */
function useRedacted(): boolean {
  const { hidden, masked } = React.useContext(RedactContext)
  return hidden && !masked
}

/** For a mask's children: they are covered, so they draw no mask of their own. */
function MaskedScope({ children }: { children: React.ReactNode }) {
  const parent = React.useContext(RedactContext)
  const value = React.useMemo(() => ({ hidden: parent.hidden, masked: true }), [parent.hidden])
  return React.createElement(RedactContext.Provider, { value }, children)
}

export { MaskedScope, RedactProvider, useRedacted }
export type { RedactProviderProps }
