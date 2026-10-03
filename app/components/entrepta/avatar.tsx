"use client"

import { type VariantProps, cva } from "class-variance-authority"
import * as React from "react"
import { type IconProp, IconSlot } from "@/lib/icon"
import { cn } from "@/lib/utils"

type AvatarSize = "sm" | "md" | "lg" | "xl"
type AvatarShape = "circle" | "square"
type AvatarStatus = "online" | "away" | "busy" | "offline"

/**
 * The face: the fill, the initials and the clip for the image. The tints are
 * translucent, so they are laid over the surface's own color rather than left
 * to show whatever sits behind: in a group, that is the avatar it overlaps.
 */
const avatarVariants = cva(
  [
    "relative flex size-full items-center justify-center overflow-hidden border",
    "bg-[var(--cutout,var(--bg-canvas))]",
    "select-none font-mono font-medium leading-none",
  ],
  {
    variants: {
      size: {
        sm: "text-mono-xs",
        md: "text-mono-sm",
        lg: "text-heading-md",
        xl: "text-display-md tracking-normal",
      },
      shape: {
        circle: "rounded-full",
        square: "",
      },
      color: {
        neutral: [
          "border-[var(--border-subtle)] text-[var(--fg-secondary)]",
          "bg-[image:linear-gradient(var(--bg-hover-strong),var(--bg-hover-strong))]",
        ],
        brand: [
          "border-[var(--border-brand)] text-[var(--fg-brand-text)]",
          "bg-[image:linear-gradient(var(--bg-surface-brand),var(--bg-surface-brand))]",
        ],
      },
    },
    compoundVariants: [
      { shape: "square", size: ["sm", "md"], class: "rounded-[var(--radius-sm)]" },
      { shape: "square", size: "lg", class: "rounded-[var(--radius-md)]" },
      { shape: "square", size: "xl", class: "rounded-[var(--radius-xl)]" },
    ],
    defaultVariants: { size: "md", shape: "circle", color: "neutral" },
  },
)

// In a group each avatar overlaps the one before by about a fifth of its size:
// little enough that two mono initials, centered, clear the next one's ring.
const SIZE: Record<AvatarSize, { box: string; dot: string; icon: number; overlap: string }> = {
  sm: { box: "size-6", dot: "size-2", icon: 12, overlap: "-space-x-1" },
  md: { box: "size-8", dot: "size-2.5", icon: 16, overlap: "-space-x-1.5" },
  lg: { box: "size-12", dot: "size-3.5", icon: 24, overlap: "-space-x-2.5" },
  xl: { box: "size-24", dot: "size-5", icon: 48, overlap: "-space-x-5" },
}

const STATUS: Record<AvatarStatus, string> = {
  online: "bg-[var(--status-success)]",
  away: "bg-[var(--status-warning)]",
  busy: "bg-[var(--status-error)]",
  offline: "bg-[var(--fg-muted)]",
}

// A ring in the color of what the avatar sits on, so a dot or an overlapping
// avatar reads as cut out of it. Set --cutout on a parent that is not
// the canvas, such as `[--cutout:var(--bg-card)]` on a Card.
const CUTOUT = "ring-2 ring-[var(--cutout,var(--bg-canvas))]"

// The active profile, or the person the page is about: a brand ring standing
// off the face by the cutout color, so it also works inside a group.
const EMPHASIS = {
  none: "",
  ring: "ring-2 ring-[var(--fg-brand)] ring-offset-2 ring-offset-[var(--cutout,var(--bg-canvas))]",
} as const

/** "Anna Maria" is AM, "entrepta" is E, "@anna_maria" is AM. */
function initialsOf(name: string): string {
  const words = name.split(/[\s._@-]+/).filter(Boolean)
  if (words.length === 0) return ""
  const ends = words.length > 1 ? [words[0], words[words.length - 1]] : [words[0]]
  return ends
    .map((word) => Array.from(word)[0])
    .join("")
    .toLocaleUpperCase()
}

const AvatarGroupContext = React.createContext<{ size: AvatarSize; shape: AvatarShape } | null>(
  null,
)

interface AvatarProps
  extends
    Omit<React.HTMLAttributes<HTMLSpanElement>, "children" | "color">,
    Omit<VariantProps<typeof avatarVariants>, "size" | "shape"> {
  /** Who or what it is. Gives the initials and the name screen readers hear. */
  name: string
  /** An image. The initials show until it loads, and stay if it fails. */
  src?: string
  /** Inside an AvatarGroup, the group's size unless set here. */
  size?: AvatarSize
  /** `circle` for people, `square` for things: a team, a bot, a repo. */
  shape?: AvatarShape
  /** A presence dot in the corner, announced with the name. */
  status?: AvatarStatus
  /** A glyph in place of the initials, for a thing rather than a person. */
  icon?: IconProp
  /** `ring` marks the active profile, or the person the page is about. */
  emphasis?: keyof typeof EMPHASIS
  /** The presence words screen readers hear after the name, for another language. */
  statusLabels?: Partial<Record<AvatarStatus, string>>
}

/**
 * A person or a thing, as an image over their initials. The initials are in
 * the server HTML and the image covers them once it loads, so there is no
 * empty circle before hydration and no broken image after a failed load.
 *
 * It is one image to a screen reader, named by `name` and `status`. Next to a
 * written name, pass `aria-hidden` so the name is not read twice.
 */
const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  (
    {
      name,
      src,
      size: ownSize,
      shape: ownShape,
      color,
      status,
      icon,
      emphasis = "none",
      statusLabels,
      className,
      ...props
    },
    ref,
  ) => {
    const group = React.useContext(AvatarGroupContext)
    const size = ownSize ?? group?.size ?? "md"
    const shape = ownShape ?? group?.shape ?? "circle"

    const [image, setImage] = React.useState<{ src: string; loaded: boolean } | null>(null)
    // what happened to this src; a result for an earlier one no longer counts
    const settled = src && image?.src === src ? image : null
    const loaded = settled?.loaded === true
    const failed = settled?.loaded === false
    const imgRef = React.useRef<HTMLImageElement>(null)

    // An image that settled before hydration fired its load or error event
    // with no listener attached yet. Read the outcome off the element instead.
    React.useEffect(() => {
      const img = imgRef.current
      if (!src || !img?.complete) return
      setImage({ src, loaded: img.naturalWidth > 0 })
    }, [src])

    const hidden = props["aria-hidden"] === true || props["aria-hidden"] === "true"

    return (
      <span
        ref={ref}
        role={hidden ? undefined : "img"}
        aria-label={
          hidden ? undefined : status ? `${name}, ${statusLabels?.[status] ?? status}` : name
        }
        className={cn("relative inline-flex shrink-0 align-middle", SIZE[size].box, className)}
        {...props}
      >
        <span
          className={cn(
            avatarVariants({ size, shape, color }),
            group && CUTOUT,
            EMPHASIS[emphasis],
          )}
        >
          <span aria-hidden className={cn(loaded && "invisible")}>
            {icon ? <IconSlot icon={icon} size={SIZE[size].icon} /> : initialsOf(name)}
          </span>
          {src && !failed && (
            <img
              ref={imgRef}
              src={src}
              alt=""
              loading="lazy"
              decoding="async"
              draggable={false}
              onLoad={() => setImage({ src, loaded: true })}
              onError={() => setImage({ src, loaded: false })}
              className="absolute inset-0 size-full object-cover"
            />
          )}
        </span>
        {status && (
          <span
            aria-hidden
            data-status={status}
            className={cn(
              "absolute right-0 bottom-0 rounded-full",
              SIZE[size].dot,
              STATUS[status],
              CUTOUT,
            )}
          />
        )}
      </span>
    )
  },
)
Avatar.displayName = "Avatar"

interface AvatarGroupProps extends React.HTMLAttributes<HTMLUListElement> {
  /**
   * How many avatars show before the rest fold into a `+N`. The row never
   * wraps, so set it when the list can grow. All of them by default.
   */
  max?: number
  /** The size of every avatar in the group. Default `"md"`. */
  size?: AvatarSize
  /** The shape of every avatar in the group. Default `"circle"`. */
  shape?: AvatarShape
  /** What screen readers hear for the folded rest: "3 more". */
  moreLabel?: (count: number) => string
}

/**
 * Overlapping avatars, as a list, with the rest folded into a `+N`. Name it
 * with `aria-label`, such as "contributors".
 */
const AvatarGroup = React.forwardRef<HTMLUListElement, AvatarGroupProps>(
  (
    {
      max,
      size = "md",
      shape = "circle",
      moreLabel = (count) => `${count} more`,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const items = React.Children.toArray(children)
    const limit = max === undefined ? items.length : Math.max(1, Math.floor(max))
    const shown = items.slice(0, limit)
    const rest = items.length - shown.length
    const context = React.useMemo(() => ({ size, shape }), [size, shape])

    return (
      <AvatarGroupContext.Provider value={context}>
        <ul
          ref={ref}
          className={cn("m-0 flex list-none items-center p-0", SIZE[size].overlap, className)}
          {...props}
        >
          {shown.map((child, index) => (
            <li key={(React.isValidElement(child) && child.key) || index} className="flex">
              {child}
            </li>
          ))}
          {rest > 0 && (
            <li className="flex">
              <span className={cn("relative inline-flex shrink-0", SIZE[size].box)}>
                <span className={cn(avatarVariants({ size, shape }), CUTOUT)}>
                  {/* three characters at most, so it fits the smallest avatar */}
                  <span aria-hidden>{rest > 99 ? "99+" : `+${rest}`}</span>
                  <span className="sr-only">{moreLabel(rest)}</span>
                </span>
              </span>
            </li>
          )}
        </ul>
      </AvatarGroupContext.Provider>
    )
  },
)
AvatarGroup.displayName = "AvatarGroup"

export { Avatar, AvatarGroup, avatarVariants }
export type { AvatarGroupProps, AvatarProps, AvatarShape, AvatarSize, AvatarStatus }
