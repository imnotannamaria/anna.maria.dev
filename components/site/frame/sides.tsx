"use client"

import dynamic from "next/dynamic"
import { usePathname } from "next/navigation"
import { useState } from "react"
import type { Group } from "@/components/site/professional/stack-data"
import type { SiteData } from "./site-data"

const Terminal = dynamic(() =>
  import("@/components/site/terminal/terminal").then((mod) => mod.Terminal),
)
const Chat = dynamic(() => import("@/components/site/ai/chat").then((mod) => mod.Chat))

/** True from the first visit to an address on: what opened once stays mounted. */
function useOpened(path: string): boolean {
  const here = usePathname() === path
  const [opened, setOpened] = useState(here)
  if (here && !opened) setOpened(true)
  return opened
}

/**
 * The terminal and the chat live in the layout so a session survives a trip to another side,
 * but most visitors never open them. Each one is loaded, code and markup, on the first visit to
 * its address, and kept from then on.
 */
export function BackSide({ data }: { data: SiteData }) {
  return useOpened("/back") ? <Terminal data={data} className="h-full" /> : null
}

export function AiSide({ data, stack }: { data: SiteData; stack: Group[] }) {
  return useOpened("/ai") ? <Chat data={data} stack={stack} /> : null
}
