"use client"

/**
 * entrepta's `PageOutline`, bound to this site's layout.
 *
 * The editor chrome scrolls `<main id="main-content">`, not the window, and entrepta takes the
 * scroll container as a function. A function cannot cross from a server component to a client
 * one, and most pages that render the outline are server components — so the binding lives
 * here, once, and every page keeps importing `PageOutline` from this path.
 */

import {
  PageOutline as EntreptaPageOutline,
  type PageOutlineProps,
} from "@/app/components/entrepta/page-outline"

export type { OutlineItem } from "@/app/components/entrepta/page-outline"

const main = () => document.getElementById("main-content")

export function PageOutline(props: Omit<PageOutlineProps, "scrollContainer">) {
  return <EntreptaPageOutline scrollContainer={main} {...props} />
}
