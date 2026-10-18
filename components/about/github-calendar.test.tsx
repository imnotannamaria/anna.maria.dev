import { renderToString } from "react-dom/server"
import { NextIntlClientProvider } from "next-intl"
import { expect, it } from "vitest"
import pt from "@/messages/pt.json"
import { GithubCalendar } from "./github-calendar"

it("localizes the calendar's unavailable state without replacing its own grid", () => {
  const html = renderToString(
    <NextIntlClientProvider locale="pt" messages={pt} timeZone="UTC">
      <GithubCalendar state={{ kind: "error" }} />
    </NextIntlClientProvider>,
  )
  expect(html).toContain(pt.professional.calendar.unavailable)
  expect(html).not.toContain("couldn&#x27;t reach github")
})
