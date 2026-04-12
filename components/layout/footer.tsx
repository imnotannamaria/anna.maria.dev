import { GitHubIcon, LinkedInIcon, XIcon } from "@/components/ui/icons"

const socialLinks = [
  { href: "https://github.com/imnotannamaria", label: "GitHub", icon: GitHubIcon },
  { href: "https://www.linkedin.com/in/imnotannamaria/", label: "LinkedIn", icon: LinkedInIcon },
  { href: "https://x.com/annamariadevbr", label: "Twitter / X", icon: XIcon },
]

export function Footer() {
  return (
    <footer className="border-border mt-auto border-t">
      <div className="mx-auto flex h-14 max-w-275 items-center justify-between px-5">
        <span className="text-text-muted text-xs">© 2026 Anna Maria</span>

        <div className="flex items-center gap-1">
          {socialLinks.map(({ href, label, icon: Icon }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="text-text-muted hover:bg-bg-elevated hover:text-text-secondary flex size-8 items-center justify-center rounded-lg transition-colors"
            >
              <Icon size={15} />
            </a>
          ))}
        </div>

        <span className="text-text-muted hidden text-xs sm:block">
          Built with{" "}
          <a
            href="https://nextjs.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            Next.js
          </a>
        </span>
      </div>
    </footer>
  )
}
