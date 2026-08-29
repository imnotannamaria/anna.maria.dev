/**
 * What a component knows about its own data.
 *
 * This is the shape `components/wristkit/today-activity-card/load.ts` already had as
 * `TodayState`, lifted so everything else can share one vocabulary. It was built that way for
 * its own reasons and turned out to be the answer everywhere: a discriminated union is what
 * lets a card be rendered in a state it is not currently in — which is what makes states
 * demoable, testable, and reviewable at all.
 *
 * `stale` is wristkit's alone: data that arrived but is a day old. It stays in the shared
 * union rather than becoming an extension, because a member nobody else uses costs nothing
 * while a second parallel union costs a reader.
 *
 * `message` is developer-facing and **must never reach the DOM**. It exists so a failure is
 * greppable in the Vercel logs, not so it can be printed — a connection string in an error
 * card is the leak the Security check is about. Every frame below renders a fixed line.
 */
export type CardState<T> =
  | { kind: "loading" }
  | { kind: "empty" }
  | { kind: "error"; message?: string }
  | { kind: "stale"; data: T }
  | { kind: "ok"; data: T }

export type CardStateKind = CardState<unknown>["kind"]

export const CARD_STATE_KINDS = ["loading", "empty", "error", "stale", "ok"] as const

/**
 * Which frame a specimen opens on.
 *
 * `states[0]` used to decide it, and the registry lists states in lifecycle order — loading,
 * empty, error, stale, ok — so four of the seven specimens opened as a grey skeleton. On the one
 * page whose job is showing the components, more than half of them were showing the moment
 * before the component exists. The list keeps the lifecycle order, because that is the order the
 * states happen in and the order they read in; only the default moves.
 */
export function defaultState(states: readonly CardStateKind[]): CardStateKind {
  return states.includes("ok") ? "ok" : states[0]
}
