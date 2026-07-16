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
  { href: "/piano", name: "piano.tsx", hint: "~/piano", icon: PianoKeysIcon },
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
        </CommandList>
        <CommandFoot />
      </Command>
    </CommandDialog>
  )
}
