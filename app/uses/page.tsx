import { createMetadata } from "@/lib/metadata"

export const metadata = createMetadata({
  title: "Uses",
  description: "The hardware, software, and tools I use every day.",
  path: "/uses",
})

const sections = [
  {
    title: "Hardware",
    items: [
      {
        name: "MacBook Pro M4 16GB",
        description: "Primary machine. Fast, quiet, great battery.",
      },
      {
        name: 'Samsung Odyssey 34"',
        description: '34" ultrawide curved monitor. Perfect for split layouts.',
      },
      {
        name: "Logitech G915 X",
        description: "Low-profile wireless mechanical keyboard. Tactile switches, great travel.",
      },
      {
        name: "Keychron M3 Wireless",
        description: "Lightweight wireless mouse. Reliable and comfortable for long sessions.",
      },
      {
        name: "AirPods Pro 3",
        description: "Daily driver for calls, focus, and commute. ANC is excellent.",
      },
    ],
  },
  {
    title: "Editor & Terminal",
    items: [
      {
        name: "VS Code",
        description: "Still the best editor for web development.",
        href: "https://code.visualstudio.com/",
      },
      {
        name: "Warp",
        description: "Modern terminal with AI built in. Fast and well designed.",
        href: "https://app.warp.dev/referral/KRP3VJ",
      },
      {
        name: "Fish Shell",
        description: "Friendly interactive shell. Great autocomplete out of the box.",
        href: "https://fishshell.com/",
      },
      {
        name: "Starship",
        description: "Minimal, fast, cross-shell prompt. Highly customizable.",
        href: "https://starship.rs/",
      },
      {
        name: "Zoxide",
        description: "Smarter cd command. Jumps to frecently used directories.",
        href: "https://github.com/ajeetdsouza/zoxide",
      },
    ],
  },
  {
    title: "Daily Apps",
    items: [
      {
        name: "Raycast",
        description: "Replaced Spotlight entirely. Extensions for everything.",
        href: "https://raycast.com/",
      },
      {
        name: "Notion",
        description: "Notes, docs, and personal wiki. All in one place.",
        href: "https://notion.so/",
      },
      {
        name: "Notion Calendar",
        description: "Calendar that actually integrates with my Notion workflow.",
        href: "https://www.notion.so/product/calendar",
      },
      {
        name: "Arc",
        description: "My main browser. Spaces and command bar changed how I use the web.",
        href: "https://arc.net/",
      },
    ],
  },
  {
    title: "Music",
    items: [
      {
        name: "Tagima Telecaster",
        description: "My electric guitar. Entry-level Telecaster — gets the job done.",
      },
      {
        name: "Strinberg Acoustic",
        description: "My acoustic guitar. Great for unplugged playing.",
      },
      {
        name: "Shelby Ukulele",
        description: "My ukulele. Small, fun, always nearby.",
      },
      {
        name: "Casio Keyboard",
        description: "My keyboard. Good enough for learning and experimenting.",
      },
      {
        name: "Spotify",
        description: "Daily listening. Playlists for focus, coding, and workout.",
        href: "https://spotify.com/",
      },
    ],
  },
]

export default function UsesPage() {
  return (
    <div className="mx-auto w-full max-w-275 px-5 py-16">
      <div className="mb-14">
        <h1 className="font-display text-text-primary text-4xl font-bold">Uses</h1>
        <p className="text-text-secondary mt-2">
          Hardware, software, and tools I use every day. Updated when something changes.
        </p>
      </div>

      <div className="space-y-16">
        {sections.map((section, i) => (
          <section key={section.title}>
            <div className="mb-6 flex items-baseline gap-4">
              <span className="text-border-hover font-mono text-4xl leading-none font-bold">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h2 className="font-display text-text-primary text-xl font-semibold">
                {section.title}
              </h2>
            </div>

            <ul className="divide-border divide-y">
              {section.items.map((item) => (
                <li key={item.name} className="flex items-start justify-between gap-6 py-4">
                  <div className="min-w-0">
                    <p className="text-text-primary text-sm font-medium">{item.name}</p>
                    <p className="text-text-secondary mt-0.5 text-sm">{item.description}</p>
                  </div>
                  {"href" in item && item.href && (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Visit ${item.name}`}
                      className="text-text-muted shrink-0 transition-colors hover:text-indigo-400"
                    >
                      ↗
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
