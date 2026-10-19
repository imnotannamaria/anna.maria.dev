import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { hookState } from "@/tests/helpers/hook-state"
const holder = vi.hoisted(() => ({ current: null as ReturnType<typeof hookState> | null }))
vi.mock("react", async (load) => ({
  ...(await load<typeof import("react")>()),
  useEffect() {},
  useState: (...args: Parameters<ReturnType<typeof hookState>["useState"]>) =>
    holder.current!.useState(...args),
  useRef: (...args: Parameters<ReturnType<typeof hookState>["useRef"]>) =>
    holder.current!.useRef(...args),
}))
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }))
vi.mock("@/components/site/abimaela/abimaela", () => ({ pet: { notify() {} } }))
import { Reactions } from "./reactions"
import { reactionCounts } from "@/lib/wall/constants"

const render = () =>
  holder.current!.render(() => Reactions({ id: "test", who: "Anna", counts: reactionCounts(null) }))
const button = (index = 0) => render().props.children[index].props.children
beforeEach(() => {
  holder.current = hookState()
})
afterEach(() => vi.unstubAllGlobals())

it("ignores a second toggle while pending and rolls back a rejected request", async () => {
  let reject!: (error: Error) => void
  vi.stubGlobal(
    "fetch",
    vi.fn(
      () =>
        new Promise((_, fail) => {
          reject = fail
        }),
    ),
  )
  const first = button()
  first.props.onClick()
  first.props.onClick() // same render, before the pending state can commit
  expect(fetch).toHaveBeenCalledTimes(1)
  expect(button().props["aria-busy"]).toBe(true)
  reject(new Error("offline"))
  await vi.waitFor(() => expect(button().props["aria-busy"]).toBeUndefined())
  expect(button().props["aria-pressed"]).toBe(false)
  expect(holder.current!.cells[0]).toEqual(reactionCounts(null))
})

it("keeps another reaction's confirmed count when the first one fails", async () => {
  let reject!: (error: Error) => void
  const fetcher = vi
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise((_, fail) => {
          reject = fail
        }),
    )
    .mockResolvedValueOnce(Response.json({ reactions: { ...reactionCounts(null), clap: 4 } }))
  vi.stubGlobal("fetch", fetcher)
  button(0).props.onClick()
  button(1).props.onClick()
  await vi.waitFor(() => expect(button(1).props["aria-busy"]).toBeUndefined())
  reject(new Error("offline"))
  await vi.waitFor(() => expect(button(0).props["aria-busy"]).toBeUndefined())
  expect(holder.current!.cells[0]).toEqual({ ...reactionCounts(null), clap: 4 })
  expect(button(1).props["aria-pressed"]).toBe(true)
})
