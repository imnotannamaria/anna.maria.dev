"use client"

import Link from "next/link"
import { motion, type Variants } from "motion/react"
import {
  CaretRightIcon,
  FileCodeIcon,
  FileJsxIcon,
  FileMdIcon,
  FileTextIcon,
  FileTsIcon,
  FileTsxIcon,
  FolderIcon,
  FolderOpenIcon,
  LockSimpleIcon,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import type { SiteTreeItem } from "@/lib/site-tree"

/**
 * The glyph follows the extension, the way it would in a real editor sidebar.
 * A tree where every file gets the same sheet of paper is a list with
 * decoration; this one tells you `about.md` is prose and `log.tsx` is a page
 * before you read either name.
 */
const FILE_ICONS: Record<string, typeof FileTextIcon> = {
  md: FileMdIcon,
  mdx: FileMdIcon,
  tsx: FileTsxIcon,
  ts: FileTsIcon,
  jsx: FileJsxIcon,
  js: FileCodeIcon,
  css: FileCodeIcon,
  json: FileCodeIcon,
}

/**
 * Returns the element rather than the component on purpose. Assigning the
 * looked-up component to a capitalized local inside the render trips
 * `react-hooks/static-components`, which can't see that the reference comes
 * from a frozen module-level map and is therefore stable.
 */
function fileGlyph(name: string, className: string) {
  const ext = name.includes(".") ? name.split(".").pop()!.toLowerCase() : ""
  const Icon = FILE_ICONS[ext] ?? FileTextIcon
  return <Icon aria-hidden size={14} className={className} />
}

type NodeProps = {
  item: SiteTreeItem
  isOpen: (path: string) => boolean
  onToggle: (path: string) => void
  listVariants: Variants
  rowVariants: Variants
}

/**
 * One row of the tree, plus its children. The caller owns the `<li>` — this
 * renders the row and the nested `<ul>` into it.
 *
 * Deliberately not `role="tree"`. A real ARIA tree owes the user arrow keys,
 * type-ahead and Home/End, and a half-built tree widget is worse for a screen
 * reader than none at all — it announces "tree, 7 items" and then the arrows do
 * nothing. This is a nested list of real buttons and links instead.
 */
export function TreeNode({ item, isOpen, onToggle, listVariants, rowVariants }: NodeProps) {
  const open = item.kind === "folder" && isOpen(item.path)
  const panelId = `tree-${item.path.replace(/[^a-z0-9]+/gi, "-")}`
  const hasChildren = Boolean(item.children && item.children.length > 0)

  const count =
    item.count !== undefined ? (
      <span className="ml-auto shrink-0 tabular-nums" style={{ color: "var(--fg-muted)" }}>
        {item.count}
        {item.countNoun && <span className="sr-only"> {item.countNoun}</span>}
      </span>
    ) : null

  // The filename is what's on screen; the real title is what a screen reader
  // gets, because "why-i-left-x.mdx" is a path, not a sentence.
  const label = (
    <>
      <span className="truncate">{item.name}</span>
      {item.hint && <span className="sr-only"> — {item.hint}</span>}
    </>
  )

  /** Keeps every row's text on the same left edge, folder or not. */
  const caretSlot = <span aria-hidden className="tree-caret" style={{ width: 10, height: 10 }} />

  return (
    <>
      {item.kind === "folder" && hasChildren ? (
        <button
          type="button"
          className="tree-row"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => onToggle(item.path)}
        >
          <CaretRightIcon
            aria-hidden
            size={10}
            weight="bold"
            className={cn("tree-caret", open && "tree-caret-open")}
            style={{ color: open ? "var(--fg-brand)" : "var(--fg-muted)" }}
          />
          {open ? (
            <FolderOpenIcon
              aria-hidden
              size={14}
              className="tree-glyph"
              style={{ color: "var(--fg-brand)" }}
            />
          ) : (
            <FolderIcon
              aria-hidden
              size={14}
              className="tree-glyph tree-glyph-shift"
              style={{ color: "var(--fg-brand)" }}
            />
          )}
          {label}
          {count}
        </button>
      ) : item.locked || !item.href ? (
        <span className="tree-row tree-row-locked">
          {caretSlot}
          {fileGlyph(item.name, "tree-glyph")}
          {label}
          <span className="sr-only">not published yet</span>
          <LockSimpleIcon aria-hidden size={12} className="ml-auto shrink-0" />
        </span>
      ) : (
        <Link href={item.href} className="tree-row" title={item.hint ?? item.name}>
          {caretSlot}
          {item.kind === "more" ? (
            <span aria-hidden className="tree-glyph" style={{ width: 14 }} />
          ) : (
            fileGlyph(item.name, "tree-glyph tree-glyph-shift")
          )}
          {label}
          {count}
        </Link>
      )}

      {hasChildren && (
        /*
         * Children stay mounted when closed. Unmounting them would take every
         * href out of the server HTML and leave the height animation with
         * nothing to measure; `inert` is what keeps the collapsed rows out of
         * the tab order and away from a screen reader.
         */
        <motion.ul
          id={panelId}
          className="tree-children"
          initial={false}
          animate={open ? "open" : "closed"}
          variants={listVariants}
          custom={item.children!.length}
          inert={!open}
        >
          {item.children!.map((child) => (
            <motion.li key={child.path} variants={rowVariants}>
              <TreeNode
                item={child}
                isOpen={isOpen}
                onToggle={onToggle}
                listVariants={listVariants}
                rowVariants={rowVariants}
              />
            </motion.li>
          ))}
        </motion.ul>
      )}
    </>
  )
}
