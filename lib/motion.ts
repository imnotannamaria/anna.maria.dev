/** The --ease-out token as a cubic-bezier array for Motion. */
export const EASE_OUT = [0.2, 0.8, 0.2, 1] as const

/** One viewport rule for every entrance: play once, when a quarter is visible. */
export const revealViewport = { once: true, amount: 0.25 } as const

/**
 * Past this many items a per-item stagger stops reading as flow and starts
 * reading as lag, so everything after it arrives together.
 */
export const STAGGER_LIMIT = 6
