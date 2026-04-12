import { createMetadata } from "@/lib/metadata"
import { ContactForm } from "@/components/contact/contact-form"
import { GitHubIcon, LinkedInIcon, XIcon } from "@/components/ui/icons"

export const metadata = createMetadata({
  title: "Contact",
  description: "Get in touch — open to OSS collaborations and tech conversations.",
  path: "/contact",
})

const socials = [
  {
    name: "GitHub",
    href: "https://github.com/imnotannamaria",
    icon: GitHubIcon,
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/in/imnotannamaria",
    icon: LinkedInIcon,
  },
  {
    name: "X (Twitter)",
    href: "https://x.com/annamariadevbr",
    icon: XIcon,
  },
]

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-275 px-5 py-16">
      <div className="mb-12">
        <h1 className="font-display text-text-primary text-4xl font-bold">Contact</h1>
        <p className="text-text-secondary mt-2">Let&apos;s talk.</p>
      </div>

      <div className="flex flex-col gap-12 lg:flex-row lg:gap-20">
        <div className="shrink-0 lg:w-80">
          <p className="text-text-secondary text-sm leading-relaxed">
            Open to conversations! Fill out the form or reach me directly through any of the links
            below.
          </p>

          <ul className="mt-8 space-y-4">
            {socials.map(({ name, href, icon: Icon }) => (
              <li key={name}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="group text-text-secondary hover:text-text-primary flex items-center gap-3 text-sm transition-colors"
                >
                  <span className="border-border bg-bg-surface group-hover:border-border-hover flex size-9 items-center justify-center rounded-lg border transition-colors">
                    <Icon size={15} />
                  </span>
                  {name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex-1">
          <ContactForm />
        </div>
      </div>
    </div>
  )
}
