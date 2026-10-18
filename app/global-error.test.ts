import { createElement } from "react"
import { renderToString } from "react-dom/server"
import { expect, it, vi } from "vitest"
import { state } from "@/messages/en.json"
vi.mock("@/app/fonts", () => ({ fontVariables: "" }))
vi.mock("@/app/components/entrepta/theme-switcher", () => ({ ThemeScript: () => null }))
vi.mock("@/components/site/abimaela/abimaela", () => ({ CatAngry: () => null }))
import GlobalError from "./global-error"

it("renders a usable retry fallback after the root provider is lost", () => {
  const html = renderToString(
    createElement(GlobalError, { error: new Error("root failed"), reset() {} }),
  )
  expect(html).toContain(state.errorTitle)
  expect(html).toContain(state.retry)
  expect(html).toContain('role="alert"')
})
