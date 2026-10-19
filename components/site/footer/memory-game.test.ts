import { isValidElement, type ReactElement, type ReactNode } from "react"
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
vi.mock("next-intl", () => ({
  useTranslations: () => Object.assign((key: string) => key, { rich: (key: string) => key }),
}))
vi.mock("next/dynamic", () => ({ default: () => () => null }))
vi.mock("@/components/site/abimaela/abimaela", () => ({ Cat: () => null, CatHappy: () => null }))
vi.mock("@/components/ui/sound-feedback", () => ({ playSoundEffect() {} }))
vi.mock("./board", () => ({
  Board: () => null,
  startRound: vi.fn(),
  finishRound: vi.fn(),
  useBoard: () => ({ rows: [], mine: null }),
}))
vi.mock("./parts", () => ({
  ...Object.fromEntries(
    ["BarButton", "Chip", "GameBar", "Places", "Prize"].map((name) => [name, () => null]),
  ),
  formatClock: () => "0:00",
  shuffle: (cards: unknown[]) => cards,
  stamp: () => 1,
  useClock: () => 0,
  usePlaces: () => [{ id: "home", label: "home", short: "home", Icon: () => null }],
  useTimers: () => ({ later: (callback: () => void) => callback(), clear() {} }),
}))
import { MemoryGame } from "./memory-game"
import { finishRound, startRound } from "./board"
import { BarButton } from "./parts"

type Props = {
  children?: ReactNode
  onClick?: () => void
  "data-index"?: number
  id?: string
  result?: unknown
}
function find(
  node: ReactNode,
  matches: (element: ReactElement<Props>) => boolean,
): ReactElement<Props> | undefined {
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = find(child, matches)
      if (found) return found
    }
  } else if (isValidElement<Props>(node)) {
    if (matches(node)) return node
    return find(node.props.children, matches)
  }
}
const render = () => holder.current!.render(() => MemoryGame({ page: "home" }))
function win() {
  for (const index of [0, 2, 1, 3])
    find(render(), (el) => el.props["data-index"] === index)!.props.onClick!()
}
beforeEach(() => {
  holder.current = hookState()
  vi.resetAllMocks()
  vi.stubGlobal("document", { activeElement: null })
  vi.mocked(startRound).mockResolvedValue("old-round")
})
afterEach(() => vi.unstubAllGlobals())

it("does not restore a previous round's claim form after shuffling", async () => {
  let finish!: (result: { ms: number; rank: number; qualifies: boolean }) => void
  vi.mocked(finishRound).mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve
      }),
  )
  win()
  await vi.waitFor(() => expect(finishRound).toHaveBeenCalledTimes(1))
  find(render(), (el) => el.type === BarButton)!.props.onClick!()
  finish({ ms: 12000, rank: 1, qualifies: true })
  await new Promise((resolve) => setTimeout(resolve, 0))
  expect(find(render(), (el) => !!el.props.result)).toBeUndefined()
})

it("keeps a qualifying result when the completed round is still current", async () => {
  vi.mocked(finishRound).mockResolvedValue({ ms: 12000, rank: 1, qualifies: true })
  win()
  await vi.waitFor(() =>
    expect(find(render(), (el) => !!el.props.result)?.props.id).toBe("old-round"),
  )
})

it("does not finish a discarded round whose start request was still pending", async () => {
  let started!: (id: string) => void
  vi.mocked(startRound).mockImplementation(
    () =>
      new Promise((resolve) => {
        started = resolve
      }),
  )
  win()
  find(render(), (el) => el.type === BarButton)!.props.onClick!()
  started("discarded-round")
  await new Promise((resolve) => setTimeout(resolve, 0))
  expect(finishRound).not.toHaveBeenCalled()
  expect(find(render(), (el) => !!el.props.result)).toBeUndefined()
})
