import { cn } from "@/lib/utils"
import { LANG_CODE, LANG_LABEL, type WallLang } from "@/lib/wall/constants"

/**
 * The language a testimonial is written in, as a flag. SVG, not emoji: Windows does not draw
 * flag emoji, it prints the letters "BR" and "US" instead.
 *
 * The colours are the flags' own, fixed on purpose. They are not a brand accent, so they do
 * not derive from `--fg-brand`. English is the US flag.
 */
export function Flag({
  lang,
  size = 18,
  className,
  decorative = false,
}: {
  lang: WallLang
  size?: number
  className?: string
  /** When the language is written beside it, the flag leaves the accessibility tree. */
  decorative?: boolean
}) {
  const a11y = decorative
    ? ({ "aria-hidden": true } as const)
    : ({ role: "img", "aria-label": LANG_LABEL[lang] } as const)

  return (
    <svg
      {...a11y}
      width={size}
      height={Math.round(size * 0.7)}
      viewBox="0 0 20 14"
      className={cn("shrink-0 rounded-[2px]", className)}
    >
      {lang === "pt-BR" ? (
        <>
          <rect width="20" height="14" fill="#009c3b" />
          <path d="M10 1.7 18.2 7 10 12.3 1.8 7z" fill="#ffdf00" />
          <circle cx="10" cy="7" r="3" fill="#002776" />
        </>
      ) : (
        <>
          <rect width="20" height="14" fill="#ffffff" />
          <path d="M0 0h20v2H0zM0 4h20v2H0zM0 8h20v2H0zM0 12h20v2H0z" fill="#b22234" />
          <rect width="9" height="8" fill="#3c3b6e" />
        </>
      )}
    </svg>
  )
}

/** Flag and code, the pair a card's head carries. Read as the language's name. */
export function LangTag({ lang, className }: { lang: WallLang; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap", className)}>
      <Flag lang={lang} size={16} decorative />
      <span className="sr-only">{LANG_LABEL[lang]}</span>
      <span aria-hidden>{LANG_CODE[lang]}</span>
    </span>
  )
}
