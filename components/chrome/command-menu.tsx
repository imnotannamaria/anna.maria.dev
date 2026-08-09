"use client"

import { useRouter } from "next/navigation"
import {
  type Icon,
  HouseLineIcon,
  UserSquareIcon,
  FileMdIcon,
  TerminalWindowIcon,
  ChatsCircleIcon,
  PianoKeysIcon,
  SquaresFourIcon,
  LockSimpleIcon,
  ListChecksIcon,
} from "@phosphor-icons/react"
import {
  CommandDialog,
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandFoot,
} from "@/app/components/entrepta/command-palette"

type Page = { href: string; name: string; hint: string; icon: Icon }

const PAGES: Page[] = [
  { href: "/", name: "home.tsx", hint: "~", icon: HouseLineIcon },
  { href: "/about", name: "about.md", hint: "~/about", icon: UserSquareIcon },
  { href: "/blog", name: "posts/", hint: "~/blog", icon: FileMdIcon },
  { href: "/projects", name: "projects/", hint: "~/projects", icon: TerminalWindowIcon },
  { href: "/contact", name: "contact.tsx", hint: "~/contact", icon: ChatsCircleIcon },
  { href: "/log", name: "log.tsx", hint: "~/log", icon: SquaresFourIcon },
  { href: "/piano", name: "piano.tsx", hint: "~/piano", icon: PianoKeysIcon },
  { href: "/roadmap", name: "roadmap.md", hint: "~/roadmap", icon: ListChecksIcon },
]

/**
 * Listed rather than hidden. /admin is a 404 for anyone not on the allowlist, so showing
 * it costs nothing — and hiding it would only hide it from me. The padlock says up front
 * that it will ask for a sign-in.
 */
const PRIVATE_PAGES: Page[] = [
  { href: "/admin/log", name: "admin/log.tsx", hint: "~/admin", icon: SquaresFourIcon },
  { href: "/admin/roadmap", name: "admin/roadmap.tsx", hint: "~/admin", icon: ListChecksIcon },
]

/**
 * Global navigation palette — opened by the titlebar "+" button or ⌘K.
 * Selecting a page routes to it and closes the dialog.
 */
export function CommandMenu({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()

  const go = (href: string) => {
    onOpenChange(false)
    router.push(href)
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command>
        <CommandInput placeholder="jump to a page…" />
        <CommandList>
          <CommandEmpty>No pages found.</CommandEmpty>
          <CommandGroup heading="pages">
            {PAGES.map((page) => {
              const PageIcon = page.icon
              return (
                <CommandItem
                  key={page.href}
                  value={`${page.name} ${page.hint}`}
                  onSelect={() => go(page.href)}
                  icon={<PageIcon size={15} />}
                  shortcut={page.hint}
                >
                  {page.name}
                </CommandItem>
              )
            })}
          </CommandGroup>

          <CommandGroup heading="private">
            {PRIVATE_PAGES.map((page) => {
              const PageIcon = page.icon
              return (
                <CommandItem
                  key={page.href}
                  value={`${page.name} ${page.hint} admin private`}
                  onSelect={() => go(page.href)}
                  icon={<PageIcon size={15} />}
                  shortcut={page.hint}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {page.name}
                    <LockSimpleIcon
                      size={11}
                      weight="fill"
                      aria-hidden
                      style={{ color: "var(--fg-muted)" }}
                    />
                    <span className="sr-only">requires sign in</span>
                  </span>
                </CommandItem>
              )
            })}
          </CommandGroup>
        </CommandList>
        <CommandFoot />
      </Command>
    </CommandDialog>
  )
}
