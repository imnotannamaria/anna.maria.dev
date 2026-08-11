import { createMetadata } from "@/lib/metadata"
import { ContactForm } from "@/components/contact/contact-form"
import { ChannelsCard } from "@/components/contact/channels-card"
import { PageOutline, type OutlineItem } from "@/components/chrome/page-outline"
import { DisplayH2, DocLabel, Em, Prose, Section, Strong } from "@/components/chrome/page-parts"
import { Reveal } from "@/components/ui/reveal"
import { TypeIn } from "@/components/ui/type-in"
import { siteConfig } from "@/lib/site-config"

export const metadata = createMetadata({
  title: "Contact",
  description: "Get in touch — open to OSS collaborations and tech conversations.",
  path: "/contact",
})

const EMAIL = siteConfig.email

/**
 * The outline order is the page order, and both changed. The form used to come last, after
 * the hero and four channel cards — two scrolls past the only thing on the page that does
 * anything. It leads now, with the channels as a narrow column beside it.
 */
const outline: OutlineItem[] = [
  { id: "contact", label: "contact", level: 1 },
  { id: "message", label: "send a message", level: 2 },
  { id: "channels", label: "other channels", level: 2 },
]

export default function ContactPage() {
  return (
    <div className="mx-auto grid w-full max-w-[1160px] grid-cols-1 min-[1100px]:grid-cols-[200px_minmax(0,1fr)]">
      <PageOutline
        items={outline}
        file="contact.tsx"
        footer={
          <>
            <div className="flex justify-between">
              <span>{"// inbox"}</span>
              <span
                className="inline-flex items-center gap-1"
                style={{ color: "var(--status-success-fg)" }}
              >
                <span
                  aria-hidden
                  className="inline-block size-1.5 animate-pulse rounded-full"
                  style={{ background: "var(--status-success)" }}
                />
                open
              </span>
            </div>
            <div className="flex justify-between">
              <span>{"// replies"}</span>
              <span>~ 1 day</span>
            </div>
            <div>{"// utf-8"}</div>
          </>
        }
      />

      <div className="min-w-0">
        <div className="mx-auto max-w-[880px] px-5 py-12 sm:px-8 lg:px-12">
          <nav
            aria-label="Breadcrumb"
            className="mb-8 font-mono text-xs"
            style={{ color: "var(--fg-muted)" }}
          >
            <span>~</span>
            <span aria-hidden style={{ opacity: 0.5, margin: "0 6px" }}>
              /
            </span>
            <span style={{ color: "var(--fg-primary)" }}>contact.tsx</span>
          </nav>

          {/* ══════════ HERO — one line of status, a title, a sentence ══════════ */}
          <Section id="contact" first>
            <DocLabel level="#">contact</DocLabel>

            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div className="min-w-0">
                {/* Smaller than the 96px it was. That size is lovely, and it spent a whole
                    screen saying what the tab title already says — which is the reason the
                    form ended up below the fold in the first place. */}
                <TypeIn
                  as="h1"
                  text="Let's talk."
                  emphasis="talk."
                  speed={0.045}
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontWeight: 400,
                    fontSize: "clamp(40px, 5.5vw, 62px)",
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                    color: "var(--fg-primary)",
                    margin: "0 0 14px",
                    display: "block",
                  }}
                />

                <Reveal delay={0.45}>
                  <p
                    className="m-0 text-[16px] leading-[1.65]"
                    style={{
                      fontFamily: "var(--font-sans)",
                      color: "var(--fg-secondary)",
                      maxWidth: "52ch",
                    }}
                  >
                    Type it below, or pick a channel on the right. I read everything that lands in
                    my inbox and I try to reply within <Strong>a day</Strong>. If it&apos;s about{" "}
                    <Em>work</Em>, tell me a bit about what you&apos;re building.
                  </p>
                </Reveal>
              </div>

              <Reveal delay={0.55}>
                <div
                  className="inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-xs"
                  style={{
                    borderColor: "var(--border-subtle)",
                    background: "var(--bg-surface)",
                    color: "var(--fg-secondary)",
                  }}
                >
                  <span
                    aria-hidden
                    className="inline-block size-2 animate-pulse rounded-full"
                    style={{ background: "var(--status-success)" }}
                  />
                  inbox open · recife · brt
                </div>
              </Reveal>
            </div>
          </Section>

          {/* ══════════ THE FORM LEADS ══════════ */}
          <Section id="message">
            <DocLabel level="##">send a message</DocLabel>
            <DisplayH2 margin="0 0 16px">
              Type it <Em>here.</Em>
            </DisplayH2>
            <Prose className="mb-8 text-[15px] leading-[1.7]">
              This drops straight into my inbox. If it&apos;s about work, a couple of lines on what
              you&apos;re building and where I&apos;d fit in is all I need to get back to you.
            </Prose>

            {/* Two columns from 1100px — the same breakpoint the outline appears at, so the
                page is never a wide form beside a narrow rail that isn't there yet. */}
            <div className="grid grid-cols-1 gap-6 min-[1100px]:grid-cols-[minmax(0,1fr)_300px]">
              <ContactForm email={EMAIL} />

              <ChannelsCard index={1} />
            </div>
          </Section>
        </div>
      </div>
    </div>
  )
}
